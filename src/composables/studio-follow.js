function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'fx-toast'
  toast.setAttribute('role', 'status')
  toast.textContent = message
  document.body.appendChild(toast)
  window.setTimeout(() => toast.remove(), 1600)
}

// 教师主页客态 · 关注 / 取消关注：「+ 关注」↔「已关注」
export function mountStudioFollow(root) {
  function onClick(e) {
    const btn = e.target.closest('.st-follow-btn')
    if (!btn || !root.contains(btn)) return
    e.stopPropagation()
    const following = btn.getAttribute('aria-pressed') !== 'true'
    btn.setAttribute('aria-pressed', String(following))
    btn.classList.toggle('is-on', following)
    btn.textContent = following ? '已关注' : '+ 关注'
    showToast(following ? '已关注' : '已取消关注')
  }

  root?.addEventListener('click', onClick)
  return () => root?.removeEventListener('click', onClick)
}
