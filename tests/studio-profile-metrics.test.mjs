import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const studioHtml = await readFile(new URL('../src/views/raw/studio.html', import.meta.url), 'utf8')

function hero(mode) {
  const guestStart = studioHtml.indexOf('<div class="mode-guest">')
  const ownerStart = studioHtml.indexOf('<div class="mode-owner">')
  const tabsStart = studioHtml.indexOf('<!-- tabs(真切换) -->')

  assert.notEqual(guestStart, -1)
  assert.notEqual(ownerStart, -1)
  assert.notEqual(tabsStart, -1)
  return mode === 'guest' ? studioHtml.slice(guestStart, ownerStart) : studioHtml.slice(ownerStart, tabsStart)
}

function statLabels(html) {
  const stats = html.slice(html.indexOf('class="st-stats"'))
  return [...stats.matchAll(/margin-left:6px;">([^<]+)<\/span>/g)].map((m) => m[1])
}

function tabs(mode) {
  const pattern = mode === 'guest'
    ? /<div class="mode-guest" style="display:flex; gap:28px;">([\s\S]*?)<\/div>/
    : /<div class="mode-owner st-owner-tabs">([\s\S]*?)<\/div>/
  return studioHtml.match(pattern)?.[1]
}

test('客态数据行只有被使用、被收藏；主态多关注、关注者且样式一致', () => {
  assert.deepEqual(statLabels(hero('guest')), ['被使用', '被收藏'])
  assert.deepEqual(statLabels(hero('owner')), ['被使用', '被收藏', '关注', '关注者'])
  for (const mode of ['guest', 'owner']) {
    assert.doesNotMatch(hero(mode), /获赞|粉丝|创作影响力|被改编|st-relations/, mode)
  }
  assert.doesNotMatch(hero('guest'), /关注者/)
})

test('主态、客态页签都带数字且都有技能页签', () => {
  for (const mode of ['guest', 'owner']) {
    const html = tabs(mode)
    assert.ok(html, mode)
    assert.match(html, /data-stab="s-wk">作品 \d+<\/span>/, mode)
    assert.match(html, /data-stab="s-sk">技能 \d+<\/span>/, mode)
    assert.match(html, /data-stab="s-tp">专题 (<span data-album-count>)?\d+/, mode)
    assert.match(html, /data-stab="s-ab">关于<\/span>/, mode)
  }
})

test('技能卡只出现在技能页签，作品卡底栏展示收藏数', () => {
  const works = studioHtml.slice(studioHtml.indexOf('id="s-wk"'), studioHtml.indexOf('id="s-sk"'))
  const skills = studioHtml.slice(studioHtml.indexOf('id="s-sk"'), studioHtml.indexOf('id="s-tp"'))

  assert.doesNotMatch(works, /nav-skill/)
  assert.equal((skills.match(/class="stcard mode-guest nav-skill"/g) || []).length, 2)
  assert.match(skills, /class="stcard mode-owner/)
  assert.doesNotMatch(studioHtml, /♥/)
})

test('专题页不展示说明文案，专题卡只展示资源数、讲次不展示类型', () => {
  const topics = studioHtml.slice(studioHtml.indexOf('id="s-tp"'), studioHtml.indexOf('id="s-ab"'))

  assert.doesNotMatch(topics, /把一个个作品组织成/)
  assert.doesNotMatch(topics, / 讲 · |使用<\/span>/)
  assert.match(topics, /共 4 个资源/)
  assert.doesNotMatch(topics, /font-size:11\.5px;color:#9A9A9A;margin-top:2px;/)
})

test('客态专题卡接到专题详情页', () => {
  const topics = studioHtml.slice(studioHtml.indexOf('id="s-tp"'), studioHtml.indexOf('id="s-ab"'))
  assert.equal((topics.match(/class="mode-guest" data-topic-id="[^"]+" role="link"/g) || []).length, 2)
  assert.doesNotMatch(topics, /nav-res/)
})

test('客态关注按钮可切换，主态技能卡进技能详情', () => {
  const skills = studioHtml.slice(studioHtml.indexOf('id="s-sk"'), studioHtml.indexOf('id="s-tp"'))

  assert.match(hero('guest'), /<button type="button" class="st-follow-btn" aria-pressed="false"[^>]*>\+ 关注<\/button>/)
  assert.doesNotMatch(skills, /nav-res/)
})

test('姓名后不展示认证对勾，界面文案统一叫专题', () => {
  assert.doesNotMatch(hero('guest'), /M20 6L9 17l-5-5/)
  assert.doesNotMatch(studioHtml, /专辑/)
})
