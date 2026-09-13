import { tagOptions } from './creation-submission.mjs'

export const WORKSHOP_ACTIVITY = 'feixiang-ai-workshop'
export const CREATION_ACTIVITY = 'feixiang-ai-creation-2026'

// 服务端毫秒时间戳可能通过 JSON 字符串返回；在接口边界统一成数字供保存确认和列表展示使用。
// 仅接受非负整数及纯数字字符串，拒绝空串、布尔值和无效日期，不猜测秒单位，也不生成本地时间。
function timestamp(value) {
  const number = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN
  return Number.isSafeInteger(number) && number >= 0 && number <= 8640000000000000 ? number : NaN
}

// 工作坊没有“我的投稿”查询入口；未知保存结果只能提示核实，不能诱导重复写入。
function uncertainSaveMessage(activityId) {
  return activityId === WORKSHOP_ACTIVITY
    ? '暂时无法确认提交结果，请联系工作人员核实，避免重复提交。'
    : '服务端返回异常，请查看我的投稿确认是否已保存'
}

// 活动接口只允许自己的 HTTPS 作品和指定 CDN 目录；按主机边界判断，
// 不能让 evilfeixianglaoshi.com 或拼接在用户名里的可信域名通过校验。
export function isAllowedWorkLink(value) {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) return false
    const host = url.hostname
    return ['feixianglaoshi.com', 'feixianglaoshi.biz'].some(base => host === base || host.endsWith('.' + base))
      || (['musk-test.fbcontent.cn', 'musk-online.fbcontent.cn'].includes(host) && url.pathname.startsWith('/pub-musk-ai-studio/'))
  } catch { return false }
}

function textField(value, name, min, max) {
  const result = typeof value === 'string' ? value.trim() : ''
  if (result.length < min || result.length > max) throw new Error(name + '长度需为 ' + min + '—' + max + ' 字')
  return result
}
function workLink(value) {
  const result = typeof value === 'string' ? value.trim() : ''
  if (!isAllowedWorkLink(result)) throw new Error('请填写允许的飞象老师 HTTPS 作品链接（不超过 2048 字符）')
  return result
}
function checkSize(data) {
  // TextEncoder 在 Chrome 86 可用；后端限制的是 UTF-8 字节而非 JS 字符数。
  if (new TextEncoder().encode(JSON.stringify(data)).length > 16 * 1024) throw new Error('表单内容超过 16 KiB')
  return data
}

// 明确列出 DTO 字段，避免前端 agreed、status、id 等 UI 状态混入 data。
// 日期窗口完全交给服务端，避免用户电脑时钟或测试活动配置影响正常提交。
export function creationData(draft) {
  if (!draft.agreed) throw new Error('请先阅读并同意活动规则')
  if (!Number.isInteger(draft.direction) || draft.direction < 0 || draft.direction > 3) throw new Error('请选择创作方向')
  const tags = {}
  for (const [key, max] of Object.entries({ stage: 2, subject: 3, scene: 3 })) {
    const values = draft[key]
    if (!Array.isArray(values) || !values.length || values.length > max
      || new Set(values).size !== values.length || values.some(value => !tagOptions[key].includes(value))) throw new Error('请按要求选择学段、学科和使用场景')
    tags[key] = [...values]
  }
  if (!['一线教师','教研员','学校管理者','师范生','教育从业者','其他'].includes(draft.identity)) throw new Error('请选择身份')
  const phone = textField(draft.phone, '手机号', 11, 11)
  if (!/^1[3-9][0-9]{9}$/.test(phone)) throw new Error('请填写有效的大陆手机号')
  return checkSize({
    direction: draft.direction, title: textField(draft.title, '作品名称', 2, 30),
    workLink: workLink(draft.url), description: textField(draft.description, '作品简介', 50, 300),
    ...tags, creator: textField(draft.creator, '创作者', 1, 50), phone, identity: draft.identity,
    region: textField(draft.region, '所在地区', 1, 100),
    organization: textField(draft.organization, '学校 / 机构', 0, 100),
    coCreators: textField(draft.coCreators, '共同创作者', 0, 200),
  })
}
export function workshopData(draft, options) {
  // 可用性由列表接口决定，接口已移除 enabled；只允许提交列表中的真实选项，
  // 并原样使用同一选项的 ID 与名称，最终是否仍可用由服务端在保存时校验。
  const selected = options.find(item => item.workshopId === draft.workshopId)
  if (!selected) throw new Error('暂无可关联工作坊，请重新加载工作坊列表')
  const province = textField(draft.province, '省份', 2, 20)
  const city = textField(draft.city, '城市', 2, 20)
  if (!/^[\u4e00-\u9fff]+$/.test(province) || !/^[\u4e00-\u9fff]+$/.test(city)) throw new Error('省份和城市请填写中文名称')
  const email = textField(draft.email, '邮箱', 3, 254)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('请填写有效邮箱')
  return checkSize({
    province, city, workshopId: selected.workshopId, workshopName: selected.workshopName,
    school: textField(draft.school, '学校', 2, 100), email,
    certificateName: textField(draft.certificateName, '证书姓名', 1, 50),
    educationId: textField(draft.teacherId, '教师 ID', 0, 100), workLink: workLink(draft.workUrl),
  })
}

export function createActivityApi({ hostname, fetcher = globalThis.fetch, onLoginRequired = () => {} }) {
  // 只识别明确的飞象运行环境；未知域名不静默发送到正式环境。
  const base = ['biz','com'].find(suffix => hostname === 'feixianglaoshi.' + suffix || hostname.endsWith('.feixianglaoshi.' + suffix))
  const origin = base ? 'https://www.feixianglaoshi.' + base : null
  const prefix = '/musk-ai-studio/api/activity'
  async function request(path, body) {
    if (!origin) throw new Error('请从飞象老师页面打开活动')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20000)
    try {
      const res = await fetcher(origin + path, {
        method: body === undefined ? 'GET' : 'POST', credentials: 'include', cache: 'no-store',
        signal: controller.signal, headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
      const requireLogin = () => {
        onLoginRequired()
        const error = new Error('请先登录，草稿已保留；登录后请再次点击提交')
        error.code = '1103'
        throw error
      }
      if (res.status === 401 || res.status === 403) requireLogin()
      const payload = await res.json()
      if (String(payload.code) === '1103') requireLogin()
      if (!res.ok || String(payload.code) !== '0') {
        const error = new Error(payload.message || '请求失败，请稍后重试')
        error.code = String(payload.code)
        throw error
      }
      return payload.result
    } catch (error) {
      // 写入超时不等于保存失败；只读请求超时则可安全提示重试。
      if (error.name === 'AbortError') throw new Error(body === undefined ? '请求超时，请稍后重试。' : uncertainSaveMessage(body.activityId))
      throw error
    } finally { clearTimeout(timer) }
  }
  async function save(activityId, data, id) {
    if (id != null && (typeof id !== 'string' || !id)) throw new Error('投稿 ID 无效，请重新加载')
    const result = await request(prefix + (id == null ? '/submit' : '/update'), { activityId, ...(id == null ? {} : { id }), data })
    const createdAt = timestamp(result?.createdAt), updatedAt = timestamp(result?.updatedAt)
    // 保留显式成功和不透明 ID 校验，只兼容已确认的时间类型差异，不把任意 code=0 都当保存成功。
    if (result?.success !== true || typeof result.id !== 'string' || !result.id
      || !Number.isFinite(createdAt) || !Number.isFinite(updatedAt)) throw new Error(uncertainSaveMessage(activityId))
    return { ...result, createdAt, updatedAt }
  }
  return {
    async checkLogin() {
      const user = await request('/musk-account/api/login/user')
      if (user?.userId == null) { onLoginRequired(); throw new Error('无法确认登录账号，请登录后重试') }
      return String(user.userId)
    },
    async workshops() {
      const items = await request(prefix + '/workshops?activityId=' + WORKSHOP_ACTIVITY)
      if (!Array.isArray(items)) throw new Error('工作坊列表返回异常')
      // 后端返回的就是可用工作坊，不再依赖已移除的 enabled 字段。
      // 仅保留基本结构校验，避免生成无效下拉项；filter 保持服务端排序不变。
      return items.filter(item => item && typeof item.workshopId === 'string' && typeof item.workshopName === 'string')
    },
    saveCreation: (draft, id) => save(CREATION_ACTIVITY, creationData(draft), id),
    saveWorkshop: (draft, options) => save(WORKSHOP_ACTIVITY, workshopData(draft, options)),
    async loadMine(cursor) {
      const params = new URLSearchParams({ activityId: CREATION_ACTIVITY, limit: '20' })
      if (cursor != null) params.set('cursor', cursor)
      const result = await request(prefix + '/mine/loadmore?' + params)
      if (!Array.isArray(result?.items) || typeof result.hasMore !== 'boolean'
        || (result.hasMore && (typeof result.nextCursor !== 'string' || !result.nextCursor || result.nextCursor === cursor))
        || result.items.some(item => typeof item.id !== 'string' || !item.id || item.activityId !== CREATION_ACTIVITY || !item.data)) throw new Error('投稿列表返回异常，请重新加载')
      // 列表使用相同时间适配，避免真实时间字符串在 UI 中显示为“—”；无效值仍保持未知。
      return { ...result, items: result.items.map(item => ({ ...item, createdAt: timestamp(item.createdAt), updatedAt: timestamp(item.updatedAt) })) }
    },
  }
}
