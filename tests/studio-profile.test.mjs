import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const studioHtml = await readFile(new URL('../src/views/raw/studio.html', import.meta.url), 'utf8')

test('个人主页默认展示作品且不再提供动态入口', () => {
  assert.doesNotMatch(studioHtml, /data-stab="s-dt"/)
  assert.doesNotMatch(studioHtml, /id="s-dt"/)
  assert.match(studioHtml, /class="stab son" data-stab="s-wk">作品 38<\/span>/)
  assert.match(studioHtml, /<div class="sbody norail">/)
  assert.doesNotMatch(studioHtml, /<button[^>]*>私信<\/button>/)
})
