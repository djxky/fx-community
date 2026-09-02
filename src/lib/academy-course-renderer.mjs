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

const growthLevels = [
  {
    key: 'a',
    className: 'lv1',
    name: '新手入门',
    description: '第一次用 AI 上课',
    courseIds: [1, 2, 3, 4],
    actionTitle: '看完动手做一个，提交你的作品',
    actionDescription: '完成并提交即可参加案例征集：30 积分 · 电子结业证 · 社区展示',
    actionLabel: '提交作品',
    actionType: 'submit',
  },
  {
    key: 'b',
    className: 'lv2',
    name: '进阶提升',
    description: '已上手，想深入',
    courseIds: [5, 6, 7, 13],
    actionTitle: '选择一个学科难点，做成可操作的互动课堂',
    actionDescription: '综合运用动画、3D 与互动课件完成课堂改造',
    actionLabel: '开始进阶',
  },
  {
    key: 'c',
    className: 'lv3',
    name: '高级',
    description: '资深老师，追求更高水平',
    courseIds: [8, 10, 14, 16],
    actionTitle: '把成熟课堂方案沉淀成可复用的教学案例',
    actionDescription: '深入命题、大单元与综合课堂设计，形成专业成果',
    actionLabel: '挑战高级课程',
  },
]

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

function renderGrowthPath(courses, filters, coverUrls) {
  const courseById = new Map(courses.map((course) => [course.id, course]))
  const labels = labelsByKey(filters)
  const inputs = growthLevels.map((level, index) => (
    `<input type="radio" name="growth-level" id="growth-level-${level.key}" class="growth-radio"${index === 0 ? ' checked' : ''}>`
  )).join('\n')
  const tabs = growthLevels.map((level) => (
    `<label class="tab ${level.className}" for="growth-level-${level.key}" tabindex="0" role="button"><span class="lvl" aria-hidden="true"><i></i><i></i><i></i></span><span><span class="nm">${escapeHtml(level.name)}</span><span class="d">${escapeHtml(level.description)}</span></span></label>`
  )).join('\n')
  const panels = growthLevels.map((level) => {
    const levelCourses = level.courseIds.map((courseId) => courseById.get(courseId)).filter(Boolean)
    const cards = levelCourses.map((course, index) => {
      const categoryText = course.categories.slice(0, 2).map((key) => labels[key]).join(' · ')
      return `<label class="vcard vlink growth-course" for="${courseRadioId(course)}" tabindex="0" role="button" aria-label="查看课程：${escapeHtml(course.title)}">
        <span class="vthumb growth-cover" style="background-image:url('${escapeHtml(coverUrls[course.coverFile])}')"><span class="idx">${String(index + 1).padStart(2, '0')}</span><span class="dur">${escapeHtml(course.duration)}</span><span class="p" aria-hidden="true">▶</span></span>
        <span class="vbody"><span class="growth-title">${escapeHtml(course.title)}</span><span class="meta">${escapeHtml(categoryText)}</span></span>
      </label>`
    }).join('\n')
    const firstCourse = levelCourses[0]
    const actionControl = level.actionType === 'submit'
      ? `<button type="button" class="st-btn" data-academy-submit-open>${escapeHtml(level.actionLabel)}</button>`
      : `<label class="st-btn" for="${courseRadioId(firstCourse)}" tabindex="0" role="button">${escapeHtml(level.actionLabel)}</label>`
    return `<div class="growth-panel growth-panel-${level.key}" id="growth-panel-${level.key}">
      <div class="grid4">${cards}</div>
      <div class="submit-strip"><div class="st-ic" aria-hidden="true">↑</div><div><div class="st-t">${escapeHtml(level.actionTitle)}</div><div class="st-d">${escapeHtml(level.actionDescription)}</div></div>${actionControl}</div>
    </div>`
  }).join('\n')

  return `<div class="growth-path">
    ${inputs}
    <div class="who">${tabs}</div>
    <div class="growth-panels">${panels}</div>
    <div class="academy-submission-modal" hidden role="dialog" aria-modal="true" aria-labelledby="academy-submission-title">
      <div class="academy-submission-backdrop" data-academy-submit-close></div>
      <div class="academy-submission-dialog">
        <button type="button" class="academy-submission-close" data-academy-submit-close aria-label="关闭">×</button>
        <div class="academy-submission-kicker">WORK SUBMISSION</div>
        <h3 id="academy-submission-title">提交你的课堂作品</h3>
        <p class="academy-submission-intro">完成对应课程并提交作品后，我们会进行作品反馈与记录。</p>
        <form class="academy-submission-form">
          <div class="academy-submission-grid">
            <label><span class="academy-field-label">您所在地区 <b>*</b></span><select name="province" required><option value="">请选择省份</option><option>北京市</option><option>上海市</option><option>广东省</option><option>浙江省</option><option>江苏省</option><option>山东省</option><option>四川省</option><option>湖北省</option><option>湖南省</option><option>其他</option></select></label>
            <label><span class="academy-field-label">城市 / 行政区 <b>*</b></span><input name="city" type="text" placeholder="请输入城市或行政区" required></label>
            <label class="academy-submission-wide"><span class="academy-field-label">关联工作坊 <b>*</b></span><input name="workshop" value="飞象老师 AI 工作坊·开学第一课·2026 秋" readonly></label>
            <label class="academy-submission-wide"><span class="academy-field-label">学校 <b>*</b></span><input name="school" type="text" placeholder="请输入学校全称" required></label>
            <label class="academy-submission-wide"><span class="academy-field-label">教师 ID（个人防伪码） <em>选填</em></span><input name="teacherId" type="text" placeholder="请输入教师 ID（个人防伪码）"></label>
            <label class="academy-submission-wide"><span class="academy-field-label">已发布在飞象老师的作品链接 <b>*</b></span><input name="workUrl" type="url" placeholder="https://www.feixianglaoshi.com/#/chat?..." required><small>仅支持当前登录账号发布的飞象老师作品，提交时将自动校验归属。</small></label>
            <label class="academy-submission-wide"><span class="academy-field-label">证书发放邮箱 <b>*</b></span><input name="email" type="email" placeholder="仅用于证书发放" required></label>
            <label class="academy-submission-wide"><span class="academy-field-label">证书姓名 <b>*</b></span><input name="certificateName" type="text" placeholder="证书上的姓名" required></label>
          </div>
          <div class="academy-submission-form-actions"><button type="button" class="academy-submission-cancel" data-academy-submit-close>暂不提交</button><button type="submit" class="academy-submission-submit">提交审核</button></div>
        </form>
        <div class="academy-submission-success" hidden>
          <div class="academy-submission-success-icon">✓</div>
          <h4>作品已提交审核</h4>
          <p>我们会核验作品信息，并将反馈与证书发放结果发送到你的邮箱。</p>
          <button type="button" class="academy-submission-submit" data-academy-submit-close>返回课程</button>
        </div>
      </div>
    </div>
  </div>`
}

function renderLibrary(courses, filters, coverUrls) {
  const filterInputs = filters.map((filter, index) => (
    `<input type="radio" name="course-type" id="${filterId(filter)}" class="chip-radio"${index === 0 ? ' checked' : ''}>`
  )).join('\n')
  const filterLabels = filters.map((filter) => {
    return `<label class="chip" for="${filterId(filter)}" tabindex="0" role="button">${escapeHtml(filter.label)}</label>`
  }).join('\n')

  const filterCourses = (filter) => (
    filter.key === 'all'
      ? courses
      : courses.filter((course) => course.categories.includes(filter.key))
  )
  const foldableFilters = filters
    .map((filter) => ({ filter, count: filterCourses(filter).length }))
    .filter(({ count }) => count > libraryVisibleLimit)
  const filterRanks = Object.fromEntries(foldableFilters.map(({ filter }) => [filter.key, 0]))
  const expandInputs = foldableFilters.map(({ filter }) => (
    `<input type="checkbox" id="course-expand-${filter.key}" class="course-expand-toggle">`
  )).join('\n')
  const expandControls = foldableFilters.map(({ filter, count }) => (
    `<label class="exp-btn course-expand-control course-expand-control-${filter.key}" for="course-expand-${filter.key}" tabindex="0" role="button"><span class="more-t">展开全部 ${count} 个</span><span class="less-t">收起</span><span class="ch">⌄</span></label>`
  )).join('\n')

  const labels = labelsByKey(filters)
  const cards = courses.map((course) => {
    const coverUrl = coverUrls[course.coverFile]
    const categoryClasses = course.categories.map((key) => `cat-${key}`).join(' ')
    const foldClasses = foldableFilters.flatMap(({ filter }) => {
      const matches = filter.key === 'all' || course.categories.includes(filter.key)
      if (!matches) return []
      filterRanks[filter.key] += 1
      return filterRanks[filter.key] > libraryVisibleLimit ? [`fold-${filter.key}`] : []
    }).join(' ')
    const categoryTags = course.categories
      .slice(0, 2)
      .map((key) => `<span>${escapeHtml(labels[key])}</span>`)
      .join('')
    return `<label class="lcard course-card ${categoryClasses}${foldClasses ? ` ${foldClasses}` : ''}" for="${courseRadioId(course)}" tabindex="0" role="button" aria-label="查看课程：${escapeHtml(course.title)}">
      <div class="lthumb course-cover" style="background-image:url('${escapeHtml(coverUrl)}')">
        <span class="dur">${escapeHtml(course.duration)}</span><span class="p" aria-hidden="true">▶</span>
      </div>
      <div class="lbody"><h4>${escapeHtml(course.title)}</h4><div class="lc-by">${escapeHtml(course.teacher)}</div><div class="course-tags">${categoryTags}</div></div>
    </label>`
  }).join('\n')

  return `<div class="course-library">
    ${filterInputs}
    ${expandInputs}
    <div class="lib-filter">${filterLabels}</div>
    <div class="lgrid">${cards}</div>
    <div class="course-expand-controls">${expandControls}</div>
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
      `<label class="pl-item" for="${courseRadioId(relatedCourse)}" tabindex="0" role="button">
        <span class="pl-thumb" style="background-image:url('${escapeHtml(coverUrls[relatedCourse.coverFile])}')"><span class="pl-dur">${escapeHtml(relatedCourse.duration)}</span></span>
        <span class="pl-t">${escapeHtml(relatedCourse.title)}</span>
      </label>`
    )).join('')

    return `<div class="lesson-page course-lesson-page" id="${coursePageId(course)}">
      <label class="lp-back" for="lp-home" tabindex="0" role="button">← 返回 AI 教学工坊</label>
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
#view-academy #${filterId(filter)}:checked ~ .lib-filter label[for="${filterId(filter)}"]{background:var(--ink);border-color:var(--ink);color:#fff;font-weight:600}`
  }).join('\n')
  const foldRules = filters.flatMap((filter) => {
    const count = filter.key === 'all'
      ? courses.length
      : courses.filter((course) => course.categories.includes(filter.key)).length
    if (count <= libraryVisibleLimit) return []
    return [
      `#view-academy #${filterId(filter)}:checked ~ #course-expand-${filter.key}:not(:checked) ~ .lgrid .fold-${filter.key}{display:none}`,
      `#view-academy #${filterId(filter)}:checked ~ .course-expand-controls .course-expand-control-${filter.key}{display:inline-flex}`,
      `#view-academy #course-expand-${filter.key}:checked ~ .course-expand-controls label[for="course-expand-${filter.key}"] .more-t{display:none}`,
      `#view-academy #course-expand-${filter.key}:checked ~ .course-expand-controls label[for="course-expand-${filter.key}"] .less-t{display:inline}`,
      `#view-academy #course-expand-${filter.key}:checked ~ .course-expand-controls label[for="course-expand-${filter.key}"] .ch{transform:rotate(180deg)}`,
    ]
  }).join('\n')
  const growthRules = growthLevels.map((level) => (
    `#view-academy #growth-level-${level.key}:checked ~ .growth-panels .growth-panel-${level.key}{display:block}\n#view-academy #growth-level-${level.key}:checked ~ .who label[for="growth-level-${level.key}"]{background:#F1F4F2;box-shadow:inset 0 -3px 0 var(--goldsolid);color:var(--ink)}`
  )).join('\n')
  return `${coursePages}{display:block}\n#view-academy .course-expand-toggle{position:absolute;opacity:0;width:0;height:0;pointer-events:none}\n#view-academy .course-expand-control{display:none}\n${filterRules}\n${foldRules}\n${growthRules}\n#view-academy .academy-submission-modal[hidden]{display:none}`
}

export function renderAcademyCourseUi({ courses, filters, coverUrls }) {
  return {
    growthPath: renderGrowthPath(courses, filters, coverUrls),
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
    .replace('<!-- ACADEMY_GROWTH_PATH -->', rendered.growthPath)
    .replace('<!-- ACADEMY_COURSE_LIBRARY -->', rendered.library)
    .replace('<!-- ACADEMY_COURSE_DETAILS -->', rendered.details)
}
