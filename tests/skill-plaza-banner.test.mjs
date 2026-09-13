import assert from 'node:assert/strict'
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

test('百校共创计划在教学广场首屏形成独立可理解的入口', async () => {
  const { default: SkillPlazaView } = await vite.ssrLoadModule('/src/views/SkillPlazaView.vue')
  const html = await renderToString(createSSRApp(SkillPlazaView))

  assert.match(html, /<section[^>]*class="hundred-schools-banner"[^>]*aria-labelledby="hundred-schools-title"/)
  assert.match(html, /中国百校 · 教育智慧共创计划/)
  assert.match(html, /id="hundred-schools-title"[^>]*>让教育智慧，走进更多教师的日常/)
  assert.match(html, /面向全国卓越校长及所在学校，共建可学习、可使用、可传承的教育智库。/)
  assert.match(html, />了解共建计划</)
  assert.match(html, />参与共建</)
})

test('教育智库保留原结构并使用适配多元主体的表述', async () => {
  const { default: SkillPlazaView } = await vite.ssrLoadModule('/src/views/SkillPlazaView.vue')
  const html = await renderToString(createSSRApp(SkillPlazaView))

  assert.match(html, /教育智库/)
  assert.match(html, /专家入驻/)
  assert.match(html, /编辑精选/)
  // 探索区改为顶部两个 tab：技能广场 / 专家团
  assert.match(html, /技能广场/)
  assert.match(html, /专家团/)
})
