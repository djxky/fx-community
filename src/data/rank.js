import { COVERS } from './covers'
import { PORTRAITS } from './portraits'
import { MASTERS } from './masters'

// 排行榜唯一数据源：排序信号与固定卡司均来自 PRD §8.4。
// resource = 作品/资源 feature 榜；creator = 人 compact 榜。
export const BOARDS = [
  {
    key: 'classroom', group: 'resource', title: '课堂使用榜', tag: '使用', hot: true,
    period: '按课堂使用排序', metricLabel: '位老师使用', desc: '真的被带进课堂的,不是刷出来的。每一张卡都能打开原资源。', layout: 'feature',
    items: [
      { name: '作文批改 Skill', blurb: '一键批改+逐条评语，改作文提速', sub: '语文 · 技能调用', kind: '技能 · 课堂调用', metric: '8,900', author: '沈砚', initial: '沈', cover: COVERS[2], resourceId: 'res-skill-zuowen' },
      { name: '立体几何·生活建模', blurb: '把立体几何搬进生活场景动手建模', sub: '数学 · 互动课件', kind: '互动课件 · 数学', metric: '5,600', author: '沈知微', portrait: PORTRAITS[2], cover: COVERS[6], resourceId: 'res-solid' },
      { name: '分层作业 Skill', blurb: '按学情自动生成分层作业', sub: '全学科 · AI Skill', kind: '技能 · 分层作业', metric: '4,200', author: '张伟', initial: '张', cover: COVERS[5], resourceId: 'res-skill-fenceng' },
      { name: '祥林嫂剧本杀', blurb: '把《祝福》上成一场沉浸式庭审', sub: '语文 · 剧本杀', kind: '剧本杀 · 语文', metric: '3,268', author: '林若水', initial: '林', cover: COVERS[0], resourceId: 'res-xianglin' },
      { name: '点餐口语游戏', blurb: '用点餐情境练开口的英语游戏', sub: '英语 · 教学游戏', kind: '教学游戏 · 英语', metric: '2,100', author: '陈红', initial: '陈', cover: COVERS[4], resourceId: 'res-order-game' },
      { name: '祥林嫂 · 县中简化版', blurb: '为县域课堂删繁就简的落地版', sub: '语文 · 课堂改编', kind: '课堂改编 · 语文', metric: '1,140', author: '周涛', initial: '周', cover: COVERS[0], resourceId: 'res-xl-zhoutao' },
      { name: '圆柱体积 · 天坛拆柱', blurb: '拆一根天坛柱子讲清圆柱体积', sub: '数学 · 互动课件', kind: '互动课件 · 数学', metric: '720', author: '李明', initial: '李', cover: COVERS[3], resourceId: 'res-cylinder' },
      { name: '双师课堂版', blurb: '主讲+辅导双师配合的课堂版', sub: '语文 · 课堂改编', kind: '课堂改编 · 语文', metric: '430', author: '李敏', initial: '李', cover: COVERS[1], resourceId: 'res-xl-limin' },
      { name: '二级 fork', blurb: '在县中版上继续改编的版本', sub: '语文 · 课堂改编', kind: '课堂改编 · 语文', metric: '88', author: '王芳', initial: '王', cover: COVERS[7], resourceId: 'res-xl-l2' },
      { name: '古文沉浸式漫游', blurb: '带学生沉浸式漫游古文场景', sub: '语文 · 互动课件', kind: '互动课件 · 语文', metric: '64', author: '苏窈', initial: '苏', portrait: PORTRAITS[1], cover: COVERS[8], resourceId: 'res-xianglin', rankKey: 'classroom-10' },
    ],
  },
  {
    key: 'latest', group: 'resource', title: '最新上架', tag: '使用', hot: false,
    period: '按课堂使用排序', metricLabel: '位老师使用', desc: '刚刚上架的课堂资源,先看同行正在把什么带进课堂。', layout: 'feature',
    items: [
      { name: '古诗词证据卡 · 课堂版', sub: '语文 · 课堂工具', kind: '课堂工具 · 语文', metric: '980', author: '刘彭芝', role: '特邀专家', initial: '刘', portrait: PORTRAITS[0], cover: COVERS[10], resourceId: 'res-xianglin', rankKey: 'latest-1' },
      { name: '古文沉浸式漫游', sub: '语文 · 互动课件', kind: '互动课件 · 语文', metric: '760', author: '苏窈', initial: '苏', portrait: PORTRAITS[1], cover: COVERS[9], resourceId: 'res-xianglin', rankKey: 'latest-2' },
      { name: '圆柱体积 · 天坛拆柱', sub: '数学 · 互动课件', kind: '互动课件 · 数学', metric: '620', author: '李明', initial: '李', cover: COVERS[3], resourceId: 'res-cylinder' },
      { name: '点餐口语游戏', sub: '英语 · 教学游戏', kind: '教学游戏 · 英语', metric: '560', author: '陈红', initial: '陈', cover: COVERS[4], resourceId: 'res-order-game' },
      { name: 'AI 回廊 · 错题追踪', sub: '数学 · AI Skill', kind: 'AI Skill · 数学', metric: '480', author: '沈知微', portrait: PORTRAITS[2], cover: COVERS[7], resourceId: 'res-ai-corridor', rankKey: 'latest-5' },
      { name: '学术摘要拆解', sub: '全学科 · 阅读工具', kind: '阅读工具 · 全学科', metric: '390', author: '刘彭芝', initial: '刘', portrait: PORTRAITS[0], cover: COVERS[8], resourceId: 'res-academic-abstract', rankKey: 'latest-6' },
      { name: '立体几何·生活建模', sub: '数学 · 互动课件', kind: '互动课件 · 数学', metric: '320', author: '沈知微', portrait: PORTRAITS[2], cover: COVERS[6], resourceId: 'res-solid' },
      { name: '作文批改 Skill', sub: '语文 · 技能调用', kind: '技能 · 课堂调用', metric: '270', author: '沈砚', initial: '沈', cover: COVERS[2], resourceId: 'res-skill-zuowen' },
      { name: '分层作业 Skill', sub: '全学科 · AI Skill', kind: '技能 · 分层作业', metric: '220', author: '张伟', initial: '张', cover: COVERS[5], resourceId: 'res-skill-fenceng' },
      { name: '祥林嫂剧本杀', sub: '语文 · 剧本杀', kind: '剧本杀 · 语文', metric: '180', author: '林若水', initial: '林', cover: COVERS[0], resourceId: 'res-xianglin' },
    ],
  },
  {
    key: 'adaptation', group: 'resource', title: '优质改编作品', tag: '使用', hot: false,
    period: '按课堂使用排序', metricLabel: '位老师使用', desc: '沿着真实课堂的改编主线,看作品如何继续长出新的版本。', layout: 'feature',
    items: [
      { name: '祥林嫂剧本杀（把〈祝福〉上成一场庭审）', sub: '语文 · 剧本杀', kind: '剧本杀 · 语文', metric: '3,268', author: '林若水', role: '飞象创作达人', initial: '林', cover: COVERS[0], resourceId: 'res-xianglin', rankKey: 'adaptation-1' },
      { name: '古诗词证据卡 · 课堂版', sub: '语文 · 课堂改编', kind: '课堂工具 · 语文', metric: '1,860', author: '刘彭芝', initial: '刘', portrait: PORTRAITS[0], cover: COVERS[10], resourceId: 'res-xianglin', rankKey: 'adaptation-2' },
      { name: '古文沉浸式漫游', sub: '语文 · 互动改编', kind: '互动课件 · 语文', metric: '1,420', author: '苏窈', initial: '苏', portrait: PORTRAITS[1], cover: COVERS[9], resourceId: 'res-xianglin', rankKey: 'adaptation-3' },
      { name: '祥林嫂 · 县中简化版', sub: '语文 · 课堂改编', kind: '课堂改编 · 语文', metric: '1,140', author: '周涛', initial: '周', cover: COVERS[8], resourceId: 'res-xl-zhoutao' },
      { name: '双师课堂版', sub: '语文 · 课堂改编', kind: '课堂改编 · 语文', metric: '860', author: '李敏', initial: '李', cover: COVERS[1], resourceId: 'res-xl-limin' },
      { name: '二级 fork', sub: '语文 · 课堂改编', kind: '课堂改编 · 语文', metric: '540', author: '王芳', initial: '王', cover: COVERS[7], resourceId: 'res-xl-l2' },
      { name: '圆柱体积 · 天坛拆柱', sub: '数学 · 课堂改编', kind: '互动课件 · 数学', metric: '420', author: '李明', initial: '李', cover: COVERS[3], resourceId: 'res-cylinder' },
      { name: '分层作业 Skill', sub: '全学科 · 课堂改编', kind: '技能 · 分层作业', metric: '360', author: '张伟', initial: '张', cover: COVERS[5], resourceId: 'res-skill-fenceng' },
      { name: '作文批改 Skill', sub: '语文 · 课堂改编', kind: '技能 · 课堂调用', metric: '280', author: '沈砚', initial: '沈', cover: COVERS[2], resourceId: 'res-skill-zuowen' },
      { name: '点餐口语游戏', sub: '英语 · 课堂改编', kind: '教学游戏 · 英语', metric: '190', author: '陈红', initial: '陈', cover: COVERS[4], resourceId: 'res-order-game' },
    ],
  },
  {
    key: 'curated', group: 'creator', title: '学科主理人', tag: '精选', hot: false,
    period: '编辑精选', metricLabel: '位老师在用', desc: '各学科正在把真实课例做成方法的主理人。', layout: 'compact',
    items: [
      { name: '林若水', sub: '语文 · 沉浸式剧本课', subject: '语文', metric: '4,900', unit: '位老师在用', role: '飞象创作达人', initial: '林', curated: true, target: 'studio' },
      { name: '沈知微', sub: '数学 · 生活建模课件', subject: '数学', metric: '5,600', unit: '位老师在用', role: '飞象创作达人', portrait: PORTRAITS[2], curated: true, target: 'studio' },
      { name: '陈红', sub: '英语 · 情境口语游戏', subject: '英语', metric: '2,100', unit: '位老师在用', initial: '陈', curated: true, target: 'studio' },
      { name: '张伟', sub: '全学科 · 分层作业设计', subject: '全学科', metric: '4,200', unit: '位老师在用', initial: '张', curated: true, target: 'studio' },
      { name: '周涛', sub: '语文 · 县中课堂改编', subject: '语文', metric: '1,140', unit: '位老师在用', initial: '周', curated: true, target: 'studio' },
      { name: '李明', sub: '数学 · 生活建模改编', subject: '数学', metric: '720', unit: '位老师在用', initial: '李', curated: true, target: 'studio' },
      { name: '李敏', sub: '语文 · 双师课堂版本', subject: '语文', metric: '430', unit: '位老师在用', initial: '李', curated: true, target: 'studio' },
      { name: '王芳', sub: '语文 · 二级课堂改编', subject: '语文', metric: '88', unit: '位老师在用', initial: '王', curated: true, target: 'studio' },
      { name: '沈砚', sub: '语文 · 作文批改方法', subject: '语文', metric: '3,100', unit: '位老师在用', initial: '沈', curated: true, target: 'studio' },
      { name: '刘彭芝', sub: '跨学科 · 课堂方法论', subject: '跨学科', metric: '2,860', unit: '位老师在用', role: '特邀专家', initial: '刘', portrait: PORTRAITS[0], curated: true, target: 'studio' },
    ],
  },
  {
    key: 'recognized', group: 'creator', title: '创作达人榜', tag: '使用', hot: false,
    period: '累计降序', metricLabel: '位老师在用', desc: '同行真正带进课堂、持续使用的创作者。', layout: 'compact',
    items: [
      { name: '沈知微', sub: '数学 · 生活建模课件', metric: '18', unit: '件作品', portrait: PORTRAITS[2], target: 'studio' },
      { name: '林若水', sub: '语文 · 沉浸式剧本课', metric: '16', unit: '件作品', initial: '林', target: 'studio' },
      { name: '张伟', sub: '全学科 · 分层作业 Skill', metric: '14', unit: '件作品', initial: '张', target: 'studio' },
      { name: '沈砚', sub: '语文 · 作文批改方法', metric: '12', unit: '件作品', initial: '沈', target: 'studio' },
      { name: '刘彭芝', sub: '跨学科 · 课堂方法论', metric: '10', unit: '件作品', initial: '刘', portrait: PORTRAITS[0], target: 'studio' },
      { name: '陈红', sub: '英语 · 点餐口语游戏', metric: '9', unit: '件作品', initial: '陈', target: 'studio' },
      { name: '周涛', sub: '语文 · 祥林嫂县中简化版', metric: '7', unit: '件作品', initial: '周', target: 'studio' },
      { name: '李明', sub: '数学 · 圆柱体积天坛拆柱', metric: '6', unit: '件作品', initial: '李', target: 'studio' },
      { name: '李敏', sub: '语文 · 双师课堂版本', metric: '4', unit: '件作品', initial: '李', target: 'studio' },
      { name: '王芳', sub: '语文 · 二级课堂改编', metric: '3', unit: '件作品', initial: '王', target: 'studio' },
    ],
  },
  {
    key: 'rising', group: 'creator', title: '新锐创作者', tag: '本周新增', hot: false,
    period: '按本周新增排序', metricLabel: '本周新增', desc: '刚把第一批课堂版本交出来,正在长出自己的方向。', layout: 'compact',
    items: [
      { name: '周涛', sub: '语文 · 祥林嫂县中简化版', metric: '+620', unit: '本周新增', initial: '周', target: 'studio' },
      { name: '李明', sub: '数学 · 圆柱体积天坛拆柱', metric: '+410', unit: '本周新增', initial: '李', target: 'studio' },
      { name: '陈红', sub: '英语 · 点餐口语游戏', metric: '+300', unit: '本周新增', initial: '陈', target: 'studio' },
      { name: '沈砚', sub: '语文 · 作文批改方法', metric: '+260', unit: '本周新增', initial: '沈', target: 'studio' },
      { name: '王芳', sub: '语文 · 二级课堂改编', metric: '+210', unit: '本周新增', initial: '王', target: 'studio' },
      { name: '李敏', sub: '语文 · 双师课堂版本', metric: '+180', unit: '本周新增', initial: '李', target: 'studio' },
      { name: '张伟', sub: '全学科 · 分层作业设计', metric: '+160', unit: '本周新增', initial: '张', target: 'studio' },
      { name: '刘彭芝', sub: '跨学科 · 课堂方法论', metric: '+140', unit: '本周新增', initial: '刘', portrait: PORTRAITS[0], target: 'studio' },
      { name: '苏窈', sub: '语文 · 古文沉浸式漫游', metric: '+120', unit: '本周新增', initial: '苏', portrait: PORTRAITS[1], target: 'studio' },
      { name: '林若水', sub: '语文 · 沉浸式剧本课', metric: '+90', unit: '本周新增', initial: '林', target: 'studio' },
    ],
  },
]

const adaptationBoard = BOARDS.find(board => board.key === 'adaptation')
const latestBoard = BOARDS.find(board => board.key === 'latest')
const classroomBoard = BOARDS.find(board => board.key === 'classroom')

// 顶部运营位只引用排行榜与固定卡司中的现有素材,不另造一套人物或指标。
export const EDITORIAL_FEATURES = [
  {
    key: 'editor-choice', eyebrow: '本周编辑精选',
    title: adaptationBoard.items[0].name,
    desc: '把《祝福》上成一场庭审,带回班里继续改编。',
    cover: adaptationBoard.items[0].cover,
    author: adaptationBoard.items[0].author,
    initial: adaptationBoard.items[0].initial,
    role: adaptationBoard.items[0].role,
    metric: adaptationBoard.items[0].metric,
    metricLabel: '位老师使用',
    resourceId: adaptationBoard.items[0].resourceId,
    target: 'resource',
  },
  {
    key: 'new-master', eyebrow: '新入驻名师',
    title: latestBoard.items[0].author,
    desc: MASTERS[0].cred + ' · 把课堂方法做成可复用的资源。',
    cover: latestBoard.items[0].cover,
    author: latestBoard.items[0].author,
    initial: latestBoard.items[0].initial,
    portrait: latestBoard.items[0].portrait,
    role: latestBoard.items[0].role,
    metric: MASTERS[0].use,
    metricLabel: '位老师使用',
    target: 'studio',
  },
]

// 专题卡引用榜单中的固定资源、人名与指标,只改变编辑化编排和文案。
export const EDITORIAL_STORIES = [
  {
    key: 'xianglin-remix', eyebrow: '改编脉络',
    title: '一课千枝 · 《祥林嫂剧本杀》',
    desc: '林若水把一节语文课做成了可以继续生长的课堂版本。',
    cover: adaptationBoard.items[0].cover,
    author: adaptationBoard.items[0].author,
    initial: adaptationBoard.items[0].initial,
    metric: adaptationBoard.items[0].metric,
    metricLabel: '位老师使用',
    resourceId: adaptationBoard.items[0].resourceId,
  },
  {
    key: 'cylinder-hit', eyebrow: '本周最火改编',
    title: '《圆柱体积·天坛拆柱》',
    desc: '李明把数学概念放回真实场景,让一根柱子变成可互动的课。',
    cover: adaptationBoard.items[6].cover,
    author: adaptationBoard.items[6].author,
    initial: adaptationBoard.items[6].initial,
    metric: adaptationBoard.items[6].metric,
    metricLabel: '位老师使用',
    resourceId: adaptationBoard.items[6].resourceId,
  },
  {
    key: 'shenyan-skill', eyebrow: '新锐名师',
    title: '沈砚 · 《作文批改 Skill》',
    desc: '把批改方法拆成一步步能被老师接住的课堂动作。',
    cover: classroomBoard.items[0].cover,
    author: classroomBoard.items[0].author,
    initial: classroomBoard.items[0].initial,
    metric: classroomBoard.items[0].metric,
    metricLabel: '位老师使用',
    resourceId: classroomBoard.items[0].resourceId,
  },
]
