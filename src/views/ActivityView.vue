<script setup>
import { COVERS } from '../data/covers'
import Sidebar from '../components/Sidebar.vue'
// 同课异构:同一个起点,不同的抵达。(≈ GitHub 的 "同一 issue 多个解法" / 一个题目多条 PR)
const ENTRIES = [
  { angle: '手法拆解', cover: COVERS[0], title: '《石灰吟》托物言志——把"清白"拆成四层意象', who: '林若水', role: '杭州求是小学', use: '1,240', hot: true },
  { angle: '主旨探究', cover: COVERS[3], title: '于谦是谁?先读人,再读诗——人物志导入', who: '李明', role: '北京十一学校', use: '860' },
  { angle: '跨学科', cover: COVERS[7], title: '石灰的化学变化 × 诗的精神变化——理科老师来上语文', who: '张伟', role: '华东师大二附中', use: '512' },
  { angle: '仿写创作', cover: COVERS[2], title: '给你一样事物,写一首你的"言志诗"', who: '沈砚', role: '杭州文澜中学', use: '426' },
  { angle: '情境诵读', cover: COVERS[4], title: '边塞、刑场、书房——三个情境读出三种《石灰吟》', who: '陈红', role: '广州执信中学', use: '318' },
  { angle: '思辨追问', cover: COVERS[6], title: '"要留清白在人间"是不是太天真?一场课堂辩论', who: '小叶老师', role: '深圳南山小学', use: '290' },
]
</script>

<template>
  <div id="view-activity">
    <div class="page">
      <Sidebar active="community" />
      <main style="flex-grow:1;min-width:0;overflow-y:auto;height:100vh;background:#F7F7F7;">
      <div class="ac-wrap">
        <div class="ac-back nav-discover">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>返回灵感
        </div>

        <!-- 活动 hero -->
        <div class="ac-hero">
          <div class="ac-hero-l">
            <div class="ac-badge">语文教研 · 同课异构</div>
            <div class="ac-h1">《石灰吟》,你会怎么上?</div>
            <div class="ac-desc">同一篇课文、同一个教学难点,换一个角度切进去,课堂就走向完全不同的地方。同一个起点,不同的抵达。</div>
            <div class="ac-meta">
              <span><b>48</b> 位老师参与</span><span class="dot">·</span>
              <span><b>6</b> 种教学角度</span><span class="dot">·</span>
              <span>本周截止</span>
            </div>
            <button class="ac-cta">我也来做一版</button>
          </div>
          <div class="ac-hero-r">
            <div class="ac-quote">好课的边界不是定义出来的,是被无数老师的尝试撑大的。</div>
          </div>
        </div>

        <div class="ac-sec">参与作品 · 按教学角度</div>
        <div class="ac-grid">
          <div v-for="(e, i) in ENTRIES" :key="i" class="ac-card nav-res">
            <div class="ac-cover">
              <img :src="e.cover" alt="" loading="lazy" />
              <span class="ac-angle">{{ e.angle }}</span>
            </div>
            <div class="ac-body">
              <div class="ac-title">{{ e.title }}</div>
              <div class="ac-foot">
                <span class="ac-av">{{ e.who[0] }}</span>
                <span class="ac-who">{{ e.who }}</span>
                <span class="ac-role">· {{ e.role }}</span>
                <span class="ac-use"><b>{{ e.use }}</b> 使用</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.ac-wrap { max-width:1120px; margin:0 auto; padding:24px 32px 60px; }
.ac-back { display:inline-flex; align-items:center; gap:6px; font-size:13.5px; color:#7A7C7C; cursor:pointer; margin-bottom:14px; }

.ac-hero { display:flex; gap:24px; background:#fff; border:1px solid #ECECEC; border-radius:18px; padding:28px; margin-bottom:26px; }
.ac-hero-l { flex-grow:1; }
.ac-badge { display:inline-block; font-size:12px; font-weight:600; color:#8A6D00; background:#FFF6DF; border:1px solid #FBEFC6; padding:4px 11px; border-radius:999px; }
.ac-h1 { font-size:26px; font-weight:700; color:#141F1B; margin:14px 0 10px; }
.ac-desc { font-size:14px; color:#7A7C7C; line-height:1.7; max-width:560px; }
.ac-meta { display:flex; align-items:center; gap:9px; margin-top:16px; font-size:13px; color:#7A7C7C; }
.ac-meta b { color:#141F1B; font-weight:700; }
.ac-meta .dot { color:#D4D4D4; }
.ac-cta { margin-top:18px; background:#141F1B; color:#fff; border:none; border-radius:11px; padding:11px 22px; font-size:14px; font-weight:600; cursor:pointer; }
.ac-cta:hover { background:#2C3632; }
.ac-hero-r { flex-shrink:0; width:260px; display:flex; align-items:center; }
.ac-quote { font-size:15px; color:#141F1B; line-height:1.8; font-weight:500; border-left:3px solid #141F1B; padding-left:16px; }

.ac-sec { font-size:16px; font-weight:700; color:#141F1B; margin-bottom:14px; }
.ac-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; }
@media (max-width:1080px){ .ac-grid { grid-template-columns:repeat(2, 1fr); } }
.ac-card { background:#fff; border:1px solid #ECECEC; border-radius:16px; overflow:hidden; cursor:pointer; transition:box-shadow .15s; }
.ac-card:hover { box-shadow:0 4px 24px rgba(89,98,84,0.06); }
.ac-cover { position:relative; height:150px; background:#EFEFEF; }
.ac-cover img { width:100%; height:100%; object-fit:cover; display:block; }
.ac-angle { position:absolute; top:10px; left:10px; background:rgba(20,31,27,0.82); color:#fff; font-size:12px; font-weight:500; padding:3px 10px; border-radius:8px; }
.ac-body { padding:13px 15px 15px; }
.ac-title { font-size:14px; font-weight:600; color:#141F1B; line-height:1.5;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.ac-foot { display:flex; align-items:center; gap:6px; margin-top:12px; font-size:12px; color:#9A9A9A; }
.ac-av { width:20px; height:20px; border-radius:50%; background:#ECECEC; color:#141F1B; font-size:10.5px; display:flex; align-items:center; justify-content:center; }
.ac-who { color:#141F1B; font-weight:500; }
.ac-role { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ac-use { margin-left:auto; white-space:nowrap; }
.ac-use b { color:#141F1B; font-weight:600; }
</style>
