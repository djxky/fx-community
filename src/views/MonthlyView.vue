<script setup>
import Sidebar from '../components/Sidebar.vue'
// 教学月志 —— 月度镜子:值得 / 链接 / 自己。"数据不是监控,是镜子。"
const KW = ['大单元教学', '沉浸式课堂', '整本书阅读', '分层作业', '课堂追问']
</script>

<template>
  <div id="view-monthly">
    <div class="page">
      <Sidebar active="" />
      <main style="flex-grow:1;min-width:0;overflow-y:auto;height:100vh;background:#F7F7F7;">
      <div class="mz-wrap">
        <div class="mz-back nav-creator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>返回创作者中心
        </div>

        <div class="mz-head">
          <div>
            <div class="mz-kicker">2026 年 8 月 · 教学月志</div>
            <div class="mz-title">这个月,你留下了这些</div>
            <div class="mz-sub">数据不是监控,是镜子;不是审判,是懂得。</div>
          </div>
          <div class="avatar mz-av">樱</div>
        </div>

        <!-- 值得 -->
        <div class="mz-card">
          <div class="mz-h"><span class="mz-tag">值得</span>你打磨的每一分心血,都有回响</div>
          <div class="mz-stats">
            <div class="mz-stat"><b>7</b><span>本月产出</span></div>
            <div class="mz-stat"><b>34</b><span>打磨轮次</span></div>
            <div class="mz-stat"><b>1,280</b><span>本月被使用</span></div>
            <div class="mz-stat"><b>23</b><span>被改编</span></div>
          </div>
          <div class="mz-note">把"打磨轮次"和"被改编次数"放在一起看——你反复改的那几处,正是别人最愿意拿走的地方。</div>
        </div>

        <!-- 链接 -->
        <div class="mz-card">
          <div class="mz-h"><span class="mz-tag">链接</span>你和多少同行,真的连上了</div>
          <div class="mz-stats">
            <div class="mz-stat"><b>52</b><span>次同行切磋</span></div>
            <div class="mz-stat"><b>210</b><span>位老师用过你的课</span></div>
            <div class="mz-stat"><b>3</b><span>次被名师翻牌</span></div>
          </div>
          <div class="mz-note">苏窈、沈知微本月都置顶回复过你——这不是冷冰冰的数字,是有温度的人际记忆。</div>
        </div>

        <!-- 自己 -->
        <div class="mz-card">
          <div class="mz-h"><span class="mz-tag">自己</span>从你的提示词与灵感里,读到的你</div>
          <div class="mz-kw">
            <span v-for="(k, i) in KW" :key="i" class="mz-chip" :class="{ big: i === 0 }">{{ k }}</span>
          </div>
          <div class="mz-note">本月你最常琢磨的是「大单元教学」——你的教学立场,正在一点点清晰起来。</div>
        </div>

        <button class="mz-share">保存并分享我的教学月志</button>
      </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.mz-wrap { max-width:680px; margin:0 auto; padding:28px 24px 70px; }
.mz-back { display:inline-flex; align-items:center; gap:6px; font-size:13.5px; color:#7A7C7C; cursor:pointer; margin-bottom:14px; }

.mz-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; }
.mz-kicker { font-size:13px; color:#8A6D00; font-weight:600; letter-spacing:.5px; }
.mz-title { font-size:24px; font-weight:700; color:#141F1B; margin-top:8px; }
.mz-sub { font-size:13.5px; color:#7A7C7C; margin-top:7px; }
.mz-av { width:52px; height:52px; background:#ECECEC; color:#141F1B; font-size:18px; }

.mz-card { background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:22px; margin-bottom:16px; }
.mz-h { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:600; color:#141F1B; }
.mz-tag { font-size:12px; font-weight:600; color:#fff; background:#141F1B; padding:3px 11px; border-radius:999px; }
.mz-stats { display:flex; gap:28px; margin:20px 0 4px; flex-wrap:wrap; }
.mz-stat { display:flex; flex-direction:column; }
.mz-stat b { font-size:26px; font-weight:700; color:#141F1B; line-height:1.1; }
.mz-stat span { font-size:12px; color:#9A9A9A; margin-top:4px; }
.mz-note { font-size:13px; color:#7A7C7C; line-height:1.7; margin-top:14px; }

.mz-kw { display:flex; flex-wrap:wrap; gap:10px; margin:18px 0 4px; }
.mz-chip { background:#F6F6F6; border:1px solid #ECECEC; color:#141F1B; font-size:13px; font-weight:500; padding:7px 15px; border-radius:999px; }
.mz-chip.big { background:#141F1B; color:#fff; border-color:#141F1B; font-size:14px; }

.mz-share { width:100%; margin-top:20px; background:#141F1B; color:#fff; border:none; border-radius:12px; padding:14px; font-size:14.5px; font-weight:600; cursor:pointer; }
.mz-share:hover { background:#2C3632; }
</style>
