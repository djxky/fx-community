import { COVERS } from './covers'
import { EDITORIAL_COVERS } from './editorial-covers'
import { PORTRAITS } from './portraits'

// 作品池只使用既有固定卡司；同一张图始终对应同一类课堂内容。
const WORKS = {
  historyRoute: {
    name: '《出师表》行军决策图', blurb: '把人物动机放进行军路线中推演',
    sub: '语文 · 教学游戏', kind: '教学游戏 · 语文', author: '周涛', initial: '周',
    cover: EDITORIAL_COVERS.historyMap, resourceId: 'res-xl-zhoutao',
  },
  projectileLab: {
    name: '平抛运动·轨迹实验台', blurb: '拖动角度，同步观察速度分解与落点',
    sub: '物理 · 互动课件', kind: '互动课件 · 物理', author: '李明', initial: '李',
    cover: EDITORIAL_COVERS.projectileLab, resourceId: 'res-solid',
  },
  algorithmKitchen: {
    name: '一盘菜讲懂算法流程', blurb: '用备菜顺序理解输入、判断与输出',
    sub: '信息科技 · 互动课件', kind: '互动课件 · 信息科技', author: '张伟', initial: '张',
    cover: EDITORIAL_COVERS.algorithmKitchen, resourceId: 'res-ai-corridor',
  },
  mathCodesign: {
    name: '立体几何·生活建模', blurb: '从实物操作到空间关系的共备方案',
    sub: '数学 · 教案', kind: '教案 · 数学', author: '沈知微', portrait: PORTRAITS[2],
    cover: EDITORIAL_COVERS.mathCodesign, resourceId: 'res-solid',
  },
  printingPress: {
    name: '《活版》排字工坊', blurb: '排字、刷墨、印纸，动手理解古代技术',
    sub: '语文 · 互动课件', kind: '互动课件 · 语文', author: '林若水', initial: '林',
    cover: EDITORIAL_COVERS.printingPress, resourceId: 'res-xianglin',
  },
  musicWave: {
    name: '节奏与声波可视化', blurb: '让重音、节拍和旋律变化看得见',
    sub: '音乐 · 互动课件', kind: '互动课件 · 音乐', author: '陈红', initial: '陈',
    cover: EDITORIAL_COVERS.musicWave, resourceId: 'res-order-game',
  },
  lessonStudy: {
    name: '物质转化·实验共备案', blurb: '实验、追问与评价量规一次备完整',
    sub: '化学 · 教案', kind: '教案 · 化学', author: '刘彭芝', initial: '刘', portrait: PORTRAITS[0],
    cover: EDITORIAL_COVERS.lessonStudy, resourceId: 'res-academic-abstract',
  },
  mathModeling: {
    name: '函数图像·同课异构', blurb: '两种建模路径放在同一块屏幕比较',
    sub: '数学 · 教案', kind: '教案 · 数学', author: '沈知微', portrait: PORTRAITS[2],
    cover: EDITORIAL_COVERS.mathModeling, resourceId: 'res-solid',
  },
  teacherCollaboration: {
    name: '跨学科项目·四人共创版', blurb: '把学科任务、材料和评价放进一张共创画布',
    sub: '全学科 · 应用', kind: '应用 · 教研协作', author: '刘彭芝', initial: '刘', portrait: PORTRAITS[0],
    cover: EDITORIAL_COVERS.teacherCollaboration, resourceId: 'res-skill-fenceng',
  },
  courseAuthoring: {
    name: '一张草图生成互动讲解', blurb: '从课堂草图补齐页面、互动和讲解节奏',
    sub: '信息科技 · 应用', kind: '应用 · AI 课件', author: '沈砚', initial: '沈',
    cover: EDITORIAL_COVERS.courseAuthoring, resourceId: 'res-skill-zuowen',
  },
  learningAnalytics: {
    name: '课堂数据回收与诊断', blurb: '把正确率、易错路径和二讲名单收在一起',
    sub: '数学 · 题单', kind: '题单 · 学情诊断', author: '王芳', initial: '王',
    cover: EDITORIAL_COVERS.learningAnalytics, resourceId: 'res-skill-fenceng',
  },
  evidencePoetry: {
    name: '古诗词证据卡 · 课堂版', blurb: '让阅读证据可以标注、归类和讨论',
    sub: '语文 · 课堂工具', kind: '课堂工具 · 语文', author: '刘彭芝', initial: '刘', portrait: PORTRAITS[0], role: '特邀专家',
    cover: COVERS[10], resourceId: 'res-xianglin',
  },
  xianglin: {
    name: '祥林嫂剧本杀', blurb: '把《祝福》上成一场沉浸式庭审',
    sub: '语文 · 剧本杀', kind: '剧本杀 · 语文', author: '林若水', initial: '林', role: '飞象创作达人',
    cover: COVERS[0], resourceId: 'res-xianglin',
  },
  englishLive: {
    name: '英语听说·全班开口课', blurb: '把角色任务和口语反馈带进课堂',
    sub: '英语 · 教学游戏', kind: '教学游戏 · 英语', author: '苏窈', initial: '苏', portrait: PORTRAITS[1],
    cover: COVERS[1], resourceId: 'res-xl-limin',
  },
  writingSkill: {
    name: '作文批改 Skill', blurb: '逐句点评、给改法示范，缩短批改时间',
    sub: '语文 · 技能', kind: '技能 · 作文批改', author: '沈砚', initial: '沈',
    cover: COVERS[2], resourceId: 'res-skill-zuowen',
  },
  crystalModel: {
    name: '晶胞均摊·三维拆解', blurb: '旋转晶体结构，逐层看清均摊关系',
    sub: '化学 · 互动课件', kind: '互动课件 · 化学', author: '李敏', initial: '李',
    cover: COVERS[3], resourceId: 'res-cylinder',
  },
  orderGame: {
    name: '点餐口语游戏', blurb: '用餐厅情境练习真实英语表达',
    sub: '英语 · 教学游戏', kind: '教学游戏 · 英语', author: '陈红', initial: '陈',
    cover: COVERS[4], resourceId: 'res-order-game',
  },
  differentiated: {
    name: '分层作业 Skill', blurb: '按学情自动生成不同层级的任务',
    sub: '全学科 · 技能', kind: '技能 · 分层作业', author: '张伟', initial: '张',
    cover: COVERS[5], resourceId: 'res-skill-fenceng',
  },
  mineMath: {
    name: '口算矿井·闯关版', blurb: '把计算练习放进有反馈的挑战路径',
    sub: '数学 · 教学游戏', kind: '教学游戏 · 数学', author: '沈知微', portrait: PORTRAITS[2],
    cover: COVERS[6], resourceId: 'res-solid',
  },
  sportsTrack: {
    name: '运动轨迹·动作复盘', blurb: '用视频轨迹标记动作节奏和改进点',
    sub: '体育 · 应用', kind: '应用 · 体育', author: '王芳', initial: '王',
    cover: COVERS[7], resourceId: 'res-ai-corridor',
  },
  academicAbstract: {
    name: '学术摘要拆解', blurb: '把观点、证据和结论拆成可操作的阅读框架',
    sub: '英语 · 题单', kind: '题单 · 英语', author: '刘彭芝', initial: '刘', portrait: PORTRAITS[0],
    cover: COVERS[8], resourceId: 'res-academic-abstract',
  },
  immersiveText: {
    name: '古文沉浸式漫游', blurb: '带学生在空间线索中理解古文场景',
    sub: '语文 · 互动课件', kind: '互动课件 · 语文', author: '苏窈', initial: '苏', portrait: PORTRAITS[1],
    cover: COVERS[9], resourceId: 'res-xianglin',
  },
}

const ranked = (work, metric, extra = {}) => ({ ...work, metric, ...extra })
const creatorEntry = (work, metric, extra = {}) => ({
  name: work.author,
  workTitle: extra.workTitle || work.name,
  sub: work.sub,
  metric,
  unit: extra.unit || '件作品',
  initial: work.initial,
  portrait: work.portrait,
  cover: work.cover,
  resourceId: work.resourceId,
  target: 'resource',
  ...extra,
})

// resource = 作品/资源榜；creator = 按创作者贡献排序的代表作榜。
export const BOARDS = [
  {
    key: 'classroom', group: 'resource', title: '课堂使用榜', tag: '使用', hot: true,
    period: '按课堂使用排序', metricLabel: '位老师使用', desc: '真的被带进课堂的，不是刷出来的。每一张卡都能打开原资源。', layout: 'feature',
    items: [
      ranked(WORKS.algorithmKitchen, '8,900'),
      ranked(WORKS.projectileLab, '5,600'),
      ranked(WORKS.historyRoute, '4,200'),
      ranked(WORKS.mathCodesign, '3,268'),
      ranked(WORKS.printingPress, '2,100'),
      ranked(WORKS.musicWave, '1,560'),
      ranked(WORKS.lessonStudy, '1,240'),
      ranked(WORKS.mathModeling, '986'),
      ranked(WORKS.sportsTrack, '720'),
      ranked(WORKS.courseAuthoring, '430', { rankKey: 'classroom-10' }),
    ],
  },
  {
    key: 'latest', group: 'resource', title: '最新上架', tag: '使用', hot: false,
    period: '按课堂使用排序', metricLabel: '位老师使用', desc: '刚刚上架的课堂资源，先看同行正在把什么带进课堂。', layout: 'feature',
    items: [
      ranked(WORKS.evidencePoetry, '980', { rankKey: 'latest-1' }),
      ranked(WORKS.teacherCollaboration, '860', { rankKey: 'latest-2' }),
      ranked(WORKS.courseAuthoring, '760'),
      ranked(WORKS.learningAnalytics, '620'),
      ranked(WORKS.xianglin, '560'),
      ranked(WORKS.englishLive, '480'),
      ranked(WORKS.writingSkill, '390'),
      ranked(WORKS.crystalModel, '320'),
      ranked(WORKS.orderGame, '270'),
      ranked(WORKS.differentiated, '220'),
    ],
  },
  {
    key: 'adaptation', group: 'resource', title: '优质改编作品', tag: '使用', hot: false,
    period: '按课堂使用排序', metricLabel: '位老师使用', desc: '沿着真实课堂的改编主线，看作品如何继续长出新的版本。', layout: 'feature',
    items: [
      ranked(WORKS.mineMath, '3,268', { rankKey: 'adaptation-1' }),
      ranked(WORKS.academicAbstract, '1,860', { rankKey: 'adaptation-2' }),
      ranked(WORKS.immersiveText, '1,420', { rankKey: 'adaptation-3' }),
      ranked(WORKS.historyRoute, '1,140'),
      ranked(WORKS.projectileLab, '860'),
      ranked(WORKS.algorithmKitchen, '540'),
      ranked(WORKS.mathCodesign, '420'),
      ranked(WORKS.printingPress, '360'),
      ranked(WORKS.musicWave, '280'),
      ranked(WORKS.lessonStudy, '190'),
    ],
  },
  {
    key: 'curated', group: 'creator', title: '学科主理人', tag: '精选', hot: false,
    period: '编辑精选', metricLabel: '位老师在用', desc: '各学科正在把真实课例做成方法的主理人。', layout: 'compact',
    items: [
      { name: '林若水', sub: '语文 · 沉浸式剧本课', subject: '语文', metric: '4,900', unit: '位老师在用', role: '飞象创作达人', initial: '林', curated: true, target: 'studio' },
      { name: '沈知微', sub: '数学 · 生活建模课件', subject: '数学', metric: '5,600', unit: '位老师在用', role: '飞象创作达人', portrait: PORTRAITS[2], curated: true, target: 'studio' },
      { name: '陈红', sub: '英语 · 情境口语游戏', subject: '英语', metric: '2,100', unit: '位老师在用', initial: '陈', curated: true, target: 'studio' },
      { name: '张伟', sub: '信息科技 · 算法课件', subject: '信息科技', metric: '4,200', unit: '位老师在用', initial: '张', curated: true, target: 'studio' },
      { name: '周涛', sub: '语文 · 县中课堂改编', subject: '语文', metric: '1,140', unit: '位老师在用', initial: '周', curated: true, target: 'studio' },
      { name: '李明', sub: '物理 · 动态模型', subject: '物理', metric: '720', unit: '位老师在用', initial: '李', curated: true, target: 'studio' },
      { name: '李敏', sub: '化学 · 三维实验', subject: '化学', metric: '430', unit: '位老师在用', initial: '李', curated: true, target: 'studio' },
      { name: '王芳', sub: '体育 · 动作复盘', subject: '体育', metric: '88', unit: '位老师在用', initial: '王', curated: true, target: 'studio' },
      { name: '沈砚', sub: '语文 · 作文批改方法', subject: '语文', metric: '3,100', unit: '位老师在用', initial: '沈', curated: true, target: 'studio' },
      { name: '刘彭芝', sub: '跨学科 · 课堂方法论', subject: '跨学科', metric: '2,860', unit: '位老师在用', role: '特邀专家', initial: '刘', portrait: PORTRAITS[0], curated: true, target: 'studio' },
    ],
  },
  {
    key: 'recognized', group: 'creator', title: '创作达人榜', tag: '使用', hot: false,
    period: '按作品数量排序', metricLabel: '件作品', desc: '同行真正带进课堂、持续使用的创作者。', layout: 'editorial-work',
    items: [
      creatorEntry(WORKS.mathCodesign, '18'),
      creatorEntry(WORKS.printingPress, '16'),
      creatorEntry(WORKS.algorithmKitchen, '14'),
      creatorEntry(WORKS.courseAuthoring, '12'),
      creatorEntry(WORKS.evidencePoetry, '10'),
      creatorEntry(WORKS.musicWave, '9'),
      creatorEntry(WORKS.historyRoute, '7'),
      creatorEntry(WORKS.projectileLab, '6'),
      creatorEntry(WORKS.crystalModel, '4'),
      creatorEntry(WORKS.learningAnalytics, '3'),
    ],
  },
  {
    key: 'rising', group: 'creator', title: '新锐创作者榜', tag: '本周新增', hot: false,
    period: '按本周新增排序', metricLabel: '本周新增', desc: '刚把第一批课堂版本交出来，正在长出自己的方向。', layout: 'work-rail',
    items: [
      creatorEntry(WORKS.historyRoute, '+620', { workTitle: '祥林嫂 · 县中简化版', unit: '本周新增' }),
      creatorEntry(WORKS.projectileLab, '+410', { unit: '本周新增' }),
      creatorEntry(WORKS.orderGame, '+300', { unit: '本周新增' }),
      creatorEntry(WORKS.courseAuthoring, '+260', { unit: '本周新增' }),
      creatorEntry(WORKS.learningAnalytics, '+210', { unit: '本周新增' }),
      creatorEntry(WORKS.crystalModel, '+180', { unit: '本周新增' }),
      creatorEntry(WORKS.algorithmKitchen, '+160', { unit: '本周新增' }),
      creatorEntry(WORKS.evidencePoetry, '+140', { unit: '本周新增' }),
      creatorEntry(WORKS.immersiveText, '+120', { unit: '本周新增' }),
      creatorEntry(WORKS.xianglin, '+90', { unit: '本周新增' }),
    ],
  },
]

const adaptationBoard = BOARDS.find(board => board.key === 'adaptation')
const latestBoard = BOARDS.find(board => board.key === 'latest')

export const EDITORIAL_FEATURES = [
  {
    key: 'editor-choice', eyebrow: '本周编辑精选',
    title: WORKS.historyRoute.name,
    desc: '把古文人物放进一张可推演的路线图，课堂讨论从“记结论”转向“找证据”。',
    cover: WORKS.historyRoute.cover,
    author: WORKS.historyRoute.author,
    initial: WORKS.historyRoute.initial,
    metric: '4,200',
    metricLabel: '位老师使用',
    resourceId: WORKS.historyRoute.resourceId,
    target: 'resource',
  },
  {
    key: 'editor-tool', eyebrow: '课堂工具精选',
    title: latestBoard.items[0].name,
    desc: '把古诗词阅读变成可标注、可讨论的课堂证据卡。',
    cover: latestBoard.items[0].cover,
    author: latestBoard.items[0].author,
    initial: latestBoard.items[0].initial,
    portrait: latestBoard.items[0].portrait,
    role: latestBoard.items[0].role,
    metric: latestBoard.items[0].metric,
    metricLabel: '位老师使用',
    resourceId: latestBoard.items[0].resourceId,
    target: 'resource',
  },
]

export const EDITORIAL_STORIES = [
  {
    key: 'math-modeling', eyebrow: '同课异构',
    title: WORKS.mathModeling.name,
    desc: '两位老师把不同建模路径放在同一块屏幕上比较。',
    cover: WORKS.mathModeling.cover,
    author: WORKS.mathModeling.author,
    metric: '986', metricLabel: '位老师使用', resourceId: WORKS.mathModeling.resourceId,
  },
  {
    key: 'algorithm-kitchen', eyebrow: '跨学科灵感',
    title: WORKS.algorithmKitchen.name,
    desc: '从生活流程进入算法概念，让抽象步骤变得可以操作。',
    cover: WORKS.algorithmKitchen.cover,
    author: WORKS.algorithmKitchen.author,
    metric: '1,530', metricLabel: '位老师使用', resourceId: WORKS.algorithmKitchen.resourceId,
  },
  {
    key: 'remix-pick', eyebrow: '优质改编',
    title: adaptationBoard.items[0].name,
    desc: '把计算练习改成有路径、有反馈的课堂挑战。',
    cover: adaptationBoard.items[0].cover,
    author: adaptationBoard.items[0].author,
    metric: adaptationBoard.items[0].metric,
    metricLabel: '位老师使用', resourceId: adaptationBoard.items[0].resourceId,
  },
]
