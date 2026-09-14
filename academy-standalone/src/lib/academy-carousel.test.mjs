import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { setupAcademyCarousel } from './academy-carousel.mjs'

const { JSDOM } = createRequire(import.meta.url)('jsdom')

// 使用真实首页模板。9.11 直播结束后直播预告 Banner 已下线，首页只剩征集 Banner：
// 防止只删 Banner 却遗留 hs2 单选项、圆点或切换按钮，导致轮播切到空白页或出现无效控件。
test('首页运营位只保留征集 Banner，不启动轮播也不渲染切换控件', () => {
  const html = readFileSync(new URL('../views/raw/academy.html', import.meta.url), 'utf8')
  const dom = new JSDOM(html)
  const doc = dom.window.document
  let timerStarted = false
  const cleanup = setupAcademyCarousel(doc, {
    windowObject: { setInterval() { timerStarted = true; return 1 }, clearInterval() {} },
    documentObject: doc,
  })
  try {
    const radios = [...doc.querySelectorAll('.hero input[name="hs"]')]
    assert.deepEqual(radios.map((radio) => radio.id), ['hs1'])
    assert.ok(radios[0].checked, '征集 Banner 依赖 #hs1:checked 才会显示')
    assert.equal(doc.querySelectorAll('.hero .hslide').length, 1)
    assert.ok(doc.querySelector('.hero .s1 .hero-campaign'))
    assert.equal(doc.querySelector('.hero .hero-live'), null)
    assert.equal(doc.querySelector('.hero .hero-controls'), null)
    assert.equal(timerStarted, false, '单张 Banner 不应启动自动轮播')
  } finally {
    cleanup()
    dom.window.close()
  }
})
