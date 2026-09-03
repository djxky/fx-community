import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

async function loadCatalog() {
  try {
    return await import('../src/data/academy-courses.mjs')
  } catch {
    return { academyCourses: [], academyUseFilters: [], academyTypeFilters: [], academyFilters: [], filterAcademyCourses: () => [] }
  }
}

async function loadRenderer() {
  try {
    return await import('../src/lib/academy-course-renderer.mjs')
  } catch {
    return { renderAcademyCourseUi: () => ({ submitCta: '', radios: '', library: '', details: '', visibilityCss: '' }) }
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

async function loadCarousel() {
  try {
    return await import('../src/lib/academy-carousel.mjs')
  } catch {
    return { setupAcademyCarousel: () => () => {} }
  }
}

async function renderUi() {
  const { academyCourses, academyUseFilters, academyTypeFilters } = await loadCatalog()
  const { renderAcademyCourseUi } = await loadRenderer()
  const coverUrls = Object.fromEntries(academyCourses.map((course) => [course.coverFile, `/covers/${course.coverFile}`]))
  return renderAcademyCourseUi({ courses: academyCourses, useFilters: academyUseFilters, typeFilters: academyTypeFilters, coverUrls })
}

test('全部筛选返回 23 门不重复的真实课程', async () => {
  const { academyCourses, filterAcademyCourses } = await loadCatalog()
  const allCourses = filterAcademyCourses(academyCourses, 'all')

  assert.equal(allCourses.length, 23)
  assert.equal(new Set(allCourses.map((course) => course.id)).size, 23)
})

test('两层分类各自返回正确的课程数量（使用指南 + 资源类型）', async () => {
  const { academyCourses, filterAcademyCourses } = await loadCatalog()
  const expectedCounts = {
    guide: 3,
    tips: 5,
    case: 16,
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

test('一条视频可同时属于使用指南和资源类型两层，在全部中只出现一次', async () => {
  const { academyCourses, filterAcademyCourses } = await loadCatalog()
  const geometry = academyCourses.find((course) => course.id === 6)

  assert.deepEqual(geometry.categories, ['animation', 'courseware', 'case'])
  assert.equal(filterAcademyCourses(academyCourses, 'animation').some((course) => course.id === 6), true)
  assert.equal(filterAcademyCourses(academyCourses, 'courseware').some((course) => course.id === 6), true)
  assert.equal(filterAcademyCourses(academyCourses, 'case').some((course) => course.id === 6), true)
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

test('课程渲染结果提供两层筛选、可点击卡片和直播回放式详情', async () => {
  const rendered = await renderUi()

  assert.match(rendered.library, /用途/)
  assert.match(rendered.library, /类型/)
  assert.match(rendered.library, />全部<\/label>/)
  assert.equal((rendered.library.match(/class="lcard course-card/g) || []).length, 23)
  assert.equal((rendered.details.match(/class="lesson-page course-lesson-page"/g) || []).length, 23)
  assert.match(rendered.details, /课程目标/)
  assert.match(rendered.details, /掌握 AI 教学动画从生成、编辑到分享和插入 PPT 的流程/)
  assert.match(rendered.details, /poster="\/covers\/01-/)
  assert.match(rendered.details, /src="https:\/\/metis-online\.fbcontent\.cn\/metis-lectio\//)
})

test('课程内容被注入原型的筛选区、详情区和可见性样式', async () => {
  const renderer = await loadRenderer()
  const source = '<style><!-- ACADEMY_COURSE_VISIBILITY --></style><!-- ACADEMY_COURSE_RADIOS --><!-- ACADEMY_COURSE_LIBRARY --><!-- ACADEMY_SUBMIT_CTA --><!-- ACADEMY_COURSE_DETAILS -->'
  const rendered = { visibilityCss: '.visible{}', radios: '<input>', submitCta: '<aside>', library: '<section>', details: '<article>' }

  assert.equal(typeof renderer.composeAcademyMarkup, 'function')
  assert.equal(
    renderer.composeAcademyMarkup(source, rendered),
    '<style>.visible{}</style><input><section><aside><article>',
  )
})

test('合并后不再有等级分层，且保留提交作品入口与文案', async () => {
  const rendered = await renderUi()

  assert.equal((rendered.submitCta.match(/name="growth-level"/g) || []).length, 0)
  assert.equal((rendered.submitCta.match(/class="growth-panel/g) || []).length, 0)
  assert.doesNotMatch(rendered.visibilityCss, /growth-level/)
})

test('新手提交作品会提供完整的审核信息弹窗', async () => {
  const rendered = await renderUi()

  assert.match(rendered.submitCta, /class="academy-submission-modal"[^>]*hidden/)
  assert.match(rendered.submitCta, /name="province"[^>]*required/)
  assert.match(rendered.submitCta, /name="city"[^>]*required/)
  assert.match(rendered.submitCta, /value="飞象老师 AI 工作坊·开学第一课·2026 秋"[^>]*readonly/)
  assert.match(rendered.submitCta, /name="school"[^>]*required/)
  assert.match(rendered.submitCta, /name="teacherId"/)
  assert.match(rendered.submitCta, /name="workUrl"[^>]*required/)
  assert.match(rendered.submitCta, /name="email"[^>]*required/)
  assert.match(rendered.submitCta, /name="certificateName"[^>]*required/)
  assert.match(rendered.submitCta, />提交审核<\/button>/)
  assert.match(rendered.submitCta, /class="academy-submission-success" hidden/)
  assert.match(rendered.visibilityCss, /\.academy-submission-modal\[hidden\]\{display:none\}/)
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

test('两层筛选单选框与网格同级，AND 组合过滤且默认全部可见', async () => {
  const rendered = await renderUi()

  const useAll = rendered.library.indexOf('id="course-use-all"')
  const typeAll = rendered.library.indexOf('id="course-type-all"')
  const grid = rendered.library.indexOf('<div class="lgrid">')
  assert.ok(useAll > -1 && typeAll > -1 && useAll < grid && typeAll < grid)

  // 每层选中后，隐藏不匹配的卡片（两层独立 => AND 组合）
  assert.match(rendered.visibilityCss, /#course-use-guide:checked ~ \.lgrid \.course-card:not\(\.cat-guide\)\{display:none\}/)
  assert.match(rendered.visibilityCss, /#course-type-animation:checked ~ \.lgrid \.course-card:not\(\.cat-animation\)\{display:none\}/)
  // 选中项高亮
  assert.match(rendered.visibilityCss, /#course-use-guide:checked ~ \.lib-filter label\[for="course-use-guide"\]/)
  assert.match(rendered.visibilityCss, /#course-type-animation:checked ~ \.lib-filter label\[for="course-type-animation"\]/)
  // 没有旧的等级/折叠机制
  assert.doesNotMatch(rendered.visibilityCss, /fold-/)
  assert.doesNotMatch(rendered.library, /course-expand/)
})

test('两层分类的分片、课程卡和详情导航可通过键盘激活对应单选框', async () => {
  const renderer = await loadRenderer()
  const rendered = await renderUi()

  assert.match(rendered.library, /class="chip" for="course-use-guide" tabindex="0" role="button"/)
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

test('首张活动 Banner 可进入案例征集落地页并复用作品提交入口', () => {
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')

  assert.match(raw, /id="lp-campaign" class="lp-radio"/)
  assert.match(raw, /class="hslide s1"[\s\S]*?for="lp-campaign"/)
  assert.match(raw, /#lp-campaign:checked ~ #LP-campaign\{display:block\}/)
  assert.match(raw, /class="lesson-page campaign-page" id="LP-campaign"/)
  assert.match(raw, /class="lp-back" for="lp-home"[^>]*>← 返回 AI 教学工坊<\/label>/)
  assert.match(raw, /id="LP-campaign"[\s\S]*?data-academy-submit-open/)
})

test('AI 教学工坊顶部只保留提交作品与联系我们', () => {
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')

  assert.match(raw, /<div class="ws-actions">\s*<button[^>]*>提交作品<\/button>\s*<label[^>]*for="ov-contact"[^>]*>联系我们<\/label>\s*<\/div>/)
  assert.doesNotMatch(raw, /<div class="ws-actions">[\s\S]*?>赛事专区<\/label>/)
})

test('三张 Banner 分别展示活动、不可点击的直播预告和赛事落地页入口', () => {
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')
  const liveBanner = raw.match(/<div class="hslide s2">([\s\S]*?)<\/div>\s*<div class="hslide s3">/)?.[1] ?? ''

  assert.match(raw, /class="hslide s1"[\s\S]*?for="lp-campaign"/)
  assert.match(liveBanner, /直播预告 · 9\.11 20:00/)
  assert.match(liveBanner, /数学难点互动课件设计（进阶场）/)
  assert.doesNotMatch(liveBanner, /\bfor=/)
  assert.doesNotMatch(liveBanner, /role="button"/)
  assert.match(raw, /class="hslide s3"[\s\S]*?for="lp-match"/)
})

test('赛事专区由弹窗改为独立落地页', () => {
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')

  assert.match(raw, /id="lp-match" class="lp-radio"/)
  assert.match(raw, /#lp-match:checked ~ #LP-match\{display:block\}/)
  assert.match(raw, /class="lesson-page match-page" id="LP-match"/)
  assert.match(raw, /id="LP-match"[\s\S]*?获奖案例回放[\s\S]*?赛事培训 · 参赛要点[\s\S]*?提交参赛资格 · 申请辅导/)
  assert.doesNotMatch(raw, /id="ov-match"/)
})

test('直播回放区域只展示回放卡片', () => {
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')
  const replay = raw.match(/<!-- 场景 2：直播 · 回放 -->([\s\S]*?)<!-- 场景 3：按资源类型找教程 -->/)?.[1] ?? ''

  assert.doesNotMatch(replay, /直播预告/)
  assert.doesNotMatch(replay, /class="vthumb preview"/)
  assert.match(replay, /class="rep">回放/)
})

test('顶部 Banner 支持五秒自动轮播、手动切换重计时与悬停暂停', () => {
  const view = readFileSync(new URL('../src/views/AcademyView.vue', import.meta.url), 'utf8')
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')

  assert.match(view, /setupAcademyCarousel/)
  assert.match(view, /intervalMs:\s*5000/)
  assert.match(view, /onMounted\([\s\S]*?setupAcademyCarousel/)
  assert.match(view, /onBeforeUnmount\([\s\S]*?cleanupAcademyCarousel/)
  assert.match(raw, /id="hs1"[\s\S]*?id="hs2"[\s\S]*?id="hs3"/)
  assert.match(raw, /label for="hs1"[\s\S]*?label for="hs2"[\s\S]*?label for="hs3"/)
})

test('鼠标点击圆点产生的非键盘焦点不会阻止重新计时', async () => {
  const createEventTarget = () => {
    const listeners = new Map()
    return {
      addEventListener(type, listener) {
        const group = listeners.get(type) ?? new Set()
        group.add(listener)
        listeners.set(type, group)
      },
      removeEventListener(type, listener) {
        listeners.get(type)?.delete(listener)
      },
      emit(type, event = {}) {
        listeners.get(type)?.forEach((listener) => listener({ target: this, ...event }))
      },
    }
  }

  const radios = [{ checked: true }, { checked: false }, { checked: false }]
  const dots = [createEventTarget(), createEventTarget(), createEventTarget()]
  const hero = {
    ...createEventTarget(),
    querySelectorAll(selector) {
      return selector === 'input[name="hs"]' ? radios : dots
    },
    contains() {
      return false
    },
  }
  const root = {
    querySelector() {
      return hero
    },
    getClientRects() {
      return [{}]
    },
  }
  const documentObject = { ...createEventTarget(), visibilityState: 'visible' }
  let activeInterval = null
  let activeIntervalId = 0
  const windowObject = {
    setInterval(callback) {
      activeInterval = callback
      activeIntervalId += 1
      return activeIntervalId
    },
    clearInterval() {
      activeInterval = null
    },
  }
  const { setupAcademyCarousel } = await loadCarousel()
  const cleanup = setupAcademyCarousel(root, { intervalMs: 5000, windowObject, documentObject })

  dots[2].emit('click')
  hero.emit('focusin', { target: { matches: () => false } })

  assert.equal(typeof activeInterval, 'function')
  activeInterval()
  assert.equal(radios[1].checked, true)
  cleanup()
})
