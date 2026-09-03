<script setup>
import raw from './raw/academy.html?raw'
import Sidebar from '../components/Sidebar.vue'
import newSemesterCampaign from '../assets/academy/new-semester-ai-campaign.png'
import workshopCollaboration from '../assets/academy/workshop-collaboration.jpg'
import coursewarePractice from '../assets/academy/courseware-practice.jpg'
import mathVisualization from '../assets/academy/math-visualization.jpg'
import peerReview from '../assets/academy/peer-review.jpg'
import learningFeedback from '../assets/academy/learning-feedback.jpg'
import { academyCourses, academyUseFilters, academyTypeFilters } from '../data/academy-courses.mjs'
import {
  activateRadioLabelFromKeyboard,
  composeAcademyMarkup,
  renderAcademyCourseUi,
} from '../lib/academy-course-renderer.mjs'

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

function handleCourseNavigationKeydown(event) {
  activateRadioLabelFromKeyboard(event, event.currentTarget?.ownerDocument)
}

const academyImages = {
  '--academy-img-campaign': `url(${newSemesterCampaign})`,
  '--academy-img-workshop': `url(${workshopCollaboration})`,
  '--academy-img-courseware': `url(${coursewarePractice})`,
  '--academy-img-math': `url(${mathVisualization})`,
  '--academy-img-review': `url(${peerReview})`,
  '--academy-img-feedback': `url(${learningFeedback})`,
}
</script>

<template>
  <div id="view-academy" :style="academyImages">
    <div class="page">
      <Sidebar active="academy" />
      <div style="display:contents" @keydown="handleCourseNavigationKeydown" v-html="renderedRaw"></div>
    </div>
  </div>
</template>
