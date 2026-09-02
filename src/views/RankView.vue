<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import RankBoardCard from '../components/RankBoardCard.vue'
import { BOARDS, EDITORIAL_FEATURES } from '../data/rank'

const periods = ['本周', '本月', '年度']
const subjects = ['全部', '语文', '数学', '英语']
const activePeriod = ref('本周')
const activeSubject = ref('全部')

const mainBoard = BOARDS.find(board => board.key === 'classroom')
const hotBoard = BOARDS.find(board => board.key === 'latest')
const remixBoard = BOARDS.find(board => board.key === 'adaptation')
const creatorBoard = BOARDS.find(board => board.key === 'recognized')
</script>

<template>
  <div id="view-rank">
    <div class="page">
      <Sidebar active="community" />
      <main class="rank-main">
        <div class="tbar">
          <div class="tbar-in">
            <div class="tbar-tabs">
              <span class="tbtab on nav-rank">排行榜</span>
              <span class="tbtab nav-discover">发现</span>
            </div>
            <div class="tbar-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>搜名师、技能、课件、教案…</div>
          </div>
        </div>

        <!-- 全局学科切换（管全站内容） -->
        <div class="rank-subbar">
          <div class="rank-subbar-in">
            <span class="rank-subbar-label">学科</span>
            <div class="seg" role="tablist" aria-label="学科">
              <button v-for="subject in subjects" :key="subject" type="button" class="seg-btn" :class="{ on: activeSubject === subject }" @click="activeSubject = subject">{{ subject }}</button>
            </div>
          </div>
        </div>

        <div class="rank-shell">
          <!-- 1. 编辑推荐（运营精选，固定不挂筛选） -->
          <section class="rank-block" aria-label="编辑推荐">
            <div class="rank-heading">
              <div class="rank-heading-title">
                <h2>编辑推荐</h2>
                <span class="rank-heading-note">本周值得被看见的课堂方法</span>
              </div>
            </div>
            <div class="rank-editorial-grid">
              <article v-for="feature in EDITORIAL_FEATURES" :key="feature.key" class="rank-editorial-card" :class="feature.target === 'studio' ? 'nav-studio' : 'nav-res'" :data-resource-id="feature.resourceId" :data-studio-name="feature.target === 'studio' ? feature.author : undefined" tabindex="0" role="button">
                <div class="rank-editorial-cover">
                  <img :src="feature.cover" :alt="feature.title + '主视觉'" />
                  <span class="rank-editorial-eyebrow">{{ feature.eyebrow }}</span>
                </div>
                <div class="rank-editorial-copy">
                  <h3>{{ feature.title }}</h3>
                  <p>{{ feature.desc }}</p>
                  <div class="rank-editorial-foot">
                    <div class="rank-author">
                      <span class="rank-avatar"><img v-if="feature.portrait" :src="feature.portrait" alt="" /><b v-else>{{ feature.initial }}</b></span>
                      <span class="rank-author-name">{{ feature.author }}</span>
                      <span v-if="feature.role" class="rank-role-badge">{{ feature.role }}</span>
                    </div>
                    <span v-if="feature.metric" class="rank-editorial-metric"><b>{{ feature.metric }}</b> {{ feature.metricLabel }}</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- 2. 课堂使用榜（主榜，周期筛选归属这里；学科随全局） -->
          <section class="rank-block" aria-label="课堂使用榜">
            <div class="rank-heading rank-heading-filter">
              <div class="rank-heading-title">
                <h2>课堂使用榜</h2>
                <span class="rank-heading-note">真的被带进课堂的，不是刷出来的</span>
              </div>
              <div class="seg" role="tablist" aria-label="周期">
                <button v-for="period in periods" :key="period" type="button" class="seg-btn" :class="{ on: activePeriod === period }" @click="activePeriod = period">{{ period }}</button>
              </div>
            </div>
            <RankBoardCard :board="mainBoard" variant="main" :period="activePeriod" :subject="activeSubject" />
          </section>

          <!-- 3. 每周热门（跟随全局学科，无周期切换——它本就是"每周"） -->
          <section class="rank-block" aria-label="每周热门">
            <div class="rank-heading">
              <div class="rank-heading-title">
                <h2>每周热门</h2>
                <span class="rank-heading-note">本周老师用得最多的资源</span>
              </div>
            </div>
            <RankBoardCard :board="hotBoard" variant="grid" :subject="activeSubject" />
          </section>

          <!-- 4. 优质改编（随全局学科） -->
          <section class="rank-block" aria-label="优质改编">
            <div class="rank-heading">
              <div class="rank-heading-title">
                <h2>优质改编</h2>
                <span class="rank-heading-note">沿着真实课堂继续长出的新版本</span>
              </div>
            </div>
            <RankBoardCard :board="remixBoard" variant="remix" :subject="activeSubject" />
          </section>

          <!-- 创作者贡献榜（随全局学科） -->
          <section class="rank-block rank-creator-block" aria-label="创作者榜">
            <div class="rank-heading">
              <div class="rank-heading-title">
                <h2>创作者贡献榜</h2>
                <span class="rank-heading-note">看见把课堂方法做成作品的人</span>
              </div>
            </div>
            <RankBoardCard :board="creatorBoard" variant="creator" :period="activePeriod" :subject="activeSubject" />
          </section>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
button { font:inherit; }
.rank-main { flex:1; min-width:0; height:100vh; overflow-y:auto; background:#F7F7F7; }
.tbar { display:flex; align-items:stretch; padding:0 32px; background:#FFFFFF; border-bottom:1px solid #ECECEC; }
.tbar-in { display:flex; align-items:stretch; justify-content:space-between; width:100%; }
.tbar-tabs { display:flex; align-items:stretch; gap:26px; }
.tbar-search { display:flex; align-items:center; gap:8px; background:#F7F7F7; border:1px solid #ECECEC; border-radius:10px; padding:9px 14px; width:300px; align-self:center; font-size:13px; color:#9A9A9A; }

/* 全局学科条 */
.rank-subbar { position:sticky; top:0; z-index:5; background:rgba(247,247,247,.92); backdrop-filter:saturate(1.4) blur(6px); border-bottom:1px solid #ECECEC; }
.rank-subbar-in { display:flex; align-items:center; gap:10px; max-width:1220px; margin:0 auto; padding:11px 34px; }
.rank-subbar-label { color:#9A9A9A; font-size:12px; }

.rank-shell { max-width:1220px; margin:0 auto; padding:24px 34px 64px; }
.rank-block { margin-bottom:30px; }
.rank-creator-block > .rank-heading, .rank-creator-block :deep(.rank-creator-board) { max-width:1040px; margin-left:auto; margin-right:auto; }
.rank-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:18px; margin-bottom:14px; }
.rank-heading-title { min-width:0; }
.rank-heading-title h2 { margin:0; color:#141F1B; font-size:19px; letter-spacing:-.03em; }
.rank-heading-note { display:block; margin-top:5px; color:#9A9A9A; font-size:12px; }

/* 分段控件 */
.seg { display:inline-flex; gap:2px; padding:3px; border-radius:10px; background:#EDEDED; flex:0 0 auto; }
.seg-btn { border:0; border-radius:7px; padding:6px 13px; background:transparent; color:#6E706F; font-size:12px; cursor:pointer; transition:color .15s ease, background .15s ease; }
.seg-btn:hover { color:#141F1B; }
.seg-btn.on { background:#FFFFFF; color:#141F1B; font-weight:600; box-shadow:0 1px 2px rgba(20,31,27,.08); }

/* 编辑推荐 */
.rank-editorial-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
.rank-editorial-card { display:grid; grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr); min-width:0; overflow:hidden; border:1px solid #ECECEC; border-radius:16px; background:#FFFFFF; box-shadow:0 2px 8px rgba(20,31,27,.03); cursor:pointer; transition:transform .18s ease,box-shadow .18s ease; }
.rank-editorial-card > * { min-width:0; }
.rank-editorial-card:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(20,31,27,.06); }
.rank-editorial-cover { position:relative; min-height:172px; overflow:hidden; background:#F7F7F7; }
.rank-editorial-cover img { width:100%; height:100%; display:block; object-fit:cover; }
.rank-editorial-eyebrow { position:absolute; left:10px; top:10px; padding:5px 8px; border-radius:8px; background:#141F1B; color:#FFFFFF; font-size:9px; font-weight:700; }
.rank-editorial-copy { display:flex; flex-direction:column; justify-content:center; min-width:0; padding:18px 18px; }
.rank-editorial-copy h3 { margin:0; color:#141F1B; font-size:16px; line-height:1.4; }
.rank-editorial-copy p { margin:8px 0 18px; color:#7A7C7C; font-size:12px; line-height:1.6; }
.rank-editorial-foot { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.rank-editorial-card .rank-author { display:flex; align-items:center; gap:5px; min-width:0; flex:1 1 auto; overflow:hidden; color:#7A7C7C; font-size:10px; font-weight:600; }
.rank-editorial-card .rank-author-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rank-editorial-card .rank-avatar { width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; border:1px solid #ECECEC; border-radius:50%; background:#F7F7F7; color:#141F1B; font-size:9px; }
.rank-editorial-card .rank-avatar img { width:100%; height:100%; object-fit:cover; }
.rank-editorial-card .rank-avatar b { font-weight:700; }
.rank-editorial-card .rank-role-badge { display:inline-block; flex:0 0 auto; padding:2px 6px; border:1px solid #D9AF3C; border-radius:8px; color:#8A6D00; font-size:9px; font-weight:700; line-height:1.2; white-space:nowrap; }
.rank-editorial-metric { flex:0 0 auto; color:#7A7C7C; font-size:10px; white-space:nowrap; }
.rank-editorial-metric b { color:#141F1B; font-size:14px; }

@media (max-width:1300px) { .rank-shell, .rank-subbar-in { padding-left:24px; padding-right:24px; } }
@media (max-width:900px) { .rank-heading-filter { flex-direction:column; align-items:flex-start; gap:12px; } }
@media (max-width:720px) { .rank-shell { padding:22px 16px 46px; } .rank-editorial-grid { grid-template-columns:1fr; } .rank-editorial-card { grid-template-columns:1fr; } .rank-editorial-cover { min-height:160px; aspect-ratio:16 / 9; } .seg { flex-wrap:wrap; } }
</style>
