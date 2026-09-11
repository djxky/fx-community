import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const resourceActivity = await import('../src/resource-activity.mjs').catch(() => ({}))

test('资源即使没有评论也会提供默认的最近动态', () => {
  assert.equal(typeof resourceActivity.getRecentResourceActivities, 'function')

  const activities = resourceActivity.getRecentResourceActivities({ contributors: [] })

  assert.ok(activities.length >= 4)
  assert.deepEqual(new Set(activities.map((item) => item.type)), new Set(['adapt', 'favorite', 'download']))
  assert.ok(activities.every((item) => item.actor && item.action && item.time))
})

test('已有共创者会优先出现在改编动态中', () => {
  const activities = resourceActivity.getRecentResourceActivities({
    contributors: [{ name: '周涛' }],
  })

  assert.deepEqual(activities[0], {
    actor: '周涛',
    action: '改编了这个资源',
    type: 'adapt',
    time: '3 分钟前',
  })
})

test('最近动态位于讨论输入区上方，原评论区完整保留', () => {
  const html = readFileSync(new URL('../src/views/raw/res.html', import.meta.url), 'utf8')
  const activityIndex = html.indexOf('__RES_RECENT_ACTIVITY__')
  const commentComposerIndex = html.indexOf('class="fbtypes"')
  const commentItemIndex = html.indexOf('class="fbitem"')

  assert.ok(activityIndex > html.indexOf('id="fg-discussion"'))
  assert.ok(activityIndex < commentComposerIndex)
  assert.ok(commentComposerIndex < commentItemIndex)
})

test('最近动态自动滚动，悬停和减少动态效果时停止', () => {
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')

  assert.match(css, /@keyframes\s+fgActivityTicker/)
  assert.match(css, /\.fg-activity-card:hover\s+\.fg-activity-track[^}]*animation-play-state:\s*paused/)
  assert.match(css, /@media\s*\(prefers-reduced-motion:reduce\)[\s\S]*\.fg-activity-track[^}]*animation:\s*none/)
})
