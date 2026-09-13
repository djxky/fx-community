<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import raw from './raw/academy.html?raw'
import newSemesterCampaign from '../assets/academy/new-semester-ai-campaign.jpg'
import workshopHeroBoard from '../assets/academy/workshop-hero-board.jpg'
import replay24 from '../assets/academy/replay-24.png'
import replay25 from '../assets/academy/replay-25.png'
import replay26 from '../assets/academy/replay-26.png'
import replay27 from '../assets/academy/replay-27.png'
import replay28 from '../assets/academy/replay-28.png'
import replay29 from '../assets/academy/replay-29.png'
import replay30 from '../assets/academy/replay-30.png'
import replay31 from '../assets/academy/replay-31.png'
import replay32 from '../assets/academy/replay-32.png'
import replay33 from '../assets/academy/replay-33.png'
import replay34 from '../assets/academy/replay-34.png'
import workshopLivePoster from '../assets/academy/workshop-live-poster.jpg'
import workshopCertificate from '../assets/academy/workshop-certificate.jpg'
import workshopMentors from '../assets/academy/workshop-mentors.jpg'
import liveWechatQr from '../assets/academy/qr-wechat-video.jpg'
import liveDouyinQr from '../assets/academy/qr-douyin-official.png'
import liveXiaohongshuQr from '../assets/academy/qr-xiaohongshu-official.png'
import workshopCollaboration from '../assets/academy/workshop-collaboration.jpg'
import coursewarePractice from '../assets/academy/courseware-practice.jpg'
import mathVisualization from '../assets/academy/math-visualization.jpg'
import peerReview from '../assets/academy/peer-review.jpg'
import learningFeedback from '../assets/academy/learning-feedback.jpg'
import trainingDemandQr from '../assets/academy/qr-training-demand-code.png'
import teachingPartnerQr from '../assets/academy/qr-teaching-partner-code.png'
import courseFilterEmptyIcon from '../assets/academy/empty-states/course-filter-empty.svg?raw'
import { academyCourses, academyUseFilters, academyTypeFilters } from '../data/academy-courses.mjs'
import {
  activateRadioLabelFromKeyboard,
  composeAcademyMarkup,
  renderAcademyCourseUi,
} from '../lib/academy-course-renderer.mjs'
import { setupAcademyCarousel } from '../lib/academy-carousel.mjs'
import { setupAcademyCourseEmptyState } from '../lib/academy-course-empty-state.mjs'
import { setupAcademyVideoPause } from '../lib/academy-video-playback.mjs'
import { setupDirectionLayout } from '../lib/academy-direction-layout.mjs'
import creationCampaign from './raw/creation-campaign.html?raw'
import creationArt from '../assets/academy/teacher-ai-creation.jpg'
import { setupCreationCampaign } from '../lib/creation-campaign.mjs'
import { installAcademyHostBridge } from '../lib/academy-host-bridge.mjs'
import '../styles/creation-campaign.css'
import '../styles/academy-ui.css'
import '../styles/academy-live-event.css'

const courseCoverModules = import.meta.glob('../assets/academy/course-covers/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const courseCoverUrls = Object.fromEntries(
  Object.entries(courseCoverModules).map(([path, url]) => [path.split('/').pop(), url]),
)

const renderedCourseUi = renderAcademyCourseUi({
  courses: academyCourses,
  useFilters: academyUseFilters,
  typeFilters: academyTypeFilters,
  coverUrls: courseCoverUrls,
  // 筛选空状态使用本地设计 SVG 原文，v-html 会生成内联 <svg>，不依赖外部地址。
  emptyStateIcon: courseFilterEmptyIcon,
})

const renderedRaw = composeAcademyMarkup(raw, renderedCourseUi)
  .replace('<!-- ACADEMY_CREATION_CAMPAIGN -->', creationCampaign)
  .replace('__ACADEMY_TRAINING_DEMAND_QR__', trainingDemandQr)
  .replace('__ACADEMY_TEACHING_PARTNER_QR__', teachingPartnerQr)
  .replace('__ACADEMY_LIVE_WECHAT_QR__', liveWechatQr)
  .replace('__ACADEMY_LIVE_DOUYIN_QR__', liveDouyinQr)
  .replace('__ACADEMY_LIVE_XIAOHONGSHU_QR__', liveXiaohongshuQr)
  .replace('__ACADEMY_LIVE_CERTIFICATE__', workshopCertificate)
  .replace('__ACADEMY_LIVE_MENTORS__', workshopMentors)
const academyRoot = ref(null)
let cleanupAcademyCarousel = () => {}
let cleanupAcademyCourseEmptyState = () => {}
let cleanupAcademyVideoPause = () => {}
// 独立清理方向页宽度同步，其他活动页面的尺寸规则保持原样。
let cleanupDirectionLayout = () => {}
let cleanupCreationCampaign = () => {}
let cleanupSubmissionBridge = () => {}
let cleanupCardTitleTooltips = () => {}

const cardTitleSelector = [
  '.vbody h4',
  '.lbody h4',
  '.growth-title',
  '.pl-t',
  '.mcard .t',
  '.acard h3',
].join(',')

function setupCardTitleTooltips(root) {
  const titles = Array.from(root?.querySelectorAll(cardTitleSelector) ?? [])
  const syncTitle = (title) => {
    const isTruncated = title.scrollWidth > title.clientWidth + 1
    if (isTruncated) {
      title.title = title.textContent.trim()
      title.dataset.overflowTitle = 'true'
    } else if (title.dataset.overflowTitle === 'true') {
      title.removeAttribute('title')
      delete title.dataset.overflowTitle
    }
  }
  const syncAll = () => titles.forEach(syncTitle)
  const frame = window.requestAnimationFrame(syncAll)

  titles.forEach((title) => title.addEventListener('mouseenter', () => syncTitle(title)))
  window.addEventListener('resize', syncAll)

  return () => {
    window.cancelAnimationFrame(frame)
    window.removeEventListener('resize', syncAll)
  }
}

onMounted(() => {
  // 异步页面的 v-html 已插入后才绑定表单，避免 App 提前挂载时缓存不存在的弹窗。
  // 监听限制在本页面根节点，卸载后不保留旧表单或未完成请求的回调。
  cleanupSubmissionBridge = installAcademyHostBridge(academyRoot.value, window.FEIXIANG_ACADEMY_INTEGRATION)
  cleanupAcademyCarousel = setupAcademyCarousel(academyRoot.value, { intervalMs: 5000 })
  cleanupAcademyCourseEmptyState = setupAcademyCourseEmptyState(academyRoot.value)
  cleanupAcademyVideoPause = setupAcademyVideoPause(academyRoot.value)
  cleanupDirectionLayout = setupDirectionLayout(academyRoot.value)
  cleanupCreationCampaign = setupCreationCampaign(academyRoot.value)
  cleanupCardTitleTooltips = setupCardTitleTooltips(academyRoot.value)
})

onBeforeUnmount(() => {
  cleanupSubmissionBridge()
  cleanupAcademyCarousel()
  cleanupAcademyCourseEmptyState()
  cleanupAcademyVideoPause()
  cleanupDirectionLayout()
  cleanupCreationCampaign()
  cleanupCardTitleTooltips()
})

function handleCourseNavigationKeydown(event) {
  activateRadioLabelFromKeyboard(event, event.currentTarget?.ownerDocument)
}

const academyImages = {
  '--academy-img-creation': `url(${creationArt})`,
  '--academy-img-live': `url(${workshopHeroBoard})`,
  '--academy-img-live-poster': `url(${workshopLivePoster})`,
  '--academy-cov-24': `url(${replay24})`,
  '--academy-cov-25': `url(${replay25})`,
  '--academy-cov-26': `url(${replay26})`,
  '--academy-cov-27': `url(${replay27})`,
  '--academy-cov-28': `url(${replay28})`,
  '--academy-cov-29': `url(${replay29})`,
  '--academy-cov-30': `url(${replay30})`,
  '--academy-cov-31': `url(${replay31})`,
  '--academy-cov-32': `url(${replay32})`,
  '--academy-cov-33': `url(${replay33})`,
  '--academy-cov-34': `url(${replay34})`,
  '--academy-img-campaign': `url(${newSemesterCampaign})`,
  '--academy-img-workshop': `url(${workshopCollaboration})`,
  '--academy-img-courseware': `url(${coursewarePractice})`,
  '--academy-img-math': `url(${mathVisualization})`,
  '--academy-img-review': `url(${peerReview})`,
  '--academy-img-feedback': `url(${learningFeedback})`,
}
</script>

<template>
  <div id="view-academy" ref="academyRoot" :style="academyImages">
    <div class="page">
      <div style="display:contents" @keydown="handleCourseNavigationKeydown" v-html="renderedRaw"></div>
    </div>
  </div>
</template>
