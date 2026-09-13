import test from 'node:test'
import assert from 'node:assert/strict'
import { createSubmissionState, emptyDraft } from './creation-submission.mjs'
const item = id => ({ id, activityId: 'feixiang-ai-creation-2026', data: { title: '作品', direction: 1, workLink: 'https://feixianglaoshi.biz/x' }, createdAt: 1, updatedAt: 2 })
test('分页按原游标追加且去重，刷新清空游标，不提供撤回', async () => {
  const cursors = []
  const api = { checkLogin: async () => 'u1', loadMine: async cursor => {
    cursors.push(cursor); return cursor == null ? { items: [item('001')], hasMore: true, nextCursor: 'opaque/1' }
      : { items: [item('001'),item('002')], hasMore: false, nextCursor: null }
  } }
  const state = createSubmissionState(api)
  assert.equal(state.withdraw, undefined)
  await state.load()
  await state.load()
  await state.load()
  assert.deepEqual(cursors, [null, 'opaque/1'])
  assert.deepEqual(state.records.map(x => x.id), ['001','002'])
  assert.equal(state.getDraft('001').url, 'https://feixianglaoshi.biz/x')
  await state.load(true)
  assert.equal(cursors[2], null)
})
test('重置后旧列表响应不能回填另一个账号', async () => {
  let resolve
  const state = createSubmissionState({ checkLogin: async () => 'u1', loadMine: () => new Promise(r => { resolve = r }) })
  const pending = state.load()
  await new Promise(r => setImmediate(r))
  state.reset()
  resolve({ items: [item('old')], hasMore: false, nextCursor: null })
  await pending
  assert.equal(state.records.length, 0)
})
test('保存只执行一次且用服务端 ID，失败不伪造成功', async () => {
  let resolve; let count = 0
  const api = { checkLogin: async () => 'u1', saveCreation: () => { count++; return new Promise(r => { resolve = r }) } }
  const state = createSubmissionState(api)
  const pending = state.save(emptyDraft())
  assert.equal(await state.save(emptyDraft()), null)
  await new Promise(r => setImmediate(r))
  resolve({ success: true, id: 'encrypted001', createdAt: 1, updatedAt: 2 })
  assert.equal((await pending).id, 'encrypted001')
  assert.equal(count, 1)
  assert.equal(state.saving, false)
  api.saveCreation = async () => { throw new Error('活动尚未开始') }
  await assert.rejects(state.save(emptyDraft()), /活动尚未开始/)
  assert.equal(state.records.length, 0)
})
test('编辑时账号变化必须停止，不能把旧账号投稿写到新账号', async () => {
  let user = 'u1'; let writes = 0
  const state = createSubmissionState({ checkLogin: async () => user,
    loadMine: async () => ({ items: [item('a')], hasMore: false, nextCursor: null }),
    saveCreation: async () => { writes++; } })
  await state.load(); user = 'u2'
  await assert.rejects(state.save(emptyDraft(), 'a'), /账号/)
  assert.equal(writes, 0)
})
