import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'

import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

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

async function renderSidebar(active) {
  const { default: Sidebar } = await vite.ssrLoadModule('/src/components/Sidebar.vue')
  return renderToString(createSSRApp(Sidebar, { active }))
}

test('主导航展示首页、灵感、技能广场、AI 教学工坊和我的知识库', async () => {
  const html = await renderSidebar('academy')
  const primary = html.match(/<nav class="side-navs"[\s\S]*?<\/nav>/)?.[0] || ''

  assert.match(primary, /nav-home/)
  assert.match(primary, /首页/)
  assert.match(primary, /nav-discover/)
  assert.match(primary, /灵感/)
  assert.match(primary, /nav-skills/)
  assert.match(primary, /技能广场/)
  assert.match(primary, /nav-academy/)
  assert.match(primary, /AI 教学工坊/)
  assert.match(primary, /nav-mylib/)
  assert.match(primary, /我的知识库/)
  assert.doesNotMatch(primary, /资源广场|应用广场|nav-notify|>消息</)
  assert.equal(primary.match(/<button\b/g)?.length, 5)
  assert.match(primary, /<button[^>]*class="[^"]*nav-academy[^"]*"[^>]*aria-current="page"/)
  assert.doesNotMatch(primary, /<button[^>]*class="[^"]*nav-home[^"]*"[^>]*aria-current="page"/)
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

test('首页与 AI 教学工坊分别高亮对应入口', async () => {
  const home = await renderSidebar('home')
  const academy = await renderSidebar('academy')

  assert.match(home, /<button[^>]*class="[^"]*nav-home[^"]*"[^>]*aria-current="page"/)
  assert.doesNotMatch(home, /<button[^>]*class="[^"]*nav-academy[^"]*"[^>]*aria-current="page"/)
  assert.match(academy, /<button[^>]*class="[^"]*nav-academy[^"]*"[^>]*aria-current="page"/)
})

test('五个主导航入口分别映射到对应页面', () => {
  const delegation = readFileSync(new URL('../src/composables/delegation.js', import.meta.url), 'utf8')

  assert.match(delegation, /\['\.nav-rank', 'rank'\]/)
  assert.match(delegation, /\['\.nav-discover', 'discover'\]/)
  assert.match(delegation, /\['\.nav-skills', 'skills'\]/)
  assert.match(delegation, /\['\.nav-academy', 'academy'\]/)
  assert.match(delegation, /\['\.nav-mylib', 'mylib'\]/)
})
