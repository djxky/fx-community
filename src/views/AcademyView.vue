<script setup>
import raw from './raw/academy.html?raw'
import Sidebar from '../components/Sidebar.vue'
</script>

<template>
  <div id="view-academy">
    <div class="page">
      <Sidebar active="academy" />
      <div style="display:contents" v-html="raw"></div>
    </div>
  </div>
</template>
