<script setup>
import { store } from '../store'
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
              <span class="ntab" data-view="feed">关注</span>
              <span class="ntab on" data-view="discover">发现</span>
              <span class="tbtab nav-local">本地</span>
              <span class="tbtab nav-rank">排行榜</span>
            </div>
            <div class="tbar-right">
              <div class="tbar-subj" title="切换学科·学段(通常不常改)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 00-2 2z"></path><path d="M19 3v18"></path></svg>
                语文 · 初中
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
              </div>
              <div class="tbar-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
                搜知识点、课型、课件、教案…
              </div>
            </div>
          </div>
        </div>

        <!-- 发现 -->
        <div id="disc-body" style="padding:24px 32px 48px;">
          <!-- 名师·上新播报位:有新入驻才展示,可收起(收起后只在有新时再冒头) -->
          <template v-if="!store.mastersCollapsed">
            <div class="sec-hd">
              <span class="sec-t">名师智库 · 特邀专家<span class="nr-new">本周 3 位新入驻</span></span>
              <div class="nr-hd-r">
                <span class="sec-more">查看专家名录 ›</span>
                <span class="nr-collapse" @click="store.mastersCollapsed = true" title="收起(有新入驻时再提醒你)">
                  收起
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"></path></svg>
                </span>
              </div>
            </div>
            <div class="mrow">
              <MasterCard v-for="(m, i) in MASTERS" :key="i" :m="m" />
            </div>
          </template>
          <div v-else class="nr-mini" @click="store.mastersCollapsed = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"></path><path d="M6 12v4.5c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5V12"></path></svg>
            <span>本周 <b>3 位专家</b> · <b>2 家机构</b> 新入驻飞象</span>
            <span class="nr-expand">展开 ›</span>
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
.tbar-right { display:flex; align-items:center; gap:12px; align-self:center; }
.tbar-subj { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:#141F1B; padding:8px 12px; border:1px solid #ECECEC; border-radius:10px; cursor:pointer; white-space:nowrap; }
.tbar-subj:hover { background:#F6F6F6; }
.tbar-search { display:flex; align-items:center; gap:8px; background:#F6F6F6; border:1px solid #ECECEC; border-radius:10px; padding:9px 14px; width:260px; font-size:13px; color:#9A9A9A; }

.sec-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.sec-t { font-size:16px; font-weight:700; color:#141F1B; display:flex; align-items:center; }
.sec-more { font-size:13px; color:#9A9A9A; cursor:pointer; }
.mrow { display:flex; align-items:stretch; gap:16px; overflow-x:auto; padding-bottom:6px; margin-bottom:32px; }

/* 名师上新播报位 */
.nr-new { margin-left:10px; font-size:11.5px; font-weight:600; color:#8A6D00; background:#FFF6DF; border:1px solid #FBEFC6; border-radius:7px; padding:2px 8px; }
.nr-hd-r { display:flex; align-items:center; gap:16px; }
.nr-collapse { display:inline-flex; align-items:center; gap:3px; font-size:13px; color:#9A9A9A; cursor:pointer; }
.nr-collapse:hover { color:#141F1B; }
.nr-mini { display:flex; align-items:center; gap:9px; padding:12px 16px; margin-bottom:26px; background:#FAFAF8; border:1px solid #EFEFEF; border-radius:12px; cursor:pointer; font-size:13.5px; color:#7A7C7C; }
.nr-mini:hover { background:#F4F4F1; }
.nr-mini b { color:#141F1B; font-weight:600; }
.nr-expand { margin-left:auto; font-size:13px; color:#141F1B; font-weight:500; }

.chips { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:32px; }

.flow-hd { margin-bottom:16px; }
.flow-t { font-size:16px; font-weight:700; color:#141F1B; }
.flow { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; }
@media (max-width:1180px){ .flow { grid-template-columns:repeat(2, 1fr); } }
</style>
