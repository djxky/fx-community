<script setup>
defineProps({ post: { type: Object, required: true } })

function showOverflowTitle(event) {
  const title = event.currentTarget
  if (title.scrollWidth > title.clientWidth) title.title = title.textContent
  else title.removeAttribute('title')
}
</script>

<template>
  <div class="pc" :class="'nav-' + post.to">
    <!-- 封面(资源为主,置顶;类型角标) -->
    <div class="pc-cover">
      <img :src="post.cover" :alt="`${post.title}封面`" loading="lazy" />
      <span v-if="post.live" class="pc-live">● 直播中</span>
      <span v-else class="pc-badge">{{ post.badge }}</span>
      <span v-if="post.region" class="pc-region">适用{{ post.region }}</span>
    </div>

    <!-- 标题 -->
    <div class="pc-title" @mouseenter="showOverflowTitle">{{ post.title }}</div>

    <!-- 基础信息(压成一行淡灰文字,不再用一排标签块) -->
    <div class="pc-meta">
      {{ post.meta }}<span v-if="post.verified" class="pc-ok"> · <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg> 课堂验证</span>
    </div>

    <!-- 作者(社会证明) + 门面数据 -->
    <div class="pc-foot">
      <span class="pc-av" :class="{ ring: post.verify === 'expert' }">{{ post.avatar?.slice(0, 1) }}</span>
      <span class="pc-nm" :title="post.author">{{ post.author }}</span>
      <span v-if="post.verify === 'expert'" class="pc-ck pc-ck--expert"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>
      <span v-else-if="post.verify === 'teacher'" class="pc-ck pc-ck--teacher"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>
      <span class="pc-metric"><b>{{ post.evi.use }}</b> 使用 <span class="pc-sep">·</span> <b>{{ post.evi.star }}</b> 收藏</span>
    </div>
  </div>
</template>

<style scoped>
.pc { background:#fff; border:1px solid #ECECEC; border-radius:var(--community-card-radius, 20px); min-width:0; overflow:hidden; cursor:pointer; display:flex; flex-direction:column; transition:transform .15s ease, border-color .15s ease, box-shadow .15s ease; box-shadow:none; }
.pc:hover { border-color:#D4D4D4; box-shadow:var(--fx-shadow-float); transform:translateY(-2px); }

.pc-cover { position:relative; width:100%; aspect-ratio:var(--community-cover-ratio, 16 / 9); background:#EFEFEF; border-radius:var(--community-card-radius, 20px); overflow:hidden; }
.pc-cover img { width:100%; height:100%; object-fit:cover; display:block; }
.pc-badge { position:absolute; top:10px; left:10px; background:rgba(20,31,27,0.82); color:#fff; font-size:11.5px; padding:3px 9px; border-radius:var(--fx-radius-tag); }
.pc-live { position:absolute; top:10px; left:10px; background:#FF4832; color:#fff; font-size:11.5px; font-weight:600; padding:3px 9px; border-radius:var(--fx-radius-tag); }
.pc-region { position:absolute; top:10px; right:10px; background:#FFF6DF; color:#8A6D00; font-size:11px; font-weight:600; padding:3px 9px; border-radius:var(--fx-radius-tag); border:1px solid #FBEFC6; }

.pc-title { margin:12px 16px 0; font-size:var(--community-card-title-size, 16px); font-weight:500; color:#141F1B; line-height:22px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }

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
.pc-ck { flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; width:12px; height:12px; border-radius:50%; }
.pc-ck--expert { background:#D9AF3C; }
.pc-ck--teacher { background:#141F1B; }
.pc-metric { flex-shrink:0; margin-left:auto; white-space:nowrap; font-variant-numeric:tabular-nums; }
.pc-metric b { color:#141F1B; font-weight:600; }
.pc-sep { color:#D4D4D4; padding:0 3px; }

.pc-act { display:flex; align-items:center; gap:10px; padding:13px 14px 14px; }
.pc-primary { background:#141F1B; color:#fff; border:none; border-radius:9px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; }
.pc-primary:hover { background:#2C3632; }
.pc-primary.live { background:#FF4832; }
.pc-ic { color:#9A9A9A; display:inline-flex; cursor:pointer; }
.pc-ic:first-of-type { margin-left:auto; }
.pc-ic:hover { color:#141F1B; }
</style>
