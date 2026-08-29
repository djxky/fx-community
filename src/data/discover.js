import { COVERS } from './covers'

// 灵感流卡片。第二行 = 社会证明降级链(每卡只取最强的一个信号):
// proof.type: 'expert'(名师推荐·金) | 'comment'(热评) | 'hot'(最热/飙升) | 'new'(最新) | 'voice'(作者一句话)
// verify: 'expert'(名师·金) | 'teacher'(认证教师·素色) | ''(素人)
export const POSTS = [
  {
    to: 'res', cover: COVERS[0], badge: '语文 · 剧本杀', live: false,
    author: '林若水', avatar: '林', role: '杭州求是小学', verify: 'teacher',
    title: '我把《祝福》上成了一场庭审——学生为"祥林嫂到底是谁害死的"吵到下课都不肯走',
    proof: { type: 'expert', by: '刘彭芝' },
    meta: '初中语文 · 九年级 · 统编版', verified: true,
    evi: { use: '1,240', adapt: '76' }, views: '2.6万',
  },
  {
    to: 'res', cover: COVERS[1], badge: '英语 · 听说', live: true, watching: '1,540',
    author: '苏窈', avatar: '苏', role: '广州 · 英语特级', verify: 'expert',
    title: '英语课没人敢开口?特级老师正在直播:一节听说课,现场让全班张嘴',
    proof: null,
    meta: '初中英语 · 听说课', verified: false,
    evi: { use: '3.2万', adapt: '210' }, views: '',
  },
  {
    to: 'skill', cover: COVERS[2], badge: '技能 · Skill', live: false,
    author: '沈砚', avatar: '沈', role: '杭州文澜中学', verify: 'teacher',
    title: '改一个班的作文要熬到半夜?我把这套批改法沉淀成了 skill——逐句点评、给改法示范',
    proof: { type: 'comment', text: '批改从两小时压到二十分钟' },
    meta: '初中语文 · 作文批改 · AI Skill', verified: false,
    evi: { use: '526', adapt: '38' }, views: '8,900',
  },
  {
    to: 'res', cover: COVERS[3], badge: '数学 · 互动课件', live: false,
    author: '李明', avatar: '李', role: '北京十一学校', verify: 'teacher',
    title: '圆柱体积讲了三年,学生还是背公式。这次让他们在天坛上"拆"柱子,公式自己长出来',
    proof: { type: 'hot', text: '本周最热' },
    meta: '小学数学 · 六年级 · 人教版', verified: true,
    evi: { use: '986', adapt: '54' }, views: '1.2万',
  },
  {
    to: 'res', cover: COVERS[4], badge: '英语 · 教学游戏', live: false,
    author: '陈红', avatar: '陈', role: '广州执信中学', verify: 'teacher',
    title: '英语课没人敢开口。我上了个"点餐"小游戏,结果全班抢着跟 AI 服务员对话',
    proof: { type: 'comment', text: '全班抢着开口,课堂救星' },
    meta: '初中英语 · 口语 · 游戏化', verified: false,
    evi: { use: '1,530', adapt: '92' }, views: '1.5万',
  },
  {
    to: 'skill', cover: COVERS[5], badge: '技能 · Skill', live: false,
    author: '张伟', avatar: '张', role: '华东师大二附中', verify: 'teacher',
    title: '同一份作业要按 ABC 分三套,出到崩溃?一个 skill 按学情自动分层',
    proof: null,
    meta: '分层作业 · 全学科 · AI Skill', verified: false,
    evi: { use: '405', adapt: '29' }, views: '6,400',
  },
  {
    to: 'res', cover: COVERS[6], badge: '数学 · 游戏化', live: false,
    author: '小叶老师', avatar: '叶', role: '深圳南山小学', verify: '',
    title: '口算太枯燥没人练,我做了个挖金矿游戏——下课铃响了还有一堆娃赖着不走',
    proof: { type: 'hot', text: '使用飙升 +134%' },
    meta: '小学数学 · 口算 · 游戏化', verified: false,
    evi: { use: '902', adapt: '61' }, views: '9,800',
  },
  {
    to: 'res', cover: COVERS[8], badge: '英语 · 精读', live: false,
    author: '刘洋', avatar: '刘', role: '上海外国语大学附中', verify: 'teacher',
    title: '说明文的"摘要"讲八百遍也写不好。让学生给课文自己写一段 Abstract',
    proof: null,
    meta: '高中英语 · 精读 · 学术写作', verified: false,
    evi: { use: '860', adapt: '43' }, views: '7,200',
  },
  {
    to: 'res', cover: COVERS[7], badge: '信息科技 · AI 应用', live: false,
    author: '张伟', avatar: '张', role: '华东师大二附中', verify: 'teacher',
    title: '让高中生自己训练一个 AI 去数走廊里的人——信息课头一回这么吵',
    proof: { type: 'expert', by: '郭承宇' },
    meta: '高中信息科技 · AI 项目', verified: true,
    evi: { use: '512', adapt: '30' }, views: '5,100',
  },
]
