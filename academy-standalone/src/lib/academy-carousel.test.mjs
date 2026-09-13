import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { setupAcademyCarousel } from './academy-carousel.mjs'

const { JSDOM } = createRequire(import.meta.url)('jsdom')

// 使用真实首页模板，防止只删 Banner 却遗留第三个切换状态或圆点，导致空白轮播。
test('首页运营位只在征集与直播之间循环，圆点对应有效 Banner', () => {
  const html = readFileSync(new URL('../views/raw/academy.html', import.meta.url), 'utf8')
  const dom = new JSDOM(html)
  const doc = dom.window.document
  let advance
  const cleanup = setupAcademyCarousel(doc, {
    windowObject: { setInterval(fn) { advance = fn; return 1 }, clearInterval() {} },
    documentObject: doc,
  })
  try {
    const active = () => doc.querySelector('.hero input[name="hs"]:checked').id
    const next = doc.querySelector('.hero-next')
    assert.equal(active(), 'hs1')
    next.click()
    assert.equal(active(), 'hs2')
    next.click()
    assert.equal(active(), 'hs1')
    doc.querySelector('.hero-prev').click()
    assert.equal(active(), 'hs2')
    advance()
    assert.equal(active(), 'hs1')
    const dots = [...doc.querySelectorAll('.hero .dots label')]
    assert.equal(dots.length, 2)
    for (const dot of dots) {
      dot.click()
      const radio = doc.getElementById(active())
      assert.equal(radio.id, dot.htmlFor)
      const slide = doc.querySelector('.hero .s' + radio.id.slice(2))
      assert.ok(slide.querySelector('.hero-campaign, .hero-live'))
    }
  } finally {
    cleanup()
    dom.window.close()
  }
})
