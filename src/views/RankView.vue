<script setup>
import Sidebar from '../components/Sidebar.vue'
import RankBoardCard from '../components/RankBoardCard.vue'
import { BOARDS } from '../data/rank'

const PERIODS = ['本周', '本月', '年度']
</script>

<template>
  <div id="view-rank">
    <div class="page">
      <Sidebar active="community" />
      <main style="flex-grow:1; min-width:0; overflow-y:auto; height:100vh;">
        <!-- 顶栏 -->
        <div class="tbar">
          <div class="tbar-in">
            <div class="tbar-tabs">
              <span class="tbtab nav-feed">关注</span>
              <span class="tbtab nav-discover">发现</span>
              <span class="tbtab nav-local">本地</span>
              <span class="tbtab on nav-rank">排行榜</span>
            </div>
            <div class="tbar-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
              搜名师、技能、课件、教案…
            </div>
          </div>
        </div>

        <div class="rk-wrap">
          <div class="rk-top">
            <div>
              <div class="rk-h1">排行榜</div>
              <div class="rk-sub">谁真的被课堂用起来、谁在被追随、什么在飙升——每天刷一眼,风向都在这</div>
            </div>
            <div class="rk-periods">
              <span v-for="(p, i) in PERIODS" :key="i" class="rk-per" :class="{ on: i === 0 }">{{ p }}</span>
            </div>
          </div>

          <div class="rk-grid">
            <RankBoardCard v-for="b in BOARDS" :key="b.key" :board="b" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.tbar { background:#fff; border-bottom:1px solid #EFEFEF; height:54px; display:flex; align-items:stretch; padding:0 32px; }
.tbar-in { display:flex; align-items:stretch; justify-content:space-between; width:100%; }
.tbar-tabs { display:flex; align-items:stretch; gap:26px; }
.tbar-search { display:flex; align-items:center; gap:8px; background:#F6F6F6; border:1px solid #ECECEC; border-radius:10px; padding:9px 14px; width:300px; align-self:center; font-size:13px; color:#9A9A9A; }

.rk-wrap { padding:26px 32px 60px; }
.rk-top { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:22px; }
.rk-h1 { font-size:24px; font-weight:700; color:#141F1B; }
.rk-sub { font-size:13.5px; color:#7A7C7C; margin-top:7px; max-width:640px; line-height:1.6; }
.rk-periods { display:flex; gap:6px; background:#F6F6F6; border-radius:10px; padding:3px; }
.rk-per { font-size:13px; color:#7A7C7C; padding:6px 14px; border-radius:8px; cursor:pointer; }
.rk-per.on { background:#fff; color:#141F1B; font-weight:600; box-shadow:0 1px 3px rgba(0,0,0,0.05); }

.rk-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; align-items:start; }
@media (max-width:1240px){ .rk-grid { grid-template-columns:repeat(2, 1fr); } }
</style>
