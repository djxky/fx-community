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
