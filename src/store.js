import { reactive } from 'vue'
import { getPrimaryNavItem, resolvePrimaryNav } from './navigation/primary-nav.mjs'

// 极简路由 store —— demo 用状态路由,产物是单文件,无需 history 服务
export const store = reactive({
  view: 'rank',
  primaryNav: 'home',
  resourceId: 'res-xianglin',
  currentUser: { accountId: 'teacher-cherry', name: '樱桃小魔丸子🔥' },
  sidebarCollapsed: false,
  mastersCollapsed: false,
  publishedEvents: [],
  studioMode: 'guest', // 'owner' = 我的主页(主态) | 'guest' = 看别人名师主页(客态)
})

export function show(v) {
  store.view = v
}

export function showPrimary(key) {
  const item = getPrimaryNavItem(key)
  if (!item) return false
  store.primaryNav = item.key
  if (item.view) store.view = item.view
  return true
}

export function syncPrimaryNav(view = store.view) {
  store.primaryNav = resolvePrimaryNav(view, store.primaryNav)
  return store.primaryNav
}
