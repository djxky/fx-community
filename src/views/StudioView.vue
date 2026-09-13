<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import raw from './raw/studio.html?raw'
import { store } from '../store'
import { mountStudioAlbums } from '../composables/studio-albums'

const root = ref(null)
let unmountAlbums = () => {}
onMounted(() => { unmountAlbums = mountStudioAlbums(root.value) })
onBeforeUnmount(() => unmountAlbums())
</script>

<template>
  <div id="view-studio" ref="root" :class="{ owner: store.studioMode === 'owner' }">
    <div class="page">
      <div style="display:contents" v-html="raw"></div>
    </div>
  </div>
</template>
