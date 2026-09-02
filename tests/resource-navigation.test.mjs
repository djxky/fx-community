import test from 'node:test'
import assert from 'node:assert/strict'

import {
  bindForkCardResourceIds,
  buildResourceUrl,
  getResourceNavigationState,
  getResourceRouteFromSearch,
  isResourceActivationKey,
  isSlideResourceKind,
} from '../src/resource-navigation.mjs'
import { getAdaptedAttribution } from '../src/resource-attribution.mjs'

test('改编卡片会保留各自的资源 ID，点击后能识别目标版本', () => {
  const html = [
    '<div class="nav-res fg-community-remix-card">周涛版</div>',
    '<div class="nav-res fg-community-remix-card">李敏版</div>',
  ].join('')

  const rendered = bindForkCardResourceIds(html, ['res-xl-zhoutao', 'res-xl-limin'])

  assert.match(rendered, /data-resource-id="res-xl-zhoutao"[^>]*>周涛版/)
  assert.match(rendered, /data-resource-id="res-xl-limin"[^>]*>李敏版/)
})

test('选择一个有效改编版本会进入对应资源详情态', () => {
  const next = getResourceNavigationState('res-xl-zhoutao', new Set(['res-xianglin', 'res-xl-zhoutao']))

  assert.deepEqual(next, {
    view: 'res',
    resourceId: 'res-xl-zhoutao',
  })
})

test('无效资源 ID 不会触发详情跳转', () => {
  const next = getResourceNavigationState('missing', new Set(['res-xianglin']))

  assert.equal(next, null)
})

test('混合类型中包含课件时使用 PPT 式页面缩略轨道', () => {
  assert.equal(isSlideResourceKind('剧本杀/课件'), true)
  assert.equal(isSlideResourceKind('PPT 互动课件'), true)
  assert.equal(isSlideResourceKind('Web App'), false)
})

test('可聚焦的资源卡片支持回车和空格进入详情', () => {
  assert.equal(isResourceActivationKey('Enter'), true)
  assert.equal(isResourceActivationKey(' '), true)
  assert.equal(isResourceActivationKey('Escape'), false)
})

test('原创与改编详情会生成各自可复制的独立地址', () => {
  assert.equal(
    buildResourceUrl('/飞象社区原型-vue.html', 'res-xianglin'),
    '/飞象社区原型-vue.html?view=res&resource=res-xianglin',
  )
  assert.equal(
    buildResourceUrl('/飞象社区原型-vue.html', 'res-xl-zhoutao'),
    '/飞象社区原型-vue.html?view=res&resource=res-xl-zhoutao',
  )
})

test('刷新独立地址会恢复到指定资源详情而不是排行榜', () => {
  const availableIds = new Set(['res-xianglin', 'res-xl-zhoutao'])

  assert.deepEqual(
    getResourceRouteFromSearch('?view=res&resource=res-xl-zhoutao', availableIds),
    { view: 'res', resourceId: 'res-xl-zhoutao' },
  )
  assert.equal(getResourceRouteFromSearch('?view=res&resource=missing', availableIds), null)
})

test('改编页来源信息始终指向原作者与被改编的版本', () => {
  const attribution = getAdaptedAttribution(
    {
      author: { name: '周涛' },
      forkedFrom: 'res-xianglin',
      forkedFromVersion: 'V10',
    },
    {
      id: 'res-xianglin',
      title: '我把〈祝福〉上成一场庭审·祥林嫂剧本杀',
      author: { name: '林若水' },
      versions: [{ v: 'V10' }, { v: 'V11' }],
    },
  )

  assert.deepEqual(attribution, {
    adapterName: '周涛',
    originalResourceId: 'res-xianglin',
    originalAuthorName: '林若水',
    originalTitle: '我把〈祝福〉上成一场庭审·祥林嫂剧本杀',
    sourceVersion: 'V10',
  })
})
