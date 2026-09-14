import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SYSTEM_TAGS,
  addTag,
  chaptersFor,
  describeTags,
  formatGrade,
  tagSuggestions,
  textbooksFor,
  validatePublish,
} from '../src/lib/publish-tags.mjs'

const filled = {
  title: '单词练练看',
  intro: '英语词汇配对小游戏',
  subject: '英语',
  labels: ['课堂练习'],
}

test('英语教材版本沿用线上列表，人教版在第三位', () => {
  assert.equal(textbooksFor('英语')[2], '人教版')
})

test('人教版高中选择性必修第一册的章节与线上一致', () => {
  const chapters = chaptersFor('英语', { textbook: '人教版', volume: '高中选择性必修第一册' })
  assert.equal(chapters[0], 'Unit 1 People of Achievement')
  assert.deepEqual(chapters.slice(-2), ['期中复习', '期末复习'])
})

test('年级未选完整时没有章节可选', () => {
  assert.deepEqual(chaptersFor('英语', { textbook: '人教版', volume: '' }), [])
})

test('年级展示为「教材版本 / 册」', () => {
  assert.equal(formatGrade({ textbook: '人教版', volume: '高中选择性必修第一册' }), '人教版 / 高中选择性必修第一册')
  assert.equal(formatGrade(null), '')
})

test('系统标签来自发现页灵感分类的任务层', () => {
  assert.ok(SYSTEM_TAGS.some((tag) => tag.label === '课堂练习' && tag.scene === 'classroom'))
})

test('加标签：去空格、去重，不改原数组', () => {
  const tags = ['课堂练习']
  assert.deepEqual(addTag(tags, '  单词游戏 ').tags, ['课堂练习', '单词游戏'])
  assert.equal(addTag(tags, '课堂练习').tags, tags)
  assert.equal(addTag(tags, '   ').tags, tags)
  assert.deepEqual(tags, ['课堂练习'])
})

test('加标签：超长和超数量给提示', () => {
  assert.equal(addTag([], '一二三四五六七八九十十一').error, '标签最多 10 个字')
  assert.equal(addTag(['a', 'b', 'c', 'd', 'e'], 'f').error, '最多添加 5 个标签')
})

test('没输入时候选是没选过的 AI 推荐', () => {
  assert.deepEqual(
    tagSuggestions('', ['课堂练习'], ['课堂练习', '互动探究']),
    [{ label: '互动探究', isNew: false }],
  )
})

test('输入时匹配系统标签，没有同名才给新建', () => {
  const partial = tagSuggestions('课堂', [])
  assert.ok(partial.some((s) => s.label === '课堂练习' && !s.isNew))
  assert.deepEqual(partial.at(-1), { label: '课堂', isNew: true })
  assert.ok(tagSuggestions('课堂练习', []).every((s) => !s.isNew))
  assert.deepEqual(tagSuggestions('单词游戏', []), [{ label: '单词游戏', isNew: true }])
})

test('发布时系统标签带场景和任务，自建标签标为自建', () => {
  assert.deepEqual(describeTags(['课堂练习', '单词游戏']), [
    { label: '课堂练习', scene: 'classroom', task: 'practice' },
    { label: '单词游戏', custom: true },
  ])
})

test('全部填好时校验通过；自定义适配标签可替代学科', () => {
  assert.equal(validatePublish(filled), null)
  assert.equal(validatePublish({ ...filled, subject: '', customTag: '英语/人教版' }), null)
})

test('按弹窗顺序报第一个没填的项', () => {
  assert.deepEqual(validatePublish({ ...filled, title: ' ', intro: '' }), { field: 'title', message: '请输入标题' })
  assert.deepEqual(validatePublish({ ...filled, intro: '  ' }), { field: 'intro', message: '请输入简介' })
  assert.deepEqual(validatePublish({ ...filled, subject: '' }), { field: 'fit', message: '请选择学科' })
  assert.deepEqual(validatePublish({ ...filled, labels: [] }), { field: 'labels', message: '请添加至少 1 个标签' })
})
