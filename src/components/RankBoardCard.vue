<script setup>
defineProps({ board: { type: Object, required: true } })
</script>

<template>
  <div class="rb">
    <div class="rb-hd">
      <span class="rb-title">
        <span v-if="board.hot" class="rb-flame">🔥</span>{{ board.title }}
      </span>
      <span v-if="board.tag" class="rb-tag" :class="{ hot: board.hot }">{{ board.tag }}</span>
      <span class="rb-period">{{ board.period }}</span>
    </div>
    <div class="rb-desc">{{ board.desc }}</div>

    <div class="rb-list">
      <div v-for="(it, i) in board.items" :key="i" class="rb-row" :class="board.layout === 'avatar' ? 'nav-studio' : 'nav-res'">
        <span class="rb-rk" :class="{ top: i < 3 }">{{ i + 1 }}</span>

        <!-- 视觉:封面 / 头像 / 机构图标 -->
        <div v-if="board.layout === 'cover'" class="rb-cover"><img :src="it.cover" alt="" loading="lazy" /></div>
        <div v-else-if="board.layout === 'avatar'" class="rb-av" :class="{ ring: it.expert }">
          <img v-if="it.portrait" :src="it.portrait" alt="" />
          <span v-else>{{ it.initial }}</span>
        </div>
        <div v-else class="rb-inst">
          <svg v-if="it.icon === 'book'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 00-2 2z"></path><path d="M19 3v18"></path></svg>
          <svg v-else-if="it.icon === 'school'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-5h6v5"></path></svg>
          <svg v-else-if="it.icon === 'studio'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"></path></svg>
          <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"></circle><path d="M3.5 19a5.5 5.5 0 0111 0"></path><circle cx="17" cy="8" r="2.6"></circle><path d="M15.5 13.6A5 5 0 0121 18.5"></path></svg>
        </div>

        <div class="rb-body">
          <div class="rb-name">{{ it.name }}</div>
          <div class="rb-sub">{{ it.sub }}</div>
        </div>
        <div class="rb-metric">
          <b :class="{ up: it.up }">{{ it.metric }}</b>
          <span v-if="it.unit">{{ it.unit }}</span>
        </div>
      </div>
    </div>

    <div class="rb-more">查看完整榜单 ›</div>
  </div>
</template>

<style scoped>
.rb { background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:18px 18px 12px; display:flex; flex-direction:column; }
.rb-hd { display:flex; align-items:center; gap:8px; }
.rb-title { font-size:15.5px; font-weight:700; color:#141F1B; }
.rb-flame { margin-right:2px; }
.rb-tag { font-size:11px; font-weight:500; color:#7A7C7C; background:#F6F6F6; border:1px solid #ECECEC; padding:1px 7px; border-radius:6px; }
.rb-tag.hot { color:#8A6D00; background:#FFF6DF; border-color:#FBEFC6; }
.rb-period { margin-left:auto; font-size:12px; color:#9A9A9A; }
.rb-desc { font-size:12px; color:#9A9A9A; margin-top:5px; }

.rb-list { margin-top:12px; }
.rb-row { display:flex; align-items:center; gap:11px; padding:8px 0; cursor:pointer; border-top:1px solid #F6F6F6; }
.rb-row:first-child { border-top:none; }
.rb-rk { width:18px; text-align:center; font-size:13px; font-weight:600; color:#C4C4C4; flex-shrink:0; }
.rb-rk.top { color:#141F1B; font-size:15px; font-weight:700; }

.rb-cover { width:46px; height:34px; border-radius:7px; overflow:hidden; background:#EFEFEF; flex-shrink:0; }
.rb-cover img { width:100%; height:100%; object-fit:cover; }
.rb-av { width:34px; height:34px; border-radius:50%; overflow:hidden; background:#ECECEC; color:#141F1B; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.rb-av img { width:100%; height:100%; object-fit:cover; }
.rb-av.ring { box-shadow:0 0 0 1.5px #fff, 0 0 0 3px #D9AF3C; }
.rb-inst { width:34px; height:34px; border-radius:9px; background:#F6F6F6; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

.rb-body { min-width:0; flex-grow:1; }
.rb-name { font-size:13px; font-weight:500; color:#141F1B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rb-sub { font-size:11.5px; color:#9A9A9A; margin-top:1px; }
.rb-metric { text-align:right; flex-shrink:0; }
.rb-metric b { font-size:14px; font-weight:700; color:#141F1B; }
.rb-metric b.up { color:#141F1B; }
.rb-metric span { display:block; font-size:10.5px; color:#9A9A9A; }

.rb-more { margin-top:8px; padding-top:10px; border-top:1px solid #F6F6F6; font-size:12.5px; color:#7A7C7C; cursor:pointer; }
</style>
