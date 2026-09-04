const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const courseRadioId = (course) => `lp-course-${course.id}`
const coursePageId = (course) => `LP-course-${course.id}`
const filterId = (filter) => `course-type-${filter.key}`
const libraryVisibleLimit = 6

const submissionCtaCopy = {
  actionTitle: '看完动手做一个，提交你的作品',
  actionDescription: '完成并提交即可参加案例征集：30 积分 · 电子结业证 · 社区展示',
  actionLabel: '提交作品',
}

export function activateRadioLabelFromKeyboard(event, ownerDocument = globalThis.document) {
  if (event.key !== 'Enter' && event.key !== ' ') return false
  const label = event.target?.closest?.('label[for]')
  const targetId = label?.getAttribute?.('for')
  const radio = targetId ? ownerDocument?.getElementById?.(targetId) : null
  if (radio?.type !== 'radio') return false

  event.preventDefault()
  radio.click()
  return true
}

function labelsByKey(filters) {
  return Object.fromEntries(filters.map((filter) => [filter.key, filter.label]))
}

function renderRadios(courses) {
  return courses
    .map((course) => `<input type="radio" name="lp" id="${courseRadioId(course)}" class="lp-radio">`)
    .join('\n')
}


function renderLibrary(courses, useFilters, typeFilters, coverUrls) {
  const rowInputs = (filters, group) => filters.map((filter, index) => (
    `<input type="radio" name="${group}" id="${group}-${filter.key}" class="chip-radio"${index === 0 ? ' checked' : ''}>`
  )).join('\n')
  const rowLabels = (filters, group) => filters.map((filter) => (
    `<label class="chip" for="${group}-${filter.key}" tabindex="0" role="button">${escapeHtml(filter.label)}</label>`
  )).join('\n')

  const typeLabels = labelsByKey(typeFilters)
  const typeKeys = new Set(typeFilters.map((filter) => filter.key))
  const cards = courses.map((course) => {
    const coverUrl = coverUrls[course.coverFile]
    const categoryClasses = course.categories.map((key) => `cat-${key}`).join(' ')
    const categoryTags = course.categories
      .filter((key) => typeKeys.has(key) && key !== 'all')
      .slice(0, 2)
      .map((key) => `<span>${escapeHtml(typeLabels[key])}</span>`)
      .join('')
    return `<label class="lcard course-card ${categoryClasses}" for="${courseRadioId(course)}" tabindex="0" role="button" aria-label="查看课程：${escapeHtml(course.title)}">
      <div class="lthumb course-cover" style="background-image:url('${escapeHtml(coverUrl)}')">
        <span class="dur">${escapeHtml(course.duration)}</span><span class="p" aria-hidden="true">▶</span>
      </div>
      <div class="lbody"><h4>${escapeHtml(course.title)}</h4><div class="lc-by">${escapeHtml(course.teacher)}</div><div class="course-tags">${categoryTags}</div></div>
    </label>`
  }).join('\n')

  return `<div class="course-library">
    ${rowInputs(useFilters, 'course-use')}
    ${rowInputs(typeFilters, 'course-type')}
    <div class="lib-filter lib-filter-use"><span class="lf-label">用途</span>${rowLabels(useFilters, 'course-use')}</div>
    <div class="lib-filter lib-filter-type"><span class="lf-label">类型</span>${rowLabels(typeFilters, 'course-type')}</div>
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

function renderDetails(courses, useFilters, typeFilters, coverUrls) {
  const typeKeys = new Set(typeFilters.map((filter) => filter.key))
  const useKeys = new Set(useFilters.map((filter) => filter.key))
  const labels = { ...labelsByKey(useFilters), ...labelsByKey(typeFilters) }
  return courses.map((course) => {
    const coverUrl = coverUrls[course.coverFile]
    const [teacherName, teacherSchool] = String(course.teacher).split('｜').map((s) => s.trim())
    const typeText = course.categories.filter((key) => key !== 'all' && typeKeys.has(key)).map((key) => labels[key]).join(' · ')
    const useText = course.categories.filter((key) => key !== 'all' && useKeys.has(key)).map((key) => labels[key]).join(' · ')
    const facts = (useText || typeText) ? `<div class="lp-facts">${useText ? `<span class="lp-fact"><b>适用范围</b>${escapeHtml(useText)}</span>` : ''}${typeText ? `<span class="lp-fact"><b>分类</b>${escapeHtml(typeText)}</span>` : ''}</div>` : ''
    const goals = course.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('')
    const related = relatedCoursesFor(course, courses).map((relatedCourse) => (
      `<label class="pl-item" for="${courseRadioId(relatedCourse)}" tabindex="0" role="button">
        <span class="pl-thumb" style="background-image:url('${escapeHtml(coverUrls[relatedCourse.coverFile])}')"><span class="pl-dur">${escapeHtml(relatedCourse.duration)}</span></span>
        <span class="pl-t">${escapeHtml(relatedCourse.title)}</span>
      </label>`
    )).join('')

    return `<div class="lesson-page course-lesson-page" id="${coursePageId(course)}">
      <label class="lp-back lp-video-back" for="lp-home" tabindex="0" role="button" aria-label="返回 AI 教学工坊"><svg class="lp-back-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="m16 7-7 7 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>返回</span></label>
      <div class="lp-video"><video controls preload="metadata" poster="${escapeHtml(coverUrl)}" src="${escapeHtml(course.videoUrl)}"></video></div>
      <div class="lp-cols">
        <div class="lp-main">
          <h1 class="lp-title">${escapeHtml(course.title)}</h1>
          <div class="lp-by"><div><div class="lp-by-n">${escapeHtml(teacherName)}</div>${teacherSchool ? `<div class="lp-by-s">${escapeHtml(teacherSchool)}</div>` : ''}</div></div>
          ${facts}
          <div class="lp-goals"><div class="lp-label">课程目标</div><ul>${goals}</ul></div>
        </div>
        <aside class="lp-side"><div class="pl-head">更多课程</div><div class="pl-list">${related}</div></aside>
      </div>
    </div>`
  }).join('\n')
}

function renderVisibilityCss(courses, useFilters, typeFilters) {
  const coursePages = courses
    .map((course) => `#view-academy #${courseRadioId(course)}:checked ~ #${coursePageId(course)}`)
    .join(',\n')
  const activeChip = (group, key) => `#view-academy #${group}-${key}:checked ~ .lib-filter label[for="${group}-${key}"]{color:var(--ink);font-weight:500}`
  const dimRules = (filters, group) => filters.map((filter) => {
    if (filter.key === 'all') return activeChip(group, 'all')
    return `#view-academy #${group}-${filter.key}:checked ~ .lgrid .course-card:not(.cat-${filter.key}){display:none}
${activeChip(group, filter.key)}`
  }).join('\n')
  return `${coursePages}{display:block}
${dimRules(useFilters, 'course-use')}
${dimRules(typeFilters, 'course-type')}
#view-academy .academy-submission-modal[hidden]{display:none}`
}

export function renderAcademyCourseUi({ courses, useFilters, typeFilters, coverUrls }) {
  return {
    submitCta: '',
    radios: renderRadios(courses),
    library: renderLibrary(courses, useFilters, typeFilters, coverUrls),
    details: renderDetails(courses, useFilters, typeFilters, coverUrls),
    visibilityCss: renderVisibilityCss(courses, useFilters, typeFilters),
  }
}

export function composeAcademyMarkup(source, rendered) {
  return source
    .replace('<!-- ACADEMY_COURSE_VISIBILITY -->', rendered.visibilityCss)
    .replace('<!-- ACADEMY_COURSE_RADIOS -->', rendered.radios)
    .replace('<!-- ACADEMY_SUBMIT_CTA -->', rendered.submitCta)
    .replace('<!-- ACADEMY_COURSE_LIBRARY -->', rendered.library)
    .replace('<!-- ACADEMY_COURSE_DETAILS -->', rendered.details)
}
