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

test('更多课程完整展示相同资源类型的系列课程，并保持课程原始顺序', async () => {
  const rendered = await renderUi()
  const firstCoursePage = rendered.details
    .split('<div class="lesson-page course-lesson-page" id="LP-course-2">')[0]
  const relatedCourseIds = [...firstCoursePage.matchAll(/class="pl-item" for="lp-course-(\d+)"/g)]
    .map((match) => Number(match[1]))

  assert.deepEqual(relatedCourseIds, [5, 6, 8, 10, 17, 18, 19])
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

test('课程筛选没有结果时提供即将上线提示', async () => {
  const rendered = await renderUi()

  assert.match(rendered.library, /class="course-empty" hidden role="status"/)
  assert.match(rendered.library, /内容即将上线/)
  assert.match(rendered.library, /敬请期待更多课程/)
})

test('两层分类的分片、课程卡和详情导航可通过键盘激活对应单选框', async () => {
  const renderer = await loadRenderer()
  const rendered = await renderUi()

  assert.match(rendered.library, /class="chip" for="course-use-guide" tabindex="0" role="button"/)
  assert.match(rendered.library, /class="chip" for="course-type-animation" tabindex="0" role="button"/)
  assert.match(rendered.library, /class="lcard course-card[^>]+tabindex="0" role="button"/)
  assert.match(rendered.details, /class="pl-item"[^>]+tabindex="0" role="button"/)
  assert.match(rendered.details, /class="lp-back(?: [^"]+)?" for="lp-home" tabindex="0" role="button"/)

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

test('首张活动 Banner 可进入教师 AI 创作征集并复用作品提交流程', () => {
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')
  const campaign = readFileSync(new URL('../src/views/raw/creation-campaign.html', import.meta.url), 'utf8')

  assert.match(raw, /id="lp-campaign" class="lp-radio"/)
  assert.match(raw, /class="hslide s1"[\s\S]*?for="lp-campaign"/)
  assert.match(raw, /#lp-campaign:checked ~ #LP-campaign\{display:block\}/)
  assert.match(raw, /class="lesson-page campaign-page" id="LP-campaign"/)
  assert.match(raw, /<!-- ACADEMY_CREATION_CAMPAIGN -->/)
  assert.match(campaign, /class="creation-campaign"/)
  assert.match(campaign, /id="cc-landingView"/)
  assert.match(campaign, /class="primary-btn chooseDirection">立即提交作品<\/button>/)
  assert.match(campaign, /id="cc-submissionForm"/)
  assert.doesNotMatch(campaign, /原型演示|示例/)
})

test('活动各子页复用左上角的单一返回入口', () => {
  const campaign = readFileSync(new URL('../src/views/raw/creation-campaign.html', import.meta.url), 'utf8')
  const controller = readFileSync(new URL('../src/lib/creation-campaign.mjs', import.meta.url), 'utf8')

  assert.equal((campaign.match(/id="cc-returnAcademy"/g) ?? []).length, 1)
  assert.match(campaign, /id="cc-backLabel">返回<\/span>/)
  assert.doesNotMatch(campaign, /class="back-link/)
  assert.match(controller, /directionView:\s*\{\s*label:\s*'返回活动详情'/)
  assert.match(controller, /formView:\s*\{\s*label:\s*'返回选择方向'/)
  assert.match(controller, /submissionsView:\s*\{\s*label:\s*'返回活动详情'/)
})

test('AI 教学工坊顶部只保留提交作品与联系我们', () => {
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')

  assert.match(raw, /<div class="ws-actions">\s*<button[^>]*>提交作品<\/button>\s*<label[^>]*for="ov-contact"[^>]*>联系我们<\/label>\s*<\/div>/)
  assert.doesNotMatch(raw, /<div class="ws-actions">[\s\S]*?>赛事专区<\/label>/)
})

test('三张 Banner 分别展示活动、完整直播入口和赛事落地页入口', () => {
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')
  const view = readFileSync(new URL('../src/views/AcademyView.vue', import.meta.url), 'utf8')
  const liveBanner = raw.match(/<div class="hslide s2">([\s\S]*?)<\/div>\s*<div class="hslide s3">/)?.[1] ?? ''

  assert.match(raw, /class="hslide s1"[\s\S]*?for="lp-campaign"/)
  assert.match(liveBanner, /近期直播/)
  assert.match(liveBanner, /新学期，AI怎么真正帮到老师？/)
  assert.match(liveBanner, /三位浙江一线教师，用真实学科案例拆解 AI 如何进入备课、课堂与评价/)
  assert.match(liveBanner, /9 月 11 日/)
  assert.match(liveBanner, /19:00–22:10/)
  assert.match(liveBanner, /for="ov-live-booking"[\s\S]*?预约直播/)
  assert.match(liveBanner, /for="lp-live"[\s\S]*?查看课程详情/)
  assert.doesNotMatch(liveBanner, /三场专题直播 · 浙江一线教师案例拆解/)
  assert.doesNotMatch(liveBanner, /href=/)
  assert.match(raw, /\.s2\{background-image:var\(--academy-img-live\)/)
  assert.match(view, /workshop-hero-board\.jpg/)
  assert.match(view, /'--academy-img-live'/)
  assert.match(raw, /class="hslide s3"[\s\S]*?for="lp-match"/)
})

test('直播 Banner 提供本地课程详情页与三个真实平台的预约弹窗', () => {
  const raw = readFileSync(new URL('../src/views/raw/academy.html', import.meta.url), 'utf8')
  const view = readFileSync(new URL('../src/views/AcademyView.vue', import.meta.url), 'utf8')
  const liveCss = readFileSync(new URL('../src/styles/academy-live-event.css', import.meta.url), 'utf8')
  const detail = raw.match(/<div class="lesson-page live-event-page" id="LP-live">([\s\S]*?)<\/div>\s*<!-- 课程整页 -->/)?.[1] ?? ''
  const booking = raw.match(/<div class="ov ov-live-booking">([\s\S]*?)<\/div>\s*<div class="ws-main">/)?.[1] ?? ''

  assert.match(raw, /id="lp-live" class="lp-radio"/)
  assert.match(raw, /#lp-live:checked ~ #LP-live\{display:block\}/)
  assert.match(detail, /返回 AI 教学工坊/)
  assert.match(detail, /class="live-detail-top"[\s\S]*?课程详情/)
  assert.match(detail, /下一场直播/)
  assert.match(detail, /三场专题，一场直播贯通/)
  assert.match(detail, /3<\/b>场专题直播[\s\S]*?3<\/b>位浙江教师[\s\S]*?3<\/b>重教学收获/)
  assert.match(detail, /19:00–20:00 · 杜梦菲[\s\S]*?从提示词到智能体：重构学科备课与教研/)
  assert.match(detail, /20:00–21:00 · 卓文莉[\s\S]*?AI如何真正进入课堂：让学生思维可见/)
  assert.match(detail, /21:00–22:10 · 汤和霖[\s\S]*?从批改到诊断：AI赋能教学评一体化/)
  assert.match(detail, /class="live-program-index"[\s\S]*?01[\s\S]*?本场聚焦[\s\S]*?稳定产出智能备课/)
  assert.match(detail, /老师能带走什么[\s\S]*?学校能获益什么/)
  assert.match(detail, /成效获益/)
  assert.match(detail, /专属权益/)
  assert.match(detail, /把一次学习，沉淀成一份可分享的成果/)
  assert.match(detail, /__ACADEMY_LIVE_CERTIFICATE__/)
  assert.match(detail, /共创导师团[\s\S]*?__ACADEMY_LIVE_MENTORS__/)
  assert.match(detail, /for="ov-live-booking"[\s\S]*?预约直播/)
  assert.match(booking, /扫码前往直播平台/)
  assert.match(booking, /微信视频号[\s\S]*?抖音[\s\S]*?小红书/)
  assert.match(booking, /__ACADEMY_LIVE_WECHAT_QR__/)
  assert.match(booking, /__ACADEMY_LIVE_DOUYIN_QR__/)
  assert.match(booking, /__ACADEMY_LIVE_XIAOHONGSHU_QR__/)
  assert.match(view, /workshop-live-poster\.jpg/)
  assert.match(view, /qr-wechat-video\.jpg/)
  assert.match(view, /qr-douyin-official\.png/)
  assert.match(view, /qr-xiaohongshu-official\.png/)
  assert.match(view, /workshop-certificate\.png/)
  assert.match(view, /workshop-mentors\.png/)
  assert.match(view, /academy-live-event\.css/)
  assert.match(liveCss, /\.live-event-page\s*\{[\s\S]*?padding:\s*18px var\(--academy-gutter\) 90px !important/)
  assert.match(liveCss, /:is\(\.live-detail-top, \.live-detail-hero, \.live-detail-body\)\s*\{[\s\S]*?width:\s*min\(1060px, 100%\)[\s\S]*?margin-inline:\s*auto/)
  assert.match(liveCss, /\.live-detail-hero\s*\{[\s\S]*?min-height:\s*430px[\s\S]*?border-radius:\s*18px/)
  assert.match(liveCss, /\.live-booking-trigger\s*\{[\s\S]*?width:\s*fit-content[\s\S]*?min-height:\s*40px[\s\S]*?padding:\s*0 16px[\s\S]*?font-size:\s*13px/)
  assert.match(liveCss, /\.live-detail-body\s*\{[\s\S]*?padding:\s*74px 0 0/)
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
  assert.match(replay, /<h2>直播回放<\/h2>/)
  assert.doesNotMatch(replay, /class="rep"| · 直播回放/)
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
  assert.match(raw, /class="hero-nav hero-prev" aria-label="上一张 Banner"/)
  assert.match(raw, /class="hero-nav hero-next" aria-label="下一张 Banner"/)
  assert.match(raw, /class="hero-controls"[\s\S]*?hero-prev[\s\S]*?class="dots"[\s\S]*?hero-next/)
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

test('Banner 左右按钮循环切换，并在每次手动切换后重新计时', async () => {
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

  let selectedIndex = 0
  const radios = [0, 1, 2].map((index) => ({
    get checked() { return selectedIndex === index },
    set checked(value) { if (value) selectedIndex = index },
  }))
  const dots = [createEventTarget(), createEventTarget(), createEventTarget()]
  const previous = createEventTarget()
  const next = createEventTarget()
  const hero = {
    ...createEventTarget(),
    querySelectorAll(selector) {
      return selector === 'input[name="hs"]' ? radios : dots
    },
    querySelector(selector) {
      if (selector === '.hero-prev') return previous
      if (selector === '.hero-next') return next
      return null
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
  let intervalStarts = 0
  const windowObject = {
    setInterval() {
      intervalStarts += 1
      return intervalStarts
    },
    clearInterval() {},
  }
  const { setupAcademyCarousel } = await loadCarousel()
  const cleanup = setupAcademyCarousel(root, { intervalMs: 5000, windowObject, documentObject })

  next.emit('click')
  assert.equal(selectedIndex, 1)
  previous.emit('click')
  assert.equal(selectedIndex, 0)
  previous.emit('click')
  assert.equal(selectedIndex, 2)
  assert.equal(intervalStarts, 4)
  cleanup()
})
