import test from 'node:test'
import assert from 'node:assert/strict'
import { createActivityApi, creationData, workshopData, isAllowedWorkLink } from './activity-api.mjs'

const draft = { direction: 1, title: '互动作品', url: 'https://www.feixianglaoshi.biz/#/chat?a=1',
  description: '教学案例'.repeat(20), stage: ['小学'], subject: ['语文'], scene: ['课堂教学'],
  creator: '张老师', phone: '13800000000', identity: '一线教师', region: '浙江省 / 杭州市',
  organization: '', coCreators: '', agreed: true, id: 'must-not-leak', status: '审核中' }
const response = (result, code = '0', status = 200) => ({ ok: status < 400, status, json: async () => ({ code, result, message: '服务端说明' }) })

// 使用线上成功响应的字段类型，防止字符串毫秒时间戳被误判为提交失败。
test('两个投稿入口及列表兼容字符串毫秒时间戳，保留服务端 ID', async () => {
  const saved = { success: true, id: '688DCD095D323C855AEEEC056A24C74A', createdAt: '1788867199025', updatedAt: '1788867199025' }
  const api = createActivityApi({ hostname: 'www.feixianglaoshi.biz', fetcher: async (url, init) => response(init.method === 'POST' ? saved : {
    items: [{ ...saved, activityId: 'feixiang-ai-creation-2026', data: creationData(draft) }], hasMore: false, nextCursor: null,
  }) })
  const workshop = { province: '北京', city: '北京', workshopId: 'w', school: '北京四中', email: 'a@b.com', certificateName: '张三', workUrl: draft.url }
  for (const result of [await api.saveCreation(draft), await api.saveWorkshop(workshop, [{ workshopId: 'w', workshopName: '工作坊' }])]) {
    assert.equal(result.id, saved.id)
    assert.equal(result.createdAt, 1788867199025)
    assert.equal(result.updatedAt, 1788867199025)
  }
  assert.equal((await api.loadMine()).items[0].createdAt, 1788867199025)
})

test('无效成功响应仍拒绝，工作坊不引导查看活动投稿', async () => {
  for (const result of [null, { success: false, id: 'x', createdAt: 1, updatedAt: 1 }, { success: true, id: '', createdAt: 1, updatedAt: 1 },
    { success: true, id: 'x', createdAt: '', updatedAt: 1 }, { success: true, id: 'x', createdAt: 'invalid', updatedAt: 1 }]) {
    const api = createActivityApi({ hostname: 'www.feixianglaoshi.biz', fetcher: async () => response(result) })
    await assert.rejects(api.saveCreation(draft))
    await assert.rejects(api.saveWorkshop({ province: '北京', city: '北京', workshopId: 'w', school: '北京四中', email: 'a@b.com', certificateName: '张三', workUrl: draft.url }, [{ workshopId: 'w', workshopName: '工作坊' }]), error => {
      assert.doesNotMatch(error.message, /我的投稿/)
      assert.match(error.message, /确认.*结果/)
      return true
    })
  }
})

test('作品链接只接受精确 HTTPS 主机和受限 CDN 路径', () => {
  for (const url of ['https://www.feixianglaoshi.com/#/chat', 'https://a.feixianglaoshi.biz/x',
    'https://musk-test.fbcontent.cn/pub-musk-ai-studio/a.html']) assert.equal(isAllowedWorkLink(url), true)
  for (const url of ['http://feixianglaoshi.com', 'https://feixianglaoshi.com.evil.test',
    'https://evilfeixianglaoshi.biz', 'https://musk-test.fbcontent.cn/other/a.html',
    'https://user:pass@feixianglaoshi.com', 'https://feixianglaoshi.com/' + 'a'.repeat(2048)]) assert.equal(isAllowedWorkLink(url), false)
})
test('征集 DTO 严格排除状态和协议字段，保留标签和完整链接', () => {
  const data = creationData(draft)
  assert.equal(data.workLink, draft.url)
  assert.deepEqual(Object.keys(data).sort(), ['direction','title','workLink','description','stage','subject','scene','creator','phone','identity','region','organization','coCreators'].sort())
  assert.throws(() => creationData({ ...draft, creator: 'a'.repeat(51) }))
  assert.throws(() => creationData({ ...draft, stage: ['小学','小学'] }))
  assert.throws(() => creationData({ ...draft, agreed: false }))
})
test('课堂 DTO 使用选项中的原名且不接受硬编码工作坊', () => {
  const input = { province: '浙江省', city: '杭州市', workshopId: 'w1', school: '实验小学',
    email: 'a@b.com', certificateName: '张三', teacherId: 'T1', workUrl: draft.url }
  const options = [{ workshopId: 'w1', workshopName: '原始 名称' }]
  assert.equal(workshopData(input, options).workshopName, '原始 名称')
  assert.equal(workshopData(input, options).educationId, 'T1')
  assert.equal(workshopData(input, options).workLink, draft.url)
  assert.throws(() => workshopData(input, []))
  assert.throws(() => workshopData({ ...input, city: '123' }, options))
})
// 后端只返回可用工作坊，不再携带 enabled；覆盖从读取选项到提交 DTO 的完整适配链。
test('无 enabled 的工作坊按服务端顺序返回且可提交，未知选项仍被拒绝', async () => {
  let body
  const api = createActivityApi({ hostname: 'www.feixianglaoshi.biz', fetcher: async (url, init) => {
    if (init.method === 'GET') return response([
      { workshopId: 'w2', workshopName: '第二期' },
      { workshopId: 'w1', workshopName: '第一期' },
      { workshopName: '缺少 ID' },
    ])
    body = JSON.parse(init.body)
    return response({ success: true, id: 'saved', createdAt: 1, updatedAt: 1 })
  } })
  const options = await api.workshops()
  assert.deepEqual(options.map(item => item.workshopId), ['w2', 'w1'])
  const input = { province: '浙江省', city: '杭州市', workshopId: 'w2', school: '实验小学',
    email: 'a@b.com', certificateName: '张三', workUrl: draft.url }
  await api.saveWorkshop(input, options)
  assert.equal(body.data.workshopId, 'w2')
  assert.equal(body.data.workshopName, '第二期')
  assert.equal(Object.hasOwn(body.data, 'enabled'), false)
  assert.throws(() => workshopData({ ...input, workshopId: 'unknown' }, options), /工作坊/)
})
test('修改使用独立 activityId、完整 DTO 和不透明 ID，Cookie 随请求发送', async () => {
  const calls = []
  const api = createActivityApi({ hostname: 'local.feixianglaoshi.biz', fetcher: async (url, init) => {
    calls.push([url, init]); return response({ success: true, id: 'opaque/001', createdAt: 1, updatedAt: 2 })
  } })
  const result = await api.saveCreation(draft, 'opaque/001')
  assert.equal(result.id, 'opaque/001')
  assert.equal(calls[0][0], 'https://www.feixianglaoshi.biz/musk-ai-studio/api/activity/update')
  assert.equal(calls[0][1].credentials, 'include')
  const body = JSON.parse(calls[0][1].body)
  assert.equal(body.id, 'opaque/001')
  assert.equal(body.activityId, 'feixiang-ai-creation-2026')
  assert.equal(body.data.id, undefined)
})
test('401、403 和业务1103触发登录且不重试 POST；其他业务错误保留说明', async () => {
  for (const [status, code] of [[401, '0'], [403, '0'], [200, 1103], [200, '1103']]) {
    let login = 0; let calls = 0
    const api = createActivityApi({ hostname: 'www.feixianglaoshi.biz', onLoginRequired: () => login++,
      fetcher: async () => { calls++; return response(null, code, status) } })
    await assert.rejects(api.saveCreation(draft), /请先登录/)
    assert.equal(login, 1); assert.equal(calls, 1)
  }
  const api = createActivityApi({ hostname: 'www.feixianglaoshi.biz', fetcher: async () => response(null, '1101') })
  await assert.rejects(api.saveCreation(draft), /服务端说明/)
})
test('游标原样编码，不伪造总数，缺少成功 ID 不当成保存成功', async () => {
  let requested
  const api = createActivityApi({ hostname: 'www.feixianglaoshi.com', fetcher: async url => {
    requested = url; return response({ items: [], hasMore: false, nextCursor: null })
  } })
  await api.loadMine('opaque/+=001')
  assert.equal(new URL(requested).searchParams.get('cursor'), 'opaque/+=001')
  await assert.rejects(api.saveCreation(draft), /返回/)
})
