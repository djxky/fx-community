<script setup>
import { computed, ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import PublishFlow from '../components/PublishFlow.vue'
import { COVERS } from '../data/covers'
import { RESOURCES_BY_ID } from '../data/resources'
import { store } from '../store'

const tabs = [
  { id: 'generated', label: '我的生成' },
  { id: 'favorites', label: '我的收藏' },
  { id: 'drive', label: '我的云盘', locked: true },
]
const filters = ['全部', '课件', '应用', '技能']
const activeTab = ref('generated')
const activeFilter = ref('全部')
const openMenuId = ref('')
const toast = ref('')
const publishItemId = ref('')

const coverById = {
  'res-xianglin': COVERS[0],
  'res-xl-zhoutao': COVERS[0],
  'res-xl-limin': COVERS[0],
  'res-xl-l2': COVERS[0],
  'res-solid': COVERS[6],
  'res-cylinder': COVERS[3],
  'res-skill-zuowen': COVERS[2],
  'res-skill-fenceng': COVERS[5],
  'res-order-game': COVERS[4],
}

// 页面只组织“我的”归属，资源身份、作者与统计统一取 §8.4 数据字典。
const libraryItems = [
  { id: 'generated-skill', resourceId: 'res-skill-zuowen', bucket: 'generated', operation: 'AI 生成', category: '技能', status: 'draft' },
  { id: 'generated-copy', resourceId: 'res-order-game', bucket: 'generated', operation: '保存副本', category: '应用', status: 'draft' },
  { id: 'generated-zhou', resourceId: 'res-xl-zhoutao', bucket: 'generated', operation: '我的改编', category: '课件', status: 'published', originId: 'res-xianglin' },
  { id: 'generated-li', resourceId: 'res-xl-limin', bucket: 'generated', operation: '我的改编', category: '课件', status: 'published', originId: 'res-xianglin' },
  { id: 'favorite-mother', resourceId: 'res-xianglin', bucket: 'favorites', operation: '已收藏', category: '课件', status: 'published' },
  { id: 'favorite-solid', resourceId: 'res-solid', bucket: 'favorites', operation: '已收藏', category: '课件', status: 'published' },
  { id: 'favorite-skill', resourceId: 'res-skill-fenceng', bucket: 'favorites', operation: '已收藏', category: '技能', status: 'published' },
]

const visibleItems = computed(() => {
  if (activeTab.value === 'drive') return []
  return libraryItems
    .filter((item) => item.bucket === activeTab.value)
    .filter((item) => activeFilter.value === '全部' || item.category === activeFilter.value)
})

const selectedPublishItem = computed(() => libraryItems.find((item) => item.id === publishItemId.value) || null)

function resourceFor(item) {
  return RESOURCES_BY_ID[item.resourceId]
}

function parentFor(item) {
  return item.originId ? RESOURCES_BY_ID[item.originId] : null
}

function formatCount(value) {
  return Number(value).toLocaleString('en-US')
}

function titleFor(item) {
  return item.publishedTitle || resourceFor(item).title
}

function statsFor(item) {
  return item.publishedStats || resourceFor(item).stats
}

function openPublish(item) {
  openMenuId.value = ''
  publishItemId.value = item.id
}

function closePublish() {
  publishItemId.value = ''
}

function handlePublished(payload) {
  const item = selectedPublishItem.value
  if (!item) return
  item.status = 'published'
  item.operation = '已发布'
  item.publishedTitle = payload.title
  item.publishedStats = { use: 0, adapt: 0, star: 0 }
  store.publishedEvents.unshift({
    id: `published-${item.id}-${Date.now()}`,
    actor: '樱桃小魔丸子',
    actorType: 'person',
    mark: '樱',
    action: item.originId ? '发布了改编版' : '发布了资源',
    icon: '＋',
    time: '刚刚',
    text: payload.description,
    resource: {
      to: 'res',
      resourceId: item.resourceId,
      title: payload.title,
      meta: `${payload.fit.subject} · ${payload.fit.grade} · ${payload.fit.textbook} · ${payload.fit.lessonType}`,
      cover: coverById[item.resourceId],
      use: '0',
      save: '0',
    },
    interactions: { like: '0', comment: '0' },
  })
  closePublish()
  toast.value = '已发布到社区，作品已回到我的生成'
  window.setTimeout(() => { toast.value = '' }, 2200)
}

function placeholderAction(label) {
  openMenuId.value = ''
  toast.value = `${label}将在后续版本开放`
  window.setTimeout(() => { toast.value = '' }, 1800)
}
</script>

<template>
  <div id="view-mylib">
    <div class="page">
      <Sidebar active="mylib" />
      <main class="ml-main">
        <div class="ml-wrap">
          <div class="ml-kicker">我的空间 · 社区升级</div>
          <div class="ml-head">
            <div>
              <h1>我的知识库</h1>
              <p>把生成、收藏和改编过的好课，放在一个地方继续生长。</p>
            </div>
            <div class="ml-summary">
              <div><b>4</b><span>我的生成</span></div>
              <div><b>3</b><span>我的收藏</span></div>
              <div><b>2</b><span>社区改编</span></div>
            </div>
          </div>

          <div class="ml-tabs" role="tablist" aria-label="知识库分类">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="ml-tab"
              :class="{ on: activeTab === tab.id, locked: tab.locked }"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.id"
              @click="activeTab = tab.id; openMenuId = ''"
            >
              <span>{{ tab.label }}</span><span v-if="tab.locked" aria-hidden="true">🔒</span>
            </button>
          </div>

          <template v-if="activeTab !== 'drive'">
            <div class="ml-toolbar">
              <div class="ml-toolbar-title">{{ activeTab === 'generated' ? '我做过的作品' : '我收藏的作品' }}</div>
              <div class="ml-filters" role="group" aria-label="资源类型筛选">
                <button
                  v-for="filter in filters"
                  :key="filter"
                  class="ml-filter"
                  :class="{ on: activeFilter === filter }"
                  type="button"
                  @click="activeFilter = filter"
                >{{ filter }}</button>
              </div>
            </div>

            <div v-if="visibleItems.length" class="ml-grid">
              <article v-for="item in visibleItems" :key="item.id" class="ml-card">
                <div class="ml-cover" :data-resource-id="item.status === 'published' ? item.resourceId : null">
                  <img :src="coverById[item.resourceId]" :alt="`${resourceFor(item).title}封面`" loading="lazy" />
                  <span class="ml-type">{{ item.category }}</span>
                  <span class="ml-status" :class="item.status">{{ item.status === 'published' ? '已发布' : '未发布' }}</span>
                </div>
                <div class="ml-card-body">
                  <div class="ml-title-row">
                    <h2>{{ titleFor(item) }}</h2>
                    <div class="ml-menu-wrap">
                      <button class="ml-more" type="button" aria-label="更多操作" @click.stop="openMenuId = openMenuId === item.id ? '' : item.id">•••</button>
                      <div v-if="openMenuId === item.id" class="ml-menu" role="menu">
                        <button type="button" role="menuitem" @click.stop="openPublish(item)">发布到社区</button>
                        <button v-if="item.originId" type="button" role="menuitem" @click.stop="placeholderAction('把改进提给原作者')">把改进提给原作者</button>
                      </div>
                    </div>
                  </div>
                  <div class="ml-operation">{{ item.operation }}</div>
                  <div v-if="parentFor(item)" class="ml-origin">
                    <span>改编自</span>
                    <button class="ml-origin-link" type="button" :data-resource-id="item.originId">{{ parentFor(item).author.name }}</button>
                  </div>
                  <div class="ml-author">
                    <span class="ml-avatar">{{ resourceFor(item).author.name.slice(0, 1) }}</span>
                    <span>{{ resourceFor(item).author.name }}</span>
                    <span class="ml-kind">· {{ resourceFor(item).kind }}</span>
                  </div>
                  <div class="ml-foot">
                    <span><b>{{ formatCount(statsFor(item).use) }}</b> 使用</span>
                    <span><b>{{ formatCount(statsFor(item).star) }}</b> 收藏</span>
                    <button v-if="item.status === 'published'" class="ml-detail-link" type="button" :data-resource-id="item.resourceId">社区详情 ›</button>
                    <span v-else class="ml-private">私人草稿</span>
                  </div>
                </div>
              </article>
            </div>
            <div v-else class="ml-empty-filter">这个类型暂时还没有作品</div>
          </template>

          <div v-else class="ml-drive-empty">
            <div class="ml-drive-icon">🔒</div>
            <h2>我的云盘暂未开放</h2>
            <p>这里会保存你的私有素材。社区首版先保留入口，不开放云盘读写。</p>
            <span>私有空间 · 敬请期待</span>
          </div>
        </div>
      </main>
    </div>
    <PublishFlow
      v-if="selectedPublishItem"
      :item="selectedPublishItem"
      :resource="resourceFor(selectedPublishItem)"
      :origin="parentFor(selectedPublishItem)"
      @close="closePublish"
      @published="handlePublished"
    />
    <div v-if="toast" class="ml-toast" role="status">{{ toast }}</div>
  </div>
</template>

<style scoped>
.ml-main { flex-grow:1; min-width:0; overflow-y:auto; height:100vh; background:#F7F7F7; }
.ml-wrap { width:100%; max-width:1180px; margin:0 auto; padding:32px 32px 72px; }
.ml-kicker { color:#8A6D00; font-size:12px; font-weight:700; letter-spacing:1.5px; }
.ml-head { display:flex; align-items:flex-end; justify-content:space-between; gap:28px; margin-top:8px; }
.ml-head h1 { margin:0; color:#141F1B; font-size:28px; line-height:1.25; letter-spacing:-.5px; }
.ml-head p { margin:9px 0 0; color:#7A7C7C; font-size:14px; }
.ml-summary { display:flex; gap:24px; flex-shrink:0; }
.ml-summary div { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
.ml-summary b { color:#141F1B; font-size:20px; line-height:1; }
.ml-summary span { color:#9A9A9A; font-size:11px; }
.ml-tabs { display:flex; gap:28px; margin-top:30px; border-bottom:1px solid #E6E6E4; }
.ml-tab { position:relative; display:inline-flex; align-items:center; gap:4px; border:0; border-bottom:2px solid transparent; margin-bottom:-1px; padding:0 0 12px; background:none; color:#9A9A9A; font-size:15px; cursor:pointer; }
.ml-tab.on { border-bottom-color:#141F1B; color:#141F1B; font-weight:700; }
.ml-tab.locked { color:#B6B8B6; }
.ml-tab.locked.on { border-bottom-color:#B6B8B6; color:#7A7C7C; }
.ml-toolbar { display:flex; align-items:center; justify-content:space-between; gap:20px; margin:24px 0 16px; }
.ml-toolbar-title { color:#141F1B; font-size:16px; font-weight:700; }
.ml-filters { display:flex; gap:8px; }
.ml-filter { border:1px solid #E3E4E3; border-radius:999px; padding:6px 14px; background:#fff; color:#7A7C7C; font-size:12.5px; cursor:pointer; }
.ml-filter.on { border-color:#141F1B; background:#141F1B; color:#fff; font-weight:600; }
.ml-grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:18px; align-items:stretch; }
.ml-card { display:flex; flex-direction:column; min-width:0; overflow:hidden; border:1px solid #ECECEC; border-radius:16px; background:#fff; box-shadow:0 1px 2px rgba(20,16,10,.03); transition:transform .15s ease, box-shadow .15s ease; }
.ml-card:hover { transform:translateY(-2px); box-shadow:0 12px 30px rgba(20,16,10,.08); }
.ml-cover { position:relative; aspect-ratio:16/9; overflow:hidden; background:#EFEFEF; cursor:pointer; }
.ml-cover img { width:100%; height:100%; display:block; object-fit:cover; }
.ml-type, .ml-status { position:absolute; top:10px; border-radius:7px; padding:3px 9px; font-size:11px; font-weight:600; }
.ml-type { left:10px; background:rgba(20,31,27,.86); color:#fff; }
.ml-status { right:10px; border:1px solid #FBEFC6; background:#FFF6DF; color:#8A6D00; }
.ml-status.draft { border-color:#E7E7E5; background:rgba(255,255,255,.94); color:#7A7C7C; }
.ml-card-body { display:flex; flex:1; flex-direction:column; min-width:0; padding:15px 16px 14px; }
.ml-title-row { display:flex; align-items:flex-start; gap:8px; min-height:45px; }
.ml-title-row h2 { flex:1; min-width:0; margin:0; color:#141F1B; font-size:15px; font-weight:700; line-height:1.5; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; }
.ml-menu-wrap { position:relative; flex-shrink:0; }
.ml-more { border:0; padding:0 2px; background:none; color:#9A9A9A; font-size:15px; line-height:1; letter-spacing:2px; cursor:pointer; }
.ml-more:hover { color:#141F1B; }
.ml-menu { position:absolute; z-index:5; top:22px; right:0; width:150px; padding:5px; border:1px solid #E3E4E3; border-radius:10px; background:#fff; box-shadow:0 10px 24px rgba(20,31,27,.12); }
.ml-menu button { display:block; width:100%; border:0; border-radius:7px; padding:8px 9px; background:#fff; color:#141F1B; text-align:left; font-size:12px; cursor:pointer; }
.ml-menu button:hover { background:#F6F6F6; }
.ml-operation { display:inline-flex; align-self:flex-start; margin-top:7px; border-radius:6px; padding:2px 7px; background:#F6F6F6; color:#7A7C7C; font-size:11px; }
.ml-origin { display:flex; align-items:center; gap:4px; min-width:0; margin-top:11px; color:#9A9A9A; font-size:12px; }
.ml-origin-link { overflow:hidden; border:0; padding:0; background:none; color:#8A6D00; font-size:12px; text-overflow:ellipsis; white-space:nowrap; cursor:pointer; }
.ml-origin-link:hover, .ml-detail-link:hover { text-decoration:underline; }
.ml-author { display:flex; align-items:center; min-width:0; gap:6px; margin-top:12px; color:#141F1B; font-size:12px; }
.ml-avatar { display:inline-flex; align-items:center; justify-content:center; width:21px; height:21px; flex-shrink:0; border-radius:50%; background:#ECECEC; color:#141F1B; font-size:10px; font-weight:600; }
.ml-kind { overflow:hidden; color:#9A9A9A; text-overflow:ellipsis; white-space:nowrap; }
.ml-foot { display:flex; align-items:center; flex-wrap:wrap; gap:10px; margin-top:auto; padding-top:14px; border-top:1px solid #F0F0EE; color:#9A9A9A; font-size:11.5px; }
.ml-foot b { color:#141F1B; font-weight:700; }
.ml-detail-link { margin-left:auto; border:0; padding:0; background:none; color:#8A6D00; font-size:11.5px; cursor:pointer; }
.ml-private { margin-left:auto; color:#9A9A9A; }
.ml-empty-filter, .ml-drive-empty { border:1px solid #ECECEC; border-radius:16px; background:#fff; color:#9A9A9A; text-align:center; }
.ml-empty-filter { padding:52px 20px; font-size:13px; }
.ml-drive-empty { display:flex; flex-direction:column; align-items:center; margin-top:28px; padding:78px 24px; }
.ml-drive-icon { display:flex; align-items:center; justify-content:center; width:58px; height:58px; border:1px solid #FBEFC6; border-radius:18px; background:#FFF6DF; font-size:25px; }
.ml-drive-empty h2 { margin:17px 0 0; color:#141F1B; font-size:18px; }
.ml-drive-empty p { max-width:420px; margin:8px 0 0; color:#9A9A9A; font-size:13px; line-height:1.7; }
.ml-drive-empty span { margin-top:18px; color:#8A6D00; font-size:12px; }
.ml-toast { position:fixed; left:50%; bottom:28px; z-index:30; transform:translateX(-50%); padding:9px 14px; border:1px solid #E3E4E3; border-radius:9px; background:#141F1B; color:#fff; font-size:12px; box-shadow:0 8px 22px rgba(20,31,27,.18); }
@media (max-width:900px) { .ml-head { align-items:flex-start; flex-direction:column; } .ml-summary { align-self:flex-start; } .ml-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); } }
@media (max-width:620px) { .ml-wrap { padding-inline:20px; } .ml-toolbar { align-items:flex-start; flex-direction:column; } .ml-filters { flex-wrap:wrap; } .ml-grid { grid-template-columns:1fr; } }
</style>
