import videoIndex from './academy-video-index.json' with { type: 'json' }

export const academyUseFilters = [
  { key: 'all', label: '全部' },
  { key: 'guide', label: '上手指南' },
  { key: 'tips', label: '使用技巧' },
  { key: 'case', label: '学科案例' },
]

export const academyTypeFilters = [
  { key: 'all', label: '全部' },
  { key: 'animation', label: '教学动画' },
  { key: 'application', label: '教育应用' },
  { key: 'game', label: '教学游戏' },
  { key: 'courseware', label: '互动课件' },
  { key: 'assessment', label: 'AI命题' },
  { key: 'worksheet', label: 'AI组题' },
  { key: 'lessonPlan', label: 'AI教案·大单元' },
]

// 兼容旧引用（默认指资源类型这层）
export const academyFilters = academyTypeFilters

const categoryAssignments = {
  1: ['animation', 'assessment', 'worksheet', 'lessonPlan', 'guide', 'tips'],
  2: ['courseware', 'application', 'guide'],
  3: ['courseware', 'tips'],
  4: ['courseware', 'tips'],
  5: ['animation', 'game', 'courseware', 'guide'],
  6: ['animation', 'courseware', 'case'],
  7: ['courseware', 'case'],
  8: ['assessment', 'tips'],
  9: ['application', 'game', 'case'],
  10: ['lessonPlan', 'tips'],
  11: ['courseware', 'case'],
  12: ['game', 'application', 'case'],
  13: ['courseware', 'case'],
  14: ['application', 'courseware', 'case'],
  15: ['courseware', 'case'],
  16: ['courseware', 'case'],
  17: ['animation', 'case'],
  18: ['animation', 'courseware', 'case'],
  19: ['animation', 'courseware', 'case'],
  20: ['game', 'courseware', 'case'],
  21: ['game', 'case'],
  22: ['game', 'case'],
  23: ['courseware', 'case'],
}

const accountOnlyTeachers = new Set(['', 'TeacherYO', 'Q老师'])

function displayTeacher(teacher = '') {
  return accountOnlyTeachers.has(teacher.trim()) ? '飞象老师' : teacher.trim()
}

// 标题里若带「老师名｜」前缀就去掉（讲师信息在卡片下方单独展示）
function stripTeacherPrefix(title = '', teacher = '') {
  const name = teacher.split('｜')[0].trim()
  if (name && name !== '飞象老师' && title.startsWith(`${name}｜`)) {
    return title.slice(name.length + 1).trim()
  }
  return title
}

export const academyCourses = videoIndex.items
  .filter((item) => item.number <= 23)
  .map((item) => {
    const teacher = displayTeacher(item.teacher)
    return {
    id: item.number,
    title: stripTeacherPrefix(item.title, teacher),
    teacher,
    audience: item.audience,
    summary: item.lead,
    goals: item.objectives,
    duration: item.duration,
    durationSeconds: item.durationSeconds,
    videoUrl: item.videoUrl,
    coverFile: item.localCover.replace(/^封面\//, ''),
    categories: categoryAssignments[item.number],
    }
  })

export function filterAcademyCourses(courses, category) {
  if (category === 'all') return [...courses]
  return courses.filter((course) => course.categories.includes(category))
}

export function academyCategoryLabel(key) {
  return academyFilters.find((filter) => filter.key === key)?.label ?? key
}
