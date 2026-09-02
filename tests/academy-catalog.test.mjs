import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'

async function loadCatalog() {
  try {
    return await import('../src/data/academy-courses.mjs')
  } catch {
    return { academyCourses: [], academyFilters: [], filterAcademyCourses: () => [] }
  }
}

async function loadRenderer() {
  try {
    return await import('../src/lib/academy-course-renderer.mjs')
  } catch {
    return { renderAcademyCourseUi: () => ({ growthPath: '', radios: '', library: '', details: '', visibilityCss: '' }) }
  }
}

async function loadSubmission() {
  try {
    return await import('../src/lib/academy-submission.mjs')
  } catch {
    return {
      handleAcademySubmissionClick: () => null,
      submitAcademyWork: () => false,
    }
  }
}

test('全部筛选返回 23 门不重复的真实课程', async () => {
  const { academyCourses, filterAcademyCourses } = await loadCatalog()
  const allCourses = filterAcademyCourses(academyCourses, 'all')

  assert.equal(allCourses.length, 23)
  assert.equal(new Set(allCourses.map((course) => course.id)).size, 23)
})

test('各分类筛选返回基于课程目标核定的课程数量', async () => {
  const { academyCourses, filterAcademyCourses } = await loadCatalog()
  const expectedCounts = {
    animation: 6,
    application: 4,
    game: 6,
    courseware: 15,
    assessment: 2,
    worksheet: 1,
    lessonPlan: 2,
  }

  for (const [category, expectedCount] of Object.entries(expectedCounts)) {
    assert.equal(filterAcademyCourses(academyCourses, category).length, expectedCount, category)
  }
})

test('跨分类课程在全部中只出现一次', async () => {
  const { academyCourses, filterAcademyCourses } = await loadCatalog()
  const geometry = academyCourses.find((course) => course.id === 6)

  assert.deepEqual(geometry.categories, ['animation', 'courseware'])
  assert.equal(filterAcademyCourses(academyCourses, 'animation').some((course) => course.id === 6), true)
  assert.equal(filterAcademyCourses(academyCourses, 'courseware').some((course) => course.id === 6), true)
  assert.equal(filterAcademyCourses(academyCourses, 'all').filter((course) => course.id === 6).length, 1)
})

test('列表优先显示详情中的真实讲师，账号名统一回退为飞象老师', async () => {
  const { academyCourses } = await loadCatalog()

  assert.equal(academyCourses.find((course) => course.id === 1).teacher, '飞象老师')
  assert.equal(academyCourses.find((course) => course.id === 3).teacher, '飞象老师')
  assert.equal(
    academyCourses.find((course) => course.id === 7).teacher,
    '林森｜浙江省宁波市鄞州区第一实验小学',
  )
})

test('每门课程都包含真实封面、视频、简介和三条课程目标', async () => {
  const { academyCourses } = await loadCatalog()

  assert.equal(academyCourses.length, 23)
  for (const course of academyCourses) {
    assert.match(course.videoUrl, /^https:\/\//, `course ${course.id} video`)
    assert.equal(course.goals.length, 3, `course ${course.id} goals`)
    assert.ok(course.summary.length >= 30, `course ${course.id} summary`)
    assert.equal(
      existsSync(new URL(`../src/assets/academy/course-covers/${course.coverFile}`, import.meta.url)),
      true,
      `course ${course.id} cover`,
    )
  }
})

test('课程渲染结果提供全部筛选、可点击卡片和直播回放式详情', async () => {
  const { academyCourses, academyFilters } = await loadCatalog()
  const { renderAcademyCourseUi } = await loadRenderer()
  const coverUrls = Object.fromEntries(academyCourses.map((course) => [course.coverFile, `/covers/${course.coverFile}`]))
  const rendered = renderAcademyCourseUi({ courses: academyCourses, filters: academyFilters, coverUrls })

  assert.match(rendered.library, />全部<\/label>/)
  assert.doesNotMatch(rendered.library, /<span class="c">/)
  assert.equal((rendered.library.match(/class="lcard course-card/g) || []).length, 23)
  assert.equal((rendered.details.match(/class="lesson-page course-lesson-page"/g) || []).length, 23)
  assert.match(rendered.details, /课程目标/)
  assert.match(rendered.details, /掌握 AI 教学动画从生成、编辑到分享和插入 PPT 的流程/)
  assert.match(rendered.details, /poster="\/covers\/01-/)
  assert.match(rendered.details, /src="https:\/\/metis-online\.fbcontent\.cn\/metis-lectio\//)
})

test('课程内容被注入原型的成长路径、筛选区、详情区和可见性样式', async () => {
  const renderer = await loadRenderer()
  const source = '<style><!-- ACADEMY_COURSE_VISIBILITY --></style><!-- ACADEMY_COURSE_RADIOS --><!-- ACADEMY_GROWTH_PATH --><!-- ACADEMY_COURSE_LIBRARY --><!-- ACADEMY_COURSE_DETAILS -->'
  const rendered = { visibilityCss: '.visible{}', radios: '<input>', growthPath: '<nav>', library: '<section>', details: '<article>' }

  assert.equal(typeof renderer.composeAcademyMarkup, 'function')
  assert.equal(
    renderer.composeAcademyMarkup(source, rendered),
    '<style>.visible{}</style><input><nav><section><article>',
  )
})

test('成长阶段会切换整组真实课程和对应行动入口', async () => {
  const { academyCourses, academyFilters } = await loadCatalog()
  const { renderAcademyCourseUi } = await loadRenderer()
  const coverUrls = Object.fromEntries(academyCourses.map((course) => [course.coverFile, `/covers/${course.coverFile}`]))
  const rendered = renderAcademyCourseUi({ courses: academyCourses, filters: academyFilters, coverUrls })

  assert.equal((rendered.growthPath.match(/name="growth-level"/g) || []).length, 3)
  assert.equal((rendered.growthPath.match(/class="growth-panel growth-panel-/g) || []).length, 3)
  assert.equal((rendered.growthPath.match(/class="vcard vlink growth-course/g) || []).length, 12)
  assert.match(rendered.growthPath, /飞象老师核心功能实操：教学动画、AI命题组题与大单元设计/)
  assert.match(rendered.growthPath, /王红蕾｜小学几何交互动画：拖拽操作理解图形关系/)
  assert.match(rendered.growthPath, /彭亚红｜AI命题实操：提示词、题型优化与好题改编/)
  assert.match(rendered.growthPath, /id="growth-level-b"[^>]*>[\s\S]*for="growth-level-b"/)
  assert.match(rendered.visibilityCss, /#growth-level-b:checked ~ \.growth-panels \.growth-panel-b\{display:block\}/)
  assert.doesNotMatch(rendered.growthPath, /新手推荐合集/)
  assert.match(rendered.growthPath, /看完动手做一个，提交你的作品/)
  assert.match(rendered.growthPath, /完成并提交即可参加案例征集：30 积分 · 电子结业证 · 社区展示/)
  assert.match(rendered.growthPath, /<button type="button" class="st-btn">提交作品<\/button>/)
})

test('新手提交作品会提供完整的审核信息弹窗', async () => {
  const { academyCourses, academyFilters } = await loadCatalog()
  const { renderAcademyCourseUi } = await loadRenderer()
  const coverUrls = Object.fromEntries(academyCourses.map((course) => [course.coverFile, `/covers/${course.coverFile}`]))
  const rendered = renderAcademyCourseUi({ courses: academyCourses, filters: academyFilters, coverUrls })

  assert.match(rendered.growthPath, /data-academy-submit-open/)
  assert.match(rendered.growthPath, /class="academy-submission-modal"[^>]*hidden/)
  assert.match(rendered.growthPath, /name="province"[^>]*required/)
  assert.match(rendered.growthPath, /name="city"[^>]*required/)
  assert.match(rendered.growthPath, /value="飞象老师 AI 工作坊·开学第一课·2026 秋"[^>]*readonly/)
  assert.match(rendered.growthPath, /name="school"[^>]*required/)
  assert.match(rendered.growthPath, /name="teacherId"/)
  assert.match(rendered.growthPath, /name="workUrl"[^>]*required/)
  assert.match(rendered.growthPath, /name="email"[^>]*required/)
  assert.match(rendered.growthPath, /name="certificateName"[^>]*required/)
  assert.match(rendered.growthPath, />提交审核<\/button>/)
  assert.match(rendered.growthPath, /class="academy-submission-success" hidden/)
})

test('提交弹窗可以打开，并在必填信息有效后切换到审核状态', async () => {
  const submission = await loadSubmission()
  const form = { hidden: true }
  const success = { hidden: false }
  const focusTarget = { focused: false, focus() { this.focused = true } }
  const modal = {
    hidden: true,
    querySelector(selector) {
      if (selector === '.academy-submission-form') return form
      if (selector === '.academy-submission-success') return success
      if (selector === 'select, input, button') return focusTarget
      return null
    },
  }
  const root = {
    querySelector(selector) {
      if (selector === '.academy-submission-modal') return modal
      if (selector === '.academy-submission-success') return success
      return null
    },
  }
  const openTarget = { closest: (selector) => selector === '[data-academy-submit-open]' ? {} : null }

  assert.equal(submission.handleAcademySubmissionClick({ target: openTarget }, root), 'open')
  assert.equal(modal.hidden, false)
  assert.equal(form.hidden, false)
  assert.equal(success.hidden, true)

  let prevented = false
  const validForm = {
    hidden: false,
    matches: (selector) => selector === '.academy-submission-form',
    checkValidity: () => true,
  }
  assert.equal(submission.submitAcademyWork({ target: validForm, preventDefault: () => { prevented = true } }, root), true)
  assert.equal(prevented, true)
  assert.equal(validForm.hidden, true)
  assert.equal(success.hidden, false)
})

test('分类单选框与课程网格保持同级，让跨分类 CSS 能显示卡片', async () => {
  const { academyCourses, academyFilters } = await loadCatalog()
  const { renderAcademyCourseUi } = await loadRenderer()
  const coverUrls = Object.fromEntries(academyCourses.map((course) => [course.coverFile, `/covers/${course.coverFile}`]))
  const rendered = renderAcademyCourseUi({ courses: academyCourses, filters: academyFilters, coverUrls })

  const allRadioPosition = rendered.library.indexOf('id="course-type-all"')
  const filterBarPosition = rendered.library.indexOf('<div class="lib-filter">')
  assert.ok(allRadioPosition > -1 && allRadioPosition < filterBarPosition)
  assert.match(rendered.visibilityCss, /#course-type-all:checked ~ \.lgrid \.course-card\{display:flex\}/)
  assert.match(rendered.visibilityCss, /#course-type-animation:checked ~ \.lib-filter label\[for="course-type-animation"\]/)
})

test('分类、课程卡和详情导航可通过键盘激活对应单选框', async () => {
  const { academyCourses, academyFilters } = await loadCatalog()
  const renderer = await loadRenderer()
  const coverUrls = Object.fromEntries(academyCourses.map((course) => [course.coverFile, `/covers/${course.coverFile}`]))
  const rendered = renderer.renderAcademyCourseUi({ courses: academyCourses, filters: academyFilters, coverUrls })

  assert.match(rendered.library, /class="chip" for="course-type-animation" tabindex="0" role="button"/)
  assert.match(rendered.library, /class="lcard course-card[^>]+tabindex="0" role="button"/)
  assert.match(rendered.details, /class="pl-item"[^>]+tabindex="0" role="button"/)
  assert.match(rendered.details, /class="lp-back" for="lp-home" tabindex="0" role="button"/)

  let clicked = 0
  const radio = { type: 'radio', click: () => { clicked += 1 } }
  const label = { getAttribute: () => 'lp-course-1' }
  let prevented = false
  const event = {
    key: 'Enter',
    target: { closest: () => label },
    preventDefault: () => { prevented = true },
  }
  const activated = renderer.activateRadioLabelFromKeyboard(event, { getElementById: () => radio })

  assert.equal(activated, true)
  assert.equal(clicked, 1)
  assert.equal(prevented, true)
})
