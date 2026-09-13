<script setup>
import raw from './raw/studio.html?raw'
import { store } from '../store'
</script>

<template>
  <div id="view-studio" :class="{ owner: store.studioMode === 'owner' }">
    <div class="page">
      <div style="display:contents" v-html="raw"></div>
    </div>
  </div>
</template>
