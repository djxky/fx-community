<script setup>
import { computed, ref } from 'vue'
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

const MODE_OPTIONS = [
  { key: 'follow', label: '关注' },
  { key: 'recommend', label: '推荐' },
]

const activeMode = ref('recommend')
const activeScene = ref('all')
const activeTask = ref('all')
const activeSubject = ref('all')
const activeStage = ref('all')

const FOLLOW_POSTS = FEED.map((item) => {
  const resource = item.resource
  return {
    to: resource.to || 'res',
    cover: resource.cover,
    badge: resource.meta?.split(' · ')[0] || '资源',
    author: item.actor,
    avatar: item.mark || item.actor.slice(0, 1),
    role: item.orgType || (item.expert ? '认证名师' : '关注作者'),
    verify: item.expert ? 'expert' : '',
    title: resource.title,
    proof: null,
    meta: resource.meta,
    verified: false,
    evi: { use: resource.use, adapt: '', star: resource.save },
    scene: resource.scene,
    task: resource.task,
    subject: resource.subject,
    stage: resource.stage,
    form: resource.form,
  }
})

const basePosts = computed(() => activeMode.value === 'follow' ? FOLLOW_POSTS : POSTS)
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
  resetAdvancedFilters()
}

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
        <div class="tbar">
          <div class="tbar-in">
            <div class="tbar-tabs">
              <span class="tbtab nav-rank">排行榜</span>
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
            <div class="toolbar-primary">
              <div class="primary-tabs" role="tablist" aria-label="灵感分类">
                <button
                  v-for="tab in primaryTabs"
                  :key="tab.key"
                  type="button"
                  class="primary-tab"
                  :class="{ on: activePrimaryTab === tab.key }"
                  role="tab"
                  :aria-selected="activePrimaryTab === tab.key"
                  @click="selectPrimaryTab(tab.key)"
                >{{ tab.label }}</button>
              </div>
            </div>

            <div v-if="activeScene !== 'all'" id="discover-advanced-filters" class="filter-panel">
              <div v-if="taskOptions.length" class="task-strip" aria-label="具体场景">
                <span class="strip-label">具体场景</span>
                <div class="facet-options">
                  <button
                    v-for="task in taskOptions"
                    :key="task.key"
                    type="button"
                    class="task-button"
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
                    <button type="button" class="facet-button" :class="{ on: activeStage === 'all' }" :aria-pressed="activeStage === 'all'" @click="activeStage = 'all'">不限</button>
                    <button v-for="stage in facetOptions.stages" :key="stage" type="button" class="facet-button" :class="{ on: activeStage === stage }" :aria-pressed="activeStage === stage" @click="activeStage = stage">{{ stage }}</button>
                  </div>
                </div>
                <div class="facet-group">
                  <span class="facet-label">学科</span>
                  <div class="facet-options">
                    <button type="button" class="facet-button" :class="{ on: activeSubject === 'all' }" :aria-pressed="activeSubject === 'all'" @click="activeSubject = 'all'">不限</button>
                    <button v-for="subject in facetOptions.subjects" :key="subject" type="button" class="facet-button" :class="{ on: activeSubject === subject }" :aria-pressed="activeSubject === subject" @click="activeSubject = subject">{{ subject }}</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div v-if="activeAdvancedCount" class="result-summary" aria-live="polite">
            <span>已筛选出 {{ visiblePosts.length }} 个灵感</span>
            <button type="button" class="clear-filters" @click="resetAdvancedFilters">清除全部</button>
          </div>

          <div class="flow">
            <PostCard v-for="(post, i) in visiblePosts" :key="post.resourceId || post.title || i" :post="post" compact />
          </div>
          <div v-if="visiblePosts.length === 0" class="empty-state">
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
