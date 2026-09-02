const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const courseRadioId = (course) => `lp-course-${course.id}`
const coursePageId = (course) => `LP-course-${course.id}`
const filterId = (filter) => `course-type-${filter.key}`

function labelsByKey(filters) {
  return Object.fromEntries(filters.map((filter) => [filter.key, filter.label]))
}

function renderRadios(courses) {
  return courses
    .map((course) => `<input type="radio" name="lp" id="${courseRadioId(course)}" class="lp-radio">`)
    .join('\n')
}

function renderLibrary(courses, filters, coverUrls) {
  const filterInputs = filters.map((filter, index) => (
    `<input type="radio" name="course-type" id="${filterId(filter)}" class="chip-radio"${index === 0 ? ' checked' : ''}>`
  )).join('\n')
  const filterLabels = filters.map((filter) => {
    const count = filter.key === 'all'
      ? courses.length
      : courses.filter((course) => course.categories.includes(filter.key)).length
    return `<label class="chip" for="${filterId(filter)}">${escapeHtml(filter.label)} <span class="c">${count}</span></label>`
  }).join('\n')

  const labels = labelsByKey(filters)
  const cards = courses.map((course) => {
    const coverUrl = coverUrls[course.coverFile]
    const categoryClasses = course.categories.map((key) => `cat-${key}`).join(' ')
    const categoryTags = course.categories
      .slice(0, 2)
      .map((key) => `<span>${escapeHtml(labels[key])}</span>`)
      .join('')
    return `<label class="lcard course-card ${categoryClasses}" for="${courseRadioId(course)}" tabindex="0" aria-label="查看课程：${escapeHtml(course.title)}">
      <div class="lthumb course-cover" style="background-image:url('${escapeHtml(coverUrl)}')">
        <span class="dur">${escapeHtml(course.duration)}</span><span class="p" aria-hidden="true">▶</span>
      </div>
      <div class="lbody"><h4>${escapeHtml(course.title)}</h4><div class="lc-by">${escapeHtml(course.teacher)}</div><div class="course-tags">${categoryTags}</div></div>
    </label>`
  }).join('\n')

  return `<div class="course-library">
    ${filterInputs}
    <div class="lib-filter">${filterLabels}</div>
    <div class="lgrid">${cards}</div>
  </div>`
}

function relatedCoursesFor(course, courses) {
  const shared = courses.filter((candidate) => (
    candidate.id !== course.id
      && candidate.categories.some((category) => course.categories.includes(category))
  ))
  const fallback = courses.filter((candidate) => candidate.id !== course.id && !shared.includes(candidate))
  return [...shared, ...fallback].slice(0, 5)
}

function renderDetails(courses, filters, coverUrls) {
  const labels = labelsByKey(filters)
  return courses.map((course) => {
    const coverUrl = coverUrls[course.coverFile]
    const teacherInitial = course.teacher === '飞象老师' ? '飞' : course.teacher.slice(0, 1)
    const categoryText = course.categories.map((key) => labels[key]).join(' · ')
    const goals = course.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('')
    const related = relatedCoursesFor(course, courses).map((relatedCourse) => (
      `<label class="pl-item" for="${courseRadioId(relatedCourse)}">
        <span class="pl-thumb" style="background-image:url('${escapeHtml(coverUrls[relatedCourse.coverFile])}')"><span class="pl-dur">${escapeHtml(relatedCourse.duration)}</span></span>
        <span class="pl-t">${escapeHtml(relatedCourse.title)}</span>
      </label>`
    )).join('')

    return `<div class="lesson-page course-lesson-page" id="${coursePageId(course)}">
      <label class="lp-back" for="lp-home">← 返回 AI 工作坊</label>
      <div class="lp-video"><video controls preload="metadata" poster="${escapeHtml(coverUrl)}" src="${escapeHtml(course.videoUrl)}"></video></div>
      <div class="lp-cols">
        <div class="lp-main">
          <div class="lp-eyebrow">使用技巧攻略</div>
          <h1 class="lp-title">${escapeHtml(course.title)}</h1>
          <div class="lp-by"><span class="lp-av">${escapeHtml(teacherInitial)}</span><div><div class="lp-by-n">${escapeHtml(course.teacher)}</div></div></div>
          <div class="lp-facts"><span class="lp-fact"><b>课程分类</b>${escapeHtml(categoryText)}</span><span class="lp-fact"><b>适用范围</b>${escapeHtml(course.audience)}</span><span class="lp-fact"><b>课程时长</b>${escapeHtml(course.duration)}</span></div>
          <p class="lp-lead">${escapeHtml(course.summary)}</p>
          <div class="lp-goals"><div class="lp-label">课程目标</div><ul>${goals}</ul></div>
        </div>
        <aside class="lp-side"><div class="pl-head">更多课程</div><div class="pl-list">${related}</div></aside>
      </div>
    </div>`
  }).join('\n')
}

function renderVisibilityCss(courses, filters) {
  const coursePages = courses
    .map((course) => `#view-academy #${courseRadioId(course)}:checked ~ #${coursePageId(course)}`)
    .join(',\n')
  const filterRules = filters.map((filter) => {
    const selector = filter.key === 'all' ? '.course-card' : `.course-card.cat-${filter.key}`
    return `#view-academy #${filterId(filter)}:checked ~ .lgrid ${selector}{display:flex}
#view-academy #${filterId(filter)}:checked ~ .lib-filter label[for="${filterId(filter)}"]{background:var(--ink);border-color:var(--ink);color:#fff;font-weight:600}
#view-academy #${filterId(filter)}:checked ~ .lib-filter label[for="${filterId(filter)}"] .c{color:rgba(255,255,255,.55)}`
  }).join('\n')
  return `${coursePages}{display:block}\n${filterRules}`
}

export function renderAcademyCourseUi({ courses, filters, coverUrls }) {
  return {
    radios: renderRadios(courses),
    library: renderLibrary(courses, filters, coverUrls),
    details: renderDetails(courses, filters, coverUrls),
    visibilityCss: renderVisibilityCss(courses, filters),
  }
}

export function composeAcademyMarkup(source, rendered) {
  return source
    .replace('<!-- ACADEMY_COURSE_VISIBILITY -->', rendered.visibilityCss)
    .replace('<!-- ACADEMY_COURSE_RADIOS -->', rendered.radios)
    .replace('<!-- ACADEMY_COURSE_LIBRARY -->', rendered.library)
    .replace('<!-- ACADEMY_COURSE_DETAILS -->', rendered.details)
}
