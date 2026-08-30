<script setup>
import Sidebar from '../components/Sidebar.vue'
import RankBoardCard from '../components/RankBoardCard.vue'
import { BOARDS } from '../data/rank'

const resourceBoards = BOARDS.filter(board => board.group === 'resource')
const creatorBoards = BOARDS.filter(board => board.group === 'creator')
</script>

<template>
  <div id="view-rank">
    <div class="page">
      <Sidebar active="community" />
      <main class="rank-main">
        <div class="tbar">
          <div class="tbar-in">
            <div class="tbar-tabs">
              <span class="tbtab nav-feed">关注</span>
              <span class="tbtab nav-discover">发现</span>
              <span class="tbtab nav-local">本地</span>
              <span class="tbtab on nav-rank">排行榜</span>
            </div>
            <div class="tbar-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>搜名师、技能、课件、教案…</div>
          </div>
        </div>

        <div class="rank-shell">
          <section class="rank-resource-section" aria-label="资源类排行榜">
            <div class="rank-resource-grid">
              <div v-for="board in resourceBoards" :key="board.key" class="rank-resource-board">
                <div class="rank-resource-board-head">
                  <h2>{{ board.title }}</h2>
                </div>
                <RankBoardCard :board="board" />
              </div>
            </div>
          </section>

          <section class="rank-creator-grid" aria-label="创作者三类排行榜">
            <RankBoardCard v-for="board in creatorBoards" :key="board.key" :board="board" />
          </section>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
.rank-main { flex:1; min-width:0; height:100vh; overflow-y:auto; background:#F7F7F7; }
.tbar { display:flex; align-items:stretch; padding:0 32px; background:#FFFFFF; border-bottom:1px solid #ECECEC; }
.tbar-in { display:flex; align-items:stretch; justify-content:space-between; width:100%; }
.tbar-tabs { display:flex; align-items:stretch; gap:26px; }
.tbar-search { display:flex; align-items:center; gap:8px; background:#F7F7F7; border:1px solid #ECECEC; border-radius:10px; padding:9px 14px; width:300px; align-self:center; font-size:13px; color:#9A9A9A; }
.rank-shell { max-width:1220px; margin:0 auto; padding:28px 34px 64px; }
.rank-resource-section { margin-bottom:25px; }
.rank-resource-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; align-items:start; }
.rank-resource-board { min-width:0; }
.rank-resource-board-head { display:flex; align-items:flex-end; gap:18px; margin:0 0 10px; }
.rank-resource-board-head h2 { margin:0; color:#141F1B; font-size:17px; font-weight:700; letter-spacing:-.02em; }
.rank-resource-board :deep(.rank-board) { padding:16px; }
.rank-creator-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; align-items:stretch; }
.rank-creator-grid :deep(.rank-board) { height:100%; box-sizing:border-box; }
@media (max-width:1100px) { .rank-shell { padding-left:24px; padding-right:24px; } }
@media (max-width:1100px) { .rank-resource-grid { grid-template-columns:1fr; } .rank-creator-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:720px) { .rank-shell { padding:22px 16px 46px; } .rank-resource-board-head { align-items:flex-start; flex-direction:column; gap:8px; } .rank-creator-grid { grid-template-columns:1fr; } }
</style>
