<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: { type: Object, required: true },
  metricMode: { type: String, default: 'full' },
  // 精简卡:只保留封面、标题和作者(发现页使用)
  compact: { type: Boolean, default: false },
})

// 专题卡:封面叠放专题内前几个资源,第一个在最前
const stackLayers = computed(() => (props.post.stack || [])
  .map((src, depth) => ({ src, depth }))
  .reverse())

function showOverflowTitle(event) {
  const title = event.currentTarget
  if (title.scrollWidth > title.clientWidth || title.scrollHeight > title.clientHeight) title.title = title.textContent
  else title.removeAttribute('title')
}
</script>

<template>
  <div class="pc" :class="'nav-' + post.to">
    <!-- 封面(资源为主,置顶;类型角标) -->
    <div class="pc-cover" :class="{ 'pc-cover--stack': stackLayers.length }">
      <template v-if="stackLayers.length">
        <img v-for="layer in stackLayers" :key="layer.depth" :class="`pc-stack pc-stack--${layer.depth}`" :src="layer.src" :alt="layer.depth === 0 ? `${post.title}封面` : ''" loading="lazy" />
      </template>
      <img v-else :src="post.cover" :alt="`${post.title}封面`" loading="lazy" />
      <span v-if="post.live" class="pc-live">● 直播中</span>
      <span v-else class="pc-badge">{{ post.badge }}</span>
      <span v-if="post.region" class="pc-region">适用{{ post.region }}</span>
    </div>

    <!-- 标题 -->
    <div class="pc-title" :class="{ 'pc-title--2l': compact }" @mouseenter="showOverflowTitle">{{ post.title }}</div>

    <!-- 基础信息(压成一行淡灰文字,不再用一排标签块) -->
    <div v-if="!compact" class="pc-meta">
      {{ post.meta }}<span v-if="post.verified" class="pc-ok"> · <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg> 课堂验证</span>
    </div>

    <!-- 作者(社会证明) + 门面数据 -->
    <div class="pc-foot">
      <span class="pc-av" :class="{ ring: post.verify === 'expert' }">{{ post.avatar?.slice(0, 1) }}</span>
      <span class="pc-nm" :title="post.author">{{ post.author }}</span>
      <span v-if="!compact" class="pc-metric" :class="{ 'pc-metric--use-only': metricMode === 'use-only' }">
        <b>{{ post.evi.use }}</b><span class="pc-metric-label"> 使用</span>
        <template v-if="metricMode !== 'use-only'"> <span class="pc-sep">·</span> <b>{{ post.evi.star }}</b> 收藏</template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.pc { background:#fff; border:1px solid #ECECEC; border-radius:var(--community-card-radius, 20px); min-width:0; overflow:hidden; cursor:pointer; display:flex; flex-direction:column; transition:transform .15s ease, border-color .15s ease, box-shadow .15s ease; box-shadow:none; }
.pc:hover { border-color:#D4D4D4; box-shadow:var(--fx-shadow-float); transform:translateY(-2px); }

.pc-cover { position:relative; width:100%; aspect-ratio:var(--community-cover-ratio, 16 / 9); background:#EFEFEF; border-radius:var(--community-card-radius, 20px); overflow:hidden; }
.pc-cover img { width:100%; height:100%; object-fit:cover; display:block; }
/* 专题卡堆叠封面:第一个资源在最前,其余向右错开 */
.pc-cover--stack { background:linear-gradient(135deg, #EEF1EF, #E2E7E4); }
.pc-cover .pc-stack { position:absolute; top:15%; left:50%; width:54%; height:70%; object-fit:cover; border:2px solid #fff; border-radius:10px; background:#E6E9E7; box-shadow:0 8px 20px -10px rgba(20,31,27,.45); }
.pc-stack--0 { z-index:3; transform:translateX(-78%) rotate(-5deg); }
.pc-stack--1 { z-index:2; transform:translateX(-50%) translateY(-5%); }
.pc-stack--2 { z-index:1; transform:translateX(-22%) rotate(5deg); }
.pc-badge { z-index:4; position:absolute; top:10px; left:10px; background:rgba(20,31,27,0.82); color:#fff; font-size:11.5px; padding:3px 9px; border-radius:var(--fx-radius-tag); }
.pc-live { position:absolute; top:10px; left:10px; background:#FF4832; color:#fff; font-size:11.5px; font-weight:600; padding:3px 9px; border-radius:var(--fx-radius-tag); }
.pc-region { position:absolute; top:10px; right:10px; background:#FFF6DF; color:#8A6D00; font-size:11px; font-weight:600; padding:3px 9px; border-radius:var(--fx-radius-tag); border:1px solid #FBEFC6; }

.pc-title { margin:12px 16px 0; font-size:var(--community-card-title-size, 16px); font-weight:500; color:#141F1B; line-height:22px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
/* 精简卡标题最多两行(约 24 字),固定占两行高度保证同排卡片对齐 */
.pc-title--2l { white-space:normal; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; min-height:44px; }

/* 社会证明信号(每卡最多一条) */
.pc-proof { padding:10px 16px 0; font-size:12px; line-height:1; min-height:26px; }
.pf-expert { display:inline-flex; align-items:center; gap:4px; background:#FFF6DF; border:1px solid #FBEFC6; color:#8A6D00; font-weight:600; padding:4px 9px; border-radius:var(--fx-radius-tag); }
.pf-line { display:inline-flex; align-items:center; gap:5px; color:#7A7C7C; }
.pf-line.hot { color:#141F1B; font-weight:500; }
.pf-quote { color:#7A7C7C; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:270px; }

.pc-meta { margin:6px 16px 0; font-size:12px; color:#9A9A9A; line-height:18px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
.pc-ok { display:inline-flex; align-items:center; color:#7A7C7C; }
.pc-ok svg { margin:0 3px; }

.pc-foot { display:flex; align-items:center; gap:6px; min-width:0; padding:10px 16px 14px; font-size:12px; color:#9A9A9A; }
.pc-av { overflow:hidden; white-space:nowrap; width:20px; height:20px; border-radius:50%; background:#ECECEC; color:#141F1B; font-size:10.5px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.pc-av.ring { box-shadow:0 0 0 1px #fff, 0 0 0 2px #D9AF3C; }
.pc-nm { min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; color:#141F1B; font-weight:500; }
.pc-metric { flex-shrink:0; margin-left:auto; white-space:nowrap; font-variant-numeric:tabular-nums; }
.pc-metric b { color:#141F1B; font-weight:600; }
.pc-metric--use-only { display:inline-flex; align-items:baseline; gap:3px; color:#7A7C7C; }
.pc-metric--use-only b { font-size:17px; font-weight:650; letter-spacing:-.2px; }
.pc-metric-label { font-size:11.5px; }
.pc-sep { color:#D4D4D4; padding:0 3px; }

.pc-act { display:flex; align-items:center; gap:10px; padding:13px 14px 14px; }
.pc-primary { background:#141F1B; color:#fff; border:none; border-radius:9px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; }
.pc-primary:hover { background:#2C3632; }
.pc-primary.live { background:#FF4832; }
.pc-ic { color:#9A9A9A; display:inline-flex; cursor:pointer; }
.pc-ic:first-of-type { margin-left:auto; }
.pc-ic:hover { color:#141F1B; }
</style>
