<script setup>
import Sidebar from '../components/Sidebar.vue'
import { RESOURCES_BY_ID } from '../data/resources'

const MOTHER_ID = 'res-xianglin'
const mother = RESOURCES_BY_ID[MOTHER_ID]
const visibleForkIds = ['res-xl-zhoutao', 'res-xl-limin', 'res-xl-l2']
const flowBack = mother.contributors.find(({ mergedInto }) => mergedInto)

const NODE_W = 224
const NODE_H = 104
const X0 = 24
const DX = 236
const Y0 = 46
const DY = 132
const nx = (t) => X0 + t * DX
const ny = (lane) => Y0 + lane * DY

function titleLines(title) {
  if (title.length <= 12) return [title]
  return [title.slice(0, 12), title.slice(12)]
}

function createResourceNode(resourceId, layout) {
  const resource = RESOURCES_BY_ID[resourceId]
  const honor = flowBack && resource.author.name === flowBack.name
  return {
    ...layout,
    id: resource.id,
    resourceId: resource.id,
    resource,
    titleLines: titleLines(resource.title),
    thumbLabel: resource.kind.split('/')[0],
    honorLabel: honor ? `改法已并入 ${flowBack.mergedInto}` : '',
  }
}

const resourceNodes = [
  createResourceNode(MOTHER_ID, { lane: 0, t: 0.5, root: true, main: true }),
  createResourceNode('res-xl-zhoutao', { lane: 1, t: 0, parent: MOTHER_ID }),
  createResourceNode('res-xl-limin', { lane: 1, t: 1, parent: MOTHER_ID }),
  createResourceNode('res-xl-l2', { lane: 2, t: 0, parent: 'res-xl-zhoutao' }),
]

const foldedNode = {
  id: 'folded-forks',
  lane: 2,
  t: 1,
  parent: MOTHER_ID,
  folded: true,
  foldedCount: Math.max(mother.stats.adapt - visibleForkIds.length, 0),
}

const NODES = [...resourceNodes, foldedNode]
const byId = Object.fromEntries(NODES.map((node) => [node.id, node]))
const W = nx(1) + NODE_W + 24
const H = ny(2) + NODE_H + 54

function edgePath(node) {
  const parent = byId[node.parent]
  const x1 = nx(parent.t) + NODE_W / 2
  const y1 = ny(parent.lane) + NODE_H
  const x2 = nx(node.t) + NODE_W / 2
  const y2 = ny(node.lane)
  const midY = y1 + (y2 - y1) * 0.52
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
}
</script>

<template>
  <div id="view-lineage">
    <div class="page">
      <Sidebar active="community" />
      <main style="flex-grow:1;min-width:0;overflow-y:auto;height:100vh;background:#F7F7F7;">
        <div class="lg-wrap">
          <div class="lg-back nav-res">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>返回资源
          </div>

          <div class="lg-head">
            <div class="lg-title">改编脉络 · 谁杀了祥林嫂 · 沉浸式剧本杀</div>
            <div class="lg-sub">好课会生长——从这里出发,让思考接力,一课开千枝。共 <b>{{ mother.stats.adapt }}</b> 次改编 · 展开 <b>4</b> 个资源节点 · 其余 <b>+{{ foldedNode.foldedCount }}</b> 折叠。</div>
            <div class="lg-legend">
              <span><i class="d main"></i>母版资源</span>
              <span><i class="d fork"></i>社区改编(fork)</span>
              <span><i class="d honor"></i>采纳共创</span>
            </div>
          </div>

          <div class="lg-graph">
            <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="祥林嫂资源改编脉络树">
              <path v-for="node in NODES.filter((item) => item.parent)" :key="`e-${node.id}`" :d="edgePath(node)"
                    fill="none" :stroke="node.folded ? '#D4D4D4' : '#C4C4C4'" stroke-width="2" stroke-linecap="round" />

              <g v-for="node in resourceNodes" :key="node.id" class="lg-node" :data-resource-id="node.resourceId" role="link" tabindex="0">
                <rect v-if="node.root" class="lg-root-ring" :x="nx(node.t) - 4" :y="ny(node.lane) - 4" :width="NODE_W + 8" :height="NODE_H + 8" rx="15" fill="none" stroke="#D9AF3C" stroke-width="2" />
                <rect class="lg-card" :x="nx(node.t)" :y="ny(node.lane)" :width="NODE_W" :height="NODE_H" rx="12" fill="#fff" :stroke="node.root ? '#141F1B' : '#141F1B'" stroke-width="1.5" />
                <rect v-if="node.root" :x="nx(node.t)" :y="ny(node.lane)" :width="NODE_W" :height="NODE_H" rx="12" fill="#141F1B" />
                <rect :x="nx(node.t) + 10" :y="ny(node.lane) + 10" width="42" height="84" rx="8" :fill="node.root ? '#2B3833' : '#F6F6F6'" />
                <text :x="nx(node.t) + 31" :y="ny(node.lane) + 56" text-anchor="middle" font-size="10" :fill="node.root ? '#D9AF3C' : '#9A9A9A'">{{ node.thumbLabel }}</text>
                <circle :cx="nx(node.t) + 72" :cy="ny(node.lane) + 24" r="12" :fill="node.root ? '#2B3833' : '#ECECEC'" :stroke="node.root ? '#D9AF3C' : 'none'" :stroke-width="node.root ? 1.5 : 0" />
                <text :x="nx(node.t) + 72" :y="ny(node.lane) + 28" text-anchor="middle" font-size="11" font-weight="700" :fill="node.root ? '#fff' : '#141F1B'">{{ node.resource.author.name.slice(0, 1) }}</text>
                <text :x="nx(node.t) + 90" :y="ny(node.lane) + 28" font-size="11.5" font-weight="600" :fill="node.root ? '#fff' : '#141F1B'">{{ node.resource.author.name }}</text>
                <text v-for="(line, index) in node.titleLines" :key="`${node.id}-title-${index}`" :x="nx(node.t) + 64" :y="ny(node.lane) + 50 + index * 14" font-size="11.5" font-weight="600" :fill="node.root ? '#fff' : '#141F1B'">{{ line }}</text>
                <text :x="nx(node.t) + NODE_W - 12" :y="ny(node.lane) + 28" text-anchor="end" font-size="14" font-weight="700" :fill="node.root ? '#fff' : '#141F1B'">{{ node.resource.stats.use.toLocaleString('en-US') }}</text>
                <text :x="nx(node.t) + NODE_W - 12" :y="ny(node.lane) + 44" text-anchor="end" font-size="10.5" :fill="node.root ? '#D4D4D4' : '#9A9A9A'">位老师使用</text>
                <g v-if="node.honorLabel">
                  <rect :x="nx(node.t) + 64" :y="ny(node.lane) + 78" width="98" height="16" rx="6" fill="#FFF6DF" stroke="#FBEFC6" />
                  <text :x="nx(node.t) + 113" :y="ny(node.lane) + 89.5" text-anchor="middle" font-size="9.5" font-weight="600" fill="#8A6D00">{{ node.honorLabel }}</text>
                </g>
              </g>

              <g class="lg-fold" :transform="`translate(${nx(foldedNode.t)}, ${ny(foldedNode.lane)})`">
                <rect :width="NODE_W" :height="NODE_H" rx="12" fill="#F6F6F6" stroke="#D4D4D4" stroke-width="1.5" stroke-dasharray="5 4" />
                <text x="20" y="42" font-size="22" font-weight="700" fill="#141F1B">+{{ foldedNode.foldedCount }}</text>
                <text x="20" y="64" font-size="12" font-weight="600" fill="#7A7C7C">其余社区改编折叠</text>
                <text x="20" y="82" font-size="11" fill="#9A9A9A">母版共 {{ mother.stats.adapt }} 次改编</text>
              </g>
            </svg>
          </div>

          <div class="lg-note"><span class="lg-note-mark">↩</span>周涛的“两轮庭审”已采纳并入母版 V11；优秀改编可以反向进入原作页面的“社区改编”。每个 fork 都署名原作者、保留前序链路。</div>
        </div>
      </main>
    </div>
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
.lg-legend .d.honor { background:#FFF6DF; border:1px solid #D9AF3C; }

.lg-graph { margin-top:22px; background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:18px; overflow-x:auto; }
.lg-node { cursor:pointer; outline:none; }
.lg-node:hover .lg-card, .lg-node:focus .lg-card { stroke:#D9AF3C; }
.lg-fold { pointer-events:none; }
.lg-note { display:flex; align-items:flex-start; gap:7px; font-size:12.5px; color:#9A9A9A; line-height:1.7; margin-top:16px; }
.lg-note-mark { color:#D9AF3C; font-weight:700; }
</style>
