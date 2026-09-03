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

function renderSubmitCta() {
  return `<div class="academy-submission-modal" hidden role="dialog" aria-modal="true" aria-labelledby="academy-submission-title">
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

function renderDetails(courses, typeFilters, coverUrls) {
  const typeKeys = new Set(typeFilters.map((filter) => filter.key))
  const labels = labelsByKey(typeFilters)
  return courses.map((course) => {
    const coverUrl = coverUrls[course.coverFile]
    const teacherInitial = course.teacher === '飞象老师' ? '飞' : course.teacher.slice(0, 1)
    const categoryText = course.categories.filter((key) => typeKeys.has(key)).map((key) => labels[key]).join(' · ')
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

function renderVisibilityCss(courses, useFilters, typeFilters) {
  const coursePages = courses
    .map((course) => `#view-academy #${courseRadioId(course)}:checked ~ #${coursePageId(course)}`)
    .join(',\n')
  const activeChip = (group, key) => `#view-academy #${group}-${key}:checked ~ .lib-filter label[for="${group}-${key}"]{background:var(--ink);border-color:var(--ink);color:#fff;font-weight:600}`
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
    submitCta: renderSubmitCta(),
    radios: renderRadios(courses),
    library: renderLibrary(courses, useFilters, typeFilters, coverUrls),
    details: renderDetails(courses, typeFilters, coverUrls),
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
