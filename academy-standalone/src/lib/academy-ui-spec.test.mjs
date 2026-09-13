import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { renderAcademyCourseUi } from './academy-course-renderer.mjs'

const { JSDOM } = createRequire(import.meta.url)('jsdom')
const academyUiCss = readFileSync(new URL('../styles/academy-ui.css', import.meta.url), 'utf8')

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function declarationsFor(selector) {
  const match = academyUiCss.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]+)\\}`))
  assert.ok(match, `缺少视觉规格规则：${selector}`)
  return Object.fromEntries(match[1]
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separator = declaration.indexOf(':')
      return [declaration.slice(0, separator).trim(), declaration.slice(separator + 1).trim()]
    }))
}

test('课程筛选只展示选项，不再展示用途与类型标题', () => {
  const rendered = renderAcademyCourseUi({
    courses: [{
      id: 'sample',
      title: '示例课程',
      duration: '2:23',
      teacher: '示例教师｜示例学校',
      coverFile: 'sample.jpg',
      videoUrl: 'https://example.com/sample.mp4',
      categories: ['all', 'video'],
      goals: ['示例目标'],
    }],
    useFilters: [{ key: 'all', label: '全部' }],
    typeFilters: [{ key: 'all', label: '全部' }, { key: 'video', label: '视频' }],
    coverUrls: { 'sample.jpg': 'https://example.com/sample.jpg' },
  })
  const dom = new JSDOM(rendered.library)

  assert.equal(dom.window.document.querySelector('.lf-label'), null)
  assert.equal(dom.window.document.querySelector('.lib-filter-use .chip')?.textContent, '全部')
  assert.equal(dom.window.document.querySelector('.lib-filter-type .chip')?.textContent, '全部')
})

test('筛选空状态内联设计原始 SVG 且保留现有文案', () => {
  const emptyStateIcon = readFileSync(
    new URL('../assets/academy/empty-states/course-filter-empty.svg', import.meta.url),
    'utf8',
  )
  const rendered = renderAcademyCourseUi({
    courses: [],
    useFilters: [],
    typeFilters: [],
    coverUrls: {},
    emptyStateIcon,
  })
  const dom = new JSDOM(rendered.library)
  const emptyState = dom.window.document.querySelector('.course-empty')

  assert.equal(emptyState?.querySelector('svg')?.getAttribute('viewBox'), '0 0 120 90')
  assert.equal(emptyState?.querySelector('strong')?.textContent, '内容即将上线')
  assert.equal(emptyState?.querySelector('span:last-child')?.textContent, '敬请期待更多课程')
})

test('Banner 圆点按 6px 默认态与 20px 选中态呈现', () => {
  const idle = declarationsFor('#app #view-academy .hero .dots label')
  assert.deepEqual({
    width: idle.width,
    height: idle.height,
    border: idle.border,
    background: idle.background,
    opacity: idle.opacity,
  }, {
    width: '6px',
    height: '6px',
    border: '0.5px solid var(--musk-v3-semantic-page-bg, var(--surface))',
    background: 'var(--musk-v3-semantic-text-secondary, var(--muted))',
    opacity: '0.5',
  })

  const selected = declarationsFor(`#app #view-academy .hero #hs1:checked ~ .hero-controls .dots label[for="hs1"],
#app #view-academy .hero #hs2:checked ~ .hero-controls .dots label[for="hs2"]`)
  assert.deepEqual({
    width: selected.width,
    height: selected.height,
    borderRadius: selected['border-radius'],
    border: selected.border,
    background: selected.background,
    opacity: selected.opacity,
  }, {
    width: '20px',
    height: '6px',
    borderRadius: '23px',
    border: '0.5px solid var(--musk-v3-semantic-page-bg, var(--surface))',
    background: 'var(--musk-v3-semantic-text-secondary, var(--muted))',
    opacity: '1',
  })
})

test('所有视频时长使用同一套自适应胶囊规格', () => {
  const declarations = declarationsFor(`#app #view-academy .vthumb .dur,
#app #view-academy .lthumb .dur,
#app #view-academy .pl-dur`)
  assert.deepEqual({
    width: declarations.width,
    fontSize: declarations['font-size'],
    fontWeight: declarations['font-weight'],
    lineHeight: declarations['line-height'],
    padding: declarations.padding,
    borderRadius: declarations['border-radius'],
    color: declarations.color,
    background: declarations.background,
  }, {
    width: 'auto',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '17px',
    padding: '0 5px',
    borderRadius: '8.5px',
    color: 'var(--musk-v3-semantic-text-inverse, var(--surface))',
    background: 'var(--musk-v3-semantic-overlay-control-bg)',
  })
})

test('课程分类标签保持 20px 总高并使用最新版灰色规格', () => {
  const declarations = declarationsFor('#app #view-academy .course-tags span')
  assert.deepEqual({
    boxSizing: declarations['box-sizing'],
    height: declarations.height,
    fontSize: declarations['font-size'],
    fontWeight: declarations['font-weight'],
    lineHeight: declarations['line-height'],
    padding: declarations.padding,
    borderRadius: declarations['border-radius'],
    color: declarations.color,
    background: declarations.background,
  }, {
    boxSizing: 'border-box',
    height: '20px',
    fontSize: '10px',
    fontWeight: '400',
    lineHeight: '14px',
    padding: '3px 5px',
    borderRadius: '6px',
    color: 'var(--musk-v3-semantic-text-secondary, var(--muted))',
    background: 'var(--musk-v3-semantic-page-subtle-bg)',
  })
})

test('课程目标圆点使用主文字色而不是黄色警示色', () => {
  const declarations = declarationsFor('#app #view-academy .lp-goals li::before')
  assert.equal(declarations.background, 'var(--musk-v3-semantic-text-primary, var(--ink))')
})
