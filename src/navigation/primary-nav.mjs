export const PRIMARY_NAV_ITEMS = Object.freeze([
  { key: 'home', label: '首页', view: null, externalUrl: 'https://www.feixianglaoshi.com/#/home', icon: 'home', selector: '.nav-home' },
  { key: 'discover', label: '灵感', view: 'rank', icon: 'discover', className: 'nav-inspiration', selector: '.nav-inspiration' },
  { key: 'skills', label: '教育智库', view: 'skills', icon: 'skills', selector: '.nav-skills' },
  { key: 'academy', label: '飞象学院', view: 'academy', icon: 'academy', selector: '.nav-academy' },
  { key: 'mylib', label: '我的知识库', view: 'mylib', icon: 'mylib', selector: '.nav-mylib' },
].map(Object.freeze))

const itemsByKey = new Map(PRIMARY_NAV_ITEMS.map((item) => [item.key, item]))

const directViewOwners = Object.freeze({
  rank: 'discover',
  discover: 'discover',
  skills: 'skills',
  skill: 'skills',
  academy: 'academy',
  mylib: 'mylib',
})

// 有「返回」按钮的页面不显示侧边导航（二者互斥）
const fullscreenViews = new Set(['creator', 'share', 'report', 'topic'])

export function getPrimaryNavItem(key) {
  return itemsByKey.get(key) ?? null
}

export function resolvePrimaryNav(view, currentKey = 'home') {
  return directViewOwners[view] ?? (itemsByKey.has(currentKey) ? currentKey : 'home')
}

export function hasPrimarySidebar(view) {
  return !fullscreenViews.has(view)
}
