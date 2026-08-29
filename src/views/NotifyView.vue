<script setup>
import { ref } from 'vue'
// 消息中心:影响力(飞象独有·主线B) / 互动(标准社交) / 私信(首版未开放)
const tab = ref('impact')

const IMPACT_TODAY = [
  { kind: 'use', unread: true, time: '12 分钟前', text: '云南昭通 · 王老师 把你的《谁杀了祥林嫂 · 沉浸式剧本杀》<b>用进了今天的语文课</b>', action: '看 TA 的课堂反馈' },
  { kind: 'milestone', unread: true, time: '2 小时前', text: '你的《谁杀了祥林嫂》冲上「真实课堂使用榜」<b>TOP 2</b>' },
  { kind: 'expert', unread: true, time: '3 小时前', text: '名师 <b>刘彭芝</b> 推荐了你的《谁杀了祥林嫂》,推荐后新增 <b>320</b> 次使用' },
  { kind: 'adapt', time: '5 小时前', text: '周涛 基于你的 V10 <b>改编</b>了「县中简化版」,已被 340 位老师使用', action: '看改编脉络' },
]
const IMPACT_WEEK = [
  { kind: 'adopt', time: '2 天前', text: '李明 采纳了你的建议,你进入了《圆柱体积》的<b>共创名单</b>' },
  { kind: 'summary', time: '本周', text: '本周你的作品共被 <b>1,280</b> 位老师用进课堂,覆盖 <b>14</b> 个省' },
]
const INTERACT = [
  { kind: 'flip', time: '昨天', avatar: '苏', text: '特级教师 <b>苏窈</b> 置顶回复了你的评论:"拆成两轮太好了"' },
  { kind: 'comment', time: '昨天', avatar: '李', text: '<b>李敏</b> 评论了你的《谁杀了祥林嫂》:"学生抢着当首席检察官"' },
  { kind: 'like', time: '2 天前', avatar: '陈', text: '<b>陈红</b> 等 <b>128</b> 人点赞了你的教学灵感' },
  { kind: 'collect', time: '3 天前', avatar: '张', text: '<b>张伟</b> 等 <b>56</b> 人收藏了你的《谁杀了祥林嫂》' },
  { kind: 'follow', time: '3 天前', avatar: '刘', text: '<b>刘洋</b> 等 <b>32</b> 位老师 关注了你' },
]
const EMO = { use: '📖', milestone: '🏆', expert: '🏅', adapt: '', adopt: '', summary: '📊', flip: '💬', comment: '💬', like: '👍', collect: '', follow: '' }
</script>

<template>
  <div id="view-notify">
    <main style="flex-grow:1;min-width:0;overflow-y:auto;height:100vh;background:#F7F7F7;">
      <div class="nt-wrap">
        <div class="nt-back nav-discover">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>返回社区
        </div>

        <div class="nt-head">
          <div class="nt-title">消息中心</div>
          <span class="nt-read">全部已读</span>
        </div>

        <div class="nt-tabs">
          <span class="nt-tab" :class="{ on: tab === 'impact' }" @click="tab = 'impact'">影响力<span class="nt-badge">3</span></span>
          <span class="nt-tab" :class="{ on: tab === 'interact' }" @click="tab = 'interact'">互动</span>
          <span class="nt-tab off" title="首版未开放">私信</span>
        </div>

        <!-- 影响力(飞象独有) -->
        <template v-if="tab === 'impact'">
          <div class="nt-hl">
            <b>1,280</b><span>位老师用进课堂</span><span class="nt-dot">·</span>
            <b>14</b><span>个省</span><span class="nt-dot">·</span>
            <b>76</b><span>次被改编</span>
            <span style="margin-left:auto;font-size:12px;color:#9A9A9A;">近 7 天</span>
          </div>
          <div class="nt-sec">今天</div>
          <div class="nt-card">
            <div v-for="(n, i) in IMPACT_TODAY" :key="i" class="nt-row">
              <span class="nt-ic" :class="n.kind">
                <span v-if="EMO[n.kind]">{{ EMO[n.kind] }}</span>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v6a3 3 0 003 3h6"></path><path d="M15 9l3 3-3 3"></path></svg>
              </span>
              <div class="nt-body">
                <div class="nt-text" v-html="n.text"></div>
                <div class="nt-meta"><span>{{ n.time }}</span><span v-if="n.action" class="nt-act">· {{ n.action }} ›</span></div>
              </div>
              <span v-if="n.unread" class="nt-unread"></span>
            </div>
          </div>
          <div class="nt-sec">本周</div>
          <div class="nt-card">
            <div v-for="(n, i) in IMPACT_WEEK" :key="i" class="nt-row">
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
        </template>

        <!-- 互动 -->
        <template v-else-if="tab === 'interact'">
          <div class="nt-card" style="margin-top:4px;">
            <div v-for="(n, i) in INTERACT" :key="i" class="nt-row">
              <span class="nt-av">{{ n.avatar }}</span>
              <div class="nt-body">
                <div class="nt-text" v-html="n.text"></div>
                <div class="nt-meta"><span>{{ n.time }}</span></div>
              </div>
            </div>
          </div>
        </template>

        <!-- 私信 -->
        <template v-else>
          <div class="nt-empty">
            <div style="font-size:15px;font-weight:600;color:#141F1B;">私信暂未开放</div>
            <div style="font-size:13px;color:#9A9A9A;margin-top:8px;line-height:1.7;max-width:360px;">首版先不开私信,把交流留在作品评论区——问作者、提建议都在那里,既公开、也能被采纳成共创。</div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.nt-wrap { max-width:680px; margin:0 auto; padding:28px 24px 70px; }
.nt-back { display:inline-flex; align-items:center; gap:6px; font-size:13.5px; color:#7A7C7C; cursor:pointer; margin-bottom:14px; }
.nt-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.nt-title { font-size:24px; font-weight:700; color:#141F1B; }
.nt-read { font-size:13px; color:#7A7C7C; cursor:pointer; }

.nt-tabs { display:flex; gap:24px; border-bottom:1px solid #ECECEC; margin-bottom:20px; }
.nt-tab { position:relative; padding:0 0 12px; font-size:15px; font-weight:500; color:#9A9A9A; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; }
.nt-tab.on { color:#141F1B; font-weight:700; border-bottom-color:#141F1B; }
.nt-tab.off { color:#D4D4D4; cursor:not-allowed; }
.nt-badge { margin-left:5px; font-size:11px; background:#FF4832; color:#fff; border-radius:999px; padding:0 6px; font-weight:600; vertical-align:top; }

.nt-hl { display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #ECECEC; border-radius:14px; padding:16px 20px; margin-bottom:22px; }
.nt-hl b { font-size:20px; font-weight:700; color:#141F1B; }
.nt-hl span { font-size:12.5px; color:#9A9A9A; }
.nt-hl .nt-dot { color:#D4D4D4; margin:0 4px; }

.nt-sec { font-size:13px; color:#9A9A9A; font-weight:600; margin:0 2px 10px; }
.nt-card { background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:6px 18px; margin-bottom:20px; }
.nt-row { display:flex; align-items:flex-start; gap:13px; padding:14px 0; border-top:1px solid #F6F6F6; position:relative; }
.nt-row:first-child { border-top:none; }
.nt-ic { flex-shrink:0; width:34px; height:34px; border-radius:10px; background:#F6F6F6; display:flex; align-items:center; justify-content:center; font-size:16px; }
.nt-ic.expert, .nt-ic.milestone { background:#FFF6DF; border:1px solid #FBEFC6; }
.nt-av { flex-shrink:0; width:34px; height:34px; border-radius:50%; background:#ECECEC; color:#141F1B; font-size:13px; display:flex; align-items:center; justify-content:center; }
.nt-body { flex-grow:1; min-width:0; }
.nt-text { font-size:13.5px; color:#141F1B; line-height:1.6; }
.nt-text :deep(b) { font-weight:700; }
.nt-meta { display:flex; align-items:center; gap:6px; margin-top:5px; font-size:12px; color:#9A9A9A; }
.nt-act { color:#7A7C7C; cursor:pointer; }
.nt-unread { position:absolute; top:18px; right:0; width:7px; height:7px; border-radius:50%; background:#FF4832; }
.nt-empty { background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:48px 24px; text-align:center; display:flex; flex-direction:column; align-items:center; }
</style>
