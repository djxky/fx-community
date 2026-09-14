<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import raw from './raw/studio.html?raw'
import { store } from '../store'
import { mountStudioAlbums } from '../composables/studio-albums'
import { mountStudioFollow } from '../composables/studio-follow'

const root = ref(null)
let unmountAlbums = () => {}
let unmountFollow = () => {}
onMounted(() => {
  unmountAlbums = mountStudioAlbums(root.value)
  unmountFollow = mountStudioFollow(root.value)
})
onBeforeUnmount(() => {
  unmountAlbums()
  unmountFollow()
})
</script>

<template>
  <div id="view-studio" ref="root" :class="{ owner: store.studioMode === 'owner' }">
    <div class="page">
      <div style="display:contents" v-html="raw"></div>
    </div>
  </div>
</template>
