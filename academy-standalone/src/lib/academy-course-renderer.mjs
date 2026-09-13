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


function renderLibrary(courses, useFilters, typeFilters, coverUrls, emptyStateIcon) {
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
      <div class="lthumb course-cover"><img src="${escapeHtml(coverUrl)}" alt="" loading="lazy" decoding="async">
        <span class="dur">${escapeHtml(course.duration)}</span><span class="p" aria-hidden="true">▶</span>
      </div>
      <div class="lbody"><h4>${escapeHtml(course.title)}</h4><div class="lc-by">${escapeHtml(course.teacher)}</div><div class="course-tags">${categoryTags}</div></div>
    </label>`
  }).join('\n')

  // 按验收反馈移除“用途 / 类型”标题，两行仍保留独立 class 和 radio 分组，
  // 避免纯展示调整改变筛选逻辑、选中状态或空状态判定。
  return `<div class="course-library">
    ${rowInputs(useFilters, 'course-use')}
    ${rowInputs(typeFilters, 'course-type')}
    <div class="lib-filter lib-filter-use">${rowLabels(useFilters, 'course-use')}</div>
    <div class="lib-filter lib-filter-type">${rowLabels(typeFilters, 'course-type')}</div>
    <div class="lgrid">${cards}</div>
    <div class="course-empty" hidden role="status">
      <!-- emptyStateIcon 仅接收构建期导入的本地设计资源；保留原始 path 与色值，避免运行时热链或近似重绘。 -->
      <span class="course-empty-icon" aria-hidden="true">${emptyStateIcon}</span>
      <strong>内容即将上线</strong>
      <span>敬请期待更多课程</span>
    </div>
  </div>`
}

function relatedCoursesFor(course, courses, typeKeys) {
  const courseTypeKeys = new Set(course.categories.filter((category) => typeKeys.has(category)))
  return courses.filter((candidate) => (
    candidate.id !== course.id
      && candidate.categories.some((category) => courseTypeKeys.has(category))
  ))
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
    const related = relatedCoursesFor(course, courses, typeKeys).map((relatedCourse) => (
      `<label class="pl-item" for="${courseRadioId(relatedCourse)}" tabindex="0" role="button">
        <span class="pl-thumb"><img src="${escapeHtml(coverUrls[relatedCourse.coverFile])}" alt="" loading="lazy" decoding="async"><span class="pl-dur">${escapeHtml(relatedCourse.duration)}</span></span>
        <span class="pl-t">${escapeHtml(relatedCourse.title)}</span>
      </label>`
    )).join('')

    // 动态课程详情页只更新返回入口的辅助名称，单选页签导航和课程内容保持原有行为。
    return `<div class="lesson-page course-lesson-page" id="${coursePageId(course)}">
      <label class="lp-back lp-video-back" for="lp-home" tabindex="0" role="button" aria-label="返回飞象学院"><svg class="lp-back-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="m16 7-7 7 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>返回</span></label>
      <div class="lp-video"><video controls preload="none" poster="${escapeHtml(coverUrl)}" src="${escapeHtml(course.videoUrl)}"></video></div>
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
  const activeChip = (group, key) => `#view-academy #${group}-${key}:checked ~ .lib-filter label[for="${group}-${key}"]{background:#EFEFEF;color:var(--ink);font-weight:500}`
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

// 投稿仅确认服务端接收；不承诺接口没有提供的归属检查或审核状态。
function renderSubmitCta() {
  return `<div class="academy-submission-modal" hidden role="dialog" aria-modal="true" aria-labelledby="academy-submission-title">
      <div class="academy-submission-backdrop" data-academy-submit-close></div>
      <div class="academy-submission-dialog">
        <button type="button" class="academy-submission-close" data-academy-submit-close aria-label="关闭">×</button>
        <aside class="academy-submission-aside">
          <div class="academy-submission-kicker">WORK SUBMISSION</div>
          <h3 id="academy-submission-title">提交你的课堂作品</h3>
          <p class="academy-submission-intro">把已经发布在飞象老师的作品提交上来，参加当期工作坊、获得作品反馈与证书。</p>
          <ul class="academy-submission-points">
            <li><span class="asp-i">①</span><span>提交的是<b>已发布作品的链接</b>，不是上传文件。</span></li>
            <li><span class="asp-i">②</span><span>请确认作品链接<b>已发布且可以访问</b>。</span></li>
            <li><span class="asp-i">③</span><span>审核结果与<b>证书</b>通过邮箱发放。</span></li>
          </ul>
        </aside>
        <div class="academy-submission-main">
          <form class="academy-submission-form">
            <div class="academy-submission-section">
              <div class="academy-submission-section-t">作品信息</div>
              <div class="academy-submission-grid">
                <!-- 加载状态放在工作坊字段内，失败/空列表时才出现重试，不占用表单底部。 -->
                <label class="academy-submission-wide"><span class="academy-field-label">关联工作坊 <b>*</b></span><select name="workshopId" required disabled><option value="">请选择工作坊</option></select><button type="button" class="academy-submission-cancel" data-academy-workshops-retry hidden>重新加载</button></label>
                <label class="academy-submission-wide"><span class="academy-field-label">已发布在飞象老师的作品链接 <b>*</b></span><input name="workUrl" type="url" maxlength="2048" placeholder="https://www.feixianglaoshi.com/#/chat?..." required><small>请提交飞象老师平台的 HTTPS 作品链接。</small></label>
              </div>
            </div>
            <div class="academy-submission-section">
              <div class="academy-submission-section-t">提交人信息</div>
              <div class="academy-submission-grid">
                <label><span class="academy-field-label">您所在地区 <b>*</b></span><input name="province" type="text" minlength="2" maxlength="20" placeholder="请输入省份" required></label>
                <label><span class="academy-field-label">城市 / 行政区 <b>*</b></span><input name="city" type="text" minlength="2" maxlength="20" placeholder="请输入城市或行政区" required></label>
                <label class="academy-submission-wide"><span class="academy-field-label">学校 <b>*</b></span><input name="school" type="text" minlength="2" maxlength="100" placeholder="请输入学校全称" required></label>
                <label class="academy-submission-wide"><span class="academy-field-label">教师 ID（个人防伪码） <em>选填</em></span><input name="teacherId" type="text" maxlength="100" placeholder="请输入教师 ID（个人防伪码）"></label>
              </div>
            </div>
            <div class="academy-submission-section">
              <div class="academy-submission-section-t">证书信息</div>
              <div class="academy-submission-grid">
                <label><span class="academy-field-label">证书姓名 <b>*</b></span><input name="certificateName" type="text" maxlength="50" placeholder="证书上的姓名" required></label>
                <label><span class="academy-field-label">证书发放邮箱 <b>*</b></span><input name="email" type="email" maxlength="254" placeholder="仅用于证书发放" required></label>
              </div>
            </div>
            <p class="academy-submission-error" role="status"></p>
            <!-- 复用已有深色控件配色；定位独立于表单流，不改变页面间距。 -->
            <div class="academy-submission-submit academy-submission-toast" data-academy-submission-toast role="status" hidden></div>
            <div class="academy-submission-form-actions"><button type="button" class="academy-submission-cancel" data-academy-submit-close>暂不提交</button><button type="submit" class="academy-submission-submit">提交作品</button></div>
          </form>
          <div class="academy-submission-success" hidden>
            <div class="academy-submission-success-icon">✓</div>
            <h4 id="academy-submission-success-title">作品已提交</h4>
            <p>我们会核验作品信息，并将反馈与证书发放结果发送到你的邮箱。</p>
            <!-- 成功态只提供关闭确认，不暗示会跳转页面或再次提交。 -->
            <button type="button" class="academy-submission-submit" data-academy-submit-close>我知道了</button>
          </div>
        </div>
      </div>
    </div>`
}

export function renderAcademyCourseUi({ courses, useFilters, typeFilters, coverUrls, emptyStateIcon = '' }) {
  return {
    submitCta: renderSubmitCta(),
    radios: renderRadios(courses),
    library: renderLibrary(courses, useFilters, typeFilters, coverUrls, emptyStateIcon),
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
