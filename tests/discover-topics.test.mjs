import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'

import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

import { buildTopicPosts, mixTopicPosts } from '../src/lib/discover-topics.mjs'

let vite

before(async () => {
  process.env.VITE_CJS_IGNORE_WARNING = 'true'
  const { createServer } = await import('vite')
  vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
})

after(async () => {
  await vite.close()
})

const topics = {
  published: { id: 'published', title: '整本书阅读 · 经典重构', author: { name: '林若水' }, community: { published: true, scene: 'classroom', task: 'interact' } },
  draft: { id: 'draft', title: '未发布专题', author: { name: '林若水' }, community: { published: false, scene: 'classroom', task: 'interact' } },
  empty: { id: 'empty', title: '空专题', author: { name: '林若水' }, community: { published: true, scene: 'prep', task: 'design' } },
  legacy: { id: 'legacy', title: '没有发布设置的专题', author: { name: '林若水' } },
}
const resources = [
  { topicMembership: { id: 'published' }, cover: 'a.jpg', fit: { subject: '语文', grade: '初中·九年级' }, stats: { use: 3268 } },
  { topicMembership: { id: 'published' }, cover: null, fit: { subject: '语文', grade: '初中·七年级' }, stats: { use: 1200 } },
  { topicMembership: { id: 'published' }, cover: 'c.jpg', fit: { subject: '语文', grade: '初中·八年级' }, stats: { use: 1000 } },
  { topicMembership: { id: 'published' }, cover: 'd.jpg', fit: { subject: '语文', grade: '初中·九年级' }, stats: { use: 532 } },
  { topicMembership: { id: 'draft' }, cover: 'x.jpg', fit: { subject: '数学', grade: '小学' } },
  { topicMembership: { id: 'legacy' }, cover: 'y.jpg', fit: { subject: '数学', grade: '小学' } },
]

test('只放发布到社区且至少有 1 个资源的专题', () => {
  const posts = buildTopicPosts(topics, resources, ['fallback.jpg'])
  assert.deepEqual(posts.map((p) => p.topicId), ['published'])
})

test('专题卡：角标写资源数，封面取第一个资源（无封面用兜底图），学科学段由资源推出', () => {
  const [post] = buildTopicPosts(topics, resources, ['fallback.jpg'])
  assert.equal(post.kind, 'topic')
  assert.equal(post.badge, '专题 · 4 个资源')
  assert.equal(post.cover, 'a.jpg')
  const [noCover] = buildTopicPosts(topics, [{ ...resources[1] }], ['fallback.jpg'])
  assert.equal(noCover.cover, 'fallback.jpg')
  assert.equal(post.author, '林若水')
  assert.equal(post.subject, '语文')
  assert.equal(post.stage, '初中')
  assert.equal(post.scene, 'classroom')
})

test('专题卡混进推荐流：第一个放在第 3 张', () => {
  const mixed = mixTopicPosts([{ title: '1' }, { title: '2' }, { title: '3' }, { title: '4' }], [{ title: 'T' }])
  assert.deepEqual(mixed.map((p) => p.title), ['1', '2', 'T', '3', '4'])
  assert.deepEqual(mixTopicPosts([{ title: '1' }], [{ title: 'T' }]).map((p) => p.title), ['1', 'T'])
})

test('专题卡渲染成一叠卡片（资源 ≥3 垫 2 张卡边，否则 1 张）、单张封面与专题角标，不带资源信息行', async () => {
  const { default: PostCard } = await vite.ssrLoadModule('/src/components/PostCard.vue')
  const [post] = buildTopicPosts(topics, resources, ['fallback.jpg'])
  const html = await renderToString(createSSRApp(PostCard, { post, compact: true }))
  assert.match(html, /class="[^"]*\bpc--deck\b[^"]*"/)
  assert.equal((html.match(/class="pc-sheet pc-sheet--\d"/g) || []).length, 2)
  assert.match(html, /class="pc-face"/)
  assert.match(html, /src="a\.jpg"/)
  assert.doesNotMatch(html, /pc-mosaic|pc-tile|pc-stack/)
  const small = await renderToString(createSSRApp(PostCard, { post: { ...post, count: 2 }, compact: true }))
  assert.equal((small.match(/class="pc-sheet pc-sheet--\d"/g) || []).length, 1)
  const resourceCard = await renderToString(createSSRApp(PostCard, { post: { ...post, kind: undefined }, compact: true }))
  assert.doesNotMatch(resourceCard, /pc--deck|pc-sheet|pc-face/)
  assert.match(html, /专题 · 4 个资源/)
  assert.match(html, /整本书阅读 · 经典重构/)
  assert.doesNotMatch(html, /pc-meta/)
  assert.match(html, />6,000<\/b><span[^>]*> 累计使用<\/span>/)
})

test('专题卡累计使用 = 专题内全部资源使用人数之和', () => {
  const withStats = resources.map((resource, i) => ({ ...resource, stats: { use: [3268, 1200, 1000, 532, 9, 9][i] } }))
  const [post] = buildTopicPosts(topics, withStats, ['fallback.jpg'])
  assert.equal(post.evi.use, '6,000')
})

test('发现页点专题卡进专题详情页，返回回到发现页', () => {
  const source = readFileSync(new URL('../src/views/DiscoverView.vue', import.meta.url), 'utf8')
  assert.match(source, /store\.topicReturn = 'discover'/)
  assert.match(source, /store\.view = 'topic'/)
  assert.match(source, /\/click\/discoverPage\/topicCard \|/)
})
