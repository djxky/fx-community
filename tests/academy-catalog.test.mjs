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
    return { renderAcademyCourseUi: () => ({ radios: '', library: '', details: '', visibilityCss: '' }) }
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

test('课程内容被注入原型的筛选区、详情区和可见性样式', async () => {
  const renderer = await loadRenderer()
  const source = '<style><!-- ACADEMY_COURSE_VISIBILITY --></style><!-- ACADEMY_COURSE_RADIOS --><!-- ACADEMY_COURSE_LIBRARY --><!-- ACADEMY_COURSE_DETAILS -->'
  const rendered = { visibilityCss: '.visible{}', radios: '<input>', library: '<section>', details: '<article>' }

  assert.equal(typeof renderer.composeAcademyMarkup, 'function')
  assert.equal(
    renderer.composeAcademyMarkup(source, rendered),
    '<style>.visible{}</style><input><section><article>',
  )
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
