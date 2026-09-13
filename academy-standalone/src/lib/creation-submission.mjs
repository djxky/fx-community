    export const directions = [
      { name: 'AI 教育应用', title: '把一个好方法，做成真正可用的 AI 教育应用', tip: '建议重点说明：目标用户是谁、使用流程是什么、为什么值得反复使用。' },
      { name: 'AI 互动课件', title: '把一堂好课，做成可互动、可改编的 AI 课件', tip: '建议重点说明：学段、学科、课题，以及这个互动设计解决了课堂中的什么问题。' },
      { name: '互动学习作品', title: '把难讲的知识，变成看得见、能操作的学习过程', tip: '建议重点说明：学生原本哪里难理解，以及作品如何通过观察、操作或探索帮助学生理解。' },
      { name: '校园应用与工具', title: '把学校里的真实难题，做成真正实用的工具', tip: '建议重点说明：原来的真实工作流程是什么、痛点在哪里，以及作品解决了哪一步问题。' }
    ];

    export const tagOptions = {
      stage: ['学前','小学','初中','高中','中职','高职','高校','跨学段 / 通用','其他'],
      subject: ['语文','数学','英语','物理','化学','生物','道德与法治 / 政治','历史','地理','科学','信息科技','艺术','体育与健康','劳动教育','心理健康','班主任工作','教研','校园管理','教师发展','跨学科 / 通用','其他'],
      scene: ['课堂教学','备课','学生自主学习','作业与评价','教研','班级管理','校园管理','家校协同','教师发展','其他']
    };

// UI 元数据保持原枚举；异步记录只来源于服务端，不创建演示投稿或本地 ID。
const clone = value => JSON.parse(JSON.stringify(value))
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
export function toggleTag(selected, value, max) {
  return selected.includes(value) ? selected.filter(item => item !== value) : selected.length < max ? [...selected, value] : [...selected]
}
export function emptyDraft() {
  return { direction: 0, title: '', url: '', description: '', creator: '', phone: '', identity: '', region: '', organization: '', coCreators: '', stage: [], subject: [], scene: [], agreed: false }
}
export function formatSubmissionTime(value) {
  return Number.isFinite(value) ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '—'
}
function recordView(item) {
  return { ...item.data, url: item.data.workLink, id: item.id, time: formatSubmissionTime(item.createdAt),
    updatedAt: item.updatedAt, status: '已提交' }
}

// revision 使清空账号/刷新列表之前发出的响应失效；锁在第一个 await 前设置。
// 不自动重试 POST：超时后可能已保存，需要用户先查询再决定是否重试。
export function createSubmissionState(api) {
  let records = [], cursor = null, hasMore = true, loading = false, saving = false
  let revision = 0, account = null
  function reset() { revision++; records = []; cursor = null; hasMore = true; loading = false }
  async function checkAccount() {
    const next = await api.checkLogin()
    if (account != null && account !== next) {
      reset(); account = next
      const error = new Error('登录账号已变化，请重新打开投稿页面')
      error.code = 'ACCOUNT_CHANGED'
      throw error
    }
    account = next
  }
  return {
    get records() { return records },
    get loading() { return loading },
    get saving() { return saving },
    get hasMore() { return hasMore },
    reset,
    getDraft(id) {
      const item = records.find(record => record.id === id)
      return item ? { ...emptyDraft(), ...clone(item), agreed: false } : null
    },
    async load(refresh = false) {
      if (refresh) reset()
      if (loading || !hasMore) return
      loading = true
      const version = revision
      try {
        await checkAccount()
        if (version !== revision) return
        const page = await api.loadMine(cursor)
        if (version !== revision) return
        const ids = new Set(records.map(item => item.id))
        for (const item of page.items) if (!ids.has(item.id)) { records.push(recordView(item)); ids.add(item.id) }
        cursor = page.nextCursor; hasMore = page.hasMore
      } finally { if (version === revision) loading = false }
    },
    async save(draft, editingId = null) {
      if (saving) return null
      saving = true
      const version = revision
      try {
        await checkAccount()
        if (version !== revision) return null
        // 登录恢复后列表缓存可能已清空，编辑 ID 仍可原样提交；归属由后端判定。
        const result = await api.saveCreation(draft, editingId)
        if (version !== revision) return null
        reset()
        return { ...clone(draft), id: result.id, time: formatSubmissionTime(result.createdAt), updatedAt: result.updatedAt }
      } finally { saving = false }
    },
  }
}
