<script setup>
import { computed, ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import PostCard from '../components/PostCard.vue'
import { POSTS } from '../data/discover'
import { FEED } from '../data/feed'
import { LOCAL_POSTS } from '../data/local'

const SOURCE_CHIPS = [
  { key: 'recommend', label: '推荐' },
  { key: 'follow', label: '关注' },
  { key: 'local', label: '本地' },
]
const TYPE_CHIPS = [
  { key: 'all', label: '全部' },
  { key: 'interactive', label: '互动课件' },
  { key: 'game', label: '教学游戏' },
  { key: 'app', label: '应用' },
  { key: 'skill', label: '技能' },
  { key: 'lesson', label: '教案' },
  { key: 'question', label: '题单' },
]
const activeSource = ref('recommend')
const activeType = ref('all')

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
  }
})

const LOCAL_RESOURCE_POSTS = LOCAL_POSTS.map((post) => ({
  to: 'res',
  cover: post.cover,
  badge: post.badge,
  region: '北京 · 同城',
  author: post.author,
  avatar: post.avatar,
  role: post.role,
  verify: post.verify,
  title: post.title,
  proof: null,
  meta: post.meta,
  verified: false,
  evi: { use: post.use, adapt: post.adapt, star: post.star },
  resourceId: post.resourceId,
}))

const sourcePosts = computed(() => ({
  recommend: POSTS,
  follow: FOLLOW_POSTS,
  local: LOCAL_RESOURCE_POSTS,
}[activeSource.value]))

const TYPE_RULES = {
  interactive: /互动课件|互动|课件/,
  game: /教学游戏|游戏化|游戏/,
  app: /应用/,
  skill: /技能|Skill/i,
  lesson: /教案|课例/,
  question: /题单/,
}

const visiblePosts = computed(() => {
  if (activeType.value === 'all') return sourcePosts.value
  const rule = TYPE_RULES[activeType.value]
  return sourcePosts.value.filter((post) => rule.test(`${post.badge} ${post.meta}`))
})

function selectSource(source) {
  activeSource.value = source
  activeType.value = 'all'
}
</script>

<template>
  <div id="view-discover">
    <div class="page">
      <Sidebar active="community" />
      <main style="flex-grow:1; min-width:0; overflow-y:auto; height:100vh;">
        <!-- 顶栏 -->
        <div class="tbar">
          <div class="tbar-in">
            <div class="tbar-tabs">
              <span class="tbtab nav-rank">排行榜</span>
              <span class="tbtab on nav-discover">发现</span>
            </div>
            <div class="tbar-right">
              <div class="tbar-subj" title="切换学科·学段(通常不常改)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 00-2 2z"></path><path d="M19 3v18"></path></svg>
                语文 · 初中
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
              </div>
              <div class="tbar-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
                搜知识点、课型、课件、教案…
              </div>
            </div>
          </div>
        </div>

        <!-- 发现 -->
        <div id="disc-body" class="discover-body">
          <div class="filter-group source-filter" aria-label="来源筛选">
            <span class="filter-label">来源</span>
            <button v-for="chip in SOURCE_CHIPS" :key="chip.key" class="tchip2" :class="{ on: activeSource === chip.key }" type="button" @click="selectSource(chip.key)">
              {{ chip.label }}
            </button>
          </div>

          <div v-if="activeSource === 'local'" class="local-context">
            <span>北京 · 同城资源</span>
            <button type="button">切换城市</button>
          </div>

          <div class="filter-group type-filter" aria-label="资源类型筛选">
            <span class="filter-label">类型</span>
            <button v-for="chip in TYPE_CHIPS" :key="chip.key" class="tchip2" :class="{ on: activeType === chip.key }" type="button" @click="activeType = chip.key">
              {{ chip.label }}
            </button>
          </div>

          <div class="flow">
            <PostCard v-for="(post, i) in visiblePosts" :key="post.resourceId || post.title || i" :post="post" />
          </div>
          <div v-if="visiblePosts.length === 0" class="empty-state">该来源下暂无此类型资源</div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.tbar { background:#fff; border-bottom:1px solid #EFEFEF; height:54px; display:flex; align-items:stretch; padding:0 32px; }
.tbar-in { display:flex; align-items:stretch; justify-content:space-between; width:100%; }
.tbar-tabs { display:flex; align-items:stretch; gap:26px; }
.tbar-right { display:flex; align-items:center; gap:12px; align-self:center; }
.tbar-subj { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:#141F1B; padding:8px 12px; border:1px solid #ECECEC; border-radius:10px; cursor:pointer; white-space:nowrap; }
.tbar-subj:hover { background:#F6F6F6; }
.tbar-search { display:flex; align-items:center; gap:8px; background:#F6F6F6; border:1px solid #ECECEC; border-radius:10px; padding:9px 14px; width:260px; font-size:13px; color:#9A9A9A; }

.discover-body { padding:24px 32px 48px; }
.filter-group { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.source-filter { margin-bottom:12px; }
.type-filter { margin-bottom:28px; }
.filter-label { width:32px; flex:0 0 32px; color:#7A7C7C; font-size:13px; }
.tchip2 { border:none; }
.local-context { display:flex; align-items:center; justify-content:space-between; margin:2px 0 14px; padding:11px 14px; background:#FAFAF8; border:1px solid #EFEFEF; border-radius:10px; color:#7A7C7C; font-size:13px; }
.local-context button { border:1px solid #D4D4D4; border-radius:8px; padding:5px 11px; background:#fff; color:#141F1B; font-size:12px; cursor:pointer; }
.empty-state { padding:56px 0; color:#9A9A9A; font-size:13px; text-align:center; }

.flow { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; }
@media (max-width:1180px){ .flow { grid-template-columns:repeat(2, 1fr); } }
</style>
