import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'

import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

let vite

before(async () => {
  process.env.VITE_CJS_IGNORE_WARNING = 'true'
  const { createServer } = await import('vite')
  vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
  })
})

after(async () => {
  await vite.close()
})

test('技能广场用教育智库串起多元主体、代表能力和教师成果', async () => {
  const { KNOWLEDGE_PARTNERS, SKILL_CATALOG, filterSkills } = await vite.ssrLoadModule('/src/data/skills.js')
  const { default: SkillPlazaView } = await vite.ssrLoadModule('/src/views/SkillPlazaView.vue')
  const html = await renderToString(createSSRApp(SkillPlazaView))

  // 数据契约
  assert.ok(SKILL_CATALOG.length >= 8)
  assert.ok(KNOWLEDGE_PARTNERS.length >= 4)
  assert.ok(KNOWLEDGE_PARTNERS.every((item) => item.featuredAbility?.title))
  assert.ok(KNOWLEDGE_PARTNERS.every((item) => Array.isArray(item.outcomes) && item.outcomes.length >= 2))
  assert.ok(KNOWLEDGE_PARTNERS.some((item) => item.entityName.includes('海淀')))
  assert.ok(KNOWLEDGE_PARTNERS.some((item) => item.entityName.includes('人民教育出版社')))
  assert.deepEqual([...new Set(SKILL_CATALOG.map((item) => item.kind))].sort(), ['Agent', 'Skill'])
  assert.ok(filterSkills(SKILL_CATALOG, '全部', '', 'Agent').every((item) => item.kind === 'Agent'))
  assert.ok(filterSkills(SKILL_CATALOG, '全部', '', 'Skill').every((item) => item.kind === 'Skill'))
  assert.ok(filterSkills(SKILL_CATALOG, '全部', '沈砚').some((item) => item.id === 'res-skill-zuowen'))

  // 页面结构
  assert.match(html, /教育智库/)
  assert.match(html, /中国百校 · 教育智慧共创计划/)
  assert.match(html, /专家入驻/)
  assert.match(html, /编辑精选/)
  assert.match(html, /搜 Skill、Agent、教学任务或作者/)
  // 探索区为顶部两个 tab
  assert.match(html, /技能广场/)
  assert.match(html, /专家团/)

  // 默认展示「一所学校 + 一位专家」，且代表能力与教师成果前后对应
  assert.match(html, /北京十一学校 · 学科课程基地/)
  assert.match(html, /刘彭芝/)
  assert.match(html, /跨学科项目设计 Agent/)
  assert.match(html, /课堂提问设计 Agent/)
})

test('技能广场与灵感页共用内容边界，并按侧栏后的可用宽度切换卡片列数', async () => {
  const { default: SkillPlazaView } = await vite.ssrLoadModule('/src/views/SkillPlazaView.vue')
  const html = await renderToString(createSSRApp(SkillPlazaView))
  const source = readFileSync(new URL('../src/views/SkillPlazaView.vue', import.meta.url), 'utf8')
  const shared = readFileSync(new URL('../src/styles/community.css', import.meta.url), 'utf8')

  assert.match(html, /class="[^"]*community-main/)
  assert.match(html, /class="[^"]*community-body/)
  assert.match(source, /import '\.\.\/styles\/community\.css'/)
  assert.match(shared, /:is\(#view-discover, #view-rank, #view-skills\)/)
  // 探索区网格随宽度切换列数（3 → 2 → 1）
  assert.match(source, /\.ex-grid\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/)
  assert.match(source, /@media\(max-width:860px\)\{\.ex-grid\{grid-template-columns:repeat\(2/)
  assert.match(source, /@media\(max-width:520px\)\{\.ex-grid\{grid-template-columns:1fr\}/)
  assert.doesNotMatch(source, /\.skills-shell\s*\{[^}]*width:min\(/)
})
