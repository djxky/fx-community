<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import raw from './raw/academy.html?raw'
import Sidebar from '../components/Sidebar.vue'
import newSemesterCampaign from '../assets/academy/new-semester-ai-campaign.png'
import workshopCollaboration from '../assets/academy/workshop-collaboration.jpg'
import coursewarePractice from '../assets/academy/courseware-practice.jpg'
import mathVisualization from '../assets/academy/math-visualization.jpg'
import peerReview from '../assets/academy/peer-review.jpg'
import learningFeedback from '../assets/academy/learning-feedback.jpg'
import trainingDemandQr from '../assets/academy/qr-training-demand-code.png'
import teachingPartnerQr from '../assets/academy/qr-teaching-partner-code.png'
import { academyCourses, academyUseFilters, academyTypeFilters } from '../data/academy-courses.mjs'
import {
  activateRadioLabelFromKeyboard,
  composeAcademyMarkup,
  renderAcademyCourseUi,
} from '../lib/academy-course-renderer.mjs'
import { setupAcademyCarousel } from '../lib/academy-carousel.mjs'
import creationCampaign from './raw/creation-campaign.html?raw'
import creationArt from '../assets/academy/teacher-ai-creation.png'
import { setupCreationCampaign } from '../lib/creation-campaign.mjs'
import '../styles/creation-campaign.css'
import '../styles/academy-ui.css'

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
})

const renderedRaw = composeAcademyMarkup(raw, renderedCourseUi)
  .replace('<!-- ACADEMY_CREATION_CAMPAIGN -->', creationCampaign)
  .replace('__ACADEMY_TRAINING_DEMAND_QR__', trainingDemandQr)
  .replace('__ACADEMY_TEACHING_PARTNER_QR__', teachingPartnerQr)
const academyRoot = ref(null)
let cleanupAcademyCarousel = () => {}
let cleanupCreationCampaign = () => {}

onMounted(() => {
  cleanupAcademyCarousel = setupAcademyCarousel(academyRoot.value, { intervalMs: 5000 })
  cleanupCreationCampaign = setupCreationCampaign(academyRoot.value)
})

onBeforeUnmount(() => {
  cleanupAcademyCarousel()
  cleanupCreationCampaign()
})

function handleCourseNavigationKeydown(event) {
  activateRadioLabelFromKeyboard(event, event.currentTarget?.ownerDocument)
}

const academyImages = {
  '--academy-img-creation': `url(${creationArt})`,
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
      <Sidebar active="academy" />
      <div style="display:contents" @keydown="handleCourseNavigationKeydown" v-html="renderedRaw"></div>
    </div>
  </div>
</template>
