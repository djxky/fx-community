import assert from 'node:assert/strict'
import test from 'node:test'
import { formatCount } from '../src/lib/format-count.mjs'

test('不足 1 万保留完整数字与千分位', () => {
  assert.equal(formatCount(620), '620')
  assert.equal(formatCount('8,900'), '8,900')
  assert.equal(formatCount(9999), '9,999')
})

test('满 1 万显示为「x.x万」，整数时去掉 .0', () => {
  assert.equal(formatCount(10000), '1万')
  assert.equal(formatCount('11,200'), '1.1万')
  assert.equal(formatCount('46,200'), '4.6万')
  assert.equal(formatCount(100000), '10万')
})

test('满 1 亿显示为「x.x亿」', () => {
  assert.equal(formatCount(120000000), '1.2亿')
})

test('无法解析的值原样返回', () => {
  assert.equal(formatCount('2.4万'), '2.4万')
  assert.equal(formatCount(''), '')
  assert.equal(formatCount(undefined), '')
})
