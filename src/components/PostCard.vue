<script setup>
defineProps({ post: { type: Object, required: true } })
</script>

<template>
  <div class="pc" :class="'nav-' + post.to">
    <!-- 封面(资源为主,置顶;类型角标) -->
    <div class="pc-cover">
      <img :src="post.cover" alt="" loading="lazy" />
      <span v-if="post.live" class="pc-live">● 直播中</span>
      <span v-else class="pc-badge">{{ post.badge }}</span>
      <span v-if="post.region" class="pc-region">适用{{ post.region }}</span>
      <span v-if="post.live" class="pc-watch">👁 {{ post.watching }} 在看</span>
      <span v-else-if="post.views" class="pc-views">👁 {{ post.views }}</span>
    </div>

    <!-- 标题 -->
    <div class="pc-title">{{ post.title }}</div>

    <!-- 社会证明降级链:每卡最多一条,普通资源不显示 -->
    <div v-if="post.proof" class="pc-proof">
      <!-- 专家推荐(最强,金色荣誉例外) -->
      <span v-if="post.proof.type === 'expert'" class="pf-expert">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#B5860B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.9 6 6.6.6-5 4.3 1.5 6.5L12 17.8 6 20.9l1.5-6.5-5-4.3 6.6-.6z"></path></svg>
        {{ post.proof.by }} 推荐
      </span>
      <!-- 热评 -->
      <span v-else-if="post.proof.type === 'comment'" class="pf-line">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H8l-4 4V5a2 2 0 012-2h13a2 2 0 012 2z"></path></svg>
        <span class="pf-quote">“{{ post.proof.text }}”</span>
      </span>
      <!-- 热度 / 飙升 -->
      <span v-else-if="post.proof.type === 'hot'" class="pf-line hot">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l6-6 4 4 6-6"></path><path d="M20 9v4h-4"></path></svg>
        {{ post.proof.text }}
      </span>
      <!-- 最新 -->
      <span v-else-if="post.proof.type === 'new'" class="pf-line">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
        {{ post.proof.text }}
      </span>
    </div>

    <!-- 基础信息(压成一行淡灰文字,不再用一排标签块) -->
    <div class="pc-meta">
      {{ post.meta }}<span v-if="post.verified" class="pc-ok"> · <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg> 课堂验证</span>
    </div>

    <!-- 作者(社会证明) + 门面数据 -->
    <div class="pc-foot">
      <span class="pc-av" :class="{ ring: post.verify === 'expert' }">{{ post.avatar }}</span>
      <span class="pc-nm">{{ post.author }}</span>
      <span v-if="post.verify === 'expert'" class="pc-ck gold"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>
      <span v-else-if="post.verify === 'teacher'" class="pc-ck plain"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>
      <span class="pc-metric"><b>{{ post.evi.use }}</b> 使用<template v-if="post.evi.star"> · <b>{{ post.evi.star }}</b> 收藏</template></span>
    </div>
  </div>
</template>

<style scoped>
.pc { background:#fff; border:1px solid #ECECEC; border-radius:16px; overflow:hidden; cursor:pointer; display:flex; flex-direction:column; height:100%; transition:box-shadow .15s; }
.pc:hover { box-shadow:0 4px 24px rgba(89,98,84,0.06); }

.pc-cover { position:relative; height:172px; background:#EFEFEF; }
.pc-cover img { width:100%; height:100%; object-fit:cover; display:block; }
.pc-badge { position:absolute; top:10px; left:10px; background:rgba(20,31,27,0.82); color:#fff; font-size:11.5px; padding:3px 9px; border-radius:8px; }
.pc-live { position:absolute; top:10px; left:10px; background:#FF4832; color:#fff; font-size:11.5px; font-weight:600; padding:3px 9px; border-radius:8px; }
.pc-region { position:absolute; top:10px; right:10px; background:#FFF6DF; color:#8A6D00; font-size:11px; font-weight:600; padding:3px 9px; border-radius:8px; border:1px solid #FBEFC6; }
.pc-views, .pc-watch { position:absolute; bottom:10px; right:10px; background:rgba(20,31,27,0.6); color:#fff; font-size:11px; padding:2px 8px; border-radius:7px; }

.pc-title { padding:14px 14px 0; font-size:14.5px; font-weight:600; color:#141F1B; line-height:1.55;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

/* 社会证明信号(每卡最多一条) */
.pc-proof { padding:10px 14px 0; font-size:12px; line-height:1; }
.pf-expert { display:inline-flex; align-items:center; gap:4px; background:#FFF6DF; border:1px solid #FBEFC6; color:#8A6D00; font-weight:600; padding:4px 9px; border-radius:7px; }
.pf-line { display:inline-flex; align-items:center; gap:5px; color:#7A7C7C; }
.pf-line.hot { color:#141F1B; font-weight:500; }
.pf-quote { color:#7A7C7C; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:270px; }

.pc-meta { padding:9px 14px 0; font-size:12px; color:#9A9A9A; display:flex; align-items:center; }
.pc-ok { display:inline-flex; align-items:center; color:#7A7C7C; }
.pc-ok svg { margin:0 3px; }

.pc-foot { display:flex; align-items:center; gap:6px; margin-top:auto; padding:12px 14px 0; font-size:12px; color:#9A9A9A; }
.pc-av { width:20px; height:20px; border-radius:50%; background:#ECECEC; color:#141F1B; font-size:10.5px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.pc-av.ring { box-shadow:0 0 0 1px #fff, 0 0 0 2px #D9AF3C; }
.pc-nm { color:#141F1B; font-weight:500; }
.pc-ck { display:inline-flex; align-items:center; justify-content:center; width:12px; height:12px; border-radius:50%; }
.pc-ck.gold { background:#D9AF3C; }
.pc-ck.plain { background:#141F1B; }
.pc-metric { margin-left:auto; white-space:nowrap; }
.pc-metric b { color:#141F1B; font-weight:600; }

.pc-act { display:flex; align-items:center; gap:10px; padding:13px 14px 14px; }
.pc-primary { background:#141F1B; color:#fff; border:none; border-radius:9px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; }
.pc-primary:hover { background:#2C3632; }
.pc-primary.live { background:#FF4832; }
.pc-ic { color:#9A9A9A; display:inline-flex; cursor:pointer; }
.pc-ic:first-of-type { margin-left:auto; }
.pc-ic:hover { color:#141F1B; }
</style>
