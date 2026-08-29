<script setup>
// 改编脉络 ≈ GitHub Network graph:作者主线(lane 0)+ 社区改编 fork 支线。
const X0 = 90, DX = 176, Y0 = 66, DY = 82
const nx = (t) => X0 + t * DX
const ny = (lane) => Y0 + lane * DY

const NODES = [
  { id: 'v10', lane: 0, t: 0, name: 'V10 · 原版', who: '林若水', use: '1,240', root: true, main: true },
  { id: 'v11', lane: 0, t: 1, name: 'V11', who: '林若水', use: '', parent: 'v10', main: true },
  { id: 'v12', lane: 0, t: 3, name: 'V12 · 最新', who: '林若水', use: '', parent: 'v11', main: true },
  { id: 'a', lane: 1, t: 2, name: '县中简化版', who: '周涛', use: '340', parent: 'v10' },
  { id: 'a2', lane: 1, t: 4, name: '再简化 · 1 课时', who: '李敏', use: '120', parent: 'a' },
  { id: 'b', lane: 2, t: 3, name: '历史跨学科版', who: '王慧', use: '88', parent: 'v11' },
  { id: 'c', lane: 3, t: 4, name: '议论文写作版', who: '陈见微', use: '156', parent: 'v12' },
]
const byId = Object.fromEntries(NODES.map(n => [n.id, n]))
const W = nx(5) + 40, H = ny(3) + 60

function edgePath(n) {
  const p = byId[n.parent]
  const x1 = nx(p.t), y1 = ny(p.lane), x2 = nx(n.t), y2 = ny(n.lane)
  if (y1 === y2) return `M ${x1} ${y1} L ${x2} ${y2}`
  const c = x1 + DX * 0.55
  return `M ${x1} ${y1} C ${c} ${y1}, ${x2 - 46} ${y2}, ${x2} ${y2}`
}
</script>

<template>
  <div id="view-lineage">
    <main style="flex-grow:1;min-width:0;overflow-y:auto;height:100vh;background:#F7F7F7;">
      <div class="lg-wrap">
        <div class="lg-back nav-res">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>返回资源
        </div>

        <div class="lg-head">
          <div class="lg-title">改编脉络 · 谁杀了祥林嫂 · 沉浸式剧本杀</div>
          <div class="lg-sub">好课会生长——从这里出发,让思考接力,一课开千枝。共 <b>23</b> 个版本 · <b>3</b> 大改编方向。</div>
          <div class="lg-legend">
            <span><i class="d main"></i>作者主线(迭代)</span>
            <span><i class="d fork"></i>社区改编(fork)</span>
          </div>
        </div>

        <div class="lg-graph">
          <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
            <!-- 连线 -->
            <path v-for="n in NODES.filter(x => x.parent)" :key="'e' + n.id" :d="edgePath(n)"
                  fill="none" :stroke="byId[n.parent].main && n.main ? '#141F1B' : '#C4C4C4'" stroke-width="2" />
            <!-- 节点 -->
            <g v-for="n in NODES" :key="n.id">
              <circle :cx="nx(n.t)" :cy="ny(n.lane)" :r="n.root ? 8 : 6"
                      :fill="n.main ? '#141F1B' : '#fff'" :stroke="n.main ? '#141F1B' : '#141F1B'" stroke-width="2" />
              <circle v-if="n.root" :cx="nx(n.t)" :cy="ny(n.lane)" r="12" fill="none" stroke="#D9AF3C" stroke-width="2" />
              <text :x="nx(n.t) + 16" :y="ny(n.lane) - 2" font-size="13" font-weight="600" fill="#141F1B">{{ n.name }}</text>
              <text :x="nx(n.t) + 16" :y="ny(n.lane) + 14" font-size="11.5" fill="#9A9A9A">{{ n.who }}<tspan v-if="n.use"> · {{ n.use }} 使用</tspan></text>
            </g>
          </svg>
        </div>

        <div class="lg-note">采纳建议会并回作者主线(像 merge);优秀改编可以反向进入原作页面的"社区改编"。每个 fork 都署名原作者、保留前序链路。</div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lg-wrap { max-width:1180px; margin:0 auto; padding:24px 32px 60px; }
.lg-back { display:inline-flex; align-items:center; gap:6px; font-size:13.5px; color:#7A7C7C; cursor:pointer; margin-bottom:16px; }
.lg-title { font-size:22px; font-weight:700; color:#141F1B; }
.lg-sub { font-size:13.5px; color:#7A7C7C; margin-top:8px; line-height:1.6; }
.lg-sub b { color:#141F1B; }
.lg-legend { display:flex; gap:20px; margin-top:14px; font-size:12.5px; color:#7A7C7C; }
.lg-legend span { display:inline-flex; align-items:center; gap:7px; }
.lg-legend .d { width:11px; height:11px; border-radius:50%; display:inline-block; }
.lg-legend .d.main { background:#141F1B; }
.lg-legend .d.fork { background:#fff; border:2px solid #141F1B; }

.lg-graph { margin-top:22px; background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:18px; overflow-x:auto; }
.lg-note { font-size:12.5px; color:#9A9A9A; line-height:1.7; margin-top:16px; }
</style>
