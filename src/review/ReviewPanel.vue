<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { store } from '../store'
import { renderMd } from './renderMd'
import './review.css'
import resPrd from './prd/res.md?raw'
import discoverPrd from './prd/discover.md?raw'
import rankPrd from './prd/rank.md?raw'
import studioPrd from './prd/studio.md?raw'

// 各视图对应的产品稿。未登记的视图暂无。
const PRD_BY_VIEW = {
  res: { title: '资源详情页', md: resPrd },
  discover: { title: '发现页', md: discoverPrd },
  rank: { title: '排行榜', md: rankPrd },
  studio: { title: '教师主页', md: studioPrd },
}
const current = computed(() => PRD_BY_VIEW[store.view] || null)
const defaultMd = computed(() => current.value?.md || '')
const title = computed(() => current.value?.title || '本页')
const storageKey = computed(() => `prd:${store.view}`)

// —— 演示 / 过稿模式 ——
const review = ref(new URLSearchParams(window.location.search).get('mode') === 'review')
function setMode(r) {
  review.value = r
  const u = new URL(window.location.href)
  if (r) u.searchParams.set('mode', 'review')
  else u.searchParams.delete('mode')
  window.history.replaceState(null, '', u.toString())
}
watch(review, (r) => { document.body.classList.toggle('review-mode', r) }, { immediate: true })

// —— 产品文档正文（本地可编辑 + 持久化）——
const md = ref('')
const editing = ref(false)
const draft = ref('')
function loadMd() {
  try { md.value = localStorage.getItem(storageKey.value) ?? defaultMd.value }
  catch { md.value = defaultMd.value }
  editing.value = false
}
watch(() => store.view, loadMd, { immediate: true })
const edited = computed(() => md.value !== defaultMd.value && defaultMd.value !== '')
const rendered = computed(() => renderMd(md.value))

function startEdit() { draft.value = md.value; editing.value = true }
function save() {
  md.value = draft.value
  try { localStorage.setItem(storageKey.value, draft.value) } catch {}
  editing.value = false
}
function cancelEdit() { editing.value = false }
function resetDefault() {
  md.value = defaultMd.value; draft.value = defaultMd.value
  try { localStorage.removeItem(storageKey.value) } catch {}
  editing.value = false
}
function copyMd() { try { navigator.clipboard?.writeText(draft.value) } catch {} }

// —— 页面序号角标 + 当前模块高亮框：号码 = 产品文档模块号（data-sec="N" ↔ ## N.）——
// 角标与高亮框都画在顶层 overlay，不用元素 outline，避免被页面元素遮挡。
const markers = ref([])
const activeSec = ref('')
const hlBox = ref(null)
let rafId = 0
function computeMarkers() {
  if (!review.value) { markers.value = []; hlBox.value = null; return }
  const secs = Array.from(document.querySelectorAll(`#view-${store.view} [data-sec]`))
  markers.value = secs
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { sec: el.dataset.sec || '', left: r.left, top: r.top, hidden: r.width === 0 && r.height === 0 }
    })
    .filter((m) => !m.hidden)
    .map(({ sec, left, top }) => ({ sec, left, top }))
  const active = secs.find((el) => el.dataset.sec === activeSec.value)
  const r = active?.getBoundingClientRect()
  hlBox.value = r && (r.width || r.height) ? { left: r.left, top: r.top, width: r.width, height: r.height } : null
}
function scheduleMarkers() {
  if (rafId) return
  rafId = requestAnimationFrame(() => { rafId = 0; computeMarkers() })
}
watch([review, () => store.view], () => { activeSec.value = ''; nextTick(computeMarkers) })

// 点角标 → 产品文档滚到 ## N.（闪一下），页面用粉框高亮该区域
const docRef = ref(null)
function focusSection(sec) {
  if (editing.value) editing.value = false
  activeSec.value = sec
  computeMarkers()
  nextTick(() => {
    const h = docRef.value?.querySelector('#rp-sec-' + sec)
    if (h) {
      h.scrollIntoView({ behavior: 'smooth', block: 'start' })
      h.classList.add('rp-sec-flash')
      setTimeout(() => h.classList.remove('rp-sec-flash'), 1600)
    }
  })
}
// 点文档模块标题 → 反向定位并高亮页面区域（事件委托，兼容 v-html 重渲染）
function onDocClick(e) {
  const h = e.target.closest('h2[id^="rp-sec-"]')
  if (!h) return
  const sec = h.id.replace('rp-sec-', '')
  activeSec.value = sec
  const el = document.querySelector(`#view-${store.view} [data-sec="${sec}"]`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  nextTick(computeMarkers)
}

// —— 演示/过稿开关可拖动（阈值区分点击与拖拽，位置持久化）——
const toggleRef = ref(null)
const toggleDragging = ref(false)
let toggleMoved = false
function onToggleDown(e) {
  const el = toggleRef.value
  if (!el) return
  const ox = e.clientX, oy = e.clientY
  const rect = el.getBoundingClientRect()
  const startLeft = rect.left, startTop = rect.top
  toggleMoved = false
  const move = (ev) => {
    if (!toggleMoved && Math.abs(ev.clientX - ox) + Math.abs(ev.clientY - oy) > 4) {
      toggleMoved = true; toggleDragging.value = true
    }
    if (!toggleMoved) return
    el.style.left = Math.max(0, Math.min(startLeft + ev.clientX - ox, window.innerWidth - el.offsetWidth)) + 'px'
    el.style.top = Math.max(0, Math.min(startTop + ev.clientY - oy, window.innerHeight - el.offsetHeight)) + 'px'
    el.style.right = 'auto'
  }
  const up = () => {
    document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up)
    toggleDragging.value = false
    if (toggleMoved) {
      try { localStorage.setItem('rp:togglePos', JSON.stringify({ left: el.style.left, top: el.style.top })) } catch {}
    }
  }
  document.addEventListener('mousemove', move); document.addEventListener('mouseup', up)
}
function onToggleClickCapture(e) {
  if (toggleMoved) { e.stopPropagation(); e.preventDefault(); toggleMoved = false }
}

// —— 面板拖拽（按住标题栏）——
const panelRef = ref(null)
let dragCleanup = null
function onHeaderDown(e) {
  if (e.target.closest('.rp-close')) return
  const panel = panelRef.value
  if (!panel) return
  const ox = e.clientX, oy = e.clientY
  const sx = panel.offsetLeft, sy = panel.offsetTop
  const move = (ev) => {
    panel.style.left = Math.max(0, Math.min(sx + ev.clientX - ox, window.innerWidth - 80)) + 'px'
    panel.style.top = Math.max(0, Math.min(sy + ev.clientY - oy, window.innerHeight - 40)) + 'px'
    panel.style.right = 'auto'
  }
  const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
  document.addEventListener('mousemove', move); document.addEventListener('mouseup', up)
  dragCleanup = up
  e.preventDefault()
}

onMounted(() => {
  window.addEventListener('scroll', scheduleMarkers, true)
  window.addEventListener('resize', scheduleMarkers)
  nextTick(computeMarkers)
  const el = toggleRef.value
  if (!el) return
  try {
    const p = JSON.parse(localStorage.getItem('rp:togglePos') || 'null')
    if (p && p.left && p.top) { el.style.left = p.left; el.style.top = p.top; el.style.right = 'auto' }
  } catch {}
})
onBeforeUnmount(() => {
  dragCleanup && dragCleanup()
  window.removeEventListener('scroll', scheduleMarkers, true)
  window.removeEventListener('resize', scheduleMarkers)
  if (rafId) cancelAnimationFrame(rafId)
  document.body.classList.remove('review-mode')
})
</script>

<template>
  <div class="mode-toggle" :class="{ 'is-dragging': toggleDragging }" ref="toggleRef"
       @mousedown="onToggleDown" @click.capture="onToggleClickCapture" title="可拖动">
    <button :class="{ active: !review }" @click="setMode(false)">演示</button>
    <button :class="{ active: review }" @click="setMode(true)">过稿</button>
  </div>

  <!-- 页面序号角标层 + 当前模块高亮框（顶层 overlay）-->
  <div v-if="review" class="rp-markers">
    <div v-if="hlBox" class="rp-hl" :style="{ left: hlBox.left + 'px', top: hlBox.top + 'px', width: hlBox.width + 'px', height: hlBox.height + 'px' }"></div>
    <button v-for="m in markers" :key="m.sec" class="rp-marker"
            :style="{ left: m.left + 'px', top: m.top + 'px' }"
            :title="'定位到产品文档 ' + m.sec" @click="focusSection(m.sec)">{{ m.sec }}</button>
  </div>

  <div v-if="review" class="review-panel" ref="panelRef">
    <div class="rp-header" @mousedown="onHeaderDown">
      <h2>📋 产品稿 · {{ title }}</h2>
      <button class="rp-close" @click="setMode(false)">✕</button>
    </div>
    <div class="rp-body">
      <div class="rp-edit-bar">
        <template v-if="!editing">
          <button @click="startEdit">✏️ 编辑</button>
          <span v-if="edited" class="rp-edited">已本地编辑</span>
          <button v-if="edited" @click="resetDefault">恢复默认</button>
        </template>
        <template v-else>
          <button class="primary" @click="save">保存</button>
          <button @click="cancelEdit">取消</button>
          <button @click="copyMd">复制 Markdown</button>
          <span class="rp-hint">保存即本地生效；复制后可贴回 src/review/prd/{{ store.view }}.md 永久保留</span>
        </template>
      </div>
      <textarea v-if="editing" class="rp-edit" v-model="draft" spellcheck="false"></textarea>
      <div v-else class="rp-mdoc" ref="docRef" v-html="rendered" @click="onDocClick"></div>
    </div>
  </div>
</template>
