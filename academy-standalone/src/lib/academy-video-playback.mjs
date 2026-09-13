export function pauseAcademyVideos(root) {
  const videos = Array.from(root?.querySelectorAll?.('.lp-video video') ?? [])
  videos.forEach((video) => video.pause())
}

export function setupAcademyVideoPause(root) {
  if (!root?.addEventListener) return () => {}

  // 旧回放的封面保存在列表背景图中，详情 poster 留空会导致未播放时出现黑屏。
  // 按同一导航目标复用封面，不复制另一套资源映射；已有课程 poster 不覆盖。
  root.querySelectorAll('.vcard[for]').forEach((card) => {
    const target = card.getAttribute('for')
    const page = root.querySelector(`[id="${target.replace(/^lp-/, 'LP-')}"]`)
    const video = page?.querySelector('video')
    const thumb = card.querySelector('.vthumb')
    if (!video || video.getAttribute('poster') || !thumb) return
    const image = thumb.querySelector('img')?.getAttribute('src')
    const background = root.ownerDocument.defaultView.getComputedStyle(thumb).backgroundImage
    const cover = image || background.match(/url\(["']?([^"')]+)["']?\)/)?.[1]
    if (cover) video.setAttribute('poster', cover)
  })

  // 仅进入当前详情时读取媒体元数据，使原生控件获得真实总时长。
  // 不自动播放，不为所有隐藏课程预加载；重复进入不 load，避免丢失已有播放进度。
  const prepareVideo = (target) => {
    const video = root.querySelector(`[id="${target.replace(/^lp-/, 'LP-')}"] .lp-video video`)
    if (video && video.preload === 'none') {
      video.preload = 'metadata'
      video.load()
    }
  }

  const handlePageChange = (event) => {
    if (!event.target?.matches?.('input[type="radio"][name="lp"]')) return
    pauseAcademyVideos(root)
    prepareVideo(event.target.id)
  }

  root.addEventListener('change', handlePageChange)
  const selected = root.querySelector('input[type="radio"][name="lp"]:checked')
  if (selected) prepareVideo(selected.id)

  return () => {
    root.removeEventListener('change', handlePageChange)
    pauseAcademyVideos(root)
  }
}
