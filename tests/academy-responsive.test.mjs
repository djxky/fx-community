import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('1599px 中屏缩小学院页边距，固定卡宽仍能稳定展示三列', () => {
  const css = readFileSync(new URL('../src/styles/academy-ui.css', import.meta.url), 'utf8')

  assert.match(
    css,
    /@media \(max-width: 1599px\)\s*\{\s*#app #view-academy \{ --academy-gutter: 24px; \}/,
  )
})
