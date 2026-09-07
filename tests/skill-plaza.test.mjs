import assert from 'node:assert/strict'
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

test('技能广场只渲染技能，并明确区分可用与即将开放', async () => {
  const { SKILL_CATALOG } = await vite.ssrLoadModule('/src/data/skills.js')
  const { default: SkillPlazaView } = await vite.ssrLoadModule('/src/views/SkillPlazaView.vue')
  const html = await renderToString(createSSRApp(SkillPlazaView))

  assert.ok(SKILL_CATALOG.length >= 2)
  assert.ok(SKILL_CATALOG.every((item) => item.kind === '技能'))
  assert.match(html, /作文批改 Skill/)
  assert.match(html, /分层作业 Skill/)
  assert.match(html, /查看详情/)
  assert.match(html, /即将开放/)
  assert.doesNotMatch(html, /互动课件|教案|题单/)
})
