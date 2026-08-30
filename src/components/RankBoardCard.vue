<script setup>
defineProps({ board: { type: Object, required: true } })

const medals = ['金', '银', '铜']
function placeClass(index) {
  return index === 0 ? 'rank-gold' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : 'rank-number'
}
</script>

<template>
  <article class="rank-board" :class="board.layout === 'feature' ? 'rank-feature-board' : 'rank-compact-board'">
    <header class="rank-board-head">
      <div>
        <div class="rank-board-title"><span v-if="board.hot" class="rank-board-mark">●</span>{{ board.title }}</div>
        <div class="rank-board-desc">{{ board.desc }}</div>
      </div>
      <div class="rank-board-side"><span v-if="board.tag" class="rank-board-tag" :class="{ hot: board.hot }">{{ board.tag }}</span><span>{{ board.period }}</span></div>
    </header>

    <div v-if="board.layout === 'feature'" class="rank-feature-grid">
      <article v-for="(it, i) in board.items" :key="it.resourceId" class="rank-content-card nav-res" :data-resource-id="it.resourceId" tabindex="0" role="button">
        <div class="rank-content-cover">
          <img :src="it.cover" :alt="it.name + '封面'" loading="lazy" />
          <span class="rank-place" :class="placeClass(i)"><b v-if="i < 3">{{ medals[i] }}</b>{{ i + 1 }}</span>
          <span class="rank-content-kind">{{ it.kind }}</span>
          <span class="rank-cover-signal"><i></i>{{ it.activeSignal }}</span>
        </div>
        <div class="rank-content-copy">
          <h3>{{ it.name }}</h3>
          <p>{{ it.sub }}</p>
          <div class="rank-content-foot">
            <div class="rank-author"><span class="rank-avatar"><img v-if="it.portrait" :src="it.portrait" alt="" /><b v-else>{{ it.initial }}</b></span><span>{{ it.author }}</span></div>
            <span class="rank-use"><b>{{ it.metric }}</b> 位老师使用</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="rank-compact-list">
      <div v-for="(it, i) in board.items" :key="it.name" class="rank-compact-row" :class="it.target === 'resource' ? 'nav-res' : 'nav-studio'" :data-resource-id="it.resourceId" tabindex="0" role="button">
        <span class="rank-place" :class="placeClass(i)"><b v-if="i < 3">{{ medals[i] }}</b>{{ i + 1 }}</span>
        <span class="rank-avatar rank-compact-avatar"><img v-if="it.portrait" :src="it.portrait" alt="" /><img v-else-if="it.logo" :src="it.logo" alt="" /><b v-else>{{ it.initial }}</b></span>
        <span class="rank-compact-copy"><strong>{{ it.name }}</strong><small>{{ it.sub }}</small><em><i></i>{{ it.signal }}</em></span>
        <span class="rank-compact-metric"><b>{{ it.metric }}</b><small>{{ it.unit }}</small></span>
      </div>
    </div>

    <footer class="rank-board-more">查看完整榜单 <span>›</span></footer>
  </article>
</template>

<style scoped>
.rank-board { background:#FFFDFC; border:1px solid #E7E3DA; border-radius:16px; padding:20px; color:#141F1B; }
.rank-board-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; }
.rank-board-title { font-size:17px; font-weight:700; letter-spacing:-.02em; }
.rank-board-mark { display:inline-block; margin-right:7px; color:#D9AF3C; font-size:12px; vertical-align:2px; }
.rank-board-desc { margin-top:6px; color:#888982; font-size:12px; line-height:1.5; }
.rank-board-side { display:flex; align-items:center; gap:8px; flex:0 0 auto; color:#9A9388; font-size:11px; white-space:nowrap; }
.rank-board-tag { padding:4px 7px; border:1px solid #ECE7DF; border-radius:7px; background:#F8F6F1; color:#78796F; font-weight:700; }
.rank-board-tag.hot { border-color:#EAD9A8; background:#FBF1D4; color:#8A6D00; }
.rank-feature-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:14px; margin-top:18px; }
.rank-content-card { min-width:0; overflow:hidden; border:1px solid #E8E4DC; border-radius:13px; background:#fff; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease; }
.rank-content-card:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(54,49,38,.08); }
.rank-content-cover { position:relative; aspect-ratio:1.36; overflow:hidden; background:#EDEBE5; }
.rank-content-cover:after { content:""; position:absolute; inset:0; background:linear-gradient(180deg,rgba(20,31,27,.03) 34%,rgba(20,31,27,.70)); pointer-events:none; }
.rank-content-cover img { width:100%; height:100%; display:block; object-fit:cover; }
.rank-content-cover > span { position:absolute; z-index:1; }
.rank-place { display:inline-flex; align-items:center; justify-content:center; gap:3px; min-width:22px; height:22px; padding:0 5px; box-sizing:border-box; border-radius:7px; font-size:12px; font-weight:800; line-height:1; }
.rank-place b { font-size:9px; font-weight:800; }
.rank-place.rank-gold { top:10px; left:10px; background:#E8C25F; color:#5D4300; box-shadow:0 2px 8px rgba(76,55,0,.22); }
.rank-place.rank-silver { top:10px; left:10px; background:#D5D8D7; color:#4E5554; box-shadow:0 2px 8px rgba(60,65,65,.18); }
.rank-place.rank-bronze { top:10px; left:10px; background:#C98C63; color:#542D18; box-shadow:0 2px 8px rgba(80,42,22,.18); }
.rank-place.rank-number { top:10px; left:10px; background:rgba(20,31,27,.75); color:#fff; }
.rank-content-kind { right:10px; top:10px; padding:4px 6px; border:1px solid rgba(255,255,255,.36); border-radius:6px; background:rgba(20,31,27,.55); color:#fff; font-size:9px; }
.rank-cover-signal { left:10px; right:10px; bottom:10px; color:#fff; font-size:10px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rank-cover-signal i,.rank-compact-copy em i { display:inline-block; width:6px; height:6px; margin-right:5px; border-radius:50%; background:#D9AF3C; vertical-align:1px; }
.rank-content-copy { padding:12px 12px 13px; }
.rank-content-copy h3 { margin:0; color:#141F1B; font-size:14px; line-height:1.42; font-weight:700; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; }
.rank-content-copy p { margin:5px 0 11px; color:#9A9388; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rank-content-foot { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.rank-author { display:flex; align-items:center; gap:5px; min-width:0; color:#696D6A; font-size:10px; font-weight:600; }
.rank-avatar { width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; border:1px solid #E7E1D6; border-radius:50%; background:#F0EDE6; color:#3D4842; font-size:10px; }
.rank-avatar img { width:100%; height:100%; object-fit:cover; }
.rank-avatar b { font-weight:700; }
.rank-use { color:#8A6D00; font-size:10px; white-space:nowrap; }
.rank-use b { font-size:13px; font-weight:750; }
.rank-compact-list { margin-top:16px; }
.rank-compact-row { display:flex; align-items:center; gap:11px; min-height:55px; padding:9px 0; border-top:1px solid #F0EDE7; cursor:pointer; }
.rank-compact-row:first-child { border-top:0; }
.rank-compact-row > .rank-place { position:static; flex:0 0 30px; }
.rank-compact-avatar { width:38px; height:38px; flex-basis:38px; font-size:14px; }
.rank-compact-copy { display:flex; flex-direction:column; min-width:0; flex:1; }
.rank-compact-copy strong { overflow:hidden; color:#141F1B; font-size:13px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.rank-compact-copy small { margin-top:3px; overflow:hidden; color:#9A9388; font-size:10.5px; text-overflow:ellipsis; white-space:nowrap; }
.rank-compact-copy em { margin-top:4px; overflow:hidden; color:#8A6D00; font-size:10px; font-style:normal; text-overflow:ellipsis; white-space:nowrap; }
.rank-compact-metric { flex:0 0 auto; text-align:right; }
.rank-compact-metric b { display:block; color:#141F1B; font-size:14px; font-weight:750; }
.rank-compact-metric small { display:block; margin-top:3px; color:#9A9388; font-size:10px; }
.rank-board-more { margin-top:10px; padding-top:12px; border-top:1px solid #F0EDE7; color:#777971; font-size:11px; cursor:pointer; }
.rank-board-more span { margin-left:3px; font-size:16px; vertical-align:-1px; }
@media (max-width:1250px) { .rank-feature-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:720px) { .rank-board { padding:16px; } .rank-feature-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; } .rank-board-side { display:none; } }
</style>
