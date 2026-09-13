<script setup>
import { defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue'
import { installActivitySession } from './lib/activity-login.mjs'

const AcademyView = defineAsyncComponent(() => import('./views/AcademyView.vue'))
let cleanupSession = () => {}

onMounted(() => {
  // 全局只监听安全的父窗口通知；表单桥接等待异步 AcademyView 真正挂载后安装。
  cleanupSession = installActivitySession()
})

onBeforeUnmount(() => {
  cleanupSession()
})
</script>

<template>
  <Suspense>
    <AcademyView />
    <template #fallback>
      <!-- 异步加载提示同步页面品牌，避免慢网速下短暂露出旧名称。 -->
      <div class="academy-loading" role="status" aria-live="polite">正在加载飞象学院…</div>
    </template>
  </Suspense>
</template>
