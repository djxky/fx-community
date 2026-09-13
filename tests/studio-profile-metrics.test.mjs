import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const studioHtml = await readFile(new URL('../src/views/raw/studio.html', import.meta.url), 'utf8')

function ownerHero() {
  const ownerStart = studioHtml.indexOf('<div class="mode-owner">')
  const tabsStart = studioHtml.indexOf('<!-- tabs(真切换) -->')

  assert.notEqual(ownerStart, -1)
  assert.notEqual(tabsStart, -1)
  return studioHtml.slice(ownerStart, tabsStart)
}

test('我的主页把身份标签、关注和粉丝合并为同一行', () => {
  const hero = ownerHero()
  const metaLine = hero.match(/<div class="st-owner-meta-line"[^>]*>([\s\S]*?)<\/div>/)?.[1]

  assert.ok(metaLine)
  assert.match(metaLine, /语文[\s\S]*小学[\s\S]*爱做沉浸式互动课[\s\S]*5[\s\S]*关注[\s\S]*860\+[\s\S]*粉丝/)
  assert.doesNotMatch(metaLine, /被使用|被收藏|被改编/)
  assert.doesNotMatch(hero, /欢迎大家收藏和下载我的作品/)
  assert.doesNotMatch(hero, /class="st-owner-relations"/)
})

test('我的主页把使用、改编和收藏归入创作影响力', () => {
  const hero = ownerHero()
  const impact = hero.match(/<div class="st-owner-impact"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/)?.[1]

  assert.ok(impact)
  assert.equal((impact.match(/class="st-owner-impact-metric/g) || []).length, 3)
  assert.match(impact, /1,240[\s\S]*被使用[\s\S]*86[\s\S]*被改编[\s\S]*633[\s\S]*被收藏/)
  assert.doesNotMatch(impact, /关注|粉丝/)
})

test('我的主页标签只展示内容类型并提供技能入口', () => {
  const ownerTabs = studioHtml.match(/<div class="mode-owner st-owner-tabs">([\s\S]*?)<\/div>/)?.[1]

  assert.ok(ownerTabs)
  assert.match(ownerTabs, /data-stab="s-wk">作品<\/span>/)
  assert.match(ownerTabs, /data-stab="s-sk">技能<\/span>/)
  assert.match(ownerTabs, /data-stab="s-tp">专题<\/span>/)
  assert.match(ownerTabs, /data-stab="s-ab">关于<\/span>/)
  assert.doesNotMatch(ownerTabs, /\d/)
  assert.match(studioHtml, /class="spanel" id="s-sk"/)
})
