import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildViewUrl,
  getViewRouteFromSearch,
} from '../src/view-navigation.mjs'

test('AI 教学工坊独立地址会恢复到学院页面', () => {
  assert.deepEqual(getViewRouteFromSearch('?view=academy'), { view: 'academy' })
})

test('资源详情参数和未知页面参数不会误判为学院页面', () => {
  assert.equal(getViewRouteFromSearch('?view=res&resource=res-xianglin'), null)
  assert.equal(getViewRouteFromSearch('?view=unknown'), null)
})

test('进入 AI 教学工坊会生成可分享的独立地址，离开时清除页面参数', () => {
  assert.equal(buildViewUrl('/fx-community/', 'academy'), '/fx-community/?view=academy')
  assert.equal(buildViewUrl('/fx-community/', 'rank'), '/fx-community/')
})
