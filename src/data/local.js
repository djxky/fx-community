import { COVERS } from './covers'
import haidianMathResearchAvatar from '../assets/institution-avatars/haidian-math-research-avatar.png'
import beijingElevenCurriculumAvatar from '../assets/institution-avatars/beijing-eleven-curriculum-avatar.png'

// 本地(北京)—— 复用发现的卡片/名师组件,数据是本地过滤 + 适用北京。
export const LOCAL_MASTERS = [
  { kind: 'expert', name: '王丽敏', initial: '王', cred: '语文特级 · 东城区教研员', bio: '深耕小学语文整本书阅读与单元整体设计,东城区教研成果被全区一线老师采用。', use: '4.1万', follow: '9.8万', local: true },
  { kind: 'expert', name: '张一凡', initial: '张', cred: '数学正高级 · 海淀名师', bio: '海淀区数学学科带头人,擅长分层教学与期末高频错题专项,课例在本区广泛使用。', use: '3.6万', follow: '7.2万', local: true },
  { kind: 'research', name: '海淀区数学教研室', icon: 'people', logo: haidianMathResearchAvatar, cred: '教研组 · 集体备课', bio: '汇聚全区名师的单元设计与分层作业,本区老师拿来即用,教材版本完全对得上。', use: '6.8万', follow: '2.1万' },
  { kind: 'school', name: '北京十一学校 · 学科基地', icon: 'school', logo: beijingElevenCurriculumAvatar, cred: '名校 · 校本课程', bio: '走班制下沉淀的项目式与跨学科课例,面向北京学校开放参考与改编。', use: '5.5万', follow: '1.9万' },
]

export const LOCAL_POSTS = [
  {
    to: 'res', cover: COVERS[0], badge: '语文 · 课件', region: '北京', live: false,
    author: '王丽敏', avatar: '王', role: '东城 · 史家小学', verify: 'expert',
    title: '《北京的春节》整本单元设计——从庙会到胡同,把课文上成一次城市漫步',
    proof: { type: 'expert', by: '东城教研室' },
    meta: '小学语文 · 六年级 · 人教版', verified: true,
    evi: { use: '3,204', adapt: '120', star: '8,340' }, views: '4.1万',
  },
  {
    to: 'res', cover: COVERS[3], badge: '数学 · 应用', region: '北京', live: false,
    author: '张一凡', avatar: '张', role: '海淀 · 中关村三小', verify: 'expert',
    title: '海淀区期末高频错题——圆柱圆锥自适应练习,对着近三年区卷做的',
    proof: { type: 'hot', text: '海淀老师都在用' },
    meta: '小学数学 · 六年级 · 期末复习', verified: true,
    evi: { use: '2,780', adapt: '96', star: '7,120' }, views: '3.5万',
  },
  {
    to: 'res', cover: COVERS[4], badge: '英语 · 教学游戏', region: '北京', live: false,
    author: '李文清', avatar: '李', role: '西城 · 北师大附小', verify: 'teacher',
    title: 'Unit 6 单词闯关——北京版教材同步,西城这套词表完全对得上',
    proof: { type: 'new', text: '本周上新' },
    meta: '小学英语 · 北京版 · 游戏化', verified: false,
    evi: { use: '1,690', adapt: '58', star: '4,280' }, views: '2.2万',
  },
  {
    to: 'res', cover: COVERS[7], badge: '物理 · 教案', region: '北京', live: false,
    author: '刘涛', avatar: '刘', role: '朝阳 · 八十中', verify: 'teacher',
    title: '朝阳一模力学专题——分层讲义,本地一模刚考完趁热做的复盘',
    proof: null,
    meta: '高中物理 · 力学 · 一模复盘', verified: false,
    evi: { use: '980', adapt: '41', star: '2,460' }, views: '1.3万',
  },
]
