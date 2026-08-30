<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ board: { type: Object, required: true } })

const medals = ['金', '银', '铜']
const subjects = ['全部', '语文', '数学', '英语', '全学科', '跨学科']
const selectedSubject = ref('全部')
const filteredItems = computed(() => {
  if (props.board.key !== 'curated' || selectedSubject.value === '全部') return props.board.items
  return props.board.items.filter(item => item.subject === selectedSubject.value)
})

function placeClass(index) {
  return index === 0 ? 'rank-gold' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : 'rank-number'
}
</script>

<template>
  <article class="rank-board" :class="board.layout === 'feature' ? 'rank-feature-board' : 'rank-compact-board'">
    <header v-if="board.layout !== 'feature'" class="rank-board-head">
      <div class="rank-board-head-main">
        <div class="rank-board-title"><span v-if="board.hot" class="rank-board-mark">●</span>{{ board.title }}</div>
      </div>
      <label v-if="board.key === 'curated'" class="rank-subject-control">
        <span>学科</span>
        <select v-model="selectedSubject" aria-label="切换学科">
          <option v-for="subject in subjects" :key="subject" :value="subject">{{ subject }}</option>
        </select>
      </label>
    </header>

    <div v-if="board.layout === 'feature'" class="rank-feature-grid">
      <div v-if="board.items[0]" class="rank-featured-list">
        <article class="rank-content-card rank-featured-card nav-res" :data-resource-id="board.items[0].resourceId" tabindex="0" role="button">
          <div class="rank-content-cover">
            <img :src="board.items[0].cover" :alt="board.items[0].name + '封面'" loading="lazy" />
            <span class="rank-place" :class="placeClass(0)"><b>{{ medals[0] }}</b>1</span>
            <span class="rank-content-kind">{{ board.items[0].kind }}</span>
          </div>
          <div class="rank-content-copy">
            <h3>{{ board.items[0].name }}</h3>
            <p>{{ board.items[0].sub }}</p>
            <div class="rank-content-foot">
              <div class="rank-author"><span class="rank-avatar"><img v-if="board.items[0].portrait" :src="board.items[0].portrait" alt="" /><b v-else>{{ board.items[0].initial }}</b></span><span class="rank-author-name">{{ board.items[0].author }}</span><span v-if="board.items[0].role" class="rank-role-badge">{{ board.items[0].role }}</span></div>
              <span class="rank-use"><b>{{ board.items[0].metric }}</b> {{ board.metricLabel }}</span>
            </div>
          </div>
        </article>
      </div>

      <div class="rank-compact-list rank-resource-compact-list">
        <div v-for="(it, i) in board.items.slice(1)" :key="it.rankKey || it.resourceId" class="rank-compact-row nav-res" :data-resource-id="it.resourceId" tabindex="0" role="button">
          <span class="rank-place" :class="placeClass(i + 1)"><b v-if="i + 1 < 3">{{ medals[i + 1] }}</b>{{ i + 2 }}</span>
          <span class="rank-compact-copy rank-resource-copy">
            <strong>{{ it.name }}</strong>
            <small>{{ it.sub }}</small>
            <span class="rank-resource-author"><span class="rank-avatar rank-resource-avatar"><img v-if="it.portrait" :src="it.portrait" alt="" /><b v-else>{{ it.initial }}</b></span><span class="rank-resource-author-name">{{ it.author }}</span><span v-if="it.role" class="rank-role-badge">{{ it.role }}</span></span>
          </span>
          <span class="rank-compact-metric"><b>{{ it.metric }}</b><small>{{ board.metricLabel }}</small></span>
        </div>
      </div>
    </div>

    <div v-else class="rank-compact-list">
      <div v-for="(it, i) in filteredItems" :key="it.rankKey || it.name" class="rank-compact-row" :class="it.target === 'resource' ? 'nav-res' : 'nav-studio'" :data-resource-id="it.resourceId" tabindex="0" role="button">
        <span class="rank-place" :class="placeClass(i)"><b v-if="i < 3">{{ medals[i] }}</b>{{ i + 1 }}</span>
        <span class="rank-avatar rank-compact-avatar"><img v-if="it.portrait" :src="it.portrait" alt="" /><img v-else-if="it.logo" :src="it.logo" alt="" /><b v-else>{{ it.initial }}</b></span>
        <span class="rank-compact-copy"><strong>{{ it.name }}</strong></span>
        <span class="rank-compact-metric"><b>{{ it.metric }}</b><small>{{ it.unit }}</small></span>
      </div>
    </div>

  </article>
</template>

<style scoped>
.rank-board { background:#FFFFFF; border:1px solid #ECECEC; border-radius:16px; padding:20px; color:#141F1B; box-shadow:0 2px 8px rgba(20,31,27,.03); }
.rank-board-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; }
.rank-board-head-main { min-width:0; }
.rank-board-title { font-size:17px; font-weight:700; letter-spacing:-.02em; }
.rank-board-mark { display:inline-block; margin-right:7px; color:#D9AF3C; font-size:12px; vertical-align:2px; }
.rank-subject-control { display:flex; align-items:center; gap:6px; flex:0 0 auto; color:#9A9A9A; font-size:11px; }
.rank-subject-control select { max-width:78px; padding:5px 7px; border:1px solid #ECECEC; border-radius:10px; background:#F7F7F7; color:#141F1B; font:inherit; cursor:pointer; }
.rank-feature-grid { display:flex; flex-direction:column; gap:12px; margin-top:0; }
.rank-feature-board .rank-board-head { display:none; }
.rank-featured-list { min-width:0; }
.rank-content-card { min-width:0; overflow:hidden; border:1px solid #ECECEC; border-radius:16px; background:#FFFFFF; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease; box-shadow:0 1px 4px rgba(20,31,27,.02); }
.rank-content-card:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(20,31,27,.05); }
.rank-featured-card { border-radius:16px; }
.rank-featured-card .rank-content-cover { width:auto; margin:0; aspect-ratio:16 / 9; border-radius:15px 15px 0 0; }
.rank-featured-card .rank-content-copy { padding:14px 16px 16px; }
.rank-content-cover:after { display:none; }
.rank-content-cover { position:relative; aspect-ratio:16 / 9; overflow:hidden; background:#F7F7F7; }
.rank-content-cover:after { content:""; position:absolute; inset:0; background:linear-gradient(180deg,rgba(20,31,27,.03) 34%,rgba(20,31,27,.70)); pointer-events:none; }
.rank-content-cover img { width:100%; height:100%; display:block; object-fit:cover; }
.rank-content-cover > span { position:absolute; z-index:1; }
.rank-place { display:inline-flex; align-items:center; justify-content:center; gap:3px; min-width:22px; height:22px; padding:0 5px; box-sizing:border-box; border-radius:8px; font-size:12px; font-weight:700; line-height:1; }
.rank-place b { font-size:9px; font-weight:700; }
.rank-place.rank-gold { top:10px; left:10px; background:#D9AF3C; color:#141F1B; box-shadow:0 1px 4px rgba(20,31,27,.08); }
.rank-place.rank-silver { top:10px; left:10px; background:#ECECEC; color:#141F1B; box-shadow:0 1px 4px rgba(20,31,27,.05); }
.rank-place.rank-bronze { top:10px; left:10px; background:#F7F7F7; color:#141F1B; border:1px solid #ECECEC; box-shadow:0 1px 4px rgba(20,31,27,.04); }
.rank-place.rank-number { top:10px; left:10px; background:rgba(20,31,27,.75); color:#fff; }
.rank-content-kind { right:10px; top:10px; padding:4px 6px; border:1px solid rgba(255,255,255,.36); border-radius:8px; background:rgba(20,31,27,.55); color:#fff; font-size:9px; }
.rank-content-copy { padding:12px 12px 13px; }
.rank-content-copy h3 { margin:0; color:#141F1B; font-size:14px; line-height:1.42; font-weight:700; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; }
.rank-content-copy p { margin:5px 0 11px; color:#9A9A9A; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rank-content-foot { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.rank-author { display:flex; align-items:center; gap:5px; min-width:0; flex:1 1 auto; overflow:hidden; color:#7A7C7C; font-size:10px; font-weight:600; }
.rank-author-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rank-avatar { width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; border:1px solid #ECECEC; border-radius:50%; background:#F7F7F7; color:#141F1B; font-size:10px; }
.rank-avatar img { width:100%; height:100%; object-fit:cover; }
.rank-avatar b { font-weight:700; }
.rank-use { color:#141F1B; font-size:10px; white-space:nowrap; }
.rank-use b { font-size:13px; font-weight:700; }
.rank-compact-list { margin-top:16px; }
.rank-resource-compact-list { display:flex; flex-direction:column; margin-top:0; }
.rank-resource-compact-list .rank-compact-row:first-child { border-top:0; }
.rank-compact-row { display:flex; align-items:center; gap:11px; min-height:55px; padding:9px 0; border-top:1px solid #ECECEC; cursor:pointer; }
.rank-compact-row:first-child { border-top:0; }
.rank-compact-row > .rank-place { position:static; flex:0 0 30px; }
.rank-resource-copy { gap:1px; }
.rank-compact-avatar { width:38px; height:38px; flex-basis:38px; font-size:14px; }
.rank-compact-copy { display:flex; flex-direction:column; min-width:0; flex:1; }
.rank-compact-copy strong { overflow:hidden; color:#141F1B; font-size:13px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.rank-compact-copy small { margin-top:3px; overflow:hidden; color:#9A9A9A; font-size:10.5px; text-overflow:ellipsis; white-space:nowrap; }
.rank-resource-author { display:flex; align-items:center; gap:5px; min-width:0; margin-top:3px; overflow:hidden; color:#7A7C7C; font-size:10px; font-weight:600; }
.rank-resource-author-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rank-resource-avatar { width:18px; height:18px; flex-basis:18px; font-size:8px; }
.rank-role-badge { display:inline-block; flex:0 0 auto; padding:2px 5px; border:1px solid #D9AF3C; border-radius:8px; color:#8A6D00; font-size:9px; font-weight:700; line-height:1.2; white-space:nowrap; }
.rank-compact-metric { flex:0 0 auto; text-align:right; }
.rank-compact-metric b { display:block; color:#141F1B; font-size:14px; font-weight:700; }
.rank-compact-metric small { display:block; margin-top:3px; color:#9A9A9A; font-size:10px; }
@media (max-width:720px) { .rank-board { padding:16px; } .rank-feature-grid { gap:12px; } .rank-featured-list, .rank-resource-compact-list { gap:10px; } }
</style>
