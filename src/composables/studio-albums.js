import { reactive } from 'vue'
import { store } from '../store'
import {
  OWNER_WORKS,
  SEED_ALBUMS,
  deleteAlbum,
  isDraftDirty,
  moveAlbum,
  moveLesson,
  renderAlbumList,
  renderLessonOrder,
  renderPickGrid,
  saveAlbum,
  toggleWork,
  validateAlbumInfo,
  validateAlbumWorks,
} from '../studio-albums.mjs'

// 我的主页专题数据：教师主页与专题详情页共用，编辑 / 排序 / 删除后专题页同步
export const ownerAlbumState = reactive({
  albums: SEED_ALBUMS.map((a) => ({ ...a, workIds: [...a.workIds] })),
})

function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'fx-toast'
  toast.setAttribute('role', 'status')
  toast.textContent = message
  document.body.appendChild(toast)
  window.setTimeout(() => toast.remove(), 1600)
}

function openTopic(id) {
  store.topicId = id
  store.topicReturn = 'studio'
  store.view = 'topic'
  requestAnimationFrame(() => {
    document.querySelectorAll('#view-topic main').forEach((main) => { main.scrollTop = 0 })
  })
}

// 我的主页 · 专题管理：列表（编辑 / 上下移 / 删除 / 进专题页）、新建与编辑弹窗、确认框。
// 事件挂在 #view-studio 上并阻止冒泡，避免全局导航委托把这些点击当成进资源详情。
export function mountStudioAlbums(root) {
  const list = root?.querySelector('[data-owner-albums]')
  const modal = root?.querySelector('.album-modal')
  const confirmBox = root?.querySelector('.album-confirm')
  if (!list || !modal || !confirmBox) return () => {}

  const $ = (selector) => modal.querySelector(selector)
  let openMenuId = ''
  let draft = null
  let initial = null
  let step = 1
  let keyword = ''
  let pendingConfirm = null

  const isEditing = () => ownerAlbumState.albums.some((a) => a.id === draft.id)

  function renderList() {
    list.innerHTML = renderAlbumList(ownerAlbumState.albums, openMenuId)
    root.querySelectorAll('[data-album-count]').forEach((el) => { el.textContent = ownerAlbumState.albums.length })
  }

  function renderPicks() {
    $('[data-album-picks]').innerHTML = renderPickGrid(OWNER_WORKS, draft.workIds, keyword)
  }

  function renderModal() {
    const editing = isEditing()
    $('.album-title').textContent = editing ? '编辑专题' : '新建专题'
    $('.album-modal-submit').textContent = editing ? '保存修改' : '创建专题'
    modal.querySelectorAll('.album-step').forEach((s) => { s.style.display = s.dataset.step === String(step) ? '' : 'none' })
    modal.querySelectorAll('.album-stepdot').forEach((d) => d.classList.toggle('on', d.dataset.sd === String(step)))
    $('.album-prev').style.display = step === 2 ? '' : 'none'
    $('.album-next').style.display = step === 1 ? '' : 'none'
    $('.album-modal-submit').style.display = step === 2 ? '' : 'none'
    $('.album-next').classList.toggle('is-disabled', !draft.name.trim())
    $('.album-modal-submit').classList.toggle('is-disabled', !draft.workIds.length)
    $('.album-count b').textContent = draft.workIds.length
    renderPicks()
    $('[data-album-order]').innerHTML = renderLessonOrder(draft.workIds)
  }

  function setError(message) {
    const el = $('.album-err')
    el.textContent = message
    el.hidden = !message
  }

  function openModal(album) {
    draft = album
      ? { ...album, workIds: [...album.workIds] }
      : { id: `album-${Date.now()}`, name: '', intro: '', workIds: [] }
    initial = { ...draft, workIds: [...draft.workIds] }
    step = 1
    keyword = ''
    $('.album-name').value = draft.name
    $('.album-intro').value = draft.intro
    $('.album-search-in').value = ''
    setError('')
    renderModal()
    modal.style.display = 'flex'
    $('.album-name').focus()
  }

  function closeModal() {
    modal.style.display = 'none'
    draft = null
  }

  function askConfirm({ title, sub, ok, danger = false, onOk }) {
    confirmBox.querySelector('.album-confirm-t').textContent = title
    confirmBox.querySelector('.album-confirm-s').textContent = sub
    const okBtn = confirmBox.querySelector('.album-confirm-ok')
    okBtn.textContent = ok
    okBtn.classList.toggle('is-danger', danger)
    pendingConfirm = onOk
    confirmBox.style.display = 'flex'
  }

  function closeConfirm() {
    confirmBox.style.display = 'none'
    pendingConfirm = null
  }

  function requestCloseModal() {
    if (!isDraftDirty(draft, initial)) return closeModal()
    const editing = isEditing()
    askConfirm({
      title: editing ? '放弃修改？' : '放弃新建专题？',
      sub: editing ? '修改的内容不会保存。' : '已填内容不会保存。',
      ok: '放弃',
      onOk: closeModal,
    })
  }

  function handleAlbumAction(action, id) {
    const album = ownerAlbumState.albums.find((a) => a.id === id)
    if (!album) return
    if (action === 'menu') {
      openMenuId = openMenuId === id ? '' : id
      renderList()
      return
    }
    openMenuId = ''
    if (action === 'up' || action === 'down') {
      ownerAlbumState.albums = moveAlbum(ownerAlbumState.albums, id, action === 'up' ? -1 : 1)
    }
    renderList()
    if (action === 'edit') openModal(album)
    if (action === 'delete') {
      askConfirm({
        title: `删除专题「${album.name}」？`,
        sub: '专题里的作品不会被删除，只是不再成组展示在主页上。',
        ok: '删除',
        danger: true,
        onOk: () => {
          ownerAlbumState.albums = deleteAlbum(ownerAlbumState.albums, id)
          renderList()
          showToast('专题已删除')
        },
      })
    }
  }

  function handleModalClick(target) {
    if (target === modal || target.closest('.album-modal-close, .album-modal-cancel')) return requestCloseModal()
    if (target.closest('.album-next')) {
      const error = validateAlbumInfo(ownerAlbumState.albums, draft)
      setError(error)
      if (!error) { step = 2; renderModal() }
      return
    }
    if (target.closest('.album-prev')) {
      step = 1
      setError('')
      renderModal()
      return
    }
    const pick = target.closest('.album-wk[data-work-id]')
    if (pick) {
      draft.workIds = toggleWork(draft.workIds, pick.dataset.workId)
      setError('')
      renderModal()
      return
    }
    const lessonBtn = target.closest('[data-lesson-act]')
    if (lessonBtn) {
      const id = lessonBtn.closest('[data-work-id]').dataset.workId
      const action = lessonBtn.dataset.lessonAct
      draft.workIds = action === 'remove'
        ? draft.workIds.filter((x) => x !== id)
        : moveLesson(draft.workIds, id, action === 'up' ? -1 : 1)
      renderModal()
      return
    }
    if (target.closest('.album-modal-submit')) {
      const error = validateAlbumWorks(draft)
      setError(error)
      if (error) return
      const editing = isEditing()
      ownerAlbumState.albums = saveAlbum(ownerAlbumState.albums, draft)
      closeModal()
      renderList()
      showToast(editing ? '专题已更新' : '专题已创建 · 已加入你的主页')
    }
  }

  function onClick(e) {
    const target = e.target
    if (target.closest('.album-confirm')) {
      e.stopPropagation()
      if (target.closest('.album-confirm-ok')) {
        const onOk = pendingConfirm
        closeConfirm()
        onOk?.()
      } else if (target === confirmBox || target.closest('.album-confirm-cancel')) {
        closeConfirm()
      }
      return
    }
    if (target.closest('.album-modal')) {
      e.stopPropagation()
      handleModalClick(target)
      return
    }
    if (target.closest('.st-create-album')) {
      e.stopPropagation()
      openModal(null)
      return
    }
    const actionEl = target.closest('[data-album-act]')
    if (actionEl) {
      e.stopPropagation()
      handleAlbumAction(actionEl.dataset.albumAct, actionEl.closest('[data-album-id]').dataset.albumId)
      return
    }
    if (openMenuId) {
      // 菜单打开时点任意处只收起菜单，不进专题页
      e.stopPropagation()
      openMenuId = ''
      renderList()
      return
    }
    const topicCard = target.closest('.st-album[data-album-id], [data-topic-id]')
    if (topicCard) {
      e.stopPropagation()
      openTopic(topicCard.dataset.albumId || topicCard.dataset.topicId)
    }
  }

  function onInput(e) {
    if (!draft) return
    const target = e.target
    if (target.classList.contains('album-name')) {
      draft.name = target.value
      setError('')
      $('.album-next').classList.toggle('is-disabled', !draft.name.trim())
    } else if (target.classList.contains('album-intro')) {
      draft.intro = target.value
    } else if (target.classList.contains('album-search-in')) {
      keyword = target.value
      renderPicks()
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      if (confirmBox.style.display === 'flex') closeConfirm()
      else if (draft) requestCloseModal()
      else if (openMenuId) { openMenuId = ''; renderList() }
      return
    }
    if (e.key !== 'Enter' && e.key !== ' ') return
    const pick = draft && e.target.closest?.('.album-wk[data-work-id]')
    const card = !draft && root.contains(e.target) && e.target.matches?.('.st-album[data-album-id], [data-topic-id]')
    if (pick || card) {
      e.preventDefault()
      e.target.click()
    }
  }

  renderList()
  root.addEventListener('click', onClick)
  root.addEventListener('input', onInput)
  document.addEventListener('keydown', onKeydown)
  return () => {
    root.removeEventListener('click', onClick)
    root.removeEventListener('input', onInput)
    document.removeEventListener('keydown', onKeydown)
  }
}
