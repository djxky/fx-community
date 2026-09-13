<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import '../styles/community.css'
import PostCard from '../components/PostCard.vue'
import { POSTS } from '../data/discover'
import { FEED } from '../data/feed'
import {
  availableFacetOptions,
  availableScenes,
  availableTasks,
  filterDiscoverPosts,
} from '../lib/discover-taxonomy.mjs'
import { buildFollowAuthors, buildFollowPosts, filterByAuthor } from '../lib/discover-follow.mjs'

const MODE_OPTIONS = [
  { key: 'follow', label: '关注' },
  { key: 'recommend', label: '推荐' },
]

const activeMode = ref('recommend')
const activeScene = ref('all')
const activeTask = ref('all')
const activeSubject = ref('all')
const activeStage = ref('all')
// 关注下选中的作者；空 = 全部关注对象
const activeAuthor = ref('')

const FOLLOW_AUTHORS = buildFollowAuthors(FEED)
const FOLLOW_POSTS = buildFollowPosts(FEED, POSTS)

const basePosts = computed(() => activeMode.value === 'follow'
  ? filterByAuthor(FOLLOW_POSTS, activeAuthor.value)
  : POSTS)
const sceneOptions = computed(() => availableScenes([...POSTS, ...FOLLOW_POSTS]))
const primaryTabs = computed(() => [
  ...MODE_OPTIONS,
  ...sceneOptions.value.filter((scene) => scene.key !== 'all'),
])
const activePrimaryTab = computed(() => {
  if (activeMode.value === 'follow') return 'follow'
  return activeScene.value === 'all' ? 'recommend' : activeScene.value
})
const taskOptions = computed(() => availableTasks(basePosts.value, activeScene.value))
const facetOptions = computed(() => availableFacetOptions(basePosts.value, activeScene.value, activeTask.value))

const visiblePosts = computed(() => filterDiscoverPosts(basePosts.value, {
  scene: activeScene.value,
  task: activeTask.value,
  subject: activeSubject.value,
  stage: activeStage.value,
}))

const activeAdvancedCount = computed(() => [
  activeTask.value,
  activeSubject.value,
  activeStage.value,
].filter((value) => value !== 'all').length)

function resetAdvancedFilters() {
  activeTask.value = 'all'
  activeSubject.value = 'all'
  activeStage.value = 'all'
}

function selectPrimaryTab(tab) {
  activeMode.value = tab === 'follow' ? 'follow' : 'recommend'
  activeScene.value = tab === 'recommend' || tab === 'follow' ? 'all' : tab
  activeAuthor.value = ''
  resetAdvancedFilters()
}

// 点头像只看该作者，再点一次回到全部
function toggleAuthor(name) {
  activeAuthor.value = activeAuthor.value === name ? '' : name
}

// 头像行左右翻页：放不下时才出现箭头
const authorRail = ref(null)
const railEdges = ref({ start: true, end: true })
function updateRailEdges() {
  const el = authorRail.value
  if (!el) return
  railEdges.value = {
    start: el.scrollLeft <= 1,
    end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
  }
}
function scrollRail(direction) {
  const el = authorRail.value
  if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
}
watch(activeMode, () => nextTick(updateRailEdges))
onMounted(() => window.addEventListener('resize', updateRailEdges))
onBeforeUnmount(() => window.removeEventListener('resize', updateRailEdges))

function selectTask(task) {
  activeTask.value = task
  activeSubject.value = 'all'
  activeStage.value = 'all'
}
</script>

<template>
  <div id="view-discover">
    <div class="page">
      <main class="discover-main community-main">
        <div class="tbar" data-sec="1">
          <div class="tbar-in">
            <div class="tbar-tabs">
              <span class="tbtab nav-rank" data-track="/click/discoverPage/rankTab | 切换到排行榜 | 无">排行榜</span>
              <span class="tbtab on nav-discover">发现</span>
            </div>
            <div class="tbar-right">
              <div class="tbar-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
                搜知识点、课型、课件、教案…
              </div>
            </div>
          </div>
        </div>

        <div id="disc-body" class="discover-body community-body">
          <section class="discover-toolbar" aria-label="发现内容筛选">
            <div class="toolbar-primary" data-sec="2">
              <div class="primary-tabs" role="tablist" aria-label="灵感分类">
                <button
                  v-for="tab in primaryTabs"
                  :key="tab.key"
                  type="button"
                  class="primary-tab"
                  data-track="/click/discoverPage/categoryTab | 切换灵感分类 | tab"
                  :class="{ on: activePrimaryTab === tab.key }"
                  role="tab"
                  :aria-selected="activePrimaryTab === tab.key"
                  @click="selectPrimaryTab(tab.key)"
                >{{ tab.label }}</button>
              </div>
            </div>

            <div v-if="activeMode === 'follow'" class="follow-authors" data-sec="3" aria-label="我关注的作者">
              <button v-show="!railEdges.start" type="button" class="rail-arrow" aria-label="上一页" data-track="/click/discoverPage/followAuthorPage | 翻页关注作者 | direction" @click="scrollRail(-1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
              </button>
              <div ref="authorRail" class="author-rail" @scroll="updateRailEdges">
                <button
                  v-for="author in FOLLOW_AUTHORS"
                  :key="author.name"
                  type="button"
                  class="author-chip"
                  :class="{ on: activeAuthor === author.name, 'is-expert': author.expert, 'is-org': author.org }"
                  :aria-pressed="activeAuthor === author.name"
                  :title="author.name"
                  data-track="/click/discoverPage/followAuthor | 选择关注作者 | authorId,selected"
                  @click="toggleAuthor(author.name)"
                >
                  <span class="author-avatar">
                    <img v-if="author.portrait" :src="author.portrait" alt="" />
                    <span v-else>{{ author.mark }}</span>
                  </span>
                  <span class="author-name">{{ author.name }}</span>
                </button>
              </div>
              <button v-show="!railEdges.end" type="button" class="rail-arrow" aria-label="下一页" data-track="/click/discoverPage/followAuthorPage | 翻页关注作者 | direction" @click="scrollRail(1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>
              </button>
            </div>

            <div v-if="activeScene !== 'all'" id="discover-advanced-filters" class="filter-panel" data-sec="4">
              <div v-if="taskOptions.length" class="task-strip" aria-label="具体场景">
                <span class="strip-label">具体场景</span>
                <div class="facet-options">
                  <button
                    v-for="task in taskOptions"
                    :key="task.key"
                    type="button"
                    class="task-button"
                    data-track="/click/discoverPage/taskFilter | 选择具体场景 | scene,task"
                    :class="{ on: activeTask === task.key }"
                    :aria-pressed="activeTask === task.key"
                    @click="selectTask(task.key)"
                  >{{ task.label }}</button>
                </div>
              </div>

              <div class="advanced-filters">
                <div class="facet-group">
                  <span class="facet-label">学段</span>
                  <div class="facet-options">
                    <button type="button" class="facet-button" data-track="/click/discoverPage/stageFilter | 选择学段 | scene,stage" :class="{ on: activeStage === 'all' }" :aria-pressed="activeStage === 'all'" @click="activeStage = 'all'">不限</button>
                    <button v-for="stage in facetOptions.stages" :key="stage" type="button" class="facet-button" data-track="/click/discoverPage/stageFilter | 选择学段 | scene,stage" :class="{ on: activeStage === stage }" :aria-pressed="activeStage === stage" @click="activeStage = stage">{{ stage }}</button>
                  </div>
                </div>
                <div class="facet-group">
                  <span class="facet-label">学科</span>
                  <div class="facet-options">
                    <button type="button" class="facet-button" data-track="/click/discoverPage/subjectFilter | 选择学科 | scene,subject" :class="{ on: activeSubject === 'all' }" :aria-pressed="activeSubject === 'all'" @click="activeSubject = 'all'">不限</button>
                    <button v-for="subject in facetOptions.subjects" :key="subject" type="button" class="facet-button" data-track="/click/discoverPage/subjectFilter | 选择学科 | scene,subject" :class="{ on: activeSubject === subject }" :aria-pressed="activeSubject === subject" @click="activeSubject = subject">{{ subject }}</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div v-if="activeAdvancedCount" class="result-summary" aria-live="polite">
            <span>已筛选出 {{ visiblePosts.length }} 个灵感</span>
            <button type="button" class="clear-filters" data-track="/click/discoverPage/clearFilters | 清除全部筛选 | scene" @click="resetAdvancedFilters">清除全部</button>
          </div>

          <div class="flow" data-sec="5">
            <PostCard v-for="(post, i) in visiblePosts" :key="post.resourceId || post.title || i" :post="post" compact data-track="/click/discoverPage/resourceCard | 点击灵感卡片 | tab,position" />
          </div>
          <div v-if="visiblePosts.length === 0 && activeMode === 'follow'" class="empty-state">
            <strong>{{ activeAuthor ? '这位作者还没有公开的资源' : '关注的作者还没有公开的资源' }}</strong>
          </div>
          <div v-else-if="visiblePosts.length === 0" class="empty-state">
            <strong>这个组合下还没有内容</strong>
            <span>换个场景或清除筛选看看</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.discover-toolbar { margin-bottom:20px; }
.toolbar-primary { min-height:68px; display:flex; align-items:center; gap:0; border-bottom:1px solid #ECEFED; }
.primary-tabs { display:flex; align-items:stretch; align-self:stretch; flex:1 1 auto; gap:34px; flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; }
.primary-tabs::-webkit-scrollbar { display:none; }
.primary-tab,
.task-button,
.facet-button,
.clear-filters { font:inherit; cursor:pointer; }
.primary-tab { position:relative; flex:0 0 auto; min-height:68px; padding:0 2px; border:0; background:transparent; color:#7A7C7C; font-size:15px; font-weight:500; }
.primary-tab:hover { color:#17231E; }
.primary-tab.on { color:#141F1B; font-weight:650; }
.primary-tab.on::after { content:""; position:absolute; left:50%; bottom:-1px; width:30px; height:2px; border-radius:2px 2px 0 0; background:#141F1B; transform:translateX(-50%); }
.filter-panel { margin-top:14px; padding:16px 18px 8px; border:1px solid #EEF0EF; border-radius:14px; background:#FAFBFA; }
.task-strip { min-height:38px; display:flex; align-items:flex-start; gap:0; padding:0; }
.strip-label { width:72px; flex:0 0 72px; margin:6px 0 0; color:#7A7C7C; font-size:12px; line-height:16px; }
.task-button { position:relative; min-height:28px; margin:0 4px 10px 0; padding:6px 10px; border:0; background:transparent; color:#7A7C7C; font-size:12px; font-weight:400; line-height:16px; border-radius:8px; }
.task-button:hover { color:#17231E; }
.task-button.on { background:#EFEFEF; color:#141F1B; font-weight:500; }

.advanced-filters { margin-top:0; padding:0; border:0; }
.facet-group { min-width:0; display:flex; min-height:38px; align-items:flex-start; padding:0; }
.facet-label { width:72px; flex:0 0 72px; margin:6px 0 0; padding-top:0; color:#7A7C7C; font-size:12px; font-weight:400; line-height:16px; }
.facet-options { min-width:0; display:flex; gap:0; flex-wrap:wrap; }
.facet-button { position:relative; min-height:28px; margin:0 4px 10px 0; padding:6px 10px; border:0; background:transparent; color:#7A7C7C; font-size:12px; line-height:16px; border-radius:8px; }
.facet-button:hover { color:#17231E; }
.facet-button.on { background:#EFEFEF; color:#141F1B; font-weight:500; }

.result-summary { display:flex; align-items:center; justify-content:space-between; min-height:30px; margin:-8px 0 14px; color:#858B88; font-size:12px; }
.clear-filters { min-height:30px; padding:0; border:0; background:transparent; color:#52645B; font-size:12px; text-decoration:underline; text-underline-offset:3px; }
.empty-state { display:flex; flex-direction:column; align-items:center; gap:8px; padding:76px 0; color:#989D9A; font-size:13px; text-align:center; }
.empty-state strong { color:#555D59; font-size:15px; }

/* 关注：关注对象头像行（点头像只看该作者，再点回到全部） */
.follow-authors { display:flex; align-items:center; gap:8px; margin-top:16px; }
.author-rail { flex:1 1 auto; min-width:0; display:flex; gap:8px; padding:6px 2px 2px; overflow-x:auto; scroll-snap-type:x proximity; scrollbar-width:none; }
.author-rail::-webkit-scrollbar { display:none; }
.author-chip { flex:0 0 96px; min-width:0; display:flex; flex-direction:column; align-items:center; gap:8px; padding:6px 4px 8px; border:0; border-radius:14px; background:transparent; color:#7A7C7C; font:inherit; font-size:13px; cursor:pointer; scroll-snap-align:start; transition:background .15s ease, color .15s ease; }
.author-chip:hover { background:#F6F7F6; color:#17231E; }
.author-avatar { width:56px; height:56px; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:50%; background:#ECECEC; color:#141F1B; font-size:15px; font-weight:650; transition:box-shadow .15s ease; }
.author-avatar img { width:100%; height:100%; display:block; object-fit:cover; }
.author-chip.is-org .author-avatar { background:#F3F3F1; font-size:13px; }
.author-chip.is-expert .author-avatar { box-shadow:0 0 0 2px #fff, 0 0 0 3px #D9AF3C; }
.author-chip.on .author-avatar { box-shadow:0 0 0 2px #fff, 0 0 0 4px #141F1B; }
.author-name { max-width:100%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; line-height:18px; }
.author-chip.on .author-name { color:#141F1B; font-weight:600; }
.rail-arrow { flex:0 0 32px; width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; padding:0; border:1px solid #ECECEC; border-radius:50%; background:#fff; color:#141F1B; cursor:pointer; }
.rail-arrow:hover { border-color:#D4D4D4; }

.flow { display:grid; grid-template-columns:repeat(var(--community-columns), minmax(0, 1fr)); gap:var(--community-gap); align-items:start; }
button:focus-visible { outline:3px solid rgba(38,115,80,.24); outline-offset:3px; }

@media (max-width:1180px) {
  .primary-tabs { gap:20px; }
}

@media (max-width:820px) {
  .toolbar-primary { align-items:center; }
  .primary-tabs { min-height:52px; gap:24px; }
  .primary-tab { min-height:52px; font-size:14px; }
}

@media (max-width:620px) {
  .discover-toolbar { margin-bottom:22px; }
  .primary-tabs { gap:20px; }
}

@media (max-width:430px) {
  .filter-panel { padding:14px 14px 6px; }
  .strip-label,
  .facet-label { width:64px; flex-basis:64px; }
}
</style>
