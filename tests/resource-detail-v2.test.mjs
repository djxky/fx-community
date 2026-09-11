import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

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
  assert.doesNotMatch(html, /data-v2-panel="discussion" hidden/)
  assert.doesNotMatch(html, /data-v2-panel="versions" hidden/)
})

test('v2 面板状态切换只改变右栏内容，不创建弹窗或抽屉', () => {
  assert.deepEqual(v2.getResourcePanelState('discussion'), { activePanel: 'discussion' })
  assert.match(v2.renderPanelState('discussion'), /data-active-panel="discussion"/)
  assert.doesNotMatch(v2.renderPanelState('discussion'), /modal|drawer|dialog/)
})

test('v2 操作区沿用线上布局，位于左侧预览底部', () => {
  const raw = readFileSync(new URL('../src/views/raw/res.html', import.meta.url), 'utf8')
  assert.match(raw, /fg-v2-resource-footer/)
  assert.match(raw, /__RES_FOOTER_ACTIVITY__/)
  assert.match(raw, /__RES_PRIMARY_ACTIONS__/)
})

test('v2 详情页不再显示面包屑或详情 Tab，讨论区保留输入入口', () => {
  const raw = readFileSync(new URL('../src/views/raw/res.html', import.meta.url), 'utf8')
  const view = readFileSync(new URL('../src/views/ResView.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(raw, /class="fg-crumb"/)
  assert.doesNotMatch(raw, /fg-v2-panel-tabs/)
  assert.match(view, /fg-v2-discussion-composer/)
  assert.match(view, /说点什么/)
  assert.ok(view.indexOf('data-v2-panel="versions"') < view.indexOf('data-v2-panel="discussion"'))
})
