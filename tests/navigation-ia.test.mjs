import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'

import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import {
  PRIMARY_NAV_ITEMS,
  getPrimaryNavItem,
  hasPrimarySidebar,
  resolvePrimaryNav,
} from '../src/navigation/primary-nav.mjs'

let vite

before(async () => {
  process.env.VITE_CJS_IGNORE_WARNING = 'true'
  const { createServer } = await import('vite')
  vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  })
})

after(async () => {
  await vite.close()
})

async function renderSidebar(activeKey, collapsed = false) {
  const { default: Sidebar } = await vite.ssrLoadModule('/src/components/Sidebar.vue')
  const { store: ssrStore } = await vite.ssrLoadModule('/src/store.js')
  const previousKey = ssrStore.primaryNav
  const previousCollapsed = ssrStore.sidebarCollapsed
  ssrStore.primaryNav = activeKey
  ssrStore.sidebarCollapsed = collapsed
  try {
    return await renderToString(createSSRApp(Sidebar))
  } finally {
    ssrStore.primaryNav = previousKey
    ssrStore.sidebarCollapsed = previousCollapsed
  }
}

test('主导航只有五个稳定入口，并使用确认后的名称和顺序', () => {
  assert.deepEqual(
    PRIMARY_NAV_ITEMS.map(({ key, label, view }) => ({ key, label, view })),
    [
      { key: 'home', label: '首页', view: null },
      { key: 'discover', label: '灵感', view: 'rank' },
      { key: 'skills', label: '教育智库', view: 'skills' },
      { key: 'academy', label: '飞象学院', view: 'academy' },
      { key: 'mylib', label: '我的知识库', view: 'mylib' },
    ],
  )
  assert.equal(getPrimaryNavItem('home')?.externalUrl, 'https://www.feixianglaoshi.com/#/home')
  assert.equal(getPrimaryNavItem('academy')?.label, '飞象学院')
  assert.equal(getPrimaryNavItem('missing'), null)
})

test('主页面决定归属，二级页面继承来源，全屏流程隐藏侧栏', () => {
  assert.equal(resolvePrimaryNav('rank', 'home'), 'discover')
  assert.equal(resolvePrimaryNav('discover', 'home'), 'discover')
  assert.equal(resolvePrimaryNav('skills', 'home'), 'skills')
  assert.equal(resolvePrimaryNav('skill', 'home'), 'skills')
  assert.equal(resolvePrimaryNav('academy', 'home'), 'academy')
  assert.equal(resolvePrimaryNav('mylib', 'home'), 'mylib')
  assert.equal(resolvePrimaryNav('res', 'discover'), 'discover')
  assert.equal(resolvePrimaryNav('lineage', 'home'), 'home')
  assert.equal(resolvePrimaryNav('res', 'invalid'), 'home')
  assert.equal(hasPrimarySidebar('creator'), false)
  assert.equal(hasPrimarySidebar('share'), false)
  assert.equal(hasPrimarySidebar('report'), false)
  assert.equal(hasPrimarySidebar('academy'), true)
})

test('主导航展示确认后的五个入口，展开态和收起态共用名称', async () => {
  const html = await renderSidebar('academy')
  const primary = html.match(/<nav class="side-navs"[\s\S]*?<\/nav>/)?.[0] || ''
  const compact = await renderSidebar('skills', true)

  assert.match(primary, /nav-home/)
  assert.match(primary, /href="https:\/\/www\.feixianglaoshi\.com\/#\/home"/)
  assert.match(primary, /首页/)
  assert.match(primary, /nav-inspiration/)
  assert.match(primary, /灵感/)
  assert.match(primary, /nav-skills/)
  assert.match(primary, /教育智库/)
  assert.match(primary, /nav-academy/)
  assert.match(primary, /飞象学院/)
  assert.match(primary, /nav-mylib/)
  assert.match(primary, /我的知识库/)
  assert.doesNotMatch(primary, /资源广场|应用广场|nav-notify|>消息</)
  assert.equal(primary.match(/class="[^"]*nav-(?:home|inspiration|skills|academy|mylib)/g)?.length, 5)
  assert.match(primary, /<button[^>]*class="[^"]*nav-academy[^"]*"[^>]*aria-current="page"/)
  assert.doesNotMatch(primary, /<button[^>]*class="[^"]*nav-home[^"]*"[^>]*aria-current="page"/)
  assert.match(compact, /title="教育智库"/)
  assert.match(compact, /title="飞象学院"/)
  assert.match(compact, /<button[^>]*class="[^"]*nav-skills[^"]*"[^>]*aria-current="page"/)
})

test('侧栏移除旧积分推广卡并保留正式站底部入口', async () => {
  const html = await renderSidebar('academy')

  assert.doesNotMatch(html, /side-promo|晒应用赢双倍积分/)
  assert.match(html, /side-history-search/)
  assert.match(html, /side-campus[\s\S]*?切换校园版/)
})

test('消息只放在我的菜单，并保留未读数', async () => {
  const html = await renderSidebar('me')
  const menu = html.match(/<div class="avatar-menu"[\s\S]*?<\/div><\/div><\/div><\/aside>/)?.[0] || html

  assert.match(menu, /nav-notify/)
  assert.match(menu, />消息</)
  assert.match(menu, />3</)
  assert.match(html, /avatar-trigger[^>]*aria-expanded="false"/)
})

test('灵感与飞象学院分别高亮对应入口', async () => {
  const inspiration = await renderSidebar('discover')
  const academy = await renderSidebar('academy')

  assert.match(inspiration, /<button[^>]*class="[^"]*nav-inspiration[^"]*"[^>]*aria-current="page"/)
  assert.doesNotMatch(inspiration, /nav-home[^"]*aria-current="page"/)
  assert.match(academy, /<button[^>]*class="[^"]*nav-academy[^"]*"[^>]*aria-current="page"/)
})

test('主导航动作同时更新归属和页面，普通页面同步保留二级来源', async () => {
  const { showPrimary, store, syncPrimaryNav } = await vite.ssrLoadModule('/src/store.js')
  const previous = { view: store.view, primaryNav: store.primaryNav }
  try {
    assert.equal(showPrimary('discover'), true)
    assert.equal(store.view, 'rank')
    assert.equal(store.primaryNav, 'discover')
    store.view = 'res'
    assert.equal(syncPrimaryNav('res'), 'discover')
    assert.equal(store.primaryNav, 'discover')
    assert.equal(showPrimary('missing'), false)
  } finally {
    Object.assign(store, previous)
  }
})

test('五个主导航入口统一使用主导航配置和状态动作', () => {
  const delegation = readFileSync(new URL('../src/composables/delegation.js', import.meta.url), 'utf8')

  assert.match(delegation, /PRIMARY_NAV_ITEMS/)
  assert.match(delegation, /showPrimary/)
  assert.match(delegation, /go\(item\.view, \{ primaryNav: item\.key \}\)/)
  assert.match(delegation, /\['\.nav-rank', 'rank'\]/)
  assert.match(delegation, /\['\.nav-discover', 'discover'\]/)
  assert.match(delegation, /item\.externalUrl/)
  assert.doesNotMatch(delegation, /\['\.nav-academy', 'academy'\]/)
})

test('根应用拥有唯一侧栏，各页面不再挂载自己的侧栏', () => {
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  assert.equal((app.match(/<Sidebar\b/g) ?? []).length, 1)
  assert.match(app, /class="community-app-shell"/)
  assert.match(app, /class="community-view-stack"/)

  const viewFiles = [
    'AcademyView.vue', 'ActivityView.vue', 'DiscoverView.vue', 'LineageView.vue',
    'LocalView.vue', 'MonthlyView.vue', 'MyLibraryView.vue', 'NotifyView.vue',
    'RankView.vue', 'ResView.vue', 'SkillPlazaView.vue', 'SkillView.vue', 'StudioView.vue',
  ]
  for (const filename of viewFiles) {
    const source = readFileSync(new URL(`../src/views/${filename}`, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /import Sidebar/)
    assert.doesNotMatch(source, /<Sidebar\b/)
    assert.match(source, /class="page"/)
  }
})

test('根应用统一控制全屏流程的侧栏可见性', () => {
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  assert.match(app, /hasPrimarySidebar\(store\.view\)/)
  assert.match(app, /<Sidebar[^>]*v-show="sidebarVisible"/)
})

test('独立飞象学院只输出嵌入内容，不挂载社区侧栏', () => {
  const app = readFileSync(new URL('../academy-standalone/src/App.vue', import.meta.url), 'utf8')
  const academy = readFileSync(new URL('../academy-standalone/src/views/AcademyView.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(app, /Sidebar/)
  assert.doesNotMatch(app, /<Sidebar\b/)
  assert.doesNotMatch(academy, /Sidebar/)
  assert.doesNotMatch(academy, /<Sidebar\b/)
})
