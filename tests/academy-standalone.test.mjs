import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { shouldRequireLogin } from '../academy-standalone/src/lib/academy-host-bridge.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const projectRoot = join(repoRoot, 'academy-standalone')
const sourceRoot = join(projectRoot, 'src')
const distRoot = join(projectRoot, 'dist')

function walkFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name)
    return entry.isDirectory() ? walkFiles(path) : [path]
  })
}

test('AI 教学工坊是可脱离社区主工程构建的独立源码工程', () => {
  const requiredFiles = [
    'package.json',
    'vite.config.js',
    'index.html',
    'README.md',
    'src/main.js',
    'src/App.vue',
    'src/views/AcademyView.vue',
  ]
  requiredFiles.forEach((path) => {
    assert.equal(existsSync(join(projectRoot, path)), true, `缺少独立工程文件：${path}`)
  })

  const sourceFiles = walkFiles(sourceRoot).filter((path) => ['.js', '.mjs', '.vue', '.css', '.html'].includes(extname(path)))
  sourceFiles.forEach((path) => {
    const source = readFileSync(path, 'utf8')
    assert.doesNotMatch(source, /(?:from\s*|import\s*)['"]\.\.\/\.\.\//, `${relative(projectRoot, path)} 引用了独立工程外部文件`)
  })
})

test('AI 教学工坊构建产物按资源拆分且满足交付体积预算', () => {
  execFileSync('npm', ['run', 'build'], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  })

  const indexPath = join(distRoot, 'index.html')
  const assetRoot = join(distRoot, 'assets')
  assert.equal(existsSync(indexPath), true, '缺少 dist/index.html')
  assert.equal(existsSync(assetRoot), true, '构建产物没有拆出 dist/assets')

  const assets = walkFiles(assetRoot)
  const scriptAssets = assets.filter((path) => extname(path) === '.js')
  assert.ok(scriptAssets.length >= 2, '教学工坊页面代码应与应用壳层拆成独立 JS 文件')
  assert.ok(assets.some((path) => extname(path) === '.css'), '构建产物缺少独立 CSS 文件')
  assert.ok(statSync(indexPath).size < 50_000, 'index.html 不应重新变成内联大文件')

  const largestAsset = assets.reduce((largest, path) => (
    statSync(path).size > statSync(largest).size ? path : largest
  ), assets[0])
  assert.ok(
    statSync(largestAsset).size < 1_500_000,
    `单个构建资源过大：${basename(largestAsset)} (${statSync(largestAsset).size} bytes)`,
  )

  const totalBytes = [indexPath, ...assets].reduce((sum, path) => sum + statSync(path).size, 0)
  assert.ok(totalBytes < 9_000_000, `AI 教学工坊构建产物总量过大：${totalBytes} bytes`)
})

test('提交审核只在宿主明确返回未登录时拦截', () => {
  assert.equal(shouldRequireLogin(), false)
  assert.equal(shouldRequireLogin({ isLoggedIn: () => true }), false)
  assert.equal(shouldRequireLogin({ isLoggedIn: () => false }), true)
})

test('隐藏课程不预加载视频，课程封面使用浏览器原生懒加载', () => {
  const raw = readFileSync(join(sourceRoot, 'views/raw/academy.html'), 'utf8')
  const renderer = readFileSync(join(sourceRoot, 'lib/academy-course-renderer.mjs'), 'utf8')
  assert.doesNotMatch(raw, /preload="metadata"/)
  assert.doesNotMatch(renderer, /preload="metadata"/)
  assert.match(renderer, /loading="lazy"/)
  assert.match(renderer, /decoding="async"/)
})
