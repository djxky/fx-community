<script setup>
import raw from './raw/studio.html?raw'
import Sidebar from '../components/Sidebar.vue'
</script>

<template>
  <div id="view-studio">
    <div class="page">
      <Sidebar active="community" />
      <div style="display:contents" v-html="raw"></div>
    </div>
  </div>
</template>
