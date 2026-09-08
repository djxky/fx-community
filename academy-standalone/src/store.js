import { reactive } from 'vue'

// 独立教学工坊只保留侧栏展开状态；页面跳转交给宿主适配器。
export const store = reactive({
  sidebarCollapsed: false,
})
