import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { setupAcademyVideoPause } from './academy-video-playback.mjs'
const { JSDOM } = createRequire(import.meta.url)('jsdom')

test('回放复用对应列表封面，只有进入详情才预加载元数据且返回后不重置播放进度', () => {
  const dom = new JSDOM(`<div id="root"><input type="radio" name="lp" id="lp-home" checked><input type="radio" name="lp" id="lp-30"><input type="radio" name="lp" id="lp-31"><label class="vcard" for="lp-30"><div class="vthumb" style="background-image:url(https://example.com/cover.jpg)"></div></label><div id="LP-30"><div class="lp-video"><video preload="none" poster=""></video></div></div><div id="LP-31"><div class="lp-video"><video preload="none" poster="existing.jpg"></video></div></div></div>`)
  const root = dom.window.document.querySelector('#root'), videos = root.querySelectorAll('video')
  let loads = 0
  videos.forEach(video => { video.pause = () => {}; video.load = () => { loads++ } })
  const cleanup = setupAcademyVideoPause(root)
  assert.equal(videos[0].getAttribute('poster'), 'https://example.com/cover.jpg')
  assert.equal(videos[1].getAttribute('poster'), 'existing.jpg')
  assert.equal(loads, 0)
  root.querySelector('#lp-30').dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  assert.equal(videos[0].preload, 'metadata')
  assert.equal(videos[1].preload, 'none')
  assert.equal(loads, 1)
  root.querySelector('#lp-home').dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  root.querySelector('#lp-30').dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  assert.equal(loads, 1)
  cleanup(); dom.window.close()
})
