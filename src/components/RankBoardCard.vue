<script setup>
import { ref, computed } from 'vue'
import { formatCount } from '../lib/format-count.mjs'

const props = defineProps({
  board: { type: Object, required: true },
  period: { type: String, default: '本周' },
  subject: { type: String, default: '全部' },
  variant: { type: String, default: 'compact' },
})

const showAll = ref(false)
const compactExpanded = ref(false)

const filteredItems = computed(() => {
  if (props.subject === '全部') return props.board.items
  return props.board.items.filter(item => item.subject === props.subject || String(item.sub || '').startsWith(`${props.subject} ·`))
})

// 主榜：前 3 名重点位（金银铜），其余两列平铺、不标号、不展开
const podiumItems = computed(() => filteredItems.value.slice(0, 3))
const restItems = computed(() => filteredItems.value.slice(3, 9))

// 创作者 compact：默认 6 条，可展开
const compactItems = computed(() => (compactExpanded.value ? filteredItems.value : filteredItems.value.slice(0, 6)))
const compactHidden = computed(() => Math.max(filteredItems.value.length - 6, 0))

// A 焦点大卡 / C 紧凑榜单 的取数：
// creator-card = 纯大卡；creator-main = 前 3 大卡 + 其余紧凑行；chart = 纯紧凑行
const cardItems = computed(() => {
  if (props.variant === 'creator-card') return filteredItems.value.slice(0, 6)
  if (props.variant === 'creator-main') return filteredItems.value.slice(0, 3)
  return []
})
const chartOffset = computed(() => (props.variant === 'creator-main' ? 3 : 0))
const chartItems = computed(() => {
  if (props.variant === 'chart') return filteredItems.value.slice(0, 8)
  if (props.variant === 'creator-main') return filteredItems.value.slice(3, 9)
  return []
})

function itemTitle(item) {
  return item.workTitle || item.name
}

function itemAuthor(item) {
  return item.author || item.name
}

function itemKind(item) {
  return item.kind || item.sub
}
</script>

<template>
  <article class="rank-board" :class="[`rank-${variant}-board`, `rank-${board.key}-board`]">
    <header v-if="variant === 'compact'" class="rank-board-head">
      <div class="rank-board-title"><span v-if="board.hot" class="rank-board-mark">●</span>{{ board.title }}</div>
      <span class="rank-board-period">{{ period }} · {{ variant === 'creator' ? board.metricLabel : board.period }}</span>
    </header>

    <div v-if="filteredItems.length === 0" class="rank-empty" role="status">
      <strong>{{ subject }}学科暂未上榜</strong>
      <span>换个学科看看本期内容</span>
    </div>

    <!-- A 焦点大卡（创作者版）+ C 紧凑榜单，按 variant 决定各渲染多少条 -->
    <template v-else-if="variant === 'creator-card' || variant === 'creator-main' || variant === 'chart'">
      <div v-if="cardItems.length" class="rank-creator-grid">
        <article v-for="(it, i) in cardItems" :key="it.rankKey || it.resourceId || it.name" class="rank-creator-card nav-res" :data-resource-id="it.resourceId" data-track="/click/rankPage/boardItem | 点击榜单条目 | boardName#STRING,resourceId#STRING,position#INT" tabindex="0" role="button">
          <div class="rank-creator-head">
            <span class="rank-avatar rank-creator-avatar"><img v-if="it.portrait" :src="it.portrait" alt="" /><b v-else>{{ it.initial }}</b></span>
            <div class="rank-creator-headtext">
              <span class="rank-creator-name">{{ itemAuthor(it) }}</span>
              <span class="rank-creator-stats"><b>{{ formatCount(it.metric) }}</b> {{ board.metricLabel }}<template v-if="it.metricNote"> · {{ it.metricNote }}</template></span>
            </div>
          </div>
          <div class="rank-creator-media">
            <img :src="it.cover" :alt="itemTitle(it) + '封面'" />
          </div>
          <h3 class="rank-creator-caption">{{ itemTitle(it) }}</h3>
        </article>
      </div>

      <!-- C 紧凑榜单：序号 + 作品封面 + 作品名 + 创作者署名 + 数据，两列密排。
           点击目标是资源详情，故资源为视觉主体，创作者只作署名。 -->
      <div v-if="chartItems.length" class="rank-chart rank-chart-2col" :class="{ 'rank-chart-after-cards': cardItems.length }">
        <div v-for="(it, i) in chartItems" :key="it.rankKey || it.resourceId || it.name" class="rank-chart-row nav-res" :data-resource-id="it.resourceId" data-track="/click/rankPage/boardItem | 点击榜单条目 | boardName#STRING,resourceId#STRING,position#INT" tabindex="0" role="button">
          <span class="rank-chart-thumb"><img :src="it.cover" :alt="itemTitle(it) + '封面'" /></span>
          <span class="rank-chart-copy">
            <strong>{{ itemTitle(it) }}</strong>
            <small><span class="rank-avatar rank-avatar-xs"><img v-if="it.portrait" :src="it.portrait" alt="" /><b v-else>{{ it.initial }}</b></span>{{ itemAuthor(it) }}</small>
          </span>
          <span class="rank-chart-metric"><b>{{ formatCount(it.metric) }}</b><small>{{ board.metricLabel }}</small></span>
        </div>
      </div>
    </template>

    <!-- 主榜：三名重点位 + 两列密集列表 -->
    <template v-else-if="variant === 'main'">
      <div class="rank-podium">
        <article v-for="(it, i) in podiumItems" :key="it.rankKey || it.resourceId || it.name" class="rank-podium-card nav-res" :data-resource-id="it.resourceId" data-track="/click/rankPage/boardItem | 点击榜单条目 | boardName#STRING,resourceId#STRING,position#INT" tabindex="0" role="button">
          <div class="rank-podium-media">
            <img :src="it.cover" :alt="itemTitle(it) + '封面'" />
          </div>
          <div class="rank-podium-body">
            <h3>{{ itemTitle(it) }}</h3>
            <p v-if="it.blurb" class="rank-podium-blurb">{{ it.blurb }}</p>
            <div class="rank-podium-foot">
              <span class="rank-mini-author"><span class="rank-avatar"><img v-if="it.portrait" :src="it.portrait" alt="" /><b v-else>{{ it.initial }}</b></span>{{ itemAuthor(it) }}</span>
              <span class="rank-podium-metric"><b>{{ formatCount(it.metric) }}</b><small>{{ board.metricLabel }}</small></span>
            </div>
          </div>
        </article>
      </div>

      <div v-if="restItems.length" class="rank-list rank-list-2col">
        <div v-for="it in restItems" :key="it.rankKey || it.resourceId || it.name" class="rank-list-row nav-res" :data-resource-id="it.resourceId" data-track="/click/rankPage/boardItem | 点击榜单条目 | boardName#STRING,resourceId#STRING,position#INT" tabindex="0" role="button">
          <span class="rank-list-thumb"><img :src="it.cover" :alt="itemTitle(it) + '封面'" /></span>
          <span class="rank-list-copy">
            <strong>{{ itemTitle(it) }}</strong>
            <span v-if="it.blurb" class="rank-list-blurb">{{ it.blurb }}</span>
            <span class="rank-list-meta">
              <span class="rank-list-author"><span class="rank-avatar rank-avatar-xs"><img v-if="it.portrait" :src="it.portrait" alt="" /><b v-else>{{ it.initial }}</b></span>{{ itemAuthor(it) }}</span>
            </span>
          </span>
          <span class="rank-list-metric"><b>{{ formatCount(it.metric) }}</b><small>{{ board.metricLabel }}</small><small v-if="it.metricNote" class="rank-metric-note">{{ it.metricNote }}</small></span>
        </div>
      </div>
    </template>

    <!-- 资源网格（每周热门）：web 端自然换行，无横滑 -->
    <template v-else-if="variant === 'grid'">
      <div class="rank-grid">
        <article v-for="(it, i) in filteredItems.slice(0, 6)" :key="it.rankKey || it.resourceId || it.name" class="rank-grid-card nav-res" :data-resource-id="it.resourceId" data-track="/click/rankPage/boardItem | 点击榜单条目 | boardName#STRING,resourceId#STRING,position#INT" tabindex="0" role="button">
          <div class="rank-grid-media">
            <img :src="it.cover" :alt="itemTitle(it) + '封面'" />
          </div>
          <div class="rank-grid-body">
            <h3>{{ itemTitle(it) }}</h3>
            <div class="rank-grid-foot">
              <span class="rank-mini-author"><span class="rank-avatar rank-avatar-xs"><img v-if="it.portrait" :src="it.portrait" alt="" /><b v-else>{{ it.initial }}</b></span>{{ itemAuthor(it) }}</span>
              <strong>{{ formatCount(it.metric) }}<small>{{ board.metricLabel }}</small></strong>
            </div>
          </div>
        </article>
      </div>
    </template>

    <!-- 改编卡（优质改编）：3 列，突出改编脉络 -->
    <template v-else-if="variant === 'remix'">
      <div class="rank-remix">
        <article v-for="it in filteredItems.slice(0, 3)" :key="it.rankKey || it.resourceId || it.name" class="rank-remix-card nav-res" :data-resource-id="it.resourceId" data-track="/click/rankPage/boardItem | 点击榜单条目 | boardName#STRING,resourceId#STRING,position#INT" tabindex="0" role="button">
          <div class="rank-remix-media">
            <img :src="it.cover" :alt="it.name + '封面'" />
            <span class="rank-remix-eyebrow">改编脉络</span>
          </div>
          <div class="rank-remix-body">
            <h3>{{ it.name }}</h3>
            <div class="rank-remix-foot">
              <span class="rank-mini-author"><span class="rank-avatar rank-avatar-xs"><img v-if="it.portrait" :src="it.portrait" alt="" /><b v-else>{{ it.initial }}</b></span>{{ it.author }}<span v-if="it.role" class="rank-remix-role">{{ it.role }}</span></span>
              <strong>{{ formatCount(it.metric) }}<small>{{ board.metricLabel }}</small></strong>
            </div>
          </div>
        </article>
      </div>
    </template>

    <!-- 创作者 compact -->
    <template v-else>
      <div class="rank-compact-list">
        <div v-for="(it, i) in compactItems" :key="it.rankKey || it.name" class="rank-compact-row" :class="it.target === 'resource' ? 'nav-res' : 'nav-studio'" :data-resource-id="it.resourceId" data-track="/click/rankPage/boardItem | 点击榜单条目 | boardName#STRING,resourceId#STRING,position#INT" tabindex="0" role="button">
          <span class="rank-avatar rank-compact-avatar"><img v-if="it.portrait" :src="it.portrait" alt="" /><img v-else-if="it.logo" :src="it.logo" alt="" /><b v-else>{{ it.initial }}</b></span>
          <span class="rank-compact-copy"><strong>{{ it.name }}</strong><small>{{ it.sub }}</small></span>
          <span class="rank-compact-metric"><b>{{ formatCount(it.metric) }}</b><small>{{ it.unit }}</small></span>
        </div>
      </div>
      <button v-if="compactHidden > 0" type="button" class="rank-more rank-more-sm" @click="compactExpanded = !compactExpanded">
        {{ compactExpanded ? '收起' : `查看全部 ${filteredItems.length} 人` }}
      </button>
    </template>
  </article>
</template>

<style scoped>
button { font:inherit; }
.rank-board { min-width:0; background:#FFFFFF; border:1px solid #ECECEC; border-radius:var(--community-card-radius, 20px); padding:20px; color:#141F1B; box-shadow:none; }
/* 无外框版式（卡片直接落在页面底色上）：B 卡片网格、A 焦点大卡 */
.rank-grid-board, .rank-remix-board, .rank-creator-card-board { background:transparent; border:0; padding:0; box-shadow:none; }
.rank-board-head { display:flex; align-items:baseline; justify-content:space-between; gap:14px; margin-bottom:15px; }
.rank-board-title { font-size:16px; font-weight:700; letter-spacing:-.02em; }
.rank-board-period { color:#9A9A9A; font-size:11px; white-space:nowrap; }
.rank-board-mark { display:inline-block; margin-right:7px; color:#D9AF3C; font-size:11px; vertical-align:1px; }
.rank-empty { min-height:156px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:6px; box-sizing:border-box; border:1px dashed #DADBDA; border-radius:var(--community-card-radius, 20px); background:#FAFAF9; text-align:center; }
.rank-empty strong { color:#141F1B; font-size:14px; font-weight:650; }
.rank-empty span { color:#9A9A9A; font-size:12px; }

/* 三名重点位 */
.rank-podium { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--community-gap, 24px); margin-bottom:6px; }
.rank-podium-card { min-width:0; overflow:hidden; border:1px solid #ECECEC; border-radius:var(--community-card-radius, 20px); background:#FFFFFF; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease; }
.rank-podium-card:hover { transform:translateY(-2px); border-color:#D4D4D4; box-shadow:var(--fx-shadow-float); }
.rank-podium-media { position:relative; aspect-ratio:var(--community-cover-ratio, 16 / 9); overflow:hidden; border-radius:var(--community-card-radius, 20px); background:#F7F7F7; }
.rank-podium-media img { width:100%; height:100%; display:block; object-fit:cover; }
.rank-podium-kind { position:absolute; right:8px; top:8px; max-width:calc(100% - 52px); padding:4px 7px; overflow:hidden; border-radius:8px; background:rgba(20,31,27,.55); color:#FFFFFF; font-size:9px; text-overflow:ellipsis; white-space:nowrap; }
.rank-podium-body { padding:12px 16px 14px; }
.rank-podium-body h3 { margin:0 0 5px; overflow:hidden; color:#141F1B; font-size:var(--community-card-title-size, 16px); font-weight:500; line-height:22px; text-overflow:ellipsis; white-space:nowrap; }
/* 创作者榜：统一的创作者卡 —— 创作者在上（头像+人名+数据）→ 代表作封面 → 作品名 */
.rank-creator-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--community-gap, 24px); }
.rank-creator-card { min-width:0; overflow:hidden; border:1px solid #ECECEC; border-radius:var(--community-card-radius, 20px); background:#FFFFFF; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease; }
.rank-creator-card:hover { transform:translateY(-2px); border-color:#D4D4D4; box-shadow:var(--fx-shadow-float); }
.rank-creator-media { position:relative; aspect-ratio:var(--community-cover-ratio, 16 / 9); overflow:hidden; background:#F7F7F7; }
.rank-creator-media img { width:100%; height:100%; display:block; object-fit:cover; }
.rank-creator-head { display:flex; align-items:center; gap:10px; padding:13px 14px 11px; }
.rank-creator-avatar { width:40px; height:40px; flex:0 0 40px; font-size:15px; }
.rank-creator-headtext { min-width:0; flex:1 1 auto; display:flex; flex-direction:column; gap:2px; }
.rank-creator-name { overflow:hidden; color:#141F1B; font-size:15px; font-weight:650; line-height:20px; text-overflow:ellipsis; white-space:nowrap; }
.rank-creator-stats { overflow:hidden; color:#9A9A9A; font-size:12px; line-height:17px; text-overflow:ellipsis; white-space:nowrap; }
.rank-creator-stats b { color:#141F1B; font-weight:700; font-variant-numeric:tabular-nums; }
/* C 紧凑榜单：小图 + 名称 + 数据（缩略图放大到 96×60） */
.rank-chart-2col { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 22px; }
.rank-chart-after-cards { margin-top:18px; }
.rank-chart-row { display:flex; align-items:center; gap:14px; padding:10px 8px; border-top:1px solid #F1F1F1; border-radius:11px; cursor:pointer; transition:background .15s ease; }
.rank-chart-2col > .rank-chart-row:nth-child(-n+2) { border-top:0; }
.rank-chart-row:hover { background:#F7F7F7; }
.rank-chart-thumb { flex:0 0 96px; width:96px; height:60px; overflow:hidden; border-radius:10px; background:#F7F7F7; }
.rank-chart-thumb img { width:100%; height:100%; display:block; object-fit:cover; }
.rank-chart-copy { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:4px; }
.rank-chart-copy strong { overflow:hidden; color:#141F1B; font-size:14px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.rank-chart-copy small { display:flex; align-items:center; gap:5px; min-width:0; overflow:hidden; color:#7A7C7C; font-size:11px; text-overflow:ellipsis; white-space:nowrap; }
.rank-chart-metric { flex:0 0 auto; text-align:right; white-space:nowrap; }
.rank-chart-metric b { display:block; color:#141F1B; font-size:14px; font-weight:700; font-variant-numeric:tabular-nums; }
.rank-chart-metric small { display:block; margin-top:1px; color:#9A9A9A; font-size:9px; }

.rank-creator-caption { margin:0; padding:11px 16px 14px; overflow:hidden; color:#141F1B; font-size:15px; font-weight:500; line-height:21px; text-overflow:ellipsis; white-space:nowrap; }
.rank-podium-blurb { margin:0 0 10px; overflow:hidden; color:#9A9A9A; font-size:12px; line-height:18px; text-overflow:ellipsis; white-space:nowrap; }
.rank-podium-foot { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.rank-podium-metric { flex:0 0 auto; text-align:right; white-space:nowrap; }
.rank-podium-metric b { color:#141F1B; font-size:15px; font-weight:700; }
.rank-podium-metric small { margin-left:3px; color:#9A9A9A; font-size:10px; }
.rank-podium-metric .rank-metric-note, .rank-list-metric .rank-metric-note { display:block; margin-left:0; margin-top:1px; color:#B0B2B1; font-size:9px; font-weight:500; }

/* 两列密集列表（缩略图放大到 96×60） */
.rank-list { margin-top:12px; }
.rank-list-2col { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 22px; }
.rank-list-row { display:flex; align-items:center; gap:14px; padding:11px 8px; border-radius:11px; cursor:pointer; border-top:1px solid #F1F1F1; transition:background .15s ease; }
.rank-list-2col > .rank-list-row:nth-child(-n+2) { border-top:0; }
.rank-list-row:hover { background:#F7F7F7; }
.rank-list-num { flex:0 0 20px; text-align:center; color:#C4C7C6; font-size:13px; font-weight:600; font-variant-numeric:tabular-nums; }
.rank-list-thumb { flex:0 0 96px; width:96px; height:60px; overflow:hidden; border-radius:10px; background:#F7F7F7; }
.rank-list-thumb img { width:100%; height:100%; display:block; object-fit:cover; }
.rank-list-copy { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:5px; }
.rank-list-copy strong { overflow:hidden; color:#141F1B; font-size:14px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.rank-list-blurb { overflow:hidden; color:#9A9A9A; font-size:11px; line-height:1.4; text-overflow:ellipsis; white-space:nowrap; }
.rank-list-meta { display:flex; align-items:center; gap:7px; min-width:0; }
.rank-list-author { display:flex; align-items:center; gap:5px; flex:0 0 auto; color:#7A7C7C; font-size:11px; }
.rank-list-chip { flex:0 1 auto; min-width:0; overflow:hidden; padding:2px 7px; border:1px solid #ECECEC; border-radius:7px; color:#9A9A9A; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
.rank-list-metric { flex:0 0 auto; text-align:right; white-space:nowrap; }
.rank-list-metric b { display:block; color:#141F1B; font-size:14px; font-weight:700; font-variant-numeric:tabular-nums; }
.rank-list-metric small { display:block; margin-top:1px; color:#9A9A9A; font-size:9px; }
.rank-list-cite { flex:0 0 auto; padding:6px 12px; border:1px solid #ECECEC; border-radius:9px; color:#141F1B; font-size:12px; font-weight:600; background:#FFFFFF; transition:border-color .15s ease; }
.rank-list-row:hover .rank-list-cite { border-color:#141F1B; }

.rank-more { display:block; width:100%; margin-top:16px; padding:11px; border:1px solid #ECECEC; border-radius:11px; background:#FFFFFF; color:#141F1B; font-size:12px; font-weight:600; cursor:pointer; transition:background .15s ease; }
.rank-more:hover { background:#F7F7F7; }
.rank-more-sm { margin-top:12px; padding:9px; font-size:11px; }

/* 每周热门网格 */
.rank-grid { display:grid; grid-template-columns:repeat(var(--community-columns, 4),minmax(0,1fr)); gap:var(--community-gap, 24px); }
.rank-grid-card { min-width:0; overflow:hidden; border:1px solid #ECECEC; border-radius:var(--community-card-radius, 20px); background:#FFFFFF; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease; }
.rank-grid-card:hover { transform:translateY(-2px); border-color:#D4D4D4; box-shadow:var(--fx-shadow-float); }
.rank-grid-media { position:relative; aspect-ratio:var(--community-cover-ratio, 16 / 9); overflow:hidden; border-radius:var(--community-card-radius, 20px); background:#F7F7F7; }
.rank-grid-media img { width:100%; height:100%; display:block; object-fit:cover; }
.rank-grid-body { padding:12px 16px 14px; }
.rank-grid-body h3 { margin:0 0 9px; overflow:hidden; color:#141F1B; font-size:var(--community-card-title-size, 16px); font-weight:500; line-height:22px; text-overflow:ellipsis; white-space:nowrap; }
.rank-grid-foot { display:flex; align-items:center; justify-content:space-between; gap:7px; }
.rank-grid-foot strong { flex:0 0 auto; color:#141F1B; font-size:13px; font-weight:700; white-space:nowrap; }
.rank-grid-foot strong small { margin-left:3px; color:#9A9A9A; font-size:9px; font-weight:500; }

/* 优质改编 3 列 */
.rank-remix { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--community-gap, 24px); }
.rank-remix-card { min-width:0; overflow:hidden; border:1px solid #ECECEC; border-radius:var(--community-card-radius, 20px); background:#FFFFFF; box-shadow:none; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease; }
.rank-remix-card:hover { transform:translateY(-2px); border-color:#D4D4D4; box-shadow:var(--fx-shadow-float); }
.rank-remix-media { position:relative; aspect-ratio:var(--community-cover-ratio, 16 / 9); overflow:hidden; border-radius:var(--community-card-radius, 20px); background:#F7F7F7; }
.rank-remix-media img { width:100%; height:100%; display:block; object-fit:cover; }
.rank-remix-eyebrow { position:absolute; left:10px; top:10px; padding:5px 8px; border-radius:8px; background:#141F1B; color:#FFFFFF; font-size:9px; font-weight:700; }
.rank-remix-body { padding:12px 16px 14px; }
.rank-remix-body h3 { margin:0 0 11px; overflow:hidden; color:#141F1B; font-size:var(--community-card-title-size, 16px); font-weight:500; line-height:22px; text-overflow:ellipsis; white-space:nowrap; }
.rank-remix-foot { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.rank-remix-foot strong { flex:0 0 auto; color:#141F1B; font-size:13px; font-weight:700; white-space:nowrap; }
.rank-remix-foot strong small { margin-left:3px; color:#9A9A9A; font-size:9px; font-weight:500; }
.rank-remix-role { display:inline-block; margin-left:6px; padding:1px 6px; border:1px solid #D9AF3C; border-radius:7px; color:#8A6D00; font-size:9px; font-weight:700; white-space:nowrap; }

/* 通用 */
.rank-mini-author { display:flex; align-items:center; gap:5px; min-width:0; overflow:hidden; color:#7A7C7C; font-size:12px; white-space:nowrap; text-overflow:ellipsis; }
.rank-avatar { width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; border:1px solid #ECECEC; border-radius:50%; background:#F7F7F7; color:#141F1B; font-size:10px; }
.rank-avatar img { width:100%; height:100%; object-fit:cover; }
.rank-avatar b { font-weight:700; }
.rank-avatar-xs { width:18px; height:18px; font-size:8px; }

/* 创作者 compact */
.rank-compact-list { margin-top:0; }
.rank-compact-row { display:flex; align-items:center; gap:11px; min-height:52px; padding:9px 0; border-top:1px solid #ECECEC; cursor:pointer; }
.rank-compact-row:first-child { border-top:0; }
.rank-compact-avatar { width:36px; height:36px; flex-basis:36px; font-size:13px; }
.rank-compact-copy { display:flex; flex-direction:column; min-width:0; flex:1; gap:3px; }
.rank-compact-copy strong { overflow:hidden; color:#141F1B; font-size:13px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.rank-compact-copy small { overflow:hidden; color:#9A9A9A; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
.rank-compact-metric { flex:0 0 auto; text-align:right; white-space:nowrap; }
.rank-compact-metric b { display:block; color:#141F1B; font-size:14px; font-weight:700; }
.rank-compact-metric small { display:block; margin-top:2px; color:#9A9A9A; font-size:9px; }

@media (max-width:980px) { .rank-list-2col { grid-template-columns:minmax(0,1fr); } .rank-list-2col > .rank-list-row:nth-child(2) { border-top:1px solid #F1F1F1; } .rank-chart-2col { grid-template-columns:minmax(0,1fr); } .rank-chart-2col > .rank-chart-row:nth-child(2) { border-top:1px solid #F1F1F1; } }
@media (max-width:900px) { .rank-podium { grid-template-columns:1fr; } .rank-remix { grid-template-columns:1fr; } .rank-creator-grid { grid-template-columns:1fr; } }
@media (max-width:720px) { .rank-board { padding:16px; } .rank-list-chip { display:none; } .rank-list-cite { display:none; } .rank-chart-thumb, .rank-list-thumb { flex-basis:80px; width:80px; height:50px; } }
</style>
