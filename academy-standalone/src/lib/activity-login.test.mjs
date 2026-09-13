import test from 'node:test'
import assert from 'node:assert/strict'
import { installActivitySession, requestActivityLogin } from './activity-login.mjs'
test('只处理同源父窗口会话通知，不接收伪造来源或未知消息', () => {
  const parent = {}, listeners = {}, received = []
  const win = { parent, location: { origin: 'https://local.feixianglaoshi.biz:3000' },
    addEventListener: (key, fn) => { listeners[key] = fn }, removeEventListener: key => { delete listeners[key] },
    dispatchEvent: event => received.push(event.detail), CustomEvent: class { constructor(type, options) { this.detail = options.detail } } }
  const cleanup = installActivitySession(win)
  const data = { channel: 'feixiang-academy', type: 'session-changed', reason: 'login' }
  listeners.message({ source: {}, origin: win.location.origin, data })
  listeners.message({ source: parent, origin: 'https://evil.test', data })
  assert.equal(received.length, 0)
  listeners.message({ source: parent, origin: win.location.origin, data })
  assert.deepEqual(received, [{ reason: 'login' }])
  cleanup()
  assert.equal(listeners.message, undefined)
})
test('登录请求限定父窗口 origin 且不携带任何账号凭据', () => {
  let sent
  const win = { location: { origin: 'https://www.feixianglaoshi.biz' },
    parent: { postMessage: (...args) => { sent = args } } }
  requestActivityLogin(win)
  assert.deepEqual(sent, [{ channel: 'feixiang-academy', type: 'request-login' }, 'https://www.feixianglaoshi.biz'])
})
