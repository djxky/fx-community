import assert from 'node:assert/strict'
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

test('主导航复原飞象老师正式站的四个入口', async () => {
  const html = await renderSidebar('academy')
  const primary = html.match(/<nav class="side-navs"[\s\S]*?<\/nav>/)?.[0] || ''

  assert.match(primary, /nav-home/)
  assert.match(primary, /首页/)
  assert.match(primary, /nav-discover/)
  assert.match(primary, /资源广场/)
  assert.match(primary, /nav-skills/)
  assert.match(primary, /应用广场/)
  assert.match(primary, /nav-mylib/)
  assert.match(primary, /我的知识库/)
  assert.doesNotMatch(primary, /灵感|技能广场|AI 教学工坊|nav-notify|>消息</)
  assert.equal(primary.match(/<button\b/g)?.length, 4)
  assert.match(primary, /<button[^>]*class="[^"]*nav-home[^"]*"[^>]*aria-current="page"/)
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

test('技能页的侧边栏能正确高亮应用广场', async () => {
  const html = await renderSidebar('skills')
  assert.match(html, /<button[^>]*class="[^"]*nav-skills[^"]*"[^>]*aria-current="page"/)
  assert.doesNotMatch(html, /<button[^>]*class="[^"]*nav-home[^"]*"[^>]*aria-current="page"/)
})
