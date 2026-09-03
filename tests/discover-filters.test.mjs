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

test('发现页分两行展示来源学科与资源类型，默认推荐加全部', async () => {
  const { default: DiscoverView } = await vite.ssrLoadModule('/src/views/DiscoverView.vue')
  const html = await renderToString(createSSRApp(DiscoverView))
  const filterButtons = [...html.matchAll(/<button[^>]*class="[^"]*\btchip2\b[^"]*"[^>]*>([^<]+)<\/button>/g)]
    .map((match) => match[1].trim())

  assert.deepEqual(filterButtons, [
    '关注', '推荐', '语文', '数学', '英语', '物理', '化学', '信息科技',
    '全部', '互动课件', '教学游戏', '应用', '技能', '教案', '题单',
  ])
  assert.match(html, /aria-label="来源与学科筛选"/)
  assert.match(html, /aria-label="资源类型筛选"/)
  const recommendButtonAttrs = html.match(/<button([^>]*)>推荐<\/button>/)?.[1] || ''
  const allButtonAttrs = html.match(/<button([^>]*)>全部<\/button>/)?.[1] || ''
  assert.match(recommendButtonAttrs, /class="[^"]*\bon\b[^"]*"/)
  assert.match(allButtonAttrs, /class="[^"]*\bon\b[^"]*"/)
  assert.doesNotMatch(html, />本地<\/button>/)
  assert.doesNotMatch(html, /切换城市|北京 · 同城资源/)
})

test('发现页右上角只保留搜索框，不再重复展示学科学段选择器', async () => {
  const { default: DiscoverView } = await vite.ssrLoadModule('/src/views/DiscoverView.vue')
  const html = await renderToString(createSSRApp(DiscoverView))

  assert.match(html, /class="tbar-search"/)
  assert.doesNotMatch(html, /class="tbar-subj"/)
  assert.doesNotMatch(html, /切换学科·学段/)
})
