import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { setupCreationCampaign } from './creation-campaign.mjs'
import { renderAcademyCourseUi } from './academy-course-renderer.mjs'
import { installAcademyHostBridge } from './academy-host-bridge.mjs'
const { JSDOM } = createRequire(import.meta.url)('jsdom')
const tick = () => new Promise(resolve => setTimeout(resolve, 0))
test('成功态真正隐藏表单与说明，关闭再打开恢复填写态', async () => {
  const html = renderAcademyCourseUi({ courses: [], useFilters: [], typeFilters: [], coverUrls: {} }).submitCta
  const dom = environment('<button data-academy-submit-open>投稿</button>' + html), doc = dom.window.document
  const wrapper = doc.createElement('div'); wrapper.id = 'app'
  doc.body.appendChild(wrapper); wrapper.appendChild(doc.querySelector('#view-academy'))
  // 加载生产 CSS，捕获 display:flex 覆盖 hidden 的真实级联问题，而非只断言 DOM 属性。
  const raw = readFileSync(new URL('../views/raw/academy.html', import.meta.url), 'utf8')
  const style = doc.createElement('style')
  // jsdom 不支持容器查询；此处只装载真实的桌面顶层弹窗规则，移动端另做浏览器验证。
  const postcss = createRequire(import.meta.url)('postcss')
  const sheets = [...Array.from(raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g), match => match[1]), readFileSync(new URL('../styles/academy-ui.css', import.meta.url), 'utf8')]
  style.textContent = sheets.flatMap(sheet => postcss.parse(sheet).nodes.filter(node => node.type === 'rule' && node.selector.includes('academy-submission')).map(node => node.toString())).join('\n')
  doc.head.appendChild(style)
  const api = { workshops: async () => [{ workshopId: 'w', workshopName: '课堂' }], checkLogin: async () => 'u1',
    saveWorkshop: async () => ({ success: true, id: 'saved', createdAt: 1, updatedAt: 1 }) }
  const cleanup = installAcademyHostBridge(doc, {}, api)
  try {
    doc.querySelector('[data-academy-submit-open]').click(); await tick()
    const form = doc.querySelector('form'), modal = doc.querySelector('.academy-submission-modal'), success = doc.querySelector('.academy-submission-success')
    Object.entries({ workshopId: 'w', workUrl: 'https://feixianglaoshi.biz/x', province: '北京', city: '北京', school: '实验小学', certificateName: '张三', email: 'a@b.com' }).forEach(([key, value]) => { form.elements[key].value = value })
    form.querySelector('[type="submit"]').click(); await tick()
    assert.equal(dom.window.getComputedStyle(form).display, 'none')
    assert.equal(dom.window.getComputedStyle(doc.querySelector('.academy-submission-aside')).display, 'none')
    assert.equal(modal.dataset.state, 'success')
    assert.equal(success.hidden, false)
    assert.equal(success.querySelector('button').textContent, '我知道了')
    success.querySelector('button').click()
    assert.equal(modal.hidden, true)
    doc.querySelector('[data-academy-submit-open]').click(); await tick()
    assert.equal(modal.dataset.state, 'form')
    assert.notEqual(dom.window.getComputedStyle(form).display, 'none')
    assert.equal(dom.window.getComputedStyle(success).display, 'none')
  } finally { cleanup(); dom.window.close() }
})
test('课堂提交校验和接口失败显示 toast，保留草稿且重试成功清除提示', async () => {
  const html = renderAcademyCourseUi({ courses: [], useFilters: [], typeFilters: [], coverUrls: {} }).submitCta
  const dom = environment('<button data-academy-submit-open>投稿</button>' + html), doc = dom.window.document
  let failure = '省份和城市请填写中文名称'
  const api = { workshops: async () => [{ workshopId: 'w', workshopName: '课堂' }], checkLogin: async () => 'u1',
    saveWorkshop: async () => { if (failure) throw new Error(failure); return { success: true, id: 'id', createdAt: 1, updatedAt: 1 } } }
  const cleanup = installAcademyHostBridge(doc, {}, api)
  try {
    doc.querySelector('[data-academy-submit-open]').click(); await tick()
    const form = doc.querySelector('form'), toast = doc.querySelector('[data-academy-submission-toast]')
    Object.entries({ workshopId: 'w', workUrl: 'https://feixianglaoshi.biz/x', province: 'bj', city: 'bj', school: '实验小学', certificateName: '张三', email: 'a@b.com' }).forEach(([key, value]) => { form.elements[key].value = value })
    form.querySelector('[type="submit"]').click(); await tick()
    assert.equal(toast.hidden, false)
    assert.match(toast.textContent, /省份和城市.*中文/)
    assert.equal(doc.querySelector('.academy-submission-error').textContent, '')
    assert.equal(form.elements.school.value, '实验小学')
    failure = 'No message available'
    form.querySelector('[type="submit"]').click(); await tick()
    assert.equal(toast.hidden, false)
    assert.match(toast.textContent, /提交失败.*重试/)
    assert.doesNotMatch(toast.textContent, /No message available/)
    failure = ''
    form.querySelector('[type="submit"]').click(); await tick()
    assert.equal(toast.hidden, true)
    assert.equal(doc.querySelector('.academy-submission-success').hidden, false)
  } finally { cleanup(); dom.window.close() }
})

// 必须从按钮点击进入，避免直接派发 submit 绕过浏览器原生校验而漏测无反馈问题。
test('遗漏必填项和邮箱格式错误通过 toast 提示首个字段，不发送投稿', async () => {
  const html = renderAcademyCourseUi({ courses: [], useFilters: [], typeFilters: [], coverUrls: {} }).submitCta
  const dom = environment('<button data-academy-submit-open>投稿</button>' + html), doc = dom.window.document
  let writes = 0
  const api = { workshops: async () => [{ workshopId: 'w', workshopName: '课堂' }], checkLogin: async () => 'u1', saveWorkshop: async () => { writes++ } }
  const cleanup = installAcademyHostBridge(doc, {}, api)
  try {
    doc.querySelector('[data-academy-submit-open]').click(); await tick()
    const form = doc.querySelector('form'), toast = doc.querySelector('[data-academy-submission-toast]')
    form.querySelector('[type="submit"]').click(); await tick()
    assert.equal(toast.hidden, false)
    assert.match(toast.textContent, /请选择工作坊/)
    Object.entries({ workshopId: 'w', workUrl: 'https://feixianglaoshi.biz/x', province: '北京', city: '北京', school: '实验小学', certificateName: '张三', email: 'bad-email' }).forEach(([key, value]) => { form.elements[key].value = value })
    form.querySelector('[type="submit"]').click(); await tick()
    assert.equal(toast.hidden, false)
    assert.match(toast.textContent, /邮箱/)
    assert.equal(writes, 0)
    assert.equal(form.elements.school.value, '实验小学')
  } finally { cleanup(); dom.window.close() }
})
test('工作坊加载失败用中文 toast，重试期间禁用提交并保留草稿', async () => {
  const html = renderAcademyCourseUi({ courses: [], useFilters: [], typeFilters: [], coverUrls: {} }).submitCta
  const dom = environment('<button data-academy-submit-open>提交</button>' + html), doc = dom.window.document
  let resolveRetry, calls = 0
  const api = { workshops: async () => {
    if (++calls === 1) throw new Error('No message available')
    return new Promise(resolve => { resolveRetry = resolve })
  } }
  const cleanup = installAcademyHostBridge(doc, {}, api)
  try {
    doc.querySelector('[data-academy-submit-open]').click(); await tick()
    const form = doc.querySelector('form'), retry = doc.querySelector('[data-academy-workshops-retry]')
    form.elements.school.value = '实验小学'
    assert.equal(doc.querySelector('[data-academy-submission-toast]')?.textContent, '工作坊加载失败，请重试。')
    assert.equal(doc.querySelector('.academy-submission-error').textContent, '')
    assert.equal(form.elements.workshopId.options[0].textContent, '加载失败')
    assert.equal(form.querySelector('[type="submit"]').disabled, true)
    assert.equal(retry.hidden, false)
    retry.click(); await tick()
    assert.equal(retry.disabled, true)
    assert.equal(form.querySelector('[type="submit"]').disabled, true)
    resolveRetry([{ workshopId: 'w', workshopName: '课堂', enabled: true }]); await tick()
    assert.equal(retry.hidden, true)
    assert.equal(form.elements.school.value, '实验小学')
    assert.equal(form.elements.workshopId.disabled, false)
    assert.equal(form.querySelector('[type="submit"]').disabled, false)
    assert.equal(doc.querySelector('[data-academy-submission-toast]').hidden, true)
  } finally { cleanup(); dom.window.close() }
})
const campaignHtml = readFileSync(new URL('../views/raw/creation-campaign.html', import.meta.url), 'utf8')
function environment(html) {
  const dom = new JSDOM('<div id="view-academy"><div class="main"></div>' + html + '</div>', { url: 'https://local.feixianglaoshi.biz:3000/', pretendToBeVisual: true })
  globalThis.window = dom.window; globalThis.document = dom.window.document
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
  return dom
}
test('我的投稿没有演示数据、计数或撤回，错误可重试并支持加载更多', async () => {
  const dom = environment(campaignHtml), doc = dom.window.document
  let count = 0
  const api = { checkLogin: async () => 'u1', loadMine: async cursor => {
    count++; if (count === 1) throw new Error('网络失败')
    return { items: [{ id: cursor ? 'id2' : 'id1', data: { title: '真实投稿', direction: 1, workLink: 'https://feixianglaoshi.biz/x' }, createdAt: 1 }],
      hasMore: !cursor, nextCursor: cursor ? null : 'cursor1' }
  } }
  const cleanup = setupCreationCampaign(doc.querySelector('#view-academy'), api)
  assert.equal(doc.querySelector('#cc-mySubmissionsBtn').textContent, '我的投稿')
  doc.querySelector('#cc-mySubmissionsBtn').click(); await tick()
  assert.match(doc.querySelector('#cc-submissionsView').textContent, /投稿记录加载失败/)
  doc.querySelector('#cc-loadMore').click(); await tick()
  assert.equal(doc.querySelectorAll('.submission-item').length, 1)
  assert.equal(doc.querySelector('[data-action="withdraw"]'), null)
  assert.equal(doc.querySelector('#cc-withdrawDialog'), null)
  doc.querySelector('#cc-loadMore').click(); await tick()
  assert.equal(doc.querySelectorAll('.submission-item').length, 2)
  assert.equal(doc.querySelector('#cc-loadMore').hidden, true)
  cleanup(); dom.window.close()
})

test('我的投稿只展示记录状态，空列表不引导提交且返回后恢复顶栏入口', async () => {
  const dom = environment(campaignHtml), doc = dom.window.document
  let finish
  const api = { checkLogin: async () => 'u1', loadMine: () => new Promise(resolve => { finish = resolve }) }
  const cleanup = setupCreationCampaign(doc.querySelector('#view-academy'), api)
  const entry = doc.querySelector('#cc-mySubmissionsBtn'), view = doc.querySelector('#cc-submissionsView')
  entry.click(); await tick()
  assert.equal(entry.hidden, true)
  assert.match(view.textContent, /正在加载投稿/)
  assert.equal(view.querySelector('.chooseDirection'), null)
  finish({ items: [], pageSize: 20, hasMore: false, nextCursor: null }); await tick()
  assert.match(view.textContent, /暂无投稿作品/)
  assert.equal(view.querySelectorAll('.submission-item').length, 0)
  assert.equal(doc.querySelector('#cc-loadMore').hidden, true)
  doc.querySelector('#cc-returnAcademy').click()
  assert.equal(entry.hidden, false)
  cleanup(); dom.window.close()
})

test('翻页失败保留已有记录和游标，统一中文错误，重试不重取第一页', async () => {
  const dom = environment(campaignHtml), doc = dom.window.document
  let calls = 0
  const cursors = []
  const item = id => ({ id, activityId: 'feixiang-ai-creation-2026', data: { title: '作品' + id, direction: 0, workLink: 'https://feixianglaoshi.biz/x' }, createdAt: 1, updatedAt: 1 })
  const api = { checkLogin: async () => 'u1', loadMine: async cursor => {
    cursors.push(cursor); calls++
    if (calls === 2) throw new Error('No message available')
    return { items: [item(cursor ? 'second' : 'first')], pageSize: 20, nextCursor: cursor ? null : 'next', hasMore: !cursor }
  } }
  const cleanup = setupCreationCampaign(doc.querySelector('#view-academy'), api)
  doc.querySelector('#cc-mySubmissionsBtn').click(); await tick()
  doc.querySelector('#cc-loadMore').click(); await tick()
  const view = doc.querySelector('#cc-submissionsView')
  assert.equal(view.querySelectorAll('.submission-item').length, 1)
  assert.match(view.textContent, /投稿记录加载失败/)
  assert.doesNotMatch(doc.body.textContent, /No message available/)
  assert.equal(doc.querySelector('#cc-loadMore').textContent, '重新加载')
  doc.querySelector('#cc-loadMore').click(); await tick()
  assert.deepEqual(cursors, [null, 'next', 'next'])
  assert.equal(view.querySelectorAll('.submission-item').length, 2)
  assert.equal(doc.querySelector('#cc-loadMore').hidden, true)
  cleanup(); dom.window.close()
})

test('工作坊空列表禁止提交，登录恢复不自动发起 POST，迟到的成功不能跨账号显示', async () => {
  const html = renderAcademyCourseUi({ courses: [], useFilters: [], typeFilters: [], coverUrls: {} }).submitCta
  const dom = environment('<button data-academy-submit-open>投稿</button>' + html), doc = dom.window.document
  let empty = true, writes = 0, finish
  const api = { checkLogin: async () => 'u1', workshops: async () => empty ? [] : [{ workshopId: 'w', workshopName: '课堂', enabled: true }],
    saveWorkshop: () => { writes++; return new Promise(resolve => { finish = resolve }) } }
  const cleanup = installAcademyHostBridge(doc, {}, api)
  doc.querySelector('[data-academy-submit-open]').click(); await tick()
  const form = doc.querySelector('form')
  assert.equal(form.querySelector('[type="submit"]').disabled, true)
  empty = false
  dom.window.dispatchEvent(new dom.window.CustomEvent('academy:session-changed', { detail: { reason: 'login' } })); await tick()
  assert.equal(writes, 0)
  Object.entries({ workshopId: 'w', workUrl: 'https://feixianglaoshi.biz/x', province: '浙江省', city: '杭州市', school: '实验小学', certificateName: '张三', email: 'a@b.com' }).forEach(([key,value]) => { form.elements[key].value = value })
  const submit = () => form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
  submit(); await tick(); submit(); await tick()
  assert.equal(writes, 1)
  dom.window.dispatchEvent(new dom.window.CustomEvent('academy:session-changed', { detail: { reason: 'account-changed' } }))
  finish({ success: true, id: 'old-account', createdAt: 1, updatedAt: 1 }); await tick()
  assert.equal(form.elements.school.value, '')
  assert.equal(doc.querySelector('.academy-submission-success').hidden, true)
  cleanup(); dom.window.close()
})

test('征集失败保留字段、重复点击只保存一次，成功后不展示投稿详情', async () => {
  const dom = environment(campaignHtml), doc = dom.window.document
  let writes = 0, finish, fail = true
  const api = { checkLogin: async () => 'u1', loadMine: async () => ({ items: [], hasMore: false, nextCursor: null }),
    saveCreation: async () => { writes++; if (fail) throw new Error('活动尚未开始'); return new Promise(resolve => { finish = resolve }) } }
  const cleanup = setupCreationCampaign(doc.querySelector('#view-academy'), api)
  doc.querySelector('[data-direction]').click()
  const values = { workTitle: '测试作品', workUrl: 'https://feixianglaoshi.biz/x', description: '说明'.repeat(30), creator: '张三', phone: '13800138000', identity: '一线教师', region: '浙江省' }
  Object.entries(values).forEach(([key, value]) => { doc.querySelector('#cc-' + key).value = value })
  doc.querySelectorAll('.chips').forEach(group => group.querySelector('button').click())
  doc.querySelector('#cc-agreeRules').checked = true
  const form = doc.querySelector('#cc-submissionForm')
  const submit = () => form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
  submit(); await tick()
  assert.equal(writes, 1)
  assert.equal(doc.querySelector('#cc-workTitle').value, '测试作品')
  assert.match(doc.querySelector('#cc-toast').textContent, /尚未开始/)
  fail = false; submit(); await tick(); submit(); await tick()
  assert.equal(writes, 2)
  finish({ success: true, id: 'server-encrypted-id', createdAt: 1, updatedAt: 1 }); await tick()
  assert.equal(doc.querySelector('#cc-successView').classList.contains('active'), true)
  assert.equal(doc.querySelector('#cc-successMeta'), null)
  assert.doesNotMatch(doc.querySelector('#cc-successView').textContent, /server-encrypted-id|投稿编号|投稿时间/)
  cleanup(); dom.window.close()
})
test('修改已保存只显示成功反馈与操作按钮，不展示投稿详情', async () => {
  const dom = environment(campaignHtml), doc = dom.window.document
  const data = { direction: 1, title: '已存在作品', workLink: 'https://feixianglaoshi.biz/x', description: '教学说明'.repeat(20), stage: ['小学'], subject: ['语文'], scene: ['课堂教学'], creator: '张三', phone: '13800138000', identity: '一线教师', region: '浙江省', organization: '', coCreators: '' }
  const api = { checkLogin: async () => 'u1', loadMine: async () => ({items: [{id:'existing',data,createdAt:1,updatedAt:1}],hasMore:false,nextCursor:null}),
    saveCreation: async (draft, id) => { assert.equal(id, 'existing'); return {success:true,id,createdAt:1,updatedAt:2} } }
  const cleanup = setupCreationCampaign(doc.querySelector('#view-academy'), api)
  try {
    doc.querySelector('#cc-mySubmissionsBtn').click(); await tick()
    doc.querySelector('[data-action="edit"]').click()
    doc.querySelector('#cc-agreeRules').checked = true
    doc.querySelector('#cc-agreeRules').dispatchEvent(new dom.window.Event('change', {bubbles:true}))
    doc.querySelector('#cc-submissionForm').dispatchEvent(new dom.window.Event('submit', {bubbles:true,cancelable:true})); await tick()
    const view = doc.querySelector('#cc-successView')
    assert.equal(view.classList.contains('active'), true)
    assert.match(view.querySelector('h2').textContent, /修改已保存/)
    assert.equal(view.querySelector('.success-meta'), null)
    assert.doesNotMatch(view.textContent, /投稿编号|投稿时间|已存在作品/)
    assert.match(view.textContent, /查看我的投稿/)
    assert.match(view.textContent, /继续提交新作品/)
  } finally {cleanup(); dom.window.close()}
})
test('课堂工作坊选项来自接口，提交失败保留草稿，成功后才显示已提交', async () => {
  const html = renderAcademyCourseUi({ courses: [], useFilters: [], typeFilters: [], coverUrls: {} }).submitCta
  const dom = environment('<button data-academy-submit-open>提交</button>' + html), doc = dom.window.document
  let fail = true, writes = 0
  const api = { checkLogin: async () => 'u1', workshops: async () => [{ workshopId: 'server-id', workshopName: '服务端工作坊', enabled: true }],
    saveWorkshop: async () => { writes++; if (fail) throw new Error('请先登录'); return { success: true, id: 'opaque', createdAt: 1, updatedAt: 1 } } }
  const cleanup = installAcademyHostBridge(doc, {}, api)
  doc.querySelector('[data-academy-submit-open]').click(); await tick()
  const form = doc.querySelector('form')
  assert.equal(form.elements.workshopId.options[1].textContent, '服务端工作坊')
  Object.entries({ workshopId: 'server-id', workUrl: 'https://feixianglaoshi.biz/x', province: '浙江省', city: '杭州市', school: '实验小学', certificateName: '张三', email: 'a@b.com' }).forEach(([key,value]) => { form.elements[key].value = value })
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); await tick()
  assert.equal(writes, 1); assert.equal(form.hidden, false); assert.equal(form.elements.school.value, '实验小学')
  fail = false
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); await tick()
  assert.equal(form.hidden, true)
  assert.equal(doc.querySelector('.academy-submission-success').hidden, false)
  cleanup(); dom.window.close()
})
