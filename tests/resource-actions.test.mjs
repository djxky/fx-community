import test from 'node:test'
import assert from 'node:assert/strict'
import { RESOURCES } from '../src/data/resources.js'

const resourceActions = await import('../src/resource-actions.mjs').catch(() => ({}))

const { getResourceActions, isResourceOwner } = resourceActions

test('每个详情资源显式声明应用或资源类型', () => {
  assert.ok(RESOURCES.length > 0)
  assert.ok(RESOURCES.every((resource) => ['app', 'resource'].includes(resource.contentType)))
  assert.ok(RESOURCES.every((resource) => resource.author.accountId))
})

test('主客态只由资源作者账号与当前登录账号是否一致决定', () => {
  assert.equal(typeof isResourceOwner, 'function')
  assert.equal(
    isResourceOwner(
      { author: { accountId: 'teacher-lin' } },
      { accountId: 'teacher-lin' },
    ),
    true,
  )
  assert.equal(
    isResourceOwner(
      { author: { accountId: 'teacher-lin' } },
      { accountId: 'teacher-chen' },
    ),
    false,
  )
  assert.equal(isResourceOwner({ author: {} }, { accountId: 'teacher-lin' }), false)
})

test('客态资源提供收藏、分享、改编和下载', () => {
  assert.equal(typeof getResourceActions, 'function')
  assert.deepEqual(getResourceActions({ contentType: 'resource', isOwner: false }), [
    { key: 'favorite', label: '收藏', emphasis: 'lightweight' },
    { key: 'share', label: '分享', emphasis: 'lightweight' },
    { key: 'adapt', label: '改编', emphasis: 'secondary' },
    { key: 'download', label: '下载', emphasis: 'primary' },
  ])
})

test('主态资源与客态资源保持同一组操作', () => {
  assert.deepEqual(
    getResourceActions({ contentType: 'resource', isOwner: true }),
    getResourceActions({ contentType: 'resource', isOwner: false }),
  )
})

test('客态应用提供收藏、分享、改编和复制副本', () => {
  assert.deepEqual(getResourceActions({ contentType: 'app', isOwner: false }), [
    { key: 'favorite', label: '收藏', emphasis: 'lightweight' },
    { key: 'share', label: '分享', emphasis: 'lightweight' },
    { key: 'adapt', label: '改编', emphasis: 'secondary' },
    { key: 'copy', label: '复制副本', emphasis: 'primary' },
  ])
})

test('主态应用提供收藏、分享和编辑', () => {
  assert.deepEqual(getResourceActions({ contentType: 'app', isOwner: true }), [
    { key: 'favorite', label: '收藏', emphasis: 'lightweight' },
    { key: 'share', label: '分享', emphasis: 'lightweight' },
    { key: 'edit', label: '编辑', emphasis: 'primary' },
  ])
})

test('原创和改编状态不会改变操作集合', () => {
  assert.deepEqual(
    getResourceActions({ contentType: 'app', isOwner: false, isAdapted: true }),
    getResourceActions({ contentType: 'app', isOwner: false, isAdapted: false }),
  )
})
