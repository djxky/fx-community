<script setup>
import Sidebar from '../components/Sidebar.vue'
import RankBoardCard from '../components/RankBoardCard.vue'
import { BOARDS } from '../data/rank'

const PERIODS = ['本周', '本月', '年度']
const mainBoard = BOARDS.find(board => board.key === 'classroom')
const sideBoards = BOARDS.filter(board => board.key !== 'classroom')
</script>

<template>
  <div id="view-rank">
    <div class="page">
      <Sidebar active="community" />
      <main class="rank-main">
        <div class="rank-topbar">
          <div class="rank-topbar-in">
            <div class="rank-tabs">
              <span class="rank-tab nav-feed">关注</span>
              <span class="rank-tab nav-discover">发现</span>
              <span class="rank-tab nav-local">本地</span>
              <span class="rank-tab on nav-rank">排行榜</span>
            </div>
            <div class="rank-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>搜名师、技能、课件、教案…</div>
          </div>
        </div>

        <div class="rank-shell">
          <header class="rank-intro">
            <div class="rank-kicker">REAL CLASSROOM IMPACT</div>
            <div class="rank-intro-row">
              <div><h1>排行榜</h1><p>看一节课真正被多少老师带进教室，也看见正在长出来的同行与组织。</p></div>
              <div class="rank-periods"><span v-for="(p, i) in PERIODS" :key="p" class="rank-period" :class="{ on: i === 0 }">{{ p }}</span></div>
            </div>
          </header>

          <section class="rank-hero-card" aria-label="真实课堂使用榜主榜">
            <RankBoardCard :board="mainBoard" />
          </section>

          <section class="rank-secondary-grid" aria-label="其它榜单">
            <RankBoardCard v-for="board in sideBoards" :key="board.key" :board="board" />
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.rank-main { flex:1; min-width:0; height:100vh; overflow-y:auto; background:#F7F7F7; }
.rank-topbar { height:56px; box-sizing:border-box; padding:0 32px; border-bottom:1px solid #ECECEC; background:#FFF; }
.rank-topbar-in { display:flex; align-items:stretch; justify-content:space-between; height:100%; }
.rank-tabs { display:flex; align-items:stretch; gap:26px; }
.rank-tab { display:inline-flex; align-items:center; position:relative; color:#7A7C7C; font-size:13px; cursor:pointer; }
.rank-tab.on { color:#141F1B; font-weight:700; }
.rank-tab.on:after { content:""; position:absolute; left:50%; bottom:0; width:22px; height:3px; transform:translateX(-50%); border-radius:3px 3px 0 0; background:#141F1B; }
.rank-search { display:flex; align-items:center; gap:8px; align-self:center; width:290px; box-sizing:border-box; padding:9px 13px; border:1px solid #ECECEC; border-radius:10px; background:#F8F8F8; color:#9A9A9A; font-size:12px; }
.rank-shell { max-width:1220px; margin:0 auto; padding:28px 34px 64px; }
.rank-intro { margin-bottom:21px; }
.rank-kicker { color:#9A9388; font-size:10px; font-weight:700; letter-spacing:.18em; }
.rank-intro-row { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-top:8px; }
.rank-intro h1 { margin:0; color:#141F1B; font-size:28px; font-weight:700; letter-spacing:-.04em; }
.rank-intro p { margin:7px 0 0; color:#777971; font-size:13px; line-height:1.6; }
.rank-periods { display:flex; gap:3px; padding:3px; border:1px solid #ECECEC; border-radius:10px; background:#FFF; }
.rank-period { padding:7px 13px; border-radius:7px; color:#8A8C87; font-size:12px; cursor:pointer; }
.rank-period.on { background:#141F1B; color:#FFF; font-weight:600; }
.rank-hero-card { margin-bottom:18px; }
.rank-hero-card :deep(.rank-board) { padding:22px; }
.rank-secondary-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; align-items:stretch; }
.rank-secondary-grid :deep(.rank-board) { height:100%; box-sizing:border-box; }
@media (max-width:1100px) { .rank-shell { padding-left:24px; padding-right:24px; } .rank-secondary-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .rank-feature-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:720px) { .rank-topbar { padding:0 18px; } .rank-search { display:none; } .rank-shell { padding:22px 16px 46px; } .rank-intro-row { align-items:flex-start; flex-direction:column; } .rank-periods { align-self:stretch; justify-content:space-between; } .rank-period { flex:1; text-align:center; } .rank-secondary-grid { grid-template-columns:1fr; } }
</style>
