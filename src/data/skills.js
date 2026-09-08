import { COVERS } from './covers'

export const SKILL_CATALOG = [
  {
    id: 'res-skill-zuowen',
    title: '作文批改 Skill',
    kind: '技能',
    subject: '语文',
    author: '沈砚',
    cover: COVERS[2],
    description: '逐句点评、给出可直接照着改的示范，并按中考标准估分。',
    metrics: { use: '8,900', install: '3,100' },
    status: 'available',
    featured: true,
  },
  {
    id: 'res-skill-fenceng',
    title: '分层作业 Skill',
    kind: '技能',
    subject: '全学科',
    author: '张伟',
    cover: COVERS[5],
    description: '根据学情把同一份作业分成不同梯度，保留老师对难度和任务的最终判断。',
    metrics: { use: '4,200', install: '1,500' },
    status: 'coming-soon',
    featured: true,
  },
  {
    id: 'res-skill-questioning', title: '课堂提问设计 Skill', kind: '技能', subject: '全学科', author: '刘彭芝', cover: COVERS[6],
    description: '围绕教学目标生成递进问题链，让提问从检查记忆走向推动思考。',
    metrics: { use: '6,800', install: '2,260' }, status: 'coming-soon', featured: true,
  },
  {
    id: 'res-skill-reading', title: '整本书阅读 Skill', kind: '技能', subject: '语文', author: '王崧舟工作室', cover: COVERS[0],
    description: '从阅读目标到课时任务，快速搭建可调整的整本书阅读方案。',
    metrics: { use: '5,600', install: '1,920' }, status: 'coming-soon', featured: true,
  },
  {
    id: 'res-skill-speaking', title: '英语听说陪练 Skill', kind: '技能', subject: '英语', author: '苏窈', cover: COVERS[1],
    description: '按真实课堂情境生成分层对话，并给出发音与表达改进建议。',
    metrics: { use: '7,200', install: '2,480' }, status: 'coming-soon', featured: false,
  },
  {
    id: 'res-skill-lab', title: '探究实验设计 Skill', kind: '技能', subject: '理科', author: '沈知微', cover: COVERS[3],
    description: '把知识点转成可观察、可记录、可讨论的课堂探究任务。',
    metrics: { use: '3,900', install: '1,180' }, status: 'coming-soon', featured: false,
  },
  {
    id: 'res-skill-errors', title: '作业错因归类 Skill', kind: '技能', subject: '全学科', author: '海淀数学教研室', cover: COVERS[7],
    description: '从学生答案中聚合高频错因，形成面向讲评课的诊断清单。',
    metrics: { use: '5,100', install: '1,760' }, status: 'coming-soon', featured: false,
  },
  {
    id: 'res-skill-unit', title: '大单元结构梳理 Skill', kind: '技能', subject: '教研', author: '人民教育出版社', cover: COVERS[8],
    description: '对齐课标、教材与学情，整理单元主线、课时关系和评价证据。',
    metrics: { use: '4,700', install: '1,640' }, status: 'coming-soon', featured: false,
  },
]

export const SKILL_CATEGORIES = ['全部', '语文', '数学', '英语', '理科', '教研']

export function filterSkills(skills, category = '全部', query = '') {
  const keyword = query.trim().toLowerCase()
  return skills.filter((skill) => {
    const categoryMatches = category === '全部'
      || skill.subject === category
      || (category === '数学' && skill.title.includes('分层作业'))
    const queryMatches = !keyword
      || [skill.title, skill.subject, skill.author, skill.description].some((value) => value.toLowerCase().includes(keyword))
    return categoryMatches && queryMatches
  })
}
