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

test('发现页使用单行来源与学科分类，默认推荐且不再提供本地入口', async () => {
  const { default: DiscoverView } = await vite.ssrLoadModule('/src/views/DiscoverView.vue')
  const html = await renderToString(createSSRApp(DiscoverView))
  const filterButtons = [...html.matchAll(/<button[^>]*class="[^"]*\btchip2\b[^"]*"[^>]*>([^<]+)<\/button>/g)]
    .map((match) => match[1].trim())

  assert.deepEqual(filterButtons, ['关注', '推荐', '语文', '数学', '英语', '物理', '化学', '信息科技'])
  assert.match(html, /aria-label="发现分类"/)
  const recommendButtonAttrs = html.match(/<button([^>]*)>推荐<\/button>/)?.[1] || ''
  assert.match(recommendButtonAttrs, /class="[^"]*\bon\b[^"]*"/)
  assert.doesNotMatch(html, /aria-label="来源筛选"/)
  assert.doesNotMatch(html, /aria-label="资源类型筛选"/)
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
