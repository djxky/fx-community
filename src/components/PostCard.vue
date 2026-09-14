<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: { type: Object, required: true },
  metricMode: { type: String, default: 'full' },
  // 精简卡:只保留封面、标题和作者(发现页使用)
  compact: { type: Boolean, default: false },
})

// 专题卡:整张卡像一叠卡片,背后垫白色卡边(资源 ≥3 个垫 2 张,否则 1 张)
const isTopic = computed(() => props.post.kind === 'topic')
const sheetCount = computed(() => (isTopic.value ? ((props.post.count || 0) >= 3 ? 2 : 1) : 0))

function showOverflowTitle(event) {
  const title = event.currentTarget
  if (title.scrollWidth > title.clientWidth || title.scrollHeight > title.clientHeight) title.title = title.textContent
  else title.removeAttribute('title')
}
</script>

<template>
  <div class="pc" :class="['nav-' + post.to, { 'pc--deck': isTopic }]">
    <!-- 专题卡:背后的卡边 + 正面卡底(内容叠在最上) -->
    <template v-if="isTopic">
      <span v-if="sheetCount >= 2" class="pc-sheet pc-sheet--2" aria-hidden="true"></span>
      <span class="pc-sheet pc-sheet--1" aria-hidden="true"></span>
      <span class="pc-face" aria-hidden="true"></span>
    </template>
    <!-- 封面(资源为主,置顶;类型角标) -->
    <div class="pc-cover">
      <img :src="post.cover" :alt="`${post.title}封面`" loading="lazy" />
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
      <!-- 精简卡只放使用人数;专题卡为专题内资源累计使用 -->
      <span v-if="!compact || post.evi?.use" class="pc-metric" :class="{ 'pc-metric--use-only': compact || metricMode === 'use-only' }">
        <b>{{ post.evi.use }}</b><span class="pc-metric-label">{{ post.kind === 'topic' ? ' 累计使用' : ' 使用' }}</span>
        <template v-if="!compact && metricMode !== 'use-only'"> <span class="pc-sep">·</span> <b>{{ post.evi.star }}</b> 收藏</template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.pc { background:#fff; border:1px solid #ECECEC; border-radius:var(--community-card-radius, 20px); min-width:0; overflow:hidden; cursor:pointer; display:flex; flex-direction:column; transition:transform .15s ease, border-color .15s ease, box-shadow .15s ease; box-shadow:none; }
.pc:hover { border-color:#D4D4D4; box-shadow:var(--fx-shadow-float); transform:translateY(-2px); }

.pc-cover { position:relative; width:100%; aspect-ratio:var(--community-cover-ratio, 16 / 9); background:#EFEFEF; border-radius:var(--community-card-radius, 20px); overflow:hidden; }
.pc-cover img { width:100%; height:100%; object-fit:cover; display:block; }
/* 专题卡:一叠卡片。正面卡底 .pc-face 在上,背后 .pc-sheet 微微旋转露出边角;悬停时卡边再张开一点 */
.pc--deck { position:relative; overflow:visible; background:transparent; border-color:transparent; }
.pc--deck:hover { border-color:transparent; box-shadow:none; }
.pc--deck > :not(.pc-sheet):not(.pc-face) { position:relative; z-index:2; }
.pc-sheet, .pc-face { position:absolute; inset:-1px; border-radius:inherit; background:#fff; border:1px solid #E4E6E5; }
.pc-face { z-index:1; transition:border-color .15s ease, box-shadow .15s ease; }
.pc--deck:hover .pc-face { border-color:#D4D4D4; box-shadow:var(--fx-shadow-float); }
/* 页面底色是白的,卡边用浅灰 + 加深描边和阴影才分得出层次 */
.pc-sheet { z-index:0; border-color:#D5D9D7; box-shadow:0 6px 18px -6px rgba(20,31,27,.22); transition:transform .22s ease; }
.pc-sheet--1 { background:#F3F4F3; transform:translate(-8px, 6px) rotate(-4deg); }
.pc-sheet--2 { background:#E9ECEA; transform:translate(10px, 8px) rotate(4.5deg); }
.pc--deck:hover .pc-sheet--1 { transform:translate(-12px, 8px) rotate(-5.5deg); }
.pc--deck:hover .pc-sheet--2 { transform:translate(14px, 10px) rotate(6deg); }
.pc-badge { z-index:1; position:absolute; top:10px; left:10px; background:rgba(20,31,27,0.82); color:#fff; font-size:11.5px; padding:3px 9px; border-radius:var(--fx-radius-tag); }
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
