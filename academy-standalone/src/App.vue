<script setup>
import { defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue'
import { installAcademyHostBridge } from './lib/academy-host-bridge.mjs'

const AcademyView = defineAsyncComponent(() => import('./views/AcademyView.vue'))
let cleanupBridge = () => {}

onMounted(() => {
  cleanupBridge = installAcademyHostBridge(document, window.FEIXIANG_ACADEMY_INTEGRATION)
})

onBeforeUnmount(() => cleanupBridge())
</script>

<template>
  <Suspense>
    <AcademyView />
    <template #fallback>
      <div class="academy-loading" role="status" aria-live="polite">正在加载 AI 教学工坊…</div>
    </template>
  </Suspense>
</template>
