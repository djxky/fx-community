export const SCENES = [
  { key: 'all', label: '全部' },
  { key: 'prep', label: '备课' },
  { key: 'classroom', label: '上课' },
  { key: 'assessment', label: '作业与评价' },
  { key: 'classcare', label: '班级管理' },
  { key: 'research', label: '教研成长' },
]

export const TASKS_BY_SCENE = {
  prep: [
    { key: 'design', label: '教学设计' },
    { key: 'materials', label: '课件素材' },
    { key: 'prep-tools', label: '备课工具' },
  ],
  classroom: [
    { key: 'explain', label: '讲解演示' },
    { key: 'interact', label: '互动探究' },
    { key: 'practice', label: '课堂练习' },
    { key: 'organize', label: '课堂组织' },
  ],
  assessment: [
    { key: 'compose', label: '出题组卷' },
    { key: 'homework', label: '作业练习' },
    { key: 'feedback', label: '批改讲评' },
    { key: 'analytics', label: '学情分析' },
  ],
  classcare: [
    { key: 'class-management', label: '班级管理' },
    { key: 'home-school', label: '家校沟通' },
    { key: 'student-growth', label: '学生成长' },
    { key: 'class-activity', label: '班会活动' },
  ],
  research: [
    { key: 'co-planning', label: '集体备课' },
    { key: 'lesson-review', label: '听课评课' },
    { key: 'showcase', label: '公开课与比赛' },
    { key: 'teacher-learning', label: '教师学习' },
  ],
}

const unique = (values) => [...new Set(values.filter(Boolean))]

export function availableScenes(posts) {
  const present = new Set(posts.map((post) => post.scene).filter(Boolean))
  return SCENES.filter((scene) => scene.key === 'all' || present.has(scene.key))
}

export function availableTasks(posts, scene) {
  if (!scene || scene === 'all') return []

  const present = new Set(
    posts
      .filter((post) => post.scene === scene)
      .map((post) => post.task)
      .filter(Boolean),
  )
  const tasks = (TASKS_BY_SCENE[scene] || []).filter((task) => present.has(task.key))
  return tasks.length ? [{ key: 'all', label: '全部' }, ...tasks] : []
}

export function filterDiscoverPosts(posts, filters = {}) {
  const matches = (actual, expected) => !expected || expected === 'all' || actual === expected

  return posts.filter((post) => (
    matches(post.scene, filters.scene)
    && matches(post.task, filters.task)
    && matches(post.subject, filters.subject)
    && matches(post.stage, filters.stage)
    && matches(post.form, filters.form)
  ))
}

export function availableFacetOptions(posts, scene = 'all', task = 'all') {
  const scopedPosts = filterDiscoverPosts(posts, { scene, task })
  return {
    subjects: unique(scopedPosts.map((post) => post.subject)),
    stages: unique(scopedPosts.map((post) => post.stage)),
    forms: unique(scopedPosts.map((post) => post.form)),
  }
}
