<script setup>
import raw from './raw/academy.html?raw'
import Sidebar from '../components/Sidebar.vue'
import workshopCollaboration from '../assets/academy/workshop-collaboration.jpg'
import coursewarePractice from '../assets/academy/courseware-practice.jpg'
import mathVisualization from '../assets/academy/math-visualization.jpg'
import peerReview from '../assets/academy/peer-review.jpg'
import learningFeedback from '../assets/academy/learning-feedback.jpg'

const academyImages = {
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
      <div style="display:contents" v-html="raw"></div>
    </div>
  </div>
</template>
