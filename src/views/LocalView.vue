<script setup>
import Sidebar from '../components/Sidebar.vue'
import MasterCard from '../components/MasterCard.vue'
import PostCard from '../components/PostCard.vue'
import { LOCAL_MASTERS, LOCAL_POSTS } from '../data/local'
</script>

<template>
  <div id="view-local">
    <div class="page">
      <Sidebar active="community" />
      <main style="flex-grow:1; min-width:0; overflow-y:auto; height:100vh;">
        <div class="tbar">
          <div class="tbar-in">
            <div class="tbar-tabs">
              <span class="tbtab nav-discover">关注</span>
              <span class="tbtab nav-discover">发现</span>
              <span class="tbtab on nav-local">本地</span>
              <span class="tbtab nav-rank">排行榜</span>
            </div>
            <div class="tbar-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
              搜名师、技能、课件、教案…
            </div>
          </div>
        </div>

        <div style="padding:24px 32px 60px;">
          <div class="loc-hd">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>
            <span class="loc-city">北京</span>
            <span class="loc-note">同城老师都在用的资源,教材版本对得上、拿来即用</span>
            <button class="loc-switch">切换城市</button>
          </div>

          <div class="sec-hd">
            <span class="sec-t">北京名师</span>
            <span class="sec-more">查看全部 ›</span>
          </div>
          <div class="mrow">
            <MasterCard v-for="(m, i) in LOCAL_MASTERS" :key="i" :m="m" />
          </div>

          <div class="sec-hd">
            <span class="sec-t">本地精选资源</span>
            <span class="sec-more">换一批</span>
          </div>
          <div class="flow">
            <PostCard v-for="(p, i) in LOCAL_POSTS" :key="i" :post="p" />
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

.loc-hd { display:flex; align-items:center; gap:10px; margin-bottom:24px; }
.loc-city { font-size:18px; font-weight:600; color:#141F1B; }
.loc-note { font-size:13px; color:#9A9A9A; }
.loc-switch { margin-left:auto; background:#fff; border:1px solid #ECECEC; border-radius:10px; padding:7px 14px; font-size:13px; color:#141F1B; font-weight:500; cursor:pointer; }

.sec-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.sec-t { font-size:16px; font-weight:700; color:#141F1B; }
.sec-more { font-size:13px; color:#9A9A9A; cursor:pointer; }
.mrow { display:flex; gap:14px; overflow-x:auto; padding-bottom:6px; margin-bottom:28px; }
.flow { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; }
@media (max-width:1180px){ .flow { grid-template-columns:repeat(2, 1fr); } }
</style>
