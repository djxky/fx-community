import videoIndex from './academy-video-index.json' with { type: 'json' }

export const academyFilters = [
  { key: 'all', label: '全部' },
  { key: 'animation', label: '教学动画' },
  { key: 'application', label: '教育应用' },
  { key: 'game', label: '教学游戏' },
  { key: 'courseware', label: '互动课件' },
  { key: 'assessment', label: 'AI命题' },
  { key: 'worksheet', label: 'AI组题' },
  { key: 'lessonPlan', label: 'AI教案·大单元' },
]

const categoryAssignments = {
  1: ['animation', 'assessment', 'worksheet', 'lessonPlan'],
  2: ['courseware', 'application'],
  3: ['courseware'],
  4: ['courseware'],
  5: ['animation', 'game', 'courseware'],
  6: ['animation', 'courseware'],
  7: ['courseware'],
  8: ['assessment'],
  9: ['application', 'game'],
  10: ['lessonPlan'],
  11: ['courseware'],
  12: ['game', 'application'],
  13: ['courseware'],
  14: ['application', 'courseware'],
  15: ['courseware'],
  16: ['courseware'],
  17: ['animation'],
  18: ['animation', 'courseware'],
  19: ['animation', 'courseware'],
  20: ['game', 'courseware'],
  21: ['game'],
  22: ['game'],
  23: ['courseware'],
}

const accountOnlyTeachers = new Set(['', 'TeacherYO', 'Q老师'])

function displayTeacher(teacher = '') {
  return accountOnlyTeachers.has(teacher.trim()) ? '飞象老师' : teacher.trim()
}

export const academyCourses = videoIndex.items
  .filter((item) => item.number <= 23)
  .map((item) => ({
    id: item.number,
    title: item.title,
    teacher: displayTeacher(item.teacher),
    audience: item.audience,
    summary: item.lead,
    goals: item.objectives,
    duration: item.duration,
    durationSeconds: item.durationSeconds,
    videoUrl: item.videoUrl,
    coverFile: item.localCover.replace(/^封面\//, ''),
    categories: categoryAssignments[item.number],
  }))

export function filterAcademyCourses(courses, category) {
  if (category === 'all') return [...courses]
  return courses.filter((course) => course.categories.includes(category))
}

export function academyCategoryLabel(key) {
  return academyFilters.find((filter) => filter.key === key)?.label ?? key
}
