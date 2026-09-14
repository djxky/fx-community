<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  INTRO_MAX,
  SUBJECTS,
  TAG_MAX_COUNT,
  TAG_MAX_LEN,
  TITLE_MAX,
  addTag,
  chaptersFor,
  describeTags,
  formatGrade,
  tagSuggestions,
  textbooksFor,
  validatePublish,
  volumesFor,
} from '../lib/publish-tags.mjs'

// 对话页「发布作品」弹窗：线上的 标题 + 适配标签，加新社区要的 简介 + 作品标签
const props = defineProps({
  work: { type: Object, required: true },
})
const emit = defineEmits(['close', 'published'])

const title = ref(props.work.title || '')
const intro = ref(props.work.intro || '')
const subject = ref(props.work.tags?.subject || '')
const grade = ref({ textbook: props.work.tags?.textbook || '', volume: props.work.tags?.volume || '' })
const chapter = ref(props.work.tags?.chapter || '')
const customTag = ref('')
const labels = ref([...(props.work.labels || [])])
const tagQuery = ref('')
const tagHint = ref('')
const error = ref(null) // { field, message }

const bodyEl = ref(null)
const tagInputEl = ref(null)
const openMenu = ref('') // subject | grade | chapter
const menuStyle = ref({})
const hoverTextbook = ref(grade.value.textbook)
const customOpen = ref(false)
const customDraft = ref('')

const gradeLabel = computed(() => formatGrade(grade.value))
const chapters = computed(() => chaptersFor(subject.value, grade.value))
const tagsFull = computed(() => labels.value.length >= TAG_MAX_COUNT)
const suggestions = computed(() => (tagsFull.value ? [] : tagSuggestions(tagQuery.value, labels.value, props.work.suggestedLabels)))

watch(subject, (next, prev) => {
  if (prev && next !== prev) { grade.value = { textbook: '', volume: '' }; chapter.value = '' }
})

function errorFor(field) {
  return error.value?.field === field ? error.value.message : ''
}
function clearError(field) {
  if (error.value?.field === field) error.value = null
}

// 下拉用 fixed 定位，避免被弹窗滚动区裁掉；下方放不下就向上展开
function toggleMenu(name, event) {
  if (name === 'chapter' && !chapters.value.length) return
  if (openMenu.value === name) { openMenu.value = ''; return }
  const rect = event.currentTarget.getBoundingClientRect()
  const menuHeight = name === 'grade' ? 204 : 272
  const openUp = window.innerHeight - rect.bottom < menuHeight + 8 && rect.top > menuHeight + 8
  menuStyle.value = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    ...(openUp ? { bottom: `${window.innerHeight - rect.top + 4}px` } : { top: `${rect.bottom + 4}px` }),
  }
  if (name === 'grade') hoverTextbook.value = grade.value.textbook || textbooksFor(subject.value)[0]
  openMenu.value = name
}
function pickSubject(value) { subject.value = value; openMenu.value = ''; clearError('fit') }
function pickVolume(volume) {
  const changed = grade.value.textbook !== hoverTextbook.value || grade.value.volume !== volume
  grade.value = { textbook: hoverTextbook.value, volume }
  if (changed) chapter.value = ''
  openMenu.value = ''
}
function clearGrade() { grade.value = { textbook: '', volume: '' }; chapter.value = ''; openMenu.value = '' }
function pickChapter(value) { chapter.value = value; openMenu.value = '' }

function commitTag(label) {
  const result = addTag(labels.value, label)
  labels.value = result.tags
  tagHint.value = result.error
  if (!result.error) tagQuery.value = ''
  if (labels.value.length) clearError('labels')
  tagInputEl.value?.focus()
}
function onTagEnter(e) {
  if (e.isComposing || e.keyCode === 229) return // 中文输入法选词时的回车不算
  commitTag(tagQuery.value)
}
function onTagBackspace() {
  if (!tagQuery.value && labels.value.length) removeTag(labels.value[labels.value.length - 1])
}
function removeTag(label) {
  labels.value = labels.value.filter((item) => item !== label)
  tagHint.value = ''
}

function openCustom() { openMenu.value = ''; customDraft.value = customTag.value; customOpen.value = true }
function confirmCustom() {
  if (!customDraft.value.trim()) return
  customTag.value = customDraft.value.trim()
  customOpen.value = false
  clearError('fit')
}
function clearCustom() { customTag.value = '' }

async function submit() {
  openMenu.value = ''
  error.value = validatePublish({
    title: title.value, intro: intro.value, subject: subject.value,
    customTag: customTag.value, labels: labels.value,
  })
  if (error.value) {
    await nextTick()
    bodyEl.value?.querySelector(`[data-field="${error.value.field}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  emit('published', {
    title: title.value.trim(),
    intro: intro.value.trim(),
    tags: customTag.value
      ? { custom: customTag.value }
      : { subject: subject.value, ...grade.value, chapter: chapter.value },
    labels: describeTags(labels.value),
  })
}

function onDocDown(e) {
  if (!(e.target instanceof Element) || !e.target.closest('.cpm-select, .cpm-menu')) openMenu.value = ''
}
function onKey(e) {
  if (e.key !== 'Escape') return
  if (openMenu.value) openMenu.value = ''
  else if (customOpen.value) customOpen.value = false
  else emit('close')
}
function closeMenu() { openMenu.value = '' }
onMounted(() => {
  document.addEventListener('mousedown', onDocDown)
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', closeMenu)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocDown)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', closeMenu)
})
</script>

<template>
  <div class="cpm-mask" @mousedown.self="emit('close')">
    <section class="cpm" role="dialog" aria-modal="true" aria-labelledby="cpm-title">
      <header class="cpm-head">
        <h2 id="cpm-title" class="cpm-title">发布作品</h2>
        <button class="cpm-close" type="button" aria-label="关闭" @click="emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </header>

      <div ref="bodyEl" class="cpm-body" @scroll="closeMenu">
        <div class="cpm-group" data-field="title">
          <div class="cpm-label">标题<i>*</i></div>
          <label class="cpm-input" :class="{ invalid: errorFor('title') }">
            <textarea v-model="title" class="cpm-title-input" :maxlength="TITLE_MAX" placeholder="请输入标题" aria-label="标题" data-track="/click/chatPublish/title | 编辑发布标题 | 无" @input="clearError('title')"></textarea>
            <span class="cpm-count">{{ title.length }}/{{ TITLE_MAX }}</span>
          </label>
          <p v-if="errorFor('title')" class="cpm-error" role="alert">{{ errorFor('title') }}</p>
        </div>

        <div class="cpm-group" data-field="intro">
          <div class="cpm-group-head">
            <span class="cpm-label">简介<i>*</i></span>
            <span class="cpm-note">AI 已根据对话生成，可修改</span>
          </div>
          <label class="cpm-input" :class="{ invalid: errorFor('intro') }">
            <textarea v-model="intro" class="cpm-intro-input" :maxlength="INTRO_MAX" placeholder="说说这份作品适合什么课堂、怎么用" aria-label="简介" data-track="/click/chatPublish/intro | 编辑发布简介 | 无" @input="clearError('intro')"></textarea>
            <span class="cpm-count">{{ intro.length }}/{{ INTRO_MAX }}</span>
          </label>
          <p v-if="errorFor('intro')" class="cpm-error" role="alert">{{ errorFor('intro') }}</p>
        </div>

        <div class="cpm-group" data-field="fit">
          <div class="cpm-group-head">
            <span class="cpm-label">完善标签</span>
            <button type="button" class="cpm-link" data-track="/click/chatPublish/customTag | 点击不在范围里 | 无" @click="openCustom">不在范围里</button>
          </div>

          <div v-if="customTag" class="cpm-custom">
            <span class="cpm-custom-text">{{ customTag }}</span>
            <button type="button" class="cpm-link" @click="openCustom">修改</button>
            <button type="button" class="cpm-link" @click="clearCustom">重新选择</button>
          </div>

          <template v-else>
            <div class="cpm-row">
              <span class="cpm-row-label">学科<i>*</i></span>
              <div class="cpm-select" :class="{ open: openMenu === 'subject', invalid: errorFor('fit') }">
                <button type="button" class="cpm-trigger" @click="toggleMenu('subject', $event)">
                  <span :class="{ ph: !subject }">{{ subject || '请选择学科' }}</span>
                  <svg class="cpm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </button>
              </div>
            </div>

            <div class="cpm-row">
              <span class="cpm-row-label">年级</span>
              <div class="cpm-select" :class="{ open: openMenu === 'grade' }">
                <button type="button" class="cpm-trigger" :disabled="!subject" @click="toggleMenu('grade', $event)">
                  <span :class="{ ph: !gradeLabel }">{{ gradeLabel || '请选择年级' }}</span>
                  <span v-if="gradeLabel" class="cpm-clear" role="button" aria-label="清空年级" @click.stop="clearGrade">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
                  </span>
                  <svg class="cpm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </button>
              </div>
            </div>

            <div class="cpm-row">
              <span class="cpm-row-label">章节</span>
              <div class="cpm-select" :class="{ open: openMenu === 'chapter' }">
                <button type="button" class="cpm-trigger" :disabled="!chapters.length" @click="toggleMenu('chapter', $event)">
                  <span :class="{ ph: !chapter }">{{ chapter || '请选择章节' }}</span>
                  <svg class="cpm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </button>
              </div>
            </div>
          </template>
          <p v-if="errorFor('fit')" class="cpm-error" role="alert">{{ errorFor('fit') }}</p>
        </div>

        <div class="cpm-group" data-field="labels">
          <div class="cpm-label">作品标签<i>*</i></div>
          <div class="cpm-tagbox" :class="{ invalid: errorFor('labels') }" @click="tagInputEl?.focus()">
            <span v-for="label in labels" :key="label" class="cpm-tag">
              {{ label }}
              <button type="button" class="cpm-tag-x" :aria-label="`移除标签 ${label}`" data-track="/click/chatPublish/removeTag | 移除作品标签 | 无" @click.stop="removeTag(label)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </span>
            <input
              v-if="!tagsFull"
              ref="tagInputEl"
              v-model="tagQuery"
              class="cpm-tag-input"
              :maxlength="TAG_MAX_LEN"
              :placeholder="labels.length ? '添加标签' : '输入标签，回车添加'"
              aria-label="输入作品标签"
              @input="tagHint = ''"
              @keydown.enter.prevent="onTagEnter"
              @keydown.backspace="onTagBackspace"
            />
          </div>
          <div v-if="suggestions.length" class="cpm-suggest">
            <span v-if="!tagQuery.trim()" class="cpm-suggest-label">推荐</span>
            <button v-for="s in suggestions" :key="s.label + s.isNew" type="button" class="cpm-chip" :class="{ 'is-new': s.isNew }" data-track="/click/chatPublish/addTag | 添加作品标签 | isNew#BOOLEAN" @click="commitTag(s.label)">
              <template v-if="s.isNew">新建「{{ s.label }}」</template>
              <template v-else>+ {{ s.label }}</template>
            </button>
          </div>
          <p v-if="errorFor('labels')" class="cpm-error" role="alert">{{ errorFor('labels') }}</p>
          <p v-else-if="tagHint" class="cpm-hint" role="status">{{ tagHint }}</p>
          <p v-else-if="tagsFull" class="cpm-hint">最多 {{ TAG_MAX_COUNT }} 个标签</p>
        </div>
      </div>

      <footer class="cpm-foot">
        <button type="button" class="cpm-submit" data-track="/click/chatPublish/confirm | 确认发布 | 无" @click="submit">确认发布</button>
      </footer>
    </section>

    <div v-if="openMenu === 'subject'" class="cpm-menu" :style="menuStyle">
      <button v-for="s in SUBJECTS" :key="s" type="button" class="cpm-opt" :class="{ on: s === subject }" @click="pickSubject(s)">{{ s }}</button>
    </div>
    <div v-if="openMenu === 'grade'" class="cpm-menu cpm-cascade" :style="menuStyle">
      <div class="cpm-col">
        <button v-for="t in textbooksFor(subject)" :key="t" type="button" class="cpm-opt cpm-opt-parent" :class="{ on: t === hoverTextbook }" @click="hoverTextbook = t" @mouseenter="hoverTextbook = t">
          <span>{{ t }}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6" /></svg>
        </button>
      </div>
      <div class="cpm-col">
        <button v-for="v in volumesFor(subject, hoverTextbook)" :key="v" type="button" class="cpm-opt" :class="{ on: grade.textbook === hoverTextbook && grade.volume === v }" @click="pickVolume(v)">{{ v }}</button>
      </div>
    </div>
    <div v-if="openMenu === 'chapter'" class="cpm-menu" :style="menuStyle">
      <button v-for="c in chapters" :key="c" type="button" class="cpm-opt" :class="{ on: c === chapter }" @click="pickChapter(c)">{{ c }}</button>
    </div>

    <div v-if="customOpen" class="cpm-mask cpm-mask-top" @mousedown.self="customOpen = false">
      <section class="cpm-custom-dlg" role="dialog" aria-modal="true" aria-labelledby="cpm-custom-title">
        <button class="cpm-close cpm-custom-close" type="button" aria-label="关闭" @click="customOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <h3 id="cpm-custom-title" class="cpm-custom-title">自定义标签</h3>
        <textarea v-model="customDraft" class="cpm-custom-input" placeholder="点击这里开始输入" aria-label="自定义标签"></textarea>
        <p class="cpm-custom-hint">标准格式：学科/教材版本/年级/期次/章节</p>
        <div class="cpm-custom-actions">
          <button type="button" class="cpm-btn-ghost" @click="customOpen = false">取消</button>
          <button type="button" class="cpm-btn-primary" :disabled="!customDraft.trim()" @click="confirmCustom">确定</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cpm-mask { position:fixed; inset:0; z-index:90; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(0,0,0,.45); animation:cpm-fade .18s ease; }
.cpm-mask-top { z-index:95; background:rgba(0,0,0,.25); }
.cpm { display:flex; flex-direction:column; width:min(520px, 100%); max-height:calc(100dvh - 48px); border:.5px solid rgba(0,0,0,.12); border-radius:16px; background:#fff; box-shadow:0 6px 24px rgba(0,0,0,.12); color:#141F1B; animation:cpm-fade .2s ease; }
.cpm-head { display:flex; align-items:center; justify-content:space-between; flex-shrink:0; padding:24px 20px 4px; }
.cpm-title { margin:0; font-size:20px; font-weight:500; line-height:24px; }
.cpm-close { display:flex; align-items:center; justify-content:center; width:24px; height:24px; border:0; padding:0; border-radius:4px; background:none; color:rgba(0,0,0,.45); cursor:pointer; }
.cpm-close:hover { background:rgba(0,0,0,.06); color:rgba(0,0,0,.88); }
.cpm-body { flex:1 1 auto; min-height:0; overflow-y:auto; padding:0 20px 4px; overscroll-behavior:contain; }
.cpm-group { padding-top:20px; }
.cpm-group + .cpm-group { margin-top:4px; }
.cpm-group-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.cpm-label { display:block; font-size:16px; font-weight:500; line-height:22px; }
.cpm-group > .cpm-label { margin-bottom:8px; }
.cpm-group-head + .cpm-input, .cpm-group-head + .cpm-row, .cpm-group-head + .cpm-custom { margin-top:8px; }
.cpm-label i, .cpm-row-label i { color:#FF4832; font-style:normal; }
.cpm-note { color:#A9B2AF; font-size:12px; }
.cpm-input { display:block; padding:14px 16px 10px; border:1px solid transparent; border-radius:10px; background:#F6F6F6; cursor:text; transition:border-color .15s, background .15s; }
.cpm-input:focus-within { border-color:#141F1B; background:#fff; }
.cpm-input.invalid { border-color:#FF4832; }
.cpm-input textarea { display:block; width:100%; border:0; padding:2px; outline:none; resize:none; background:transparent; color:#141F1B; font-size:16px; line-height:22px; }
.cpm-title-input { height:48px; font-weight:500; }
.cpm-intro-input { height:92px; font-size:15px !important; font-weight:400; }
.cpm-input textarea::placeholder { color:#A9B2AF; font-weight:400; }
.cpm-count { display:block; margin-top:6px; text-align:right; color:#A9B2AF; font-size:12px; line-height:17px; }
.cpm-link { border:0; padding:0; background:none; color:#7A7C7C; font-size:14px; cursor:pointer; white-space:nowrap; }
.cpm-link:hover { color:#141F1B; }
.cpm-row { display:flex; align-items:center; gap:18px; margin-top:12px; }
.cpm-row-label { flex:0 0 30px; color:#7A7C7C; font-size:14px; white-space:nowrap; }
.cpm-select { position:relative; flex:1 1 auto; min-width:0; }
.cpm-trigger { display:flex; align-items:center; gap:8px; width:100%; height:52px; border:1px solid #E3E4E3; border-radius:12px; padding:14px 16px; background:#fff; color:#141F1B; font-size:14px; font-weight:500; text-align:left; cursor:pointer; transition:border-color .15s; }
.cpm-trigger > span:first-child { flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cpm-trigger .ph { color:#A9B2AF; font-weight:400; }
.cpm-trigger:hover:not(:disabled), .cpm-select.open .cpm-trigger { border-color:#141F1B; }
.cpm-select.invalid .cpm-trigger { border-color:#FF4832; }
.cpm-trigger:disabled { cursor:not-allowed; background:#FAFAFA; }
.cpm-arrow { flex-shrink:0; color:#141F1B; transition:transform .15s; }
.cpm-select.open .cpm-arrow { transform:rotate(180deg); }
.cpm-clear { display:none; align-items:center; justify-content:center; flex-shrink:0; width:16px; height:16px; border-radius:50%; background:#A9B2AF; }
.cpm-trigger:hover .cpm-clear { display:flex; }
.cpm-trigger:hover .cpm-clear + .cpm-arrow { display:none; }
.cpm-menu { position:fixed; z-index:96; max-height:264px; overflow-y:auto; padding:4px; border-radius:12px; background:#fff; box-shadow:0 6px 16px rgba(0,0,0,.08), 0 3px 6px -4px rgba(0,0,0,.12), 0 9px 28px 8px rgba(0,0,0,.05); }
.cpm-opt { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; min-height:42px; border:0; border-radius:8px; padding:0 12px; background:none; color:#141F1B; font-size:14px; text-align:left; cursor:pointer; }
.cpm-opt:hover { background:#F5F5F5; }
.cpm-opt.on { background:#F0F0F0; font-weight:500; }
.cpm-opt-parent svg { flex-shrink:0; color:#7A7C7C; }
.cpm-cascade { display:flex; max-height:none; overflow:visible; padding:0; }
.cpm-col { flex:1 1 50%; min-width:0; max-height:196px; overflow-y:auto; padding:4px; }
.cpm-col + .cpm-col { border-left:1px solid #F0F0F0; }
.cpm-custom { display:flex; align-items:center; gap:14px; min-height:52px; border:1px solid #E3E4E3; border-radius:12px; padding:14px 16px; font-size:14px; font-weight:500; }
.cpm-custom-text { flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cpm-tagbox { display:flex; flex-wrap:wrap; align-items:center; gap:8px; min-height:52px; border:1px solid transparent; border-radius:10px; padding:10px 12px; background:#F6F6F6; cursor:text; transition:border-color .15s, background .15s; }
.cpm-tagbox:focus-within { border-color:#141F1B; background:#fff; }
.cpm-tagbox.invalid { border-color:#FF4832; }
.cpm-tag { display:inline-flex; align-items:center; gap:2px; height:30px; border-radius:8px; padding:0 4px 0 10px; background:#141F1B; color:#fff; font-size:14px; font-weight:500; }
.cpm-tag-x { display:flex; align-items:center; justify-content:center; width:20px; height:20px; border:0; border-radius:5px; padding:0; background:none; color:rgba(255,255,255,.7); cursor:pointer; }
.cpm-tag-x:hover { background:rgba(255,255,255,.16); color:#fff; }
.cpm-tag-input { flex:1 1 96px; min-width:96px; height:30px; border:0; padding:0 4px; outline:none; background:transparent; color:#141F1B; font-size:14px; }
.cpm-tag-input::placeholder { color:#A9B2AF; }
.cpm-suggest { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:10px; }
.cpm-suggest-label { color:#A9B2AF; font-size:13px; }
.cpm-chip { height:30px; border:1px solid #E3E4E3; border-radius:8px; padding:0 10px; background:#fff; color:#141F1B; font-size:13px; cursor:pointer; transition:border-color .15s, background .15s; }
.cpm-chip:hover { border-color:#141F1B; }
.cpm-chip.is-new { border-style:dashed; }
.cpm-error { margin:6px 0 0; color:#FF4832; font-size:13px; line-height:18px; }
.cpm-hint { margin:6px 0 0; color:#A9B2AF; font-size:13px; line-height:18px; }
.cpm-foot { flex-shrink:0; padding:16px 20px 20px; border-top:1px solid #F2F2F2; }
.cpm-submit { display:block; width:100%; height:48px; border:0; border-radius:10px; background:#141F1B; color:#fff; font-size:16px; font-weight:500; cursor:pointer; transition:background .15s, transform .1s; }
.cpm-submit:hover { background:#2C3632; }
.cpm-submit:active { transform:scale(.99); }
.cpm-custom-dlg { position:relative; width:min(432px, 100%); padding:24px 20px 20px; border-radius:16px; background:#fff; box-shadow:0 6px 24px rgba(0,0,0,.12); animation:cpm-fade .2s ease; }
.cpm-custom-close { position:absolute; top:24px; right:20px; }
.cpm-custom-title { margin:0; color:#141F1B; font-size:18px; font-weight:500; line-height:24px; }
.cpm-custom-input { display:block; width:100%; height:92px; margin-top:20px; border:0; border-radius:10px; padding:14px 16px; outline:none; resize:none; background:#F6F6F6; color:#161D29; font-size:16px; line-height:22px; }
.cpm-custom-input::placeholder { color:#A9B2AF; }
.cpm-custom-hint { margin:10px 0 0; color:#A9B2AF; font-size:14px; }
.cpm-custom-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:24px; }
.cpm-btn-ghost, .cpm-btn-primary { min-width:72px; height:36px; border:0; border-radius:10px; padding:0 16px; font-size:14px; font-weight:500; cursor:pointer; }
.cpm-btn-ghost { background:#fff; color:#141F1B; box-shadow:inset 0 0 0 1px #E3E4E3; }
.cpm-btn-ghost:hover { background:#F6F6F6; }
.cpm-btn-primary { background:#141F1B; color:#fff; }
.cpm-btn-primary:disabled { background:#D4D4D4; cursor:not-allowed; }
@keyframes cpm-fade { from { opacity:0; } }
</style>
