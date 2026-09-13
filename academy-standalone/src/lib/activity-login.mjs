import { createActivityApi } from './activity-api.mjs'

let api
// Cookie 由浏览器携带，不经 iframe 消息传递。未嵌入宿主时保留错误提示，
// 不猜测独立页面的登录 URL，也不把失败误判成已经登录。
export function requestActivityLogin(win = window) {
  if (win.parent !== win) win.parent.postMessage({ channel: 'feixiang-academy', type: 'request-login' }, win.location.origin)
}
export function getActivityApi() {
  if (!api) api = createActivityApi({ hostname: window.location.hostname, onLoginRequired: () => requestActivityLogin() })
  return api
}
export function installActivitySession(win = window) {
  // 只信任部署在同源 public 目录之外的直接父窗口，不接受其他 iframe/网站的通知。
  // 通知只使前端缓存失效；是否登录仍以服务端为准，绝不自动重发投稿。
  const listener = event => {
    const data = event.data
    if (win.parent === win || event.source !== win.parent || event.origin !== win.location.origin
      || data?.channel !== 'feixiang-academy' || data.type !== 'session-changed'
      || !['login', 'logout', 'account-changed'].includes(data.reason)) return
    win.dispatchEvent(new win.CustomEvent('academy:session-changed', { detail: { reason: data.reason } }))
  }
  win.addEventListener('message', listener)
  return () => win.removeEventListener('message', listener)
}
