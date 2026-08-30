import { COVERS } from './covers'
import { PORTRAITS } from './portraits'
import pepLogo from '../assets/institution-logos/people-education-press-logo.png'
import haidianMathResearchAvatar from '../assets/institution-avatars/haidian-math-research-avatar.png'
import beijingElevenCurriculumAvatar from '../assets/institution-avatars/beijing-eleven-curriculum-avatar.png'
import poeticChineseStudioAvatar from '../assets/institution-avatars/poetic-chinese-studio-avatar.png'

// 排行榜唯一数据源：所有使用数与固定卡司均来自 PRD §8.4。
// feature = 资源/应用主榜的大封面卡；compact = 名师/学科/机构紧凑榜。
export const BOARDS = [
  {
    key: 'classroom', title: '真实课堂使用榜', tag: '主榜 · 本周', hot: true,
    period: '按老师使用排序',
    desc: '真的被带进课堂的,不是刷出来的。每一张卡都能打开原资源。', layout: 'feature',
    items: [
      { name: '作文批改 Skill', sub: '沈砚 · 语文 · 被调用', kind: '技能 · 课堂调用', metric: '8,900', activeSignal: '正在被 8,900 位老师用', author: '沈砚', initial: '沈', cover: COVERS[2], resourceId: 'res-skill-zuowen' },
      { name: '立体几何 · 生活建模', sub: '沈知微 · 数学 · 互动课件', kind: '互动课件 · 数学', metric: '5,600', activeSignal: '正在被 5,600 位老师用', author: '沈知微', portrait: PORTRAITS[2], cover: COVERS[3], resourceId: 'res-solid' },
      { name: '分层作业 Skill', sub: '张伟 · 全学科 · AI Skill', kind: '技能 · 分层作业', metric: '4,200', activeSignal: '正在被 4,200 位老师用', author: '张伟', initial: '张', cover: COVERS[5], resourceId: 'res-skill-fenceng' },
      { name: '我把〈祝福〉上成一场庭审 · 祥林嫂剧本杀', sub: '林若水 · 语文 · 剧本杀', kind: '剧本杀 · 语文', metric: '3,268', activeSignal: '正在被 3,268 位老师用', author: '林若水', initial: '林', cover: COVERS[0], resourceId: 'res-xianglin' },
      { name: '点餐口语游戏', sub: '陈红 · 英语 · 教学游戏', kind: '教学游戏 · 英语', metric: '2,100', activeSignal: '正在被 2,100 位老师用', author: '陈红', initial: '陈', cover: COVERS[4], resourceId: 'res-order-game' },
    ],
  },
  {
    key: 'rising', title: '新锐榜', tag: '正在长出来', hot: false,
    period: '本周', desc: '从一节课开始,让素人老师被更多同行看见。', layout: 'compact',
    items: [
      { name: '林若水', sub: '语文 · 沉浸式课堂', metric: '4,900', unit: '累计使用', signal: '正在被 4,900 位老师用', initial: '林', target: 'studio' },
      { name: '张伟', sub: '全学科 · 分层作业 Skill', metric: '4,200', unit: '累计使用', signal: '正在被 4,200 位老师用', initial: '张', target: 'studio' },
      { name: '陈红', sub: '英语 · 点餐口语游戏', metric: '2,100', unit: '累计使用', signal: '正在被 2,100 位老师用', initial: '陈', target: 'studio' },
      { name: '周涛', sub: '语文 · 祥林嫂县中简化版', metric: '1,140', unit: '累计使用', signal: '正在被 1,140 位老师用', initial: '周', target: 'studio' },
      { name: '李明', sub: '数学 · 圆柱体积天坛拆柱', metric: '720', unit: '累计使用', signal: '正在被 720 位老师用', initial: '李', target: 'studio' },
    ],
  },
  {
    key: 'subject', title: '学科榜', tag: '课堂方向', hot: false,
    period: '本周', desc: '按学科看见正在被老师使用的具体内容。', layout: 'compact',
    items: [
      { name: '语文 · 作文批改 Skill', sub: '沈砚 · 技能调用', metric: '8,900', unit: '课堂使用', signal: '正在被 8,900 位老师用', initial: '沈', target: 'resource', resourceId: 'res-skill-zuowen' },
      { name: '数学 · 立体几何 · 生活建模', sub: '沈知微 · 互动课件', metric: '5,600', unit: '课堂使用', signal: '正在被 5,600 位老师用', portrait: PORTRAITS[2], target: 'resource', resourceId: 'res-solid' },
      { name: '数学 · 分层作业 Skill', sub: '张伟 · 技能调用', metric: '4,200', unit: '课堂使用', signal: '正在被 4,200 位老师用', initial: '张', target: 'resource', resourceId: 'res-skill-fenceng' },
      { name: '语文 · 祥林嫂剧本杀', sub: '林若水 · 剧本杀', metric: '3,268', unit: '课堂使用', signal: '正在被 3,268 位老师用', initial: '林', target: 'resource', resourceId: 'res-xianglin' },
      { name: '英语 · 点餐口语游戏', sub: '陈红 · 教学游戏', metric: '2,100', unit: '课堂使用', signal: '正在被 2,100 位老师用', initial: '陈', target: 'resource', resourceId: 'res-order-game' },
    ],
  },
  {
    key: 'institution', title: '机构榜', tag: '组织影响力', hot: false,
    period: '本月', desc: '出版社、教研组、名校与工作室,整建制贡献课程。', layout: 'compact',
    items: [
      { name: '人民教育出版社 · 数学编辑部', sub: '出版社 · 教材同步资源', metric: '12.4万', unit: '使用', signal: '正在被 12.4 万位老师用', logo: pepLogo, target: 'studio' },
      { name: '王崧舟 · 诗意语文工作室', sub: '工作室 · 团队共创', metric: '7.3万', unit: '使用', signal: '正在被 7.3 万位老师用', logo: poeticChineseStudioAvatar, target: 'studio' },
      { name: '海淀区教师进修学校 · 数学教研室', sub: '教研组 · 集体备课', metric: '6.8万', unit: '使用', signal: '正在被 6.8 万位老师用', logo: haidianMathResearchAvatar, target: 'studio' },
      { name: '北京十一学校 · 学科课程基地', sub: '名校 · 校本课程', metric: '5.5万', unit: '使用', signal: '正在被 5.5 万位老师用', logo: beijingElevenCurriculumAvatar, target: 'studio' },
    ],
  },
]
