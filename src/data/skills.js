import { COVERS } from './covers'
import schoolTeamPhoto from '../assets/community-editorial/teacher-collaboration.jpg'
import chenXiAvatar from '../assets/community-editorial/eleven-experts/chen-xi.jpg'
import wangKaiAvatar from '../assets/community-editorial/eleven-experts/wang-kai.jpg'
import sunNingAvatar from '../assets/community-editorial/eleven-experts/sun-ning.jpg'
import liMingAvatar from '../assets/community-editorial/eleven-experts/li-ming.jpg'

export const KNOWLEDGE_PARTNERS = [
  {
    entityType: '专家',
    entityName: '刘彭芝',
    thesis: '用有层次的问题推动学生解释、质疑并形成自己的判断。',
    featuredAbility: {
      kind: 'Agent',
      title: '课堂提问设计 Agent',
      description: '围绕教学目标生成递进问题链，让提问从检查记忆走向推动思考。',
      metrics: '6,800 人使用',
    },
    worksCount: 18,
    outcomes: [
      { title: '《祝福》人物关系探究课', creator: '林若水', resourceId: 'res-xianglin', cover: COVERS[0], uses: '4,900' },
      { title: '圆的认识·问题链设计', creator: '赵磊', resourceId: 'res-circle-q', cover: COVERS[6], uses: '3,200' },
      { title: '《背影》父子情感层次品读', creator: '陈亦', resourceId: 'res-beiying', cover: COVERS[2], uses: '1,600' },
      { title: '《祥林嫂》县中简化版', creator: '周涛', resourceId: 'res-xl-zhoutao', cover: COVERS[0], uses: '1,240' },
    ],
  },
  {
    entityType: '专家',
    entityName: '苏窈',
    thesis: '让每个学生都敢开口，在真实情境里练成会用的英语。',
    featuredAbility: {
      kind: 'Agent',
      title: '英语听说陪练 Agent',
      description: '按真实课堂情境生成分层对话，并给出发音与表达改进建议。',
      metrics: '7,200 人使用',
    },
    worksCount: 22,
    outcomes: [
      { title: '情景对话·分层陪练课', creator: '李婷', resourceId: 'res-en-dialog', cover: COVERS[1], uses: '3,100' },
      { title: '英语点单闯关游戏', creator: '郑好', resourceId: 'res-en-order', cover: COVERS[4], uses: '2,600' },
      { title: '中考名词专题互动网站', creator: '何欣', resourceId: 'res-en-noun', cover: COVERS[1], uses: '1,800' },
      { title: '音标听辨闯关课', creator: '许乐', resourceId: 'res-en-phonics', cover: COVERS[4], uses: '1,400' },
    ],
  },
  {
    entityType: '专家',
    entityName: '沈知微',
    thesis: '让数学思维看得见，分层不落下任何一个孩子。',
    featuredAbility: {
      kind: 'Skill',
      title: '分层探究设计 Skill',
      description: '把知识点转成可观察、可记录、可讨论的分层课堂探究任务。',
      metrics: '3,900 人使用',
    },
    worksCount: 15,
    outcomes: [
      { title: '轴对称·动态探究课', creator: '黄吉雁', resourceId: 'res-axis', cover: COVERS[3], uses: '2,000' },
      { title: '立体几何·生活建模', creator: '沈知微', resourceId: 'res-solid', cover: COVERS[6], uses: '1,240' },
      { title: '分数意义·分层探究单', creator: '吴敏', resourceId: 'res-frac-explore', cover: COVERS[8], uses: '940' },
      { title: '圆柱体积·天坛拆柱', creator: '李明', resourceId: 'res-cylinder', cover: COVERS[3], uses: '860' },
    ],
  },
  {
    entityType: '学校',
    entityName: '北京十一学校 · 学科课程基地',
    teamName: '十一学校教研组',
    thesis: '让课程从真实问题出发，在项目与实践中生长。',
    teamPhoto: schoolTeamPhoto,
    members: [
      { name: '陈曦', avatar: chenXiAvatar, bio: '把真实问题带进课堂，让学生在调查与协作中学习。' },
      { name: '王凯', avatar: wangKaiAvatar, bio: '关注跨学科实践，带学生用设计解决身边的问题。' },
      { name: '孙宁', avatar: sunNingAvatar, bio: '擅长把校园场景转成可观察、可分析的探究任务。' },
      { name: '李明', avatar: liMingAvatar, bio: '持续共创数学建模与空间想象类课程案例。' },
      { name: '周涛', bio: '关注整本书阅读和真实表达中的深度学习。' },
      { name: '赵倩', bio: '以实验和证据为支点，设计可持续迭代的学习活动。' },
      { name: '刘敏', bio: '连接学科、社区与生活，支持学生完成真实项目。' },
    ],
    featuredAbility: {
      kind: 'Agent',
      title: '跨学科项目设计 Agent',
      description: '从真实问题、学科目标到成果评价，协助教师搭建完整项目。',
      metrics: '5,480 人使用',
    },
    worksCount: 26,
    outcomes: [
      { title: '校园水质调查项目', creator: '陈曦', resourceId: 'res-water', cover: COVERS[5], uses: '2,130' },
      { title: '桥梁承重·工程挑战', creator: '王凯', resourceId: 'res-bridge', cover: COVERS[6], uses: '1,500' },
      { title: '校园气象站·数据探究', creator: '孙宁', resourceId: 'res-weather', cover: COVERS[7], uses: '1,100' },
      { title: '圆柱体积·天坛拆柱', creator: '李明', resourceId: 'res-cylinder2', cover: COVERS[3], uses: '860' },
    ],
  },
  {
    entityType: '教研组',
    entityName: '海淀区教师进修学校 · 数学教研室',
    teamName: '海淀数学教研室',
    thesis: '把集体备课经验沉淀成不同学情都能使用的教学支架。',
    featuredAbility: {
      kind: 'Skill',
      title: '分层作业 Skill',
      description: '依据班级学情生成基础、进阶和挑战三层任务，并保留教师调整空间。',
      metrics: '4,200 人使用',
    },
    worksCount: 20,
    outcomes: [
      { title: '六年级数学·一课三练', creator: '张伟', resourceId: 'res-layered-homework', cover: COVERS[5], uses: '2,010' },
      { title: '错因聚类·讲评任务单', creator: '王芳', resourceId: 'res-error-review', cover: COVERS[7], uses: '1,530' },
      { title: '期末复习·分层卷', creator: '刘敏', resourceId: 'res-final-review', cover: COVERS[8], uses: '980' },
      { title: '计算专项·分层练', creator: '赵倩', resourceId: 'res-calc-layered', cover: COVERS[6], uses: '830' },
    ],
  },
  {
    entityType: '出版社',
    entityName: '人民教育出版社 · 数学编辑部',
    teamName: '人教社数学编辑部',
    thesis: '把教材配套资源精编成拿来即用、可改编的课件与题单。',
    featuredAbility: {
      kind: 'Skill',
      title: '大单元结构梳理 Skill',
      description: '对齐课标、教材与学情，整理单元主线、课时关系和评价证据。',
      metrics: '4,700 人使用',
    },
    worksCount: 17,
    outcomes: [
      { title: '长方体和正方体·单元方案', creator: '陈澍', resourceId: 'res-unit-cube', cover: COVERS[6], uses: '1,900' },
      { title: '小数乘法·单元作业', creator: '周涛', resourceId: 'res-unit-dec', cover: COVERS[5], uses: '1,600' },
      { title: '分数的意义·单元统整', creator: '刘敏', resourceId: 'res-unit-frac', cover: COVERS[8], uses: '1,200' },
      { title: '位置与方向·单元统整', creator: '钱进', resourceId: 'res-unit-pos', cover: COVERS[4], uses: '900' },
    ],
  },
]

export const SKILL_CATALOG = [
  {
    id: 'res-skill-zuowen', title: '作文批改·中考版 Skill', kind: 'Skill', subject: '语文', author: '沈砚', cover: COVERS[2],
    description: '为语文老师逐句点评作文，给出照着改的示范并按中考标准估分。',
    metrics: { use: '8,900', install: '3,100' }, status: 'available', featured: true,
  },
  {
    id: 'res-skill-fenceng', title: '分层作业·三级任务 Skill', kind: 'Skill', subject: '全学科', author: '张伟', cover: COVERS[5],
    description: '按班级学情把一份作业拆成基础、进阶、挑战三层，难度与任务量老师可再调。',
    metrics: { use: '4,200', install: '1,500' }, status: 'available', featured: true,
  },
  {
    id: 'agent-questioning', title: '课堂提问设计 Agent', kind: 'Agent', subject: '全学科', author: '刘彭芝', cover: COVERS[6],
    description: '围绕一节课的目标生成层层递进的问题链，把提问从检查记忆推向推动思考。',
    metrics: { use: '6,800', install: '2,260' }, status: 'available', featured: true,
  },
  {
    id: 'res-skill-reading', title: '整本书阅读·单元方案 Skill', kind: 'Skill', subject: '语文', author: '王崧舟工作室', cover: COVERS[0],
    description: '从阅读目标到课时任务，为语文老师快速搭出可调整的整本书阅读方案。',
    metrics: { use: '5,600', install: '1,920' }, status: 'available', featured: true,
  },
  {
    id: 'skill-animation', title: '教学动画一键生成 Skill', kind: 'Skill', subject: '全学科', author: '沈知微', cover: COVERS[6],
    description: '把抽象知识点转成可交互的教学动画，拖拽即可在课堂上讲清。',
    metrics: { use: '6,300', install: '2,100' }, status: 'available', featured: true,
  },
  {
    id: 'agent-exam', title: '单元命题·双向细目 Agent', kind: 'Agent', subject: '全学科', author: '沈知微', cover: COVERS[8],
    description: '按课标知识点与能力层级，排出结构均衡、可直接印发的单元卷。',
    metrics: { use: '5,300', install: '1,720' }, status: 'available', featured: true,
  },
  {
    id: 'agent-followup', title: '课堂追问设计 Agent', kind: 'Agent', subject: '全学科', author: '刘彭芝', cover: COVERS[0],
    description: '给定课时目标，生成从理解到分析再到评价、层层递进的一组追问。',
    metrics: { use: '8,600', install: '2,640' }, status: 'available', featured: true,
  },
  {
    id: 'agent-speaking', title: '英语听说陪练 Agent', kind: 'Agent', subject: '英语', author: '苏窈', cover: COVERS[1],
    description: '按真实课堂情境生成分层对话，为英语老师提供发音与表达的改进建议。',
    metrics: { use: '7,200', install: '2,480' }, status: 'available', featured: false,
  },
  {
    id: 'res-skill-lab', title: '探究实验设计 Skill', kind: 'Skill', subject: '理科', author: '沈知微', cover: COVERS[3],
    description: '为理科老师把知识点转成可观察、可记录、可讨论的课堂探究任务。',
    metrics: { use: '3,900', install: '1,180' }, status: 'available', featured: false,
  },
  {
    id: 'agent-errors', title: '作业错因诊断 Agent', kind: 'Agent', subject: '全学科', author: '海淀数学教研室', cover: COVERS[7],
    description: '从学生答案中聚合高频错因，生成面向讲评课的诊断清单。',
    metrics: { use: '5,100', install: '1,760' }, status: 'available', featured: false,
  },
  {
    id: 'res-skill-unit', title: '大单元结构梳理 Skill', kind: 'Skill', subject: '教研', author: '人民教育出版社', cover: COVERS[8],
    description: '对齐课标、教材与学情，理出单元主线、课时关系与评价证据。',
    metrics: { use: '4,700', install: '1,640' }, status: 'available', featured: false,
  },
  {
    id: 'skill-class-activity', title: '班级活动方案 Skill', kind: 'Skill', subject: '全学科', author: '王芳', cover: COVERS[4],
    description: '帮班主任策划节日、班会、研学等活动，输出含目标与流程的方案。',
    metrics: { use: '4,100', install: '1,320' }, status: 'available', featured: false,
  },
  {
    id: 'skill-parent-meeting', title: '家长会发言稿·班主任版 Skill', kind: 'Skill', subject: '全学科', author: '苏窈', cover: COVERS[2],
    description: '为班主任一键生成家长会发言稿，涵盖开场、学情通报与家教建议。',
    metrics: { use: '3,600', install: '1,200' }, status: 'available', featured: false,
  },
  {
    id: 'agent-lesson-design', title: '教案与大单元设计 Agent', kind: 'Agent', subject: '全学科', author: '陈澍', cover: COVERS[5],
    description: '锚定核心素养，搭出从教材解析、学情研判到课时活动的完整骨架。',
    metrics: { use: '5,900', install: '1,980' }, status: 'available', featured: false,
  },
]

export const SKILL_CATEGORIES = ['全部', '语文', '数学', '英语', '理科', '教研']

export function filterSkills(skills, category = '全部', query = '', kind = '全部') {
  const keyword = query.trim().toLowerCase()
  return skills.filter((skill) => {
    const categoryMatches = category === '全部'
      || skill.subject === category
      || (category === '数学' && skill.title.includes('分层作业'))
    const queryMatches = !keyword
      || [skill.title, skill.subject, skill.author, skill.description].some((value) => value.toLowerCase().includes(keyword))
    const kindMatches = kind === '全部' || skill.kind === kind
    return categoryMatches && queryMatches && kindMatches
  })
}
