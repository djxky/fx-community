import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'

import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

let vite

before(async () => {
  process.env.VITE_CJS_IGNORE_WARNING = 'true'
  const { createServer } = await import('vite')
  vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
})

after(async () => {
  await vite.close()
})

test('技能广场保留专家入口，并把推荐与探索技能组织成可筛选列表', async () => {
  const { SKILL_CATALOG, filterSkills } = await vite.ssrLoadModule('/src/data/skills.js')
  const { default: SkillPlazaView } = await vite.ssrLoadModule('/src/views/SkillPlazaView.vue')
  const html = await renderToString(createSSRApp(SkillPlazaView))

  assert.ok(SKILL_CATALOG.length >= 8)
  assert.ok(SKILL_CATALOG.every((item) => item.kind === '技能'))
  assert.equal(filterSkills(SKILL_CATALOG, '语文', '').length, 2)
  assert.deepEqual(filterSkills(SKILL_CATALOG, '全部', '沈砚').map((item) => item.id), ['res-skill-zuowen'])
  assert.match(html, /专家入驻/)
  assert.match(html, /刘彭芝/)
  assert.match(html, /苏窈/)
  assert.match(html, /沈知微/)
  assert.match(html, /拔尖创新人才早期培养/)
  assert.match(html, /深耕中学英语听说教学/)
  assert.match(html, /北京市数学学科带头人/)
  assert.match(html, /人使用/)
  assert.doesNotMatch(html, /人关注/)
  assert.doesNotMatch(html, /把好老师的方法|装进你的课堂|选择经过验证的教学技能/)
  assert.match(html, /编辑精选/)
  assert.match(html, /探索技能/)
  assert.match(html, /搜技能名称、学科或作者/)
  assert.equal((html.match(/class="skill-author-avatar"/g) || []).length, 12)
  assert.match(html, /作文批改 Skill/)
  assert.match(html, /分层作业 Skill/)
  assert.match(html, /查看详情/)
  assert.match(html, /即将开放/)
  assert.doesNotMatch(html, /互动课件|教案|题单/)
  assert.doesNotMatch(html, /精选文章|创作者激励计划|活动 banner/)
})

test('技能广场与灵感页共用内容边界，并按侧栏后的可用宽度切换卡片列数', async () => {
  const { default: SkillPlazaView } = await vite.ssrLoadModule('/src/views/SkillPlazaView.vue')
  const html = await renderToString(createSSRApp(SkillPlazaView))
  const source = readFileSync(new URL('../src/views/SkillPlazaView.vue', import.meta.url), 'utf8')
  const shared = readFileSync(new URL('../src/styles/community.css', import.meta.url), 'utf8')

  assert.match(html, /class="[^"]*community-main/)
  assert.match(html, /class="[^"]*community-body/)
  assert.match(source, /import '\.\.\/styles\/community\.css'/)
  assert.match(source, /\.featured-grid\s*\{[^}]*grid-template-columns:repeat\(var\(--community-columns\),minmax\(0,1fr\)\)[^}]*gap:var\(--community-gap\)/)
  assert.match(shared, /:is\(#view-discover, #view-rank, #view-skills\)/)
  assert.doesNotMatch(source, /\.skills-shell\s*\{[^}]*width:min\(/)
  assert.doesNotMatch(source, /@media\(max-width:1100px\)\s*\{[^}]*\.featured-grid/)
})
