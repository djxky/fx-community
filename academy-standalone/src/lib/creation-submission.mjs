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

const cutoff = Date.parse('2026-12-01T00:00:00+08:00')
const limits = { stage: 2, subject: 3, scene: 3 }
const clone = value => JSON.parse(JSON.stringify(value))
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

export function toggleTag(selected, value, max) {
  return selected.includes(value) ? selected.filter(item => item !== value) : selected.length < max ? [...selected, value] : [...selected]
}
export function emptyDraft() {
  return { direction: 0, title: '', url: '', description: '', creator: '', phone: '', identity: '', region: '', organization: '', coCreators: '', stage: [], subject: [], scene: [], agreed: false }
}
export function validateSubmission(draft, now = new Date()) {
  const errors = {}
  if (now.getTime() >= cutoff) errors.deadline = '征集已截止，停止新增和修改投稿信息'
  if (!Number.isInteger(draft.direction) || !directions[draft.direction]) errors.direction = '请选择创作方向'
  const titleLength = String(draft.title || '').trim().length
  if (titleLength < 2 || titleLength > 30) errors.title = '作品名称需为 2—30 字'
  const descriptionLength = String(draft.description || '').trim().length
  if (descriptionLength < 50 || descriptionLength > 300) errors.description = '作品简介需为 50—300 字'
  try {
    const url = new URL(draft.url)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('scheme')
  } catch { errors.url = '请填写有效的作品链接（http 或 https）' }
  for (const [key, max] of Object.entries(limits)) {
    const values = draft[key]
    if (!Array.isArray(values) || values.length < 1 || values.length > max || new Set(values).size !== values.length || values.some(value => !tagOptions[key].includes(value))) errors[key] = '请按要求选择学段、学科和使用场景标签'
  }
  for (const key of ['creator', 'region']) if (!String(draft[key] || '').trim()) errors[key] = '请填写完整的创作者信息'
  if (!['一线教师', '教研员', '学校管理者', '师范生', '教育从业者', '其他'].includes(draft.identity)) errors.identity = '请选择身份'
  if (!/^1[3-9][0-9]{9}$/.test(draft.phone || '')) errors.phone = '请填写有效的手机号'
  if (!draft.agreed) errors.agreed = '请阅读并同意活动规则'
  return errors
}
export function createSubmissionState(seed = [], clock = () => new Date()) {
  const records = clone(seed)
  let sequence = Math.max(0, ...records.map(item => Number(item.id?.split('-')[1]) || 0))
  return {
    records,
    getDraft(id) {
      const record = records.find(item => item.id === id)
      return record ? { ...emptyDraft(), ...clone(record), agreed: false } : null
    },
    save(draft, editingId = null) {
      const errors = validateSubmission(draft, clock())
      const index = records.findIndex(item => item.id === editingId)
      if (editingId && index < 0) errors.record = '这条投稿已不存在'
      if (Object.keys(errors).length) return { ok: false, errors }
      const timestamp = clock().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).slice(0, 16)
      const record = { ...clone(draft), title: draft.title.trim(), url: draft.url.trim(), description: draft.description.trim(), id: editingId || 'FXAI26-' + String(++sequence).padStart(5, '0'), time: editingId ? records[index].time : timestamp, updatedAt: timestamp, status: '已提交' }
      if (editingId) records[index] = record
      else records.unshift(record)
      return { ok: true, record }
    },
    withdraw(id, confirmed) {
      if (!confirmed || clock().getTime() >= cutoff) return false
      const index = records.findIndex(item => item.id === id)
      if (index < 0) return false
      records.splice(index, 1)
      return true
    },
  }
}
