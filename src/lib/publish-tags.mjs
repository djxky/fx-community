// 发布弹窗的选项与校验。
// 适配标签复刻线上 feixianglaoshi.com 对话页 → 发布作品：学科（必填）→ 年级（教材版本 / 册 两级级联）→ 章节（随年级变化）。
// 新社区补充：简介（必填）、作品标签（可选系统标签，也可老师自己新建）。
import { TASKS_BY_SCENE } from './discover-taxonomy.mjs'

export const TITLE_MAX = 100
export const INTRO_MAX = 200
export const TAG_MAX_COUNT = 5
export const TAG_MAX_LEN = 10

export const SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物', '道德与法治', '政治', '历史', '地理']

const ENGLISH_TEXTBOOKS = [
  '人教PEP版', '人教精通版', '人教版', '北师大版（三起）', '北师大版',
  '外研版（三起）（主编：孙有中）', '外研社版（主编：刘兆义）', '外研版', '闽教版', '沪教版',
  '冀教版（三起）', '接力版', '冀教版', '辽师大版（三起）', '译林版（一起）', '译林版（三起）',
  '译林版', '北京版', '湘少版（三起）', '清华版', '重大版', '湘鲁版',
  '鲁科版（五四学制）（三起）', '沪教版（五四学制）', '鲁教版（五四学制）',
]

const GENERIC_TEXTBOOKS = ['统编版', '人教版', '北师大版', '苏教版', '沪教版']

const VOLUMES = [
  '七年级上册', '七年级下册', '八年级上册', '八年级下册', '九年级上册',
  '高中必修第一册', '高中必修第二册', '高中必修第三册',
  '高中选择性必修第一册', '高中选择性必修第二册', '高中选择性必修第三册', '高中选择性必修第四册',
]

const CHAPTERS = {
  '英语|人教版|高中选择性必修第一册': [
    'Unit 1 People of Achievement', 'Unit 2 Looking into the Future', 'Unit 3 Fascinating Parks',
    'Unit 4 Body Language', 'Unit 5 Working the Land', '期中复习', '期末复习',
  ],
}

export function textbooksFor(subject) {
  return subject === '英语' ? ENGLISH_TEXTBOOKS : GENERIC_TEXTBOOKS
}

export function volumesFor() {
  return VOLUMES
}

export function chaptersFor(subject, grade) {
  if (!subject || !grade?.textbook || !grade?.volume) return []
  const known = CHAPTERS[`${subject}|${grade.textbook}|${grade.volume}`]
  if (known) return known
  const unit = subject === '英语' ? (n) => `Unit ${n}` : (n) => `第${'一二三四五六'[n - 1]}单元`
  return [1, 2, 3, 4, 5, 6].map(unit).concat(['期中复习', '期末复习'])
}

export function formatGrade(grade) {
  return grade?.textbook && grade?.volume ? `${grade.textbook} / ${grade.volume}` : ''
}

// 系统标签 = 发现页灵感分类的任务层；选了系统标签，作品就能被对应场景 / 任务筛到
export const SYSTEM_TAGS = Object.entries(TASKS_BY_SCENE)
  .flatMap(([scene, tasks]) => tasks.map((task) => ({ label: task.label, scene, task: task.key })))

export function findSystemTag(label) {
  return SYSTEM_TAGS.find((tag) => tag.label === label) || null
}

// 加一个标签：去空格、去重，超长 / 超数量给提示，不改原数组
export function addTag(tags, input) {
  const label = String(input || '').trim()
  if (!label || tags.includes(label)) return { tags, error: '' }
  if (label.length > TAG_MAX_LEN) return { tags, error: `标签最多 ${TAG_MAX_LEN} 个字` }
  if (tags.length >= TAG_MAX_COUNT) return { tags, error: `最多添加 ${TAG_MAX_COUNT} 个标签` }
  return { tags: [...tags, label], error: '' }
}

// 输入框下方的候选：没输入时给 AI 推荐；输入时给匹配的系统标签，没有同名的再给「新建」
export function tagSuggestions(query, selected, recommended = []) {
  const q = String(query || '').trim()
  if (!q) return recommended.filter((label) => !selected.includes(label)).map((label) => ({ label, isNew: false }))
  const matches = SYSTEM_TAGS
    .filter((tag) => tag.label.includes(q) && !selected.includes(tag.label))
    .slice(0, 6)
    .map((tag) => ({ label: tag.label, isNew: false }))
  const exists = selected.includes(q) || SYSTEM_TAGS.some((tag) => tag.label === q)
  return exists ? matches : [...matches, { label: q, isNew: true }]
}

// 发布时把标签拆成系统标签（带场景 / 任务）和老师新建的标签
export function describeTags(labels) {
  return labels.map((label) => {
    const system = findSystemTag(label)
    return system ? { label, scene: system.scene, task: system.task } : { label, custom: true }
  })
}

// 按弹窗从上到下的顺序返回第一个没填的项，全部填好返回 null
export function validatePublish({ title, intro, subject, customTag, labels }) {
  if (!String(title || '').trim()) return { field: 'title', message: '请输入标题' }
  if (!String(intro || '').trim()) return { field: 'intro', message: '请输入简介' }
  if (!customTag && !subject) return { field: 'fit', message: '请选择学科' }
  if (!labels?.length) return { field: 'labels', message: '请添加至少 1 个标签' }
  return null
}
