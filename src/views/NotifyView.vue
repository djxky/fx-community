<script setup>
import Sidebar from '../components/Sidebar.vue'

const NOTIFY_TODAY = [
  { kind: 'flip', pinned: true, gold: true, unread: true, time: '12 分钟前', text: '名师 <b>刘彭芝</b> 翻牌了你的《谁杀了祥林嫂》', action: '查看名师点评', to: 'creator' },
  { kind: 'comment', gold: true, unread: true, time: '1 小时前', text: '<b>沈知微</b> 评论了你的《谁杀了祥林嫂》：“学生抢着当首席检察官”', action: '查看评论', to: 'res' },
  { kind: 'collect', gold: true, unread: true, time: '2 小时前', text: '<b>张伟</b> 收藏了你的《谁杀了祥林嫂》', action: '查看作品', to: 'res' },
  { kind: 'adapt', gold: true, unread: true, time: '3 小时前', text: '<b>周涛</b> 基于你的《谁杀了祥林嫂》创建了改编版', action: '查看改编脉络', to: 'lineage' },
  { kind: 'rank', gold: true, unread: true, time: '3 小时前', text: '你的《谁杀了祥林嫂》冲上「真实课堂使用榜」<b>TOP 2</b>' },
  { kind: 'milestone', gold: true, time: '5 小时前', text: '你的作品累计被 <b>4,900</b> 位老师用进课堂,达成「真实课堂」里程碑' },
]
const NOTIFY_WEEK = [
  { kind: 'announcement', time: '昨天', text: '<b>平台公告</b>：飞象社区共创季开启,欢迎提交你的课堂改编' },
]
const EMO = { flip: '🏅', comment: '💬', collect: '🔖', adapt: '🔁', adopt: '🤝', rank: '🏆', milestone: '🎉', announcement: '📣' }
</script>

<template>
  <div id="view-notify">
    <div class="page">
      <Sidebar active="community" />
      <main style="flex-grow:1;min-width:0;overflow-y:auto;height:100vh;background:#F7F7F7;">
      <div class="nt-wrap">
        <div class="nt-head">
          <div class="nt-title">消息中心</div>
          <span class="nt-read">全部已读</span>
        </div>

        <!-- 消息:评论、收藏、改编与平台动态 -->
          <div class="nt-sec">今天</div>
          <div class="nt-card">
            <div v-for="(n, i) in NOTIFY_TODAY" :key="i" class="nt-row" :class="{ 'nt-row-gold': n.gold, 'nt-row-pinned': n.pinned }">
              <span class="nt-ic" :class="n.kind">
                <span v-if="EMO[n.kind]">{{ EMO[n.kind] }}</span>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v6a3 3 0 003 3h6"></path><path d="M15 9l3 3-3 3"></path></svg>
              </span>
              <div class="nt-body">
                <div class="nt-text" v-html="n.text"></div>
                <div class="nt-meta"><span>{{ n.time }}</span><span v-if="n.action" class="nt-act" :class="{ 'nav-creator': n.to === 'creator' }">· {{ n.action }} ›</span></div>
              </div>
              <span v-if="n.unread" class="nt-unread"></span>
            </div>
          </div>
          <div class="nt-sec">本周</div>
          <div class="nt-card">
            <div v-for="(n, i) in NOTIFY_WEEK" :key="i" class="nt-row" :class="{ 'nt-row-gold': n.gold, 'nt-row-pinned': n.pinned }">
              <span class="nt-ic" :class="n.kind">
                <span v-if="EMO[n.kind]">{{ EMO[n.kind] }}</span>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
              </span>
              <div class="nt-body">
                <div class="nt-text" v-html="n.text"></div>
                <div class="nt-meta"><span>{{ n.time }}</span></div>
              </div>
            </div>
          </div>
      </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.nt-wrap { max-width:680px; margin:0 auto; padding:28px 24px 70px; }
.nt-back { display:inline-flex; align-items:center; gap:6px; font-size:13.5px; color:#7A7C7C; cursor:pointer; margin-bottom:14px; }
.nt-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.nt-title { font-size:24px; font-weight:700; color:#141F1B; }
.nt-read { font-size:13px; color:#7A7C7C; cursor:pointer; }

.nt-sec { font-size:13px; color:#9A9A9A; font-weight:600; margin:0 2px 10px; }
.nt-card { background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:6px 18px; margin-bottom:20px; }
.nt-row { display:flex; align-items:flex-start; gap:13px; padding:14px 0; border-top:1px solid #F6F6F6; position:relative; }
.nt-row:first-child { border-top:none; }
.nt-ic { flex-shrink:0; width:34px; height:34px; border-radius:10px; background:#F6F6F6; display:flex; align-items:center; justify-content:center; font-size:16px; }
.nt-ic.flip, .nt-ic.adopt, .nt-ic.rank, .nt-ic.milestone { background:#FFF6DF; border:1px solid #FBEFC6; }
.nt-row-gold { background:#FFF6DF; border:1px solid #FBEFC6; border-left:3px solid #D9AF3C; border-radius:12px; padding:13px 12px; margin:8px 0; }
.nt-row-gold + .nt-row-gold { border-top:1px solid #FBEFC6; }
.nt-row-pinned { box-shadow:0 2px 0 rgba(217,175,60,.12); }
.nt-body { flex-grow:1; min-width:0; }
.nt-text { font-size:13.5px; color:#141F1B; line-height:1.6; }
.nt-text :deep(b) { font-weight:700; }
.nt-meta { display:flex; align-items:center; gap:6px; margin-top:5px; font-size:12px; color:#9A9A9A; }
.nt-act { color:#7A7C7C; cursor:pointer; }
.nt-unread { position:absolute; top:18px; right:0; width:7px; height:7px; border-radius:50%; background:#FF4832; }
</style>
