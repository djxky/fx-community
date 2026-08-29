<script setup>
import Sidebar from '../components/Sidebar.vue'
import MasterCard from '../components/MasterCard.vue'
import PostCard from '../components/PostCard.vue'
import { MASTERS } from '../data/masters'
import { POSTS } from '../data/discover'
import feed from './raw/discover_feed.html?raw'

const CHIPS = ['推荐', '互动课件', '教学游戏', '应用', '技能', '教案', '题单']
</script>

<template>
  <div id="view-discover">
    <div class="page">
      <Sidebar active="community" />
      <main style="flex-grow:1; min-width:0; overflow-y:auto; height:100vh;">
        <!-- 顶栏 -->
        <div class="tbar">
          <div class="tbar-in">
            <div class="tbar-tabs">
              <span class="ntab on" data-view="discover">发现</span>
              <span class="ntab" data-view="feed">关注</span>
              <span class="tbtab nav-local">本地</span>
              <span class="tbtab nav-rank">排行榜</span>
            </div>
            <div class="tbar-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
              搜名师、技能、课件、教案…
            </div>
          </div>
        </div>

        <!-- 发现 -->
        <div id="disc-body" style="padding:22px 32px 40px;">
          <div class="sec-hd">
            <span class="sec-t">名师智库 · 特邀专家</span>
            <span class="sec-more">查看专家名录 ›</span>
          </div>
          <div class="mrow">
            <MasterCard v-for="(m, i) in MASTERS" :key="i" :m="m" />
          </div>

          <div class="chips">
            <span v-for="(c, i) in CHIPS" :key="i" class="tchip2" :class="{ on: i === 0 }">{{ c }}</span>
          </div>

          <div class="sec-hd flow-hd">
            <span class="flow-t">精选教学灵感</span>
            <span class="sec-more">换一批</span>
          </div>
          <div class="flow">
            <PostCard v-for="(p, i) in POSTS" :key="i" :post="p" />
          </div>
        </div>

        <!-- 关注(保留迁移内容) -->
        <div id="feed-body" style="display:none; padding:28px 48px 56px;" v-html="feed"></div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.tbar { background:#fff; border-bottom:1px solid #EFEFEF; height:54px; display:flex; align-items:stretch; padding:0 32px; }
.tbar-in { display:flex; align-items:stretch; justify-content:space-between; width:100%; }
.tbar-tabs { display:flex; align-items:stretch; gap:26px; }
.tbar-search { display:flex; align-items:center; gap:8px; background:#F6F6F6; border:1px solid #ECECEC; border-radius:10px; padding:9px 14px; width:300px; align-self:center; font-size:13px; color:#9A9A9A; }

.sec-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.sec-t { font-size:16px; font-weight:700; color:#141F1B; }
.sec-more { font-size:13px; color:#9A9A9A; cursor:pointer; }
.mrow { display:flex; gap:14px; overflow-x:auto; padding-bottom:6px; margin-bottom:26px; }

.chips { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:26px; }

.flow-hd { margin-bottom:16px; }
.flow-t { font-size:17px; font-weight:700; color:#141F1B; }
.flow { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; }
@media (max-width:1180px){ .flow { grid-template-columns:repeat(2, 1fr); } }
</style>
