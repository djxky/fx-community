import test from 'node:test'
import assert from 'node:assert/strict'
import { RESOURCES_BY_ID } from '../src/data/resources.js'
import { isResourceOwner } from '../src/resource-actions.mjs'

const preview = await import('../src/resource-state-preview.mjs').catch(() => ({}))

const currentUser = { accountId: 'teacher-cherry', name: '樱桃小魔丸子🔥' }

test('状态预览器能生成资源与应用的全部八种主客原创改编组合', () => {
  assert.equal(typeof preview.createPreviewResource, 'function')

  const cases = [
    { contentType: 'resource', viewer: 'guest', source: 'original' },
    { contentType: 'resource', viewer: 'guest', source: 'adapted' },
    { contentType: 'resource', viewer: 'owner', source: 'original' },
    { contentType: 'resource', viewer: 'owner', source: 'adapted' },
    { contentType: 'app', viewer: 'guest', source: 'original' },
    { contentType: 'app', viewer: 'guest', source: 'adapted' },
    { contentType: 'app', viewer: 'owner', source: 'original' },
    { contentType: 'app', viewer: 'owner', source: 'adapted' },
  ]

  for (const state of cases) {
    const resource = preview.createPreviewResource(state, { currentUser, resourcesById: RESOURCES_BY_ID })

    assert.equal(resource.contentType, state.contentType, JSON.stringify(state))
    assert.equal(isResourceOwner(resource, currentUser), state.viewer === 'owner', JSON.stringify(state))
    assert.equal(Boolean(resource.forkedFrom), state.source === 'adapted', JSON.stringify(state))
    if (resource.forkedFrom) {
      assert.equal(RESOURCES_BY_ID[resource.forkedFrom].contentType, state.contentType, JSON.stringify(state))
    }
  }
})

test('状态预览地址保留当前资源并可在刷新后恢复选择', () => {
  assert.equal(typeof preview.buildResourcePreviewUrl, 'function')
  assert.equal(typeof preview.getResourcePreviewStateFromSearch, 'function')

  const state = { contentType: 'app', viewer: 'owner', source: 'adapted' }
  const url = preview.buildResourcePreviewUrl(
    '/index.html',
    '?view=res&resource=res-xianglin',
    state,
  )

  assert.equal(
    url,
    '/index.html?view=res&resource=res-xianglin&preview=1&previewType=app&previewViewer=owner&previewSource=adapted',
  )
  assert.deepEqual(preview.getResourcePreviewStateFromSearch(url.split('?')[1]), {
    enabled: true,
    state,
  })
})

test('关闭状态预览会删除预览参数但保留详情地址', () => {
  assert.equal(typeof preview.clearResourcePreviewUrl, 'function')

  assert.equal(
    preview.clearResourcePreviewUrl(
      '/index.html',
      '?view=res&resource=res-order-game&preview=1&previewType=resource&previewViewer=guest&previewSource=original',
    ),
    '/index.html?view=res&resource=res-order-game',
  )
})
