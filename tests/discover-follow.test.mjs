import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { buildFollowAuthors, buildFollowPosts, filterByAuthor } from '../src/lib/discover-follow.mjs'

const feed = [
  { actor: '刘彭芝', actorType: 'person', expert: true, portrait: 'liu.jpg', resource: { title: '祥林嫂剧本杀', meta: '初中语文 · 九年级' } },
  { actor: '人民教育出版社·数学编辑部', actorType: 'org', mark: '人教', resource: { title: '圆的面积·同步题单', meta: '小学数学 · 六年级' } },
  { actor: '刘彭芝', actorType: 'person', expert: true, portrait: 'liu.jpg', resource: { title: '物质转化共备', meta: '高中化学' } },
]
const posts = [
  { author: '刘彭芝', title: '五位老师共备“物质转化”' },
  { author: '周涛', title: '《出师表》决策地图' },
  { author: '刘彭芝', title: '祥林嫂剧本杀' },
]

test('关注头像行：同一作者只出现一次，按最近动态排序，老师和机构都在', () => {
  const authors = buildFollowAuthors(feed)
  assert.deepEqual(authors.map((a) => a.name), ['刘彭芝', '人民教育出版社·数学编辑部'])
  assert.equal(authors[0].portrait, 'liu.jpg')
  assert.equal(authors[0].expert, true)
  assert.equal(authors[1].org, true)
  assert.equal(authors[1].mark, '人教')
})

test('默认展示全部关注对象的资源：合并推荐里这些作者的资源、按标题去重、不混入未关注作者', () => {
  const titles = buildFollowPosts(feed, posts).map((p) => p.title)
  assert.deepEqual(titles, ['祥林嫂剧本杀', '圆的面积·同步题单', '物质转化共备', '五位老师共备“物质转化”'])
  assert.ok(!titles.includes('《出师表》决策地图'))
})

test('点头像只看该作者；取消选中回到全部', () => {
  const all = buildFollowPosts(feed, posts)
  assert.deepEqual(filterByAuthor(all, '人民教育出版社·数学编辑部').map((p) => p.title), ['圆的面积·同步题单'])
  assert.equal(filterByAuthor(all, '').length, all.length)
})

test('发现页在关注下展示头像行，模块号按页面顺序：3 关注作者 / 4 筛选区 / 5 卡片流', () => {
  const source = readFileSync(new URL('../src/views/DiscoverView.vue', import.meta.url), 'utf8')
  assert.match(source, /v-if="activeMode === 'follow'"[^>]*class="follow-authors"[^>]*data-sec="3"/)
  assert.match(source, /class="filter-panel" data-sec="4"/)
  assert.match(source, /class="flow" data-sec="5"/)
  assert.match(source, /data-track="\/click\/discoverPage\/followAuthor \|/)
})
