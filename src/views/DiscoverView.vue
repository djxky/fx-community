<script setup>
import { computed, ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import PostCard from '../components/PostCard.vue'
import { POSTS } from '../data/discover'
import { FEED } from '../data/feed'

const FILTER_CHIPS = [
  { key: 'follow', label: '关注' },
  { key: 'recommend', label: '推荐' },
  { key: '语文', label: '语文' },
  { key: '数学', label: '数学' },
  { key: '英语', label: '英语' },
  { key: '物理', label: '物理' },
  { key: '化学', label: '化学' },
  { key: '信息科技', label: '信息科技' },
]
const activeFilter = ref('recommend')

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

const visiblePosts = computed(() => {
  if (activeFilter.value === 'follow') return FOLLOW_POSTS
  if (activeFilter.value === 'recommend') return POSTS
  return POSTS.filter((post) => `${post.badge} ${post.meta}`.includes(activeFilter.value))
})
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
              <div class="tbar-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
                搜知识点、课型、课件、教案…
              </div>
            </div>
          </div>
        </div>

        <!-- 发现 -->
        <div id="disc-body" class="discover-body">
          <div class="filter-group discover-filter" aria-label="发现分类">
            <button v-for="chip in FILTER_CHIPS" :key="chip.key" class="tchip2" :class="{ on: activeFilter === chip.key }" type="button" @click="activeFilter = chip.key">
              {{ chip.label }}
            </button>
          </div>

          <div class="flow">
            <PostCard v-for="(post, i) in visiblePosts" :key="post.resourceId || post.title || i" :post="post" />
          </div>
          <div v-if="visiblePosts.length === 0" class="empty-state">该分类下暂无资源</div>
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
.tbar-search { display:flex; align-items:center; gap:8px; background:#F6F6F6; border:1px solid #ECECEC; border-radius:10px; padding:9px 14px; width:260px; font-size:13px; color:#9A9A9A; }

.discover-body { padding:24px 32px 48px; }
.filter-group { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.discover-filter { margin-bottom:28px; }
.tchip2 { border:none; }
.empty-state { padding:56px 0; color:#9A9A9A; font-size:13px; text-align:center; }

.flow { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; }
@media (max-width:1180px){ .flow { grid-template-columns:repeat(2, 1fr); } }
</style>
