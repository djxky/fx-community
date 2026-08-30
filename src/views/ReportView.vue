<script setup>
import raw from './raw/report.html?raw'
</script>

<template>
  <div id="view-report">
    <div style="display:contents" v-html="raw"></div>
  </div>
</template>
