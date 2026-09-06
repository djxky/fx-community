export function pauseAcademyVideos(root) {
  const videos = Array.from(root?.querySelectorAll?.('.lp-video video') ?? [])
  videos.forEach((video) => video.pause())
}

export function setupAcademyVideoPause(root) {
  if (!root?.addEventListener) return () => {}

  const handlePageChange = (event) => {
    if (!event.target?.matches?.('input[type="radio"][name="lp"]')) return
    pauseAcademyVideos(root)
  }

  root.addEventListener('change', handlePageChange)

  return () => {
    root.removeEventListener('change', handlePageChange)
    pauseAcademyVideos(root)
  }
}
