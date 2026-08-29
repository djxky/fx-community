import { reactive } from 'vue'

// 极简路由 store —— demo 用状态路由,产物是单文件,无需 history 服务
export const store = reactive({
  view: 'discover',
  sidebarCollapsed: false,
})

export function show(v) {
  store.view = v
}
