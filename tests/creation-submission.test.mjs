import test from 'node:test'
import assert from 'node:assert/strict'
import { createSubmissionState, validateSubmission, toggleTag } from '../src/lib/creation-submission.mjs'

const now = () => new Date('2026-10-01T12:00:00+08:00')
const draft = () => ({ direction: 0, title: '课堂互动练习', url: 'https://www.feixianglaoshi.com/#/work/demo', description: '这是一个帮助学生理解知识并通过观察操作解决真实课堂问题的教育应用。老师可以引导学生自主探索，记录学习过程，并根据反馈继续改进教学。', stage: ['小学'], subject: ['数学'], scene: ['课堂教学'], creator: '演示老师', phone: '13800000000', identity: '一线教师', region: '北京市', organization: '演示学校', coCreators: '共同作者', agreed: true })

test('完整投稿保留所有表单字段并生成可查询的独立记录', () => {
  const state = createSubmissionState([], now)
  const result = state.save(draft())
  assert.equal(result.ok, true)
  assert.equal(state.records.length, 1)
  assert.equal(state.records[0].id, 'FXAI26-00001')
  assert.equal(state.records[0].description, draft().description)
  assert.deepEqual(state.records[0].subject, ['数学'])
  assert.equal(state.records[0].phone, '13800000000')
})

test('校验必填、简介长度、方向、电话、协议和安全网址', () => {
  for (const [field, value] of [['title', ' '], ['description', '太短'], ['direction', 9], ['phone', '123'], ['agreed', false], ['url', 'javascript:alert(1)'], ['url', 'ftp://example.com'], ['stage', []], ['subject', ['未知']]]) {
    const data = { ...draft(), [field]: value }
    assert.ok(validateSubmission(data, now())[field], field)
    const state = createSubmissionState([], now)
    assert.equal(state.save(data).ok, false)
    assert.equal(state.records.length, 0)
  }
})

test('标签上限分别为学段2个、学科3个、场景3个，取消选择不受限制', () => {
  assert.deepEqual(toggleTag(['小学', '初中'], '高中', 2), ['小学', '初中'])
  assert.deepEqual(toggleTag(['小学', '初中'], '小学', 2), ['初中'])
  assert.deepEqual(toggleTag(['语文', '数学'], '英语', 3), ['语文', '数学', '英语'])
  assert.ok(validateSubmission({ ...draft(), stage: ['小学', '初中', '高中'] }, now()).stage)
  assert.ok(validateSubmission({ ...draft(), subject: ['语文', '数学', '英语', '物理'] }, now()).subject)
  assert.ok(validateSubmission({ ...draft(), scene: ['课堂教学', '备课', '教研', '班级管理'] }, now()).scene)
})

test('修改原投稿保持编号与数量，不新增记录；草稿不污染已存记录', () => {
  const state = createSubmissionState([], now)
  const original = state.save(draft()).record
  const editing = state.getDraft(original.id)
  editing.title = '更新后的互动练习'
  editing.stage.push('初中')
  editing.agreed = true
  assert.equal(state.records[0].title, '课堂互动练习')
  assert.deepEqual(state.records[0].stage, ['小学'])
  assert.equal(state.save(editing, original.id).ok, true)
  assert.equal(state.records.length, 1)
  assert.equal(state.records[0].id, original.id)
  assert.equal(state.records[0].title, '更新后的互动练习')
})

test('撤回需要确认，删除后新投稿编号不复用', () => {
  const state = createSubmissionState([], now)
  const first = state.save(draft()).record
  assert.equal(state.withdraw(first.id, false), false)
  assert.equal(state.records.length, 1)
  assert.equal(state.withdraw(first.id, true), true)
  assert.equal(state.records.length, 0)
  assert.equal(state.save(draft()).record.id, 'FXAI26-00002')
  assert.equal(state.save(draft(), first.id).ok, false)
})

test('截止时仍可投稿，截止后停止新增和修改', () => {
  assert.deepEqual(validateSubmission(draft(), new Date('2026-11-30T23:59:59+08:00')), {})
  const state = createSubmissionState([], () => new Date('2026-12-01T00:00:00+08:00'))
  assert.equal(state.save(draft()).ok, false)
  assert.equal(state.records.length, 0)
})
