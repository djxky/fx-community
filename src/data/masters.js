import { PORTRAITS } from './portraits'

// 名师智库 —— 认证主体多元:名师 / 出版社 / 教研组 / 名校 / 工作室。
// kind: 'expert'(金环荣誉) | 'press' | 'research' | 'school' | 'studio'(素色类型标)
export const MASTERS = [
  {
    kind: 'expert', name: '刘彭芝', portrait: PORTRAITS[0],
    cred: '数学特级 · 正高级 · 人大附中联合学校总校名誉校长',
    bio: '拔尖创新人才早期培养的探索者与实践者,长期主持人大附中办学,培养特级、正高级教师数十名。',
    use: '8.9万', follow: '46.2万',
  },
  {
    kind: 'expert', name: '苏窈', portrait: PORTRAITS[1],
    cred: '英语特级 · 正高级 · 省名师工作室主持人',
    bio: '深耕中学英语听说教学 25 年,主持省级课题 5 项,主编地方教材,示范课覆盖全国 20 余省市。',
    use: '3.2万', follow: '15.8万',
  },
  {
    kind: 'expert', name: '沈知微', portrait: PORTRAITS[2],
    cred: '数学特级 · 正高级 · 人教版教材编写组',
    bio: '北京市数学学科带头人,深耕数学思维与分层教学,主持市级重点课题 3 项,培养青年骨干 50 余人。',
    use: '4.1万', follow: '13.2万',
  },
  {
    kind: 'press', name: '人民教育出版社 · 数学编辑部', icon: 'book',
    cred: '官方出版机构 · 教材同步资源',
    bio: '把教材配套的例题、习题与拓展精编为可直接使用、可改编的课件与题单,与教学进度同步。',
    use: '12.4万', follow: '3.6万',
  },
  {
    kind: 'research', name: '海淀区教师进修学校 · 数学教研室', icon: 'people',
    cred: '区域教研组 · 集体备课',
    bio: '汇聚全区一线名师的集体备课成果,单元整体设计与分层作业,本区老师拿来即用、外区可改编。',
    use: '6.8万', follow: '2.1万',
  },
  {
    kind: 'school', name: '北京十一学校 · 学科课程基地', icon: 'school',
    cred: '名校 · 校本课程',
    bio: '把学校走班制下沉淀的项目式课程与跨学科课例开放出来,供更多学校参考与改编落地。',
    use: '5.5万', follow: '1.9万',
  },
  {
    kind: 'studio', name: '王崧舟 · 诗意语文工作室', icon: 'studio',
    cred: '名师工作室 · 团队共创',
    bio: '主持人带团队共创的整本书阅读与经典课文课例,一课多讲,持续迭代,徒弟们各有代表作。',
    use: '7.3万', follow: '9.4万',
  },
]
