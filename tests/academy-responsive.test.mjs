import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('学院卡片按飞象老师的主内容宽度规则切换两、三、四列', () => {
  const css = readFileSync(new URL('../src/styles/academy-ui.css', import.meta.url), 'utf8')

  assert.match(css, /--academy-card-width: 348px;/)
  assert.match(css, /--academy-content-width: 713px;/)
  assert.match(css, /--academy-grid-gap: 17px;/)
  assert.match(css, /min-width: 785px;/)
  assert.match(css, /container: academy-main \/ inline-size;/)
  assert.match(css, /grid-template-columns: repeat\(2, var\(--academy-card-width\)\);/)
  assert.match(css, /@container academy-main \(min-width: 1151px\)/)
  assert.match(css, /--academy-content-width: 1078px;/)
  assert.match(css, /grid-template-columns: repeat\(3, var\(--academy-card-width\)\);/)
  assert.match(css, /@container academy-main \(min-width: 1537px\)/)
  assert.match(css, /--academy-content-width: 1464px;/)
  assert.match(css, /--academy-grid-gap: 24px;/)
  assert.match(css, /grid-template-columns: repeat\(4, var\(--academy-card-width\)\);/)
})
