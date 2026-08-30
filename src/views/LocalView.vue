<script setup>
import Sidebar from '../components/Sidebar.vue'
import { LOCAL_MASTERS, LOCAL_POSTS } from '../data/local'
</script>

<template>
  <div id="view-local">
    <div class="page">
      <Sidebar active="community" />
      <main class="local-main">
        <div class="tbar">
          <div class="tbar-in">
            <div class="tbar-tabs">
              <span class="tbtab nav-feed">关注</span>
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

        <div class="local-shell">
          <header class="local-hero">
            <div class="local-kicker">LOCAL CLASSROOMS · BEIJING</div>
            <div class="local-title-row">
              <div>
                <h1>北京 · 同城老师都在用的资源</h1>
                <p>同城，不是同校。按北京教材与教研语境，先找到一节能带回班里的课。</p>
              </div>
              <button class="loc-switch" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>
                切换城市
              </button>
            </div>
            <div class="local-proof-row">
              <span class="local-proof-dot"></span>
              <span>北京老师正在把这些资源带进真实课堂</span>
              <span class="local-proof-sep">·</span>
              <span>教材版本与教研场景优先</span>
            </div>
          </header>

          <section class="local-masters-section">
            <div class="section-heading">
              <div>
                <div class="section-eyebrow">PEOPLE &amp; PLACES</div>
                <h2>北京名师与教研主体</h2>
              </div>
              <span class="section-more">横向查看更多 <b>→</b></span>
            </div>
            <div class="local-master-strip">
              <div v-for="master in LOCAL_MASTERS" :key="master.name" class="local-master-chip nav-studio">
                <div v-if="master.kind === 'expert'" class="local-master-avatar" :class="{ initial: !master.portrait }">
                  <img v-if="master.portrait" :src="master.portrait" :alt="master.name" />
                  <span v-else>{{ master.initial }}</span>
                </div>
                <div v-else class="local-master-avatar institution-avatar">
                  <img v-if="master.logo" :src="master.logo" :alt="master.name" />
                </div>
                <div class="local-master-copy">
                  <div class="local-master-name" :title="master.name">{{ master.name }}</div>
                  <div class="local-master-cred">{{ master.cred }}</div>
                  <div class="local-master-signal">{{ master.signal }} <b>{{ master.use }}</b></div>
                </div>
                <span class="local-master-arrow">›</span>
              </div>
            </div>
          </section>

          <section class="local-feed-section">
            <div class="section-heading feed-heading">
              <div>
                <div class="section-eyebrow">USED IN BEIJING</div>
                <h2>本地热用资源</h2>
              </div>
              <span class="feed-note">按真实课堂使用排序</span>
            </div>
            <div class="local-feed-grid">
              <article v-for="post in LOCAL_POSTS" :key="post.resourceId" class="local-feed-card nav-res" :data-resource-id="post.resourceId">
                <div class="local-feed-cover">
                  <img :src="post.cover" :alt="`${post.title}封面`" loading="lazy" />
                  <span class="local-feed-badge">{{ post.badge }}</span>
                  <span class="local-feed-region">北京 · 同城</span>
                </div>
                <div class="local-feed-body">
                  <h3>{{ post.title }}</h3>
                  <div class="local-feed-meta">{{ post.meta }}</div>
                  <div class="local-feed-signal local-use-signal"><span></span>{{ post.localSignal }}</div>
                  <div class="local-feed-foot">
                    <span class="local-feed-avatar" :class="{ expert: post.verify === 'expert' }">{{ post.avatar }}</span>
                    <span class="local-feed-author">{{ post.author }}</span>
                    <span class="local-feed-role">{{ post.role }}</span>
                    <span class="local-feed-metric"><b>{{ post.use }}</b> 使用</span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.local-main { flex-grow:1; min-width:0; overflow-y:auto; height:100vh; background:#FAFAF8; color:#141F1B; }
.tbar { background:#fff; border-bottom:1px solid #EFEFEF; height:54px; display:flex; align-items:stretch; padding:0 32px; }
.tbar-in { display:flex; align-items:stretch; justify-content:space-between; width:100%; }
.tbar-tabs { display:flex; align-items:stretch; gap:26px; }
.tbar-search { display:flex; align-items:center; gap:8px; background:#F6F6F6; border:1px solid #ECECEC; border-radius:10px; padding:9px 14px; width:300px; align-self:center; font-size:13px; color:#9A9A9A; }

.local-shell { max-width:1240px; margin:0 auto; padding:34px 40px 72px; }
.local-hero { background:#F1EEE6; border:1px solid #E9E3D6; border-radius:18px; padding:28px 30px 22px; }
.local-kicker, .section-eyebrow { font-size:10px; letter-spacing:.18em; color:#8B7E65; font-weight:700; }
.local-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; margin-top:10px; }
.local-title-row h1 { margin:0; font-size:28px; line-height:1.25; letter-spacing:-.03em; font-weight:700; }
.local-title-row p { margin:9px 0 0; color:#777166; font-size:13px; line-height:21px; }
.loc-switch { flex:none; display:inline-flex; align-items:center; gap:7px; border:1px solid #D9D1C2; background:#FBF9F3; color:#504A3E; border-radius:10px; padding:8px 13px; font-size:12px; font-weight:600; cursor:pointer; }
.local-proof-row { display:flex; align-items:center; gap:8px; margin-top:22px; color:#6E685C; font-size:12px; }
.local-proof-dot, .local-feed-signal span { width:6px; height:6px; border-radius:50%; background:#B5860B; flex:none; }
.local-proof-sep { color:#C7BDAA; }

.local-masters-section { margin-top:38px; }
.section-heading { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:15px; }
.section-heading h2 { margin:5px 0 0; font-size:19px; letter-spacing:-.02em; }
.section-more, .feed-note { color:#8C8D89; font-size:12px; }
.section-more b { font-size:15px; font-weight:400; margin-left:3px; }
.local-master-strip { display:flex; gap:11px; overflow-x:auto; padding:3px 2px 13px; scrollbar-width:none; }
.local-master-strip::-webkit-scrollbar { display:none; }
.local-master-chip { position:relative; flex:0 0 272px; min-height:92px; display:flex; align-items:center; gap:12px; padding:14px 14px 14px 15px; border:1px solid #E8E8E4; background:#fff; border-radius:14px; cursor:pointer; transition:border-color .15s ease, transform .15s ease, box-shadow .15s ease; }
.local-master-chip:hover { border-color:#D2D0C6; box-shadow:0 8px 20px rgba(20,31,27,.06); transform:translateY(-2px); }
.local-master-avatar { width:48px; height:48px; border-radius:50%; flex:none; overflow:hidden; background:#ECECE8; display:flex; align-items:center; justify-content:center; color:#141F1B; font-size:17px; font-weight:700; box-shadow:0 0 0 2px #fff, 0 0 0 3px #D9AF3C; }
.local-master-avatar img { width:100%; height:100%; object-fit:cover; display:block; }
.local-master-avatar.initial { background:#E9E6DC; }
.local-master-avatar.institution-avatar { box-shadow:none; border:1px solid #E5E5DF; background:#F7F7F4; }
.local-master-copy { min-width:0; padding-right:11px; }
.local-master-name { font-size:13px; line-height:18px; font-weight:650; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.local-master-cred { margin-top:2px; color:#8A8B87; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.local-master-signal { margin-top:7px; color:#A08E62; font-size:10.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.local-master-signal b { color:#5D5548; font-weight:650; margin-left:2px; }
.local-master-arrow { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#B7B5AC; font-size:20px; font-weight:300; }

.local-feed-section { margin-top:30px; }
.feed-heading { align-items:center; }
.local-feed-grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:18px; }
.local-feed-card { min-width:0; background:#fff; border:1px solid #E8E8E4; border-radius:15px; overflow:hidden; cursor:pointer; transition:border-color .15s ease, transform .15s ease, box-shadow .15s ease; }
.local-feed-card:hover { border-color:#D2D0C6; box-shadow:0 10px 24px rgba(20,31,27,.07); transform:translateY(-2px); }
.local-feed-cover { position:relative; aspect-ratio:16 / 9; overflow:hidden; background:#EDEDE9; }
.local-feed-cover img { width:100%; height:100%; object-fit:cover; display:block; }
.local-feed-badge, .local-feed-region { position:absolute; top:11px; padding:4px 8px; border-radius:6px; font-size:10px; line-height:1; }
.local-feed-badge { left:11px; background:rgba(20,31,27,.84); color:#fff; }
.local-feed-region { right:11px; background:rgba(255,250,239,.94); color:#8A6D00; border:1px solid rgba(218,195,135,.7); }
.local-feed-body { padding:15px 16px 14px; }
.local-feed-body h3 { min-height:44px; margin:0; font-size:15px; line-height:22px; font-weight:600; letter-spacing:-.015em; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; }
.local-feed-meta { margin-top:9px; color:#92938E; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.local-feed-signal { display:flex; align-items:center; gap:6px; margin-top:11px; color:#8A6D00; font-size:11px; }
.local-feed-foot { display:flex; align-items:center; gap:6px; margin-top:14px; padding-top:11px; border-top:1px solid #F0F0ED; color:#92938E; font-size:11px; min-width:0; }
.local-feed-avatar { width:21px; height:21px; border-radius:50%; background:#ECECE8; color:#141F1B; display:inline-flex; align-items:center; justify-content:center; font-size:10px; flex:none; }
.local-feed-avatar.expert { box-shadow:0 0 0 1px #fff, 0 0 0 2px #D9AF3C; }
.local-feed-author { color:#333B37; font-weight:600; white-space:nowrap; }
.local-feed-role { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.local-feed-metric { margin-left:auto; flex:none; white-space:nowrap; color:#777973; }
.local-feed-metric b { color:#141F1B; font-weight:650; }

@media (max-width:1180px) {
  .local-shell { padding-left:28px; padding-right:28px; }
  .local-feed-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); }
}
@media (max-width:720px) {
  .tbar { padding:0 18px; }
  .tbar-search { width:180px; }
  .local-shell { padding:22px 18px 52px; }
  .local-hero { padding:22px 20px 18px; }
  .local-title-row h1 { font-size:23px; }
  .local-title-row { display:block; }
  .loc-switch { margin-top:15px; }
  .local-proof-row { flex-wrap:wrap; line-height:18px; }
  .local-feed-grid { grid-template-columns:1fr; }
}
</style>
