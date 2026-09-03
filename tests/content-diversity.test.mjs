import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

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

test('发现页使用多学科真实内容与学院丰富素材，不再只复用旧资源封面', async () => {
  const { POSTS } = await vite.ssrLoadModule('/src/data/discover.js')
  const text = POSTS.map((post) => `${post.badge} ${post.meta} ${post.title}`).join(' ')
  const editorialCoverCount = POSTS.filter((post) => post.cover.includes('/assets/community-editorial/')).length

  assert.equal(POSTS.length, 9)
  assert.equal(new Set(POSTS.map((post) => post.cover)).size, POSTS.length)
  assert.ok(editorialCoverCount >= 8, `社区丰富素材仅 ${editorialCoverCount} 张`)
  for (const subject of ['语文', '数学', '英语', '物理', '化学', '信息科技']) {
    assert.match(text, new RegExp(subject), subject)
  }
  for (const type of ['互动课件', '教学游戏', '应用', '技能', '教案', '题单']) {
    assert.match(text, new RegExp(type), type)
  }
})

test('排行榜各模块使用足够多的不同代表作，且作者仍来自固定卡司', async () => {
  const { BOARDS, EDITORIAL_FEATURES } = await vite.ssrLoadModule('/src/data/rank.js')
  const visible = {
    classroom: 9,
    latest: 8,
    adaptation: 3,
    recognized: 9,
    rising: 8,
  }
  const fixedCast = new Set(['林若水', '沈知微', '张伟', '沈砚', '刘彭芝', '陈红', '周涛', '李明', '李敏', '王芳', '苏窈'])
  const visibleItems = []

  for (const [key, count] of Object.entries(visible)) {
    const board = BOARDS.find((item) => item.key === key)
    const items = board.items.slice(0, count)
    const covers = items.map((item) => item.cover)

    assert.equal(new Set(covers).size, covers.length, `${key} 出现重复封面`)
    visibleItems.push(...items)
  }

  const distinctCovers = new Set(visibleItems.map((item) => item.cover))
  const content = visibleItems.map((item) => `${item.workTitle || item.name} ${item.sub}`).join(' ')

  assert.ok(distinctCovers.size >= 20, `可见榜单只有 ${distinctCovers.size} 张不同封面`)
  for (const subject of ['语文', '数学', '英语', '物理', '化学', '信息科技', '音乐', '体育']) {
    assert.match(content, new RegExp(subject), subject)
  }
  for (const item of [...visibleItems, ...EDITORIAL_FEATURES]) {
    assert.ok(fixedCast.has(item.author || item.name), `${item.author || item.name} 不在固定卡司中`)
  }
})
