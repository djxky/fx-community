import test from 'node:test'
import assert from 'node:assert/strict'

const v2 = await import('../src/resource-detail-v2.mjs').catch(() => ({}))

test('v2 详情栏默认包含详情与讨论切换状态', () => {
  assert.equal(typeof v2.getResourcePanelState, 'function')
  assert.equal(typeof v2.renderPanelTabs, 'function')
  assert.deepEqual(v2.getResourcePanelState('detail'), { activePanel: 'detail' })
  assert.match(v2.renderPanelTabs('detail'), /详情/)
  assert.match(v2.renderPanelTabs('discussion'), /讨论/)
})

test('v2 页面把详情面板放在预览右侧，并把讨论作为同栏切换内容', () => {
  const html = v2.renderPanelLayout({
    preview: 'PREVIEW',
    authorActions: 'AUTHOR_ACTIONS',
    detail: 'DETAIL',
    discussion: 'DISCUSSION',
    lower: 'LOWER',
  })

  assert.match(html, /class="fg-v2-layout"/)
  assert.match(html, /data-panel="detail"/)
  assert.match(html, /data-panel="discussion"/)
  assert.ok(html.indexOf('fg-v2-panel') < html.indexOf('LOWER'))
})

test('v2 面板状态切换只改变右栏内容，不创建弹窗或抽屉', () => {
  assert.deepEqual(v2.getResourcePanelState('discussion'), { activePanel: 'discussion' })
  assert.match(v2.renderPanelState('discussion'), /data-active-panel="discussion"/)
  assert.doesNotMatch(v2.renderPanelState('discussion'), /modal|drawer|dialog/)
})
