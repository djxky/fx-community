import { COVERS } from './covers'
import { PORTRAITS } from './portraits'
import pepLogo from '../assets/institution-logos/people-education-press-logo.png'
import haidianMathResearchAvatar from '../assets/institution-avatars/haidian-math-research-avatar.png'
import beijingElevenCurriculumAvatar from '../assets/institution-avatars/beijing-eleven-curriculum-avatar.png'

// 本地(北京)——只取 §8.4 固定卡司与固定资源,本地感来自地域语境而不是新编数字。
export const LOCAL_MASTERS = [
  { kind: 'expert', name: '沈知微', portrait: PORTRAITS[2], cred: '数学特级 · 正高级', signal: '北京数学课堂常用', use: '4.1万' },
  { kind: 'expert', name: '林若水', initial: '林', cred: '语文教师 · 课堂实践者', signal: '北京语文课堂常用', use: '3,268' },
  { kind: 'expert', name: '沈砚', initial: '沈', cred: '语文教师 · Skill 作者', signal: '北京老师正在使用', use: '8,900' },
  { kind: 'press', name: '人民教育出版社 · 数学编辑部', icon: 'book', logo: pepLogo, cred: '出版社 · 教材同步', signal: '北京教材版本可对上', use: '12.4万' },
  { kind: 'research', name: '海淀区数学教研室', icon: 'people', logo: haidianMathResearchAvatar, cred: '教研组 · 集体备课', signal: '海淀教研持续使用', use: '6.8万' },
  { kind: 'school', name: '北京十一学校 · 学科基地', icon: 'school', logo: beijingElevenCurriculumAvatar, cred: '名校 · 学科课程基地', signal: '北京学校开放参考', use: '5.5万' },
]

export const LOCAL_POSTS = [
  {
    resourceId: 'res-skill-zuowen', cover: COVERS[2], badge: '技能 · 作文批改',
    author: '沈砚', avatar: '沈', role: '语文教师 · Skill 作者', verify: 'expert',
    title: '作文批改 Skill——把一轮轮讲评变成学生看得懂的修改建议',
    meta: '语文 · 初中 · 作文批改', localSignal: '北京老师正在用',
    use: '8,900', adapt: '34', star: '3,100',
  },
  {
    resourceId: 'res-solid', cover: COVERS[3], badge: '数学 · 应用',
    author: '沈知微', avatar: '沈', role: '数学特级 · 正高级', verify: 'expert',
    title: '立体几何 · 生活建模——让学生从教室里的物体开始建自己的模型',
    meta: '数学 · 小学六年级 · 人教版', localSignal: '北京数学课堂正在用',
    use: '5,600', adapt: '63', star: '2,400',
  },
  {
    resourceId: 'res-skill-fenceng', cover: COVERS[5], badge: '技能 · 分层作业',
    author: '张伟', avatar: '张', role: '一线教师 · Skill 作者', verify: 'teacher',
    title: '分层作业 Skill——同一道题,给不同起点的孩子一条能走通的路',
    meta: '全学科 · 小学至初中 · 分层作业', localSignal: '北京老师正在用',
    use: '4,200', adapt: '18', star: '1,500',
  },
  {
    resourceId: 'res-xianglin', cover: COVERS[0], badge: '语文 · 互动课件',
    author: '林若水', avatar: '林', role: '语文教师 · 课堂实践者', verify: 'teacher',
    title: '我把〈祝福〉上成一场庭审——祥林嫂剧本杀的真实课堂版本',
    meta: '语文 · 初中九年级 · 统编版', localSignal: '北京语文课堂正在用',
    use: '3,268', adapt: '47', star: '1,902',
  },
  {
    resourceId: 'res-order-game', cover: COVERS[4], badge: '英语 · 教学游戏',
    author: '陈红', avatar: '陈', role: '一线教师 · 英语课堂', verify: 'teacher',
    title: '点餐口语游戏——把北京版教材里的对话练习搬进真实情境',
    meta: '英语 · 初中 · 口语游戏化', localSignal: '北京英语课堂正在用',
    use: '2,100', adapt: '12', star: '880',
  },
]
