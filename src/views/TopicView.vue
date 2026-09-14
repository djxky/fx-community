<script setup>
import { computed } from 'vue'
import { store } from '../store'
import { RESOURCES } from '../data/resources'
import { COVERS } from '../data/covers'
import { TOPICS } from '../data/topics'
import { albumLessons } from '../studio-albums.mjs'
import { ownerAlbumState } from '../composables/studio-albums'

// 专题来源：资源上的专题归属（TOPICS），或教师主页「我的主页」里老师自建的专题
const album = computed(() => ownerAlbumState.albums.find((a) => a.id === store.topicId) || null)
const topic = computed(() => TOPICS[store.topicId] || null)
const topicResources = computed(() => (album.value
  ? albumLessons(album.value).map((w) => ({ id: w.id, title: w.title, coverBg: w.cover, author: { name: store.currentUser.name }, stats: { use: w.use, star: w.star } }))
  : RESOURCES.filter((r) => r.topicMembership?.id === store.topicId)))
const topicTitle = computed(() => album.value?.name || topic.value?.title || topicResources.value[0]?.topicMembership?.title || '专题合集')
const topicIntro = computed(() => album.value?.intro || topic.value?.intro || '汇集同一主题下的优质资源，帮你更快找到能直接带进课堂的那一份。')
const topicAuthor = computed(() => (album.value ? { name: store.currentUser.name } : topic.value?.author || null))

function goBack() {
  store.view = store.topicReturn || 'res'
}

function fmt(n) { return Number(n || 0).toLocaleString('en-US') }
</script>

<template>
  <div id="view-topic">
    <div class="page">
      <main style="flex-grow:1;min-width:0;overflow-y:auto;height:100vh;background:#F7F7F7;">
        <div class="tp-wrap">
          <div class="tp-back" role="button" tabindex="0" data-track="/click/topicPage/back | 返回 | from#STRING" @click="goBack" @keydown.enter="goBack">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 7-7 7 7 7"></path></svg>返回
          </div>

          <div class="tp-head">
            <div class="tp-title-row">
              <div class="tp-title">{{ topicTitle }}</div>
              <span class="tp-count">共 <b>{{ topicResources.length }}</b> 个资源</span>
            </div>
            <div class="tp-sub">{{ topicIntro }}</div>
            <div
              v-if="topicAuthor"
              class="tp-author"
              :class="album ? 'nav-mypage' : 'nav-studio'"
              role="link"
              tabindex="0"
              data-track="/click/topicPage/author | 点击专题作者 | 无"
              :aria-label="`查看作者主页：${topicAuthor.name}`"
            >
              <span class="tp-av">{{ topicAuthor.name[0] }}</span>
              <span class="tp-author-nm">{{ topicAuthor.name }}</span>
            </div>
          </div>

          <div v-if="topicResources.length" class="tp-grid">
            <article
              v-for="r in topicResources"
              :key="r.id"
              class="tp-card"
              :class="{ 'nav-res': album }"
              :data-resource-id="album ? undefined : r.id"
              role="link"
              tabindex="0"
              :aria-label="`查看资源：${r.title}`"
            >
              <div class="tp-cover">
                <div v-if="r.coverBg" class="tp-cover-fill" :style="{ background: r.coverBg }"></div>
                <img v-else :src="r.cover || COVERS[0]" :alt="`${r.title}封面`" loading="lazy" />
              </div>
              <div class="tp-card-body">
                <div class="tp-card-title">{{ r.title }}</div>
                <div class="tp-card-foot">
                  <span class="tp-av">{{ (r.author?.name || '')[0] }}</span>
                  <span class="tp-nm">{{ r.author?.name }}</span>
                  <span class="tp-metric"><b>{{ fmt(r.stats?.use) }}</b> 使用 · <b>{{ fmt(r.stats?.star) }}</b> 收藏</span>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="tp-empty">这个专题暂时还没有资源。</div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.tp-wrap { max-width: 1180px; margin: 0 auto; padding: 24px 32px 60px; }
.tp-back { display: inline-flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 500; color: #141F1B; cursor: pointer; margin-bottom: 16px; }
.tp-head { margin-bottom: 24px; }
.tp-title-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.tp-title { font-size: 22px; font-weight: 700; color: #141F1B; }
.tp-count { flex-shrink: 0; white-space: nowrap; font-size: 13.5px; color: #7A7C7C; }
.tp-count b { color: #141F1B; font-weight: 700; }
.tp-author { display: inline-flex; align-items: center; gap: 7px; margin-top: 12px; font-size: 13px; cursor: pointer; }
.tp-author-nm { font-weight: 600; color: #3A423E; }
.tp-author:hover .tp-author-nm { color: #141F1B; text-decoration: underline; text-underline-offset: 3px; }
.tp-sub { font-size: 13.5px; color: #7A7C7C; margin-top: 8px; line-height: 1.6; max-width: 680px; }

.tp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(248px, 1fr)); gap: 18px; }
.tp-card { background: #fff; border: 1px solid #EAEDEB; border-radius: 14px; overflow: hidden; cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
.tp-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px -12px rgba(16,35,28,.24); border-color: #DfE4E1; }
.tp-cover { position: relative; aspect-ratio: 16 / 10; background: #EDEFEE; }
.tp-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tp-cover-fill { width: 100%; height: 100%; }
.tp-card-body { padding: 12px 14px 14px; }
.tp-card-title { font-size: 15px; font-weight: 700; color: #10231C; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 42px; }
.tp-card-foot { display: flex; align-items: center; gap: 7px; margin-top: 12px; font-size: 12px; color: #6A736E; }
.tp-av { width: 22px; height: 22px; border-radius: 50%; background: #E7EEEA; color: #2E5C48; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.tp-nm { font-weight: 600; color: #3A423E; }
.tp-metric { margin-left: auto; color: #9AA19E; white-space: nowrap; }
.tp-metric b { color: #3A423E; font-weight: 700; }
.tp-empty { padding: 60px 0; text-align: center; color: #9AA19E; font-size: 14px; }
</style>
