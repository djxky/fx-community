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
  },
]
