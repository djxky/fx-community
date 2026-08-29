<script setup>
import raw from './raw/creator.html?raw'
import Sidebar from '../components/Sidebar.vue'
</script>

<template>
  <div id="view-creator">
    <div class="page">
      <Sidebar active="" />
      <div style="display:contents" v-html="raw"></div>
    </div>
  </div>
</template>
