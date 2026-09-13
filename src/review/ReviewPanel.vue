<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { store } from '../store'
import { renderMd } from './renderMd'
import './review.css'
import resPrd from './prd/res.md?raw'

// 各视图对应的产品稿。目前只做透了「资源详情页」，其余视图给占位。
const PRD_BY_VIEW = {
  res: { title: '资源详情页', md: resPrd },
}
// 元素标注按 data-doc 前缀分组，对应产品文档模块（skill §823：前缀呼应模块编号）
const SECTION_NAMES = {
  sec1: '1 · 资源预览区', sec2: '2 · 资源标识区', sec3: '3 · 所属专题',
  sec4: '4 · 简介', sec5: '5 · 优质改编', sec6: '6 · 最近动态', sec7: '7 · 讨论',
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

// —— 面板正文（本地可编辑 + 持久化）——
const tab = ref('doc')
const md = ref('')
const editing = ref(false)
const draft = ref('')
const els = ref([])
const markers = ref([])
const activeSeq = ref('')

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

// —— 元素标注 + 页面 ①②③ 序号角标 ——
// 扫描当前资源页 data-doc/data-prd/data-track，按 DOM 顺序编号；角标浮在元素左上角，随滚动/缩放刷新。
let rafId = 0
function refreshMarkers() {
  if (!review.value) { markers.value = []; return }
  const nodes = Array.from(document.querySelectorAll('#view-res [data-doc]'))
    .filter(el => el.dataset.prd || el.dataset.track)
  const list = [], marks = []
  nodes.forEach((el, i) => {
    const seq = String(i + 1)
    list.push({ seq, doc: el.dataset.doc || '', prd: el.dataset.prd || '', track: el.dataset.track || '' })
    const r = el.getBoundingClientRect()
    if (r.width || r.height) marks.push({ seq, left: r.left, top: r.top })
  })
  els.value = list
  markers.value = marks
}
function scheduleRefresh() {
  if (rafId) return
  rafId = requestAnimationFrame(() => { rafId = 0; refreshMarkers() })
}
// 按模块分组（前缀 secN），组内保留页面序号；空组不显示
const elGroups = computed(() => {
  const map = new Map()
  for (const it of els.value) {
    const sec = it.doc.split('-')[0]
    if (!map.has(sec)) map.set(sec, [])
    map.get(sec).push(it)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sec, items]) => ({ sec, name: SECTION_NAMES[sec] || sec, items }))
})
watch([review, () => store.view], () => nextTick(refreshMarkers))

function focusItem(seq) {
  tab.value = 'els'
  activeSeq.value = seq
  const item = els.value.find(a => a.seq === seq)
  if (!item) return
  document.querySelectorAll('.review-highlight').forEach(n => n.classList.remove('review-highlight'))
  const el = document.querySelector(`#view-res [data-doc="${item.doc}"]`)
  if (el) { el.classList.add('review-highlight'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
  nextTick(() => document.getElementById('rpCard-' + seq)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
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
// 拖拽结束后的那次 click 要拦掉，避免误切模式
function onToggleClickCapture(e) {
  if (toggleMoved) { e.stopPropagation(); e.preventDefault(); toggleMoved = false }
}
onMounted(() => {
  // 角标随任意滚动容器 / 窗口缩放刷新位置（capture 捕获内层滚动）
  window.addEventListener('scroll', scheduleRefresh, true)
  window.addEventListener('resize', scheduleRefresh)
  nextTick(refreshMarkers)
  const el = toggleRef.value
  if (!el) return
  try {
    const p = JSON.parse(localStorage.getItem('rp:togglePos') || 'null')
    if (p && p.left && p.top) { el.style.left = p.left; el.style.top = p.top; el.style.right = 'auto' }
  } catch {}
})

// —— 拖拽（按住标题栏移动）——
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
onBeforeUnmount(() => {
  dragCleanup && dragCleanup()
  window.removeEventListener('scroll', scheduleRefresh, true)
  window.removeEventListener('resize', scheduleRefresh)
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

  <div v-if="review" class="review-panel" ref="panelRef">
    <div class="rp-header" @mousedown="onHeaderDown">
      <h2>📋 产品稿 · {{ title }}</h2>
      <button class="rp-close" @click="setMode(false)">✕</button>
    </div>
    <div class="rp-tabs">
      <button class="rp-tab" :class="{ active: tab === 'doc' }" @click="tab = 'doc'">📄 产品文档</button>
      <button class="rp-tab" :class="{ active: tab === 'els' }" @click="tab = 'els'">📌 元素标注</button>
    </div>

    <div class="rp-body">
      <template v-if="tab === 'doc'">
        <div v-if="!current" class="rp-els-empty">本页（{{ store.view }}）暂无产品稿。<br>资源详情页已完成，切到任一资源查看。</div>
        <div v-else class="rp-doc-wrap">
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
          <div v-else class="rp-mdoc" v-html="rendered"></div>
        </div>
      </template>

      <div v-else class="rp-els">
        <div v-if="!els.length" class="rp-els-empty">本页暂无带标注的元素。</div>
        <template v-for="g in elGroups" :key="g.sec">
          <div class="rp-els-group">{{ g.name }}</div>
          <div v-for="it in g.items" :key="it.seq" class="rp-item" :class="{ 'rp-active': activeSeq === it.seq }"
               :id="'rpCard-' + it.seq" @click="focusItem(it.seq)">
            <div class="rp-item-id"><span class="rp-marker rp-marker-inline">{{ it.seq }}</span>{{ it.doc }}</div>
            <div v-if="it.prd" class="rp-item-prd">{{ it.prd }}</div>
            <div v-if="it.track" class="rp-item-track">📊 {{ it.track }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <!-- 页面上的 ①②③ 序号角标（过稿态浮在被标注元素左上角，点角标联动到列表卡片） -->
  <div v-if="review" class="rp-markers">
    <button v-for="m in markers" :key="m.seq" class="rp-marker" :class="{ 'is-active': activeSeq === m.seq }"
            :style="{ left: m.left + 'px', top: m.top + 'px' }" @click="focusItem(m.seq)">{{ m.seq }}</button>
  </div>
</template>
