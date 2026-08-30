<script setup>
import Sidebar from '../components/Sidebar.vue'
import PostCard from '../components/PostCard.vue'
import { LOCAL_MASTERS, LOCAL_POSTS } from '../data/local'

const LOCAL_CARD_POSTS = LOCAL_POSTS.map((post) => ({
  to: 'res',
  cover: post.cover,
  badge: post.badge,
  region: '北京 · 同城',
  author: post.author,
  avatar: post.avatar,
  role: post.role,
  verify: post.verify,
  title: post.title,
  proof: { type: 'hot', text: post.localSignal },
  meta: post.meta,
  verified: false,
  evi: { use: post.use, adapt: post.adapt, star: post.star },
  resourceId: post.resourceId,
}))
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
          <section class="local-masters-section">
            <div class="section-heading">
              <div>
                <div class="section-eyebrow">PEOPLE &amp; PLACES</div>
                <h2>北京名师与教研主体</h2>
              </div>
              <button class="loc-switch" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>
                切换城市
              </button>
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
              <div v-for="post in LOCAL_CARD_POSTS" :key="post.resourceId" class="local-card-shell nav-res" :data-resource-id="post.resourceId">
                <PostCard :post="post" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.local-main { flex-grow:1; min-width:0; overflow-y:auto; height:100vh; background:#F7F7F7; color:#141F1B; }
.tbar { background:#FFFFFF; border-bottom:1px solid #ECECEC; height:54px; display:flex; align-items:stretch; padding:0 32px; }
.tbar-in { display:flex; align-items:stretch; justify-content:space-between; width:100%; }
.tbar-tabs { display:flex; align-items:stretch; gap:26px; }
.tbar-search { display:flex; align-items:center; gap:8px; background:#F7F7F7; border:1px solid #ECECEC; border-radius:10px; padding:9px 14px; width:300px; align-self:center; font-size:13px; color:#9A9A9A; }

.local-shell { max-width:1240px; margin:0 auto; padding:34px 40px 72px; }
.section-eyebrow { font-size:10px; letter-spacing:.18em; color:#9A9A9A; font-weight:700; }
.loc-switch { flex:none; display:inline-flex; align-items:center; gap:7px; border:1px solid #ECECEC; background:#FFFFFF; color:#141F1B; border-radius:10px; padding:8px 13px; font-size:12px; font-weight:600; cursor:pointer; }
.local-proof-row { display:flex; align-items:center; gap:8px; margin-top:22px; color:#7A7C7C; font-size:12px; }
.local-proof-dot, .local-feed-signal span { width:6px; height:6px; border-radius:50%; background:#141F1B; flex:none; }
.local-proof-sep { color:#ECECEC; }

.local-masters-section { margin-top:0; }
.section-heading { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:15px; }
.section-heading h2 { margin:5px 0 0; font-size:19px; letter-spacing:-.02em; }
.feed-note { color:#9A9A9A; font-size:12px; }
.local-master-strip { display:flex; gap:11px; overflow-x:auto; padding:3px 2px 13px; scrollbar-width:none; }
.local-master-strip::-webkit-scrollbar { display:none; }
.local-master-chip { position:relative; flex:0 0 272px; min-height:92px; display:flex; align-items:center; gap:12px; padding:14px 14px 14px 15px; border:1px solid #ECECEC; background:#FFFFFF; border-radius:16px; cursor:pointer; transition:border-color .15s ease, transform .15s ease, box-shadow .15s ease; box-shadow:0 1px 4px rgba(20,31,27,.02); }
.local-master-chip:hover { border-color:#ECECEC; box-shadow:0 4px 12px rgba(20,31,27,.03); transform:translateY(-2px); }
.local-master-avatar { width:48px; height:48px; border-radius:50%; flex:none; overflow:hidden; background:#F7F7F7; display:flex; align-items:center; justify-content:center; color:#141F1B; font-size:17px; font-weight:700; box-shadow:0 0 0 2px #fff, 0 0 0 3px #D9AF3C; }
.local-master-avatar img { width:100%; height:100%; object-fit:cover; display:block; }
.local-master-avatar.initial { background:#F7F7F7; }
.local-master-avatar.institution-avatar { box-shadow:none; border:1px solid #ECECEC; background:#F7F7F7; }
.local-master-copy { min-width:0; padding-right:11px; }
.local-master-name { font-size:13px; line-height:18px; font-weight:650; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.local-master-cred { margin-top:2px; color:#9A9A9A; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.local-master-signal { margin-top:7px; color:#7A7C7C; font-size:10.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.local-master-signal b { color:#141F1B; font-weight:650; margin-left:2px; }
.local-master-arrow { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#9A9A9A; font-size:20px; font-weight:300; }

.local-feed-section { margin-top:30px; }
.feed-heading { align-items:center; }
.local-feed-grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:18px; }
.local-card-shell { min-width:0; }
.local-card-shell :deep(.pc) { min-height:100%; }

@media (max-width:1180px) {
  .local-shell { padding-left:28px; padding-right:28px; }
  .local-feed-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); }
}
@media (max-width:720px) {
  .tbar { padding:0 18px; }
  .tbar-search { width:180px; }
  .local-shell { padding:22px 18px 52px; }
  .section-heading { align-items:flex-start; gap:14px; }
  .section-heading .loc-switch { margin-top:4px; }
  .local-feed-grid { grid-template-columns:1fr; }
}
</style>
