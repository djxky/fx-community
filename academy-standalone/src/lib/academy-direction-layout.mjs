// 方向选择、提交表单和我的投稿共用活动导航宽度，不再各自铺满页面。
// 监听导航尺寸可同时覆盖侧栏切换、窗口缩放及宿主异步注入宽度规则。
export function setupDirectionLayout(root) {
  const header = root.querySelector('.creation-campaign > .modal-header')
  const contents = root.querySelectorAll('#cc-directionView > .subview-shell, #cc-formView > .subview-shell, #cc-submissionsView > .subview-shell')
  if (!header || !contents.length) return () => {}
  const sync = () => {
    const width = header.getBoundingClientRect().width
    // 活动页隐藏时宽度为零，保留最近有效值，待页面重新显示再同步。
    // 隐藏的子页面也同步，切换时无需等待下一次尺寸事件。
    // 仅调整外壳宽度；表单底栏随父级收缩，卡片内部 padding 不变。
    if (width > 0) contents.forEach((content) => { content.style.width = `${width}px` })
  }
  const observer = new ResizeObserver(sync)
  observer.observe(header)
  sync()
  // 随页面卸载释放观察器，避免重复挂载累积回调。
  return () => observer.disconnect()
}
