<script setup>
import { computed, ref } from 'vue'
import { MASTERS } from '../data/masters'
import { KNOWLEDGE_PARTNERS, SKILL_CATALOG, SKILL_CATEGORIES, filterSkills } from '../data/skills'
import wisdomBannerImage from '../assets/community-editorial/education-wisdom-banner.jpg'
import '../styles/community.css'

const activeCategory = ref('全部')
const activeKind = ref('Skill')
const query = ref('')
const activeAgent = ref(null)
const showAllPartners = ref(false)
const memberPages = ref({})

// 专家优先排序(纯展示),默认只显示 2 个,其余点开
const orderedPartners = computed(() => {
  const rank = (t) => (t === '学校' ? 0 : t === '专家' ? 1 : 2)
  return [...KNOWLEDGE_PARTNERS].sort((a, b) => rank(a.entityType) - rank(b.entityType))
})
// 折叠态默认展示「一所学校 + 一位专家」,先让学校教研组成为入口
const defaultPair = computed(() => {
  const list = orderedPartners.value
  const pick = []
  const school = list.find((p) => p.entityType === '学校')
  if (school) pick.push(school)
  const expert = list.find((p) => p.entityType === '专家')
  if (expert) pick.push(expert)
  for (const p of list) { if (pick.length >= 2) break; if (!pick.includes(p)) pick.push(p) }
  return pick.slice(0, 2)
})
const visiblePartners = computed(() => (showAllPartners.value ? orderedPartners.value : defaultPair.value))
const hiddenPartnerCount = computed(() => Math.max(0, orderedPartners.value.length - defaultPair.value.length))

const featuredSkills = SKILL_CATALOG.filter((s) => s.featured)
const heroSkill = featuredSkills[0]
const listSkills = featuredSkills.slice(1)
const visibleSkills = computed(() => filterSkills(SKILL_CATALOG, activeCategory.value, query.value, activeKind.value))

const certLabels = {
  刘彭芝: '特级专家',
  苏窈: '特级专家',
  沈知微: '特级专家',
  '北京十一学校 · 学科课程基地': '示范名校',
  '人民教育出版社 · 数学编辑部': '官方出品',
}
const authorAliases = {
  王崧舟工作室: '王崧舟 · 诗意语文工作室',
  海淀数学教研室: '海淀区教师进修学校 · 数学教研室',
  人民教育出版社: '人民教育出版社 · 数学编辑部',
}

function fallbackAvatar(name) {
  const initial = String(name || '').trim().slice(0, 1)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><linearGradient id="fa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F7F6"/><stop offset="1" stop-color="#E7EAE8"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#fa)"/><text x="32" y="41" text-anchor="middle" font-family="-apple-system,'PingFang SC',sans-serif" font-size="26" font-weight="500" fill="#5A645E">${initial}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
function getProfile(name) { return MASTERS.find((m) => m.name === (authorAliases[name] || name)) }
function getAvatar(name) { const p = getProfile(name); return p?.portrait || p?.logo || fallbackAvatar(name) }
function getProfileLine(name) { return getProfile(name)?.cred || '认证教育创作者' }

function shortName(title) { return String(title).replace(/\s*(Agent|Skill)\s*$/i, '').trim() }
function fuzz(value) {
  return String(value).replace(/[\d,]{2,}/, (m) => {
    const n = Number(m.replace(/,/g, '')) || 0
    if (n >= 1000) return (Math.floor(n / 1000) * 1000).toLocaleString('en-US') + '+'
    if (n >= 100) return Math.floor(n / 100) * 100 + '+'
    return n + '+'
  })
}
function verb(kind, hero = false, partner = null) {
  if (kind === 'Agent' && partner) return '邀请'
  return kind === 'Agent' ? '召唤' : hero ? '试一试' : '安装'
}
function bar(uses) { const n = Number(String(uses).replace(/[^\d]/g, '')) || 0; return Math.max(10, Math.min(100, Math.round((n / 5000) * 100))) }
function partnerType(t) { return t === '专家' ? '专家 · 个人智库' : t === '学校' ? '学校 · 校本课程' : '教研组 · 集体备课' }
function isPerson(t) { return t === '专家' }
function collaborationLabel(partner) {
  return partner.featuredAbility.title
}
function memberAvatar(partner, member) { return member.avatar || getAvatar(member.name) }
function abilityOwner(partner) { return isPerson(partner.entityType) ? partner.entityName : (partner.teamName || partner.entityName) }
function abilityTopic(partner) { return shortName(partner.featuredAbility.title) }
function expertIntroText(partner) {
  const profile = getProfile(partner.entityName)
  if (profile?.bioParas) return profile.bioParas
  return profile ? [profile.bio, partner.thesis] : [partner.thesis]
}
function memberPage(partner) { return memberPages.value[partner.entityName] || 1 }
function memberPageLabel(page) { return `查看第${page}组专家` }
function syncMemberPage(partner, event) {
  const container = event.currentTarget
  const page = Math.max(1, Math.round(container.scrollLeft / Math.max(1, container.clientWidth)) + 1)
  if (page !== memberPage(partner)) memberPages.value = { ...memberPages.value, [partner.entityName]: page }
}
function scrollMembers(partner, page, event) {
  const container = event.currentTarget.closest('.team-intro')?.querySelector('.member-list-scroll')
  if (!container) return
  container.scrollTo({ left: (page - 1) * container.clientWidth, behavior: 'smooth' })
  memberPages.value = { ...memberPages.value, [partner.entityName]: page }
}

function summon(skill, partner = null) {
  activeAgent.value = partner ? { ...skill, ownerName: abilityOwner(partner), topic: abilityTopic(partner) } : skill
}

// 能力图标系统:近黑单色线性图标,按标题语义选形,兜底按 kind
// Lucide 图标(统一 24 网格 / 2px 描边 / 圆角端点)
const GLYPHS = {
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.91a1 1 0 0 0 0-1.83z"/><path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>',
  flask: '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  spark: '<path d="M11 3.2 12.7 8 17.5 9.7 12.7 11.4 11 16.2 9.3 11.4 4.5 9.7 9.3 8Z"/><path d="M18.5 14.5 19.3 16.7 21.5 17.5 19.3 18.3 18.5 20.5 17.7 18.3 15.5 17.5 17.7 16.7Z"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9.5 4.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V6h-5Z"/><path d="M9.5 11h5M9.5 15h3"/>',
}
function glyphKey(item) {
  const t = String(item.title || '')
  if (/听说|口语|陪练|发音|朗读/.test(t)) return 'mic'
  if (/动画|生成|游戏|互动|交互|可视化/.test(t)) return 'spark'
  if (/提问|追问|对话|问题链/.test(t)) return 'chat'
  if (/作文|批改|讲评|文稿|写作|发言/.test(t)) return 'pen'
  if (/阅读|整本书|绘本/.test(t)) return 'book'
  if (/命题|卷|细目|双向|结构|梳理|单元|教案/.test(t)) return 'grid'
  if (/实验|探究|项目/.test(t)) return 'flask'
  if (/活动|班会|班级/.test(t)) return 'clipboard'
  if (/分层|作业|诊断|错因|题/.test(t)) return 'layers'
  return item.kind === 'Agent' ? 'chat' : 'layers'
}
function glyphSvg(item) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[glyphKey(item)]}</svg>`
}
function tileKind(item) { return item.kind === 'Agent' ? 'ag' : 'sk' }
</script>

<template>
  <div id="view-skills" @keydown.esc="activeAgent = null">
    <div class="page">
      <main class="skills-main community-main">
        <div class="skills-shell community-body">
          <header class="skills-hero">
            <h1>教育智库</h1>
            <label class="skills-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
              <input v-model="query" type="search" placeholder="搜 Skill、Agent、教学任务或作者" />
            </label>
          </header>

          <section class="hundred-schools-banner" aria-labelledby="hundred-schools-title" :style="{ backgroundImage: `url(${wisdomBannerImage})` }">
            <div class="hundred-schools-copy">
              <p class="hundred-schools-eyebrow">中国百校 · 教育智慧共创计划</p>
              <h2 id="hundred-schools-title">让教育智慧，走进更多教师的日常</h2>
              <p class="hundred-schools-summary">面向全国卓越校长及所在学校，共建可学习、可使用、可传承的教育智库。</p>
              <div class="hundred-schools-actions">
                <button type="button" class="hundred-schools-primary">了解共建计划</button>
                <button type="button" class="hundred-schools-secondary">参与共建</button>
              </div>
            </div>
          </section>

          <!-- ===== 专家入驻 · 名家卡(默认2,展开更多) ===== -->
          <section class="kn" aria-labelledby="expert-entry-title">
            <div class="section-head">
              <div><h2 id="expert-entry-title">专家入驻</h2></div>
              <button type="button" class="text-link">更多</button>
            </div>

            <div class="kn-grid">
              <article v-for="p in visiblePartners" :key="p.entityName" class="mcard">
                <div class="mbar">
                  <img class="mava" :class="isPerson(p.entityType) ? 'person' : 'inst'" :src="getAvatar(p.entityName)" :alt="p.entityName" />
                  <div class="mwho">
                    <div class="mname">
                      <span :title="p.entityName">{{ p.entityName }}</span>
                      <span v-if="certLabels[p.entityName]" class="cert">★ {{ certLabels[p.entityName] }}</span>
                    </div>
                    <div class="mrole">{{ getProfileLine(p.entityName) }}</div>
                  </div>
                </div>

                <div class="mbody">
                  <section v-if="p.members?.length" class="mintro-block" aria-label="十一学校专家团">
                    <div class="mintro team-intro">
                      <div class="member-list member-list-scroll" @scroll="syncMemberPage(p, $event)">
                        <article v-for="member in p.members" :key="member.name" class="member-profile">
                          <img class="member-avatar" :src="memberAvatar(p, member)" :alt="member.name" :data-member-name="member.name" loading="lazy" />
                          <div class="member-copy">
                            <div class="member-name">{{ member.name }}</div>
                            <p>{{ member.bio }}</p>
                          </div>
                        </article>
                      </div>
                      <div v-if="p.members.length > 2" class="member-dots">
                        <button v-for="dot in Math.ceil(p.members.length / 2)" :key="dot" type="button" class="member-dot" :class="{ active: memberPage(p) === dot }" :aria-label="memberPageLabel(dot)" :aria-current="memberPage(p) === dot ? 'true' : undefined" @click="scrollMembers(p, dot, $event)"></button>
                      </div>
                    </div>
                  </section>
                  <section v-else class="mintro-block" aria-label="刘彭芝专家介绍">
                    <div class="mintro expert-intro">
                      <div class="expert-intro-copy">
                        <p v-for="(para, i) in expertIntroText(p)" :key="i">{{ para }}</p>
                      </div>
                    </div>
                  </section>
                  <div class="m-divider" aria-hidden="true"></div>
                  <div class="cap">
                    <span class="cic" :class="`is-${p.featuredAbility.kind.toLowerCase()}`" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9h8M8 13h5"/><path d="M4 5h16v11H8l-4 3z"/></svg>
                    </span>
                    <div class="cm">
                      <div class="cn"><span class="cn-t">{{ shortName(p.featuredAbility.title) }}</span></div>
                      <div class="cp">{{ p.featuredAbility.description }}</div>
                    </div>
                    <div class="cr">
                      <button type="button" class="ccall" :class="{ primary: p.featuredAbility.kind === 'Agent' }" @click="summon(p.featuredAbility, p)">{{ verb(p.featuredAbility.kind, false, p) }}</button>
                    </div>
                  </div>
                  <div class="m-divider" aria-hidden="true"></div>

                  <div class="made">
                    <div class="co-grid">
                      <button v-for="o in p.outcomes.slice(0, 2)" :key="o.resourceId" type="button" class="co-item nav-res" :data-resource-id="o.resourceId">
                        <div class="co-line">
                          <img class="co-avatar" :src="getAvatar(o.creator)" :alt="o.creator" loading="lazy" />
                          <span class="co-creator">{{ o.creator }}</span>
                          <span class="co-use">使用</span>
                          <span class="co-agent">「{{ collaborationLabel(p) }}」</span>
                          <span class="co-generated">生成了</span>
                        </div>
                        <div class="co-result">
                          <img class="co-cover" :src="o.cover" :alt="o.title" loading="lazy" />
                          <span class="co-title">{{ o.title }}</span>
                          <span class="co-uses">{{ fuzz(o.uses) }} 人使用</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div v-if="hiddenPartnerCount > 0 && !showAllPartners" class="kn-more">
              <button type="button" @click="showAllPartners = true">更多</button>
            </div>
          </section>

          <!-- ===== 编辑精选 · App Store 风 ===== -->
          <section class="ep" aria-labelledby="featured-title">
            <div class="section-head"><div><h2 id="featured-title">编辑精选</h2></div><button type="button" class="text-link has-arw">全部精选<span class="lk-arw" aria-hidden="true">→</span></button></div>

            <div v-if="heroSkill" class="ep-hero">
              <span class="ep-ic" :class="tileKind(heroSkill)" v-html="glyphSvg(heroSkill)"></span>
              <div class="ep-info">
                <div class="ep-eb">本周精选</div>
                <div class="ep-nm">{{ shortName(heroSkill.title) }}</div>
                <p class="ep-ds">{{ heroSkill.description }}</p>
              </div>
              <div class="ep-side">
                <button type="button" class="ep-get" :class="{ primary: heroSkill.kind === 'Agent' }" @click="heroSkill.kind === 'Agent' && summon(heroSkill)">{{ verb(heroSkill.kind, true) }}</button>
                <span class="ep-cnt">{{ heroSkill.kind }} · {{ fuzz(heroSkill.metrics.install) }} {{ heroSkill.kind === 'Agent' ? '对话' : '安装' }}</span>
              </div>
            </div>

            <div class="ep-list">
              <div v-for="(s, i) in listSkills" :key="s.id" class="ep-row">
                <span class="rk">{{ i + 1 }}</span>
                <span class="ep-rowic" :class="tileKind(s)" v-html="glyphSvg(s)"></span>
                <div class="ep-m"><div class="n">{{ shortName(s.title) }}</div><div class="s2">{{ s.description }}</div><div class="s">{{ s.kind }} · {{ s.subject }} · {{ s.author }}</div></div>
                <div class="ep-r"><button type="button" class="ep-getsm" :class="{ primary: s.kind === 'Agent' }" @click="s.kind === 'Agent' && summon(s)">{{ verb(s.kind) }}</button><span class="cnt">{{ fuzz(s.metrics.install) }} {{ s.kind === 'Agent' ? '对话' : '安装' }}</span></div>
              </div>
            </div>
          </section>

          <!-- ===== 探索全部 · youmind 风 ===== -->
          <section class="ex explore-section" aria-label="能力探索">
            <div class="ex-tabs" role="tablist" aria-label="能力类型">
              <button v-for="tab in [{ label: '技能广场', kind: 'Skill' }, { label: '专家团', kind: 'Agent' }]" :key="tab.kind" type="button" role="tab" :aria-selected="activeKind === tab.kind" :class="{ active: activeKind === tab.kind }" @click="activeKind = tab.kind">{{ tab.label }}</button>
            </div>
            <div class="skill-filters" aria-label="学科分类">
              <button v-for="category in SKILL_CATEGORIES" :key="category" type="button" :class="{ active: activeCategory === category }" @click="activeCategory = category">{{ category }}</button>
            </div>

            <div class="ex-grid" role="tabpanel">
              <article v-for="s in visibleSkills" :key="s.id" class="excard">
                <div class="ex-top">
                  <span class="ex-tile" :class="tileKind(s)" v-html="glyphSvg(s)"></span>
                  <div class="ex-h"><div class="ex-t">{{ shortName(s.title) }}</div><div class="ex-kd">{{ s.subject }}</div></div>
                  <button type="button" class="ex-get" :class="{ primary: s.kind === 'Agent' }" @click="s.kind === 'Agent' ? summon(s) : null">{{ verb(s.kind) }}</button>
                </div>
                <p class="ex-d">{{ s.description }}</p>
                <div class="ex-f">
                  <span class="ex-au"><img :src="getAvatar(s.author)" :alt="s.author" />{{ s.author }}</span>
                  <span class="ex-met"><b>{{ fuzz(s.metrics.use) }}</b> 使用</span>
                </div>
              </article>
            </div>
            <p v-if="visibleSkills.length === 0" class="skills-empty">没有找到匹配的能力，换个关键词或筛选条件试试。</p>
          </section>
        </div>
      </main>
    </div>

    <div v-if="activeAgent" class="agent-dialog" role="dialog" aria-modal="true" :aria-label="activeAgent.ownerName ? `邀请${activeAgent.ownerName}` : activeAgent.title">
      <button type="button" class="agent-backdrop" aria-label="关闭对话" @click="activeAgent = null"></button>
      <div class="agent-panel">
        <div class="agent-head"><div><span>{{ activeAgent.ownerName ? '专家邀请' : 'Agent' }}</span><h2>{{ activeAgent.ownerName ? `邀请${activeAgent.ownerName}` : shortName(activeAgent.title) }}</h2></div><button type="button" aria-label="关闭" @click="activeAgent = null">×</button></div>
        <p>{{ activeAgent.ownerName ? `向 ${activeAgent.ownerName} 发起教学协作邀请，一起完善你的课堂方案。` : activeAgent.description }}</p>
        <div class="agent-example"><span>你可以这样开始</span><button type="button">帮我围绕本节课目标，设计一组从理解到评价的递进问题。</button></div>
        <div class="agent-input"><span>@{{ activeAgent.ownerName || shortName(activeAgent.title) }}</span><input type="text" placeholder="说说你正在准备哪一课……" /><button type="button">{{ activeAgent.ownerName ? '发起邀请' : '发送' }}</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-main{color:#141F1B;--ease:cubic-bezier(.22,1,.36,1);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","PingFang SC","Helvetica Neue","Microsoft YaHei",sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;font-variant-numeric:tabular-nums}
.skills-shell{padding-bottom:120px}
.skills-hero{display:flex;align-items:center;justify-content:space-between;gap:32px;padding:30px 0 18px}
.skills-hero h1{margin:0;font-size:31px;font-weight:600;letter-spacing:-.032em}
.skills-search{display:flex;align-items:center;gap:10px;width:min(440px,48%);box-sizing:border-box;padding:12px 15px;border:1px solid #E8E8E8;border-radius:14px;color:#9A9A9A;background:#FBFBFA;transition:border-color .3s var(--ease),box-shadow .3s var(--ease),background .3s var(--ease)}
.skills-search:focus-within{border-color:#7A7C7C;box-shadow:0 0 0 3px rgba(20,31,27,.06)}
.skills-search input{width:100%;border:0;outline:0;background:transparent;color:#222;font:inherit;font-size:13px}
.hundred-schools-banner{position:relative;display:flex;align-items:center;min-height:220px;margin:12px 0 34px;padding:30px 34px;box-sizing:border-box;overflow:hidden;border-radius:20px;background-color:#0F1815;background-repeat:no-repeat;background-size:cover;background-position:right center;color:#fff;box-shadow:0 14px 36px rgba(20,31,27,.12)}
.hundred-schools-banner::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(15,24,21,.9) 0%,rgba(15,24,21,.62) 34%,rgba(15,24,21,.12) 62%,rgba(15,24,21,0) 80%)}
.hundred-schools-copy{position:relative;z-index:2;max-width:720px}
.hundred-schools-eyebrow{margin:0 0 10px;color:#BFEED4;font-size:11.5px;font-weight:600;letter-spacing:.08em}
.hundred-schools-banner h2{margin:0;font-size:28px;font-weight:600;line-height:1.24;letter-spacing:-.035em}
.hundred-schools-summary{max-width:620px;margin:10px 0 0;color:rgba(255,255,255,.68);font-size:13px;line-height:1.65}
.hundred-schools-actions{display:flex;align-items:center;gap:10px;margin-top:20px}
.hundred-schools-actions button{min-height:44px;padding:0 20px;border-radius:999px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;transition:transform .4s var(--ease),background .3s var(--ease),border-color .3s var(--ease)}
.hundred-schools-actions button:hover{transform:translateY(-1px)}
.hundred-schools-actions button:active{transform:scale(.97)}
.hundred-schools-actions button:focus-visible{outline:3px solid rgba(191,238,212,.48);outline-offset:3px}
.hundred-schools-primary{border:1px solid #BFEED4;background:#BFEED4;color:#141F1B}
.hundred-schools-primary:hover{background:#D8F6E5;border-color:#D8F6E5}
.hundred-schools-secondary{border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.06);color:#fff}
.hundred-schools-secondary:hover{border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.1)}
.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:22px}
.section-head h2{margin:0;font-size:21px;font-weight:600;letter-spacing:-.022em}
.section-head p{margin:6px 0 0;color:#9A9A9A;font-size:12.5px}
.text-link{padding:0;border:0;background:none;color:#7A7C7C;font-size:13px;cursor:pointer;white-space:nowrap;transition:color .25s var(--ease)}
.text-link:hover{color:#141F1B}
.text-link.has-arw{display:inline-flex;align-items:center;gap:5px}
.lk-arw{display:inline-block;transition:transform .3s var(--ease)}
.text-link.has-arw:hover .lk-arw{transform:translateX(3px)}
.text-link.sm{font-size:11.5px;color:#9A9A9A}

/* 教育智库 */
.kn{margin-top:30px}
.kn-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.kn-title{display:flex;align-items:baseline;gap:11px;flex-wrap:wrap;min-width:0}
.kn-title h2{margin:0;font-size:18px;font-weight:600;letter-spacing:-.01em}
.kn-eb{color:#9A9A9A;font-size:12.5px}
.kn-reg{color:#7A7C7C;font-size:12.5px}
.kn-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:14px}
.mcard{display:flex;flex-direction:column;border:1px solid #EDEDED;border-radius:20px;background:#fff;box-shadow:0 1px 2px rgba(20,31,27,.03),0 8px 22px rgba(20,31,27,.03);overflow:hidden;transition:transform .5s var(--ease),box-shadow .5s var(--ease),border-color .5s var(--ease)}
.mcard:hover{transform:translateY(-3px);border-color:#E3E4E3;box-shadow:0 2px 4px rgba(20,31,27,.04),0 16px 40px rgba(20,31,27,.08)}
.mbar{display:flex;align-items:center;gap:13px;padding:16px 16px;background:linear-gradient(150deg,#22332C,#141F1B);border-radius:18px 18px 0 0}
.mava{width:52px;height:52px;flex:0 0 52px;object-fit:cover;background:#F6F6F6;box-shadow:0 0 0 1px rgba(255,255,255,.14)}
.mava.person{border-radius:50%}
.mava.inst{border-radius:14px}
.mwho{min-width:0;flex:1}
.mname{display:flex;align-items:center;gap:7px;flex-wrap:wrap;font-size:15.5px;font-weight:600;line-height:1.25;color:#fff}
.mname>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.cert{flex:0 0 auto;padding:1px 8px;border-radius:999px;background:#fbefc6;border:1px solid #ead79a;color:#B5860B;font-size:10.5px;font-weight:600}
.mrole{overflow:hidden;margin-top:3px;color:rgba(255,255,255,.62);text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.mhome{flex:0 0 auto;border:0;background:none;color:rgba(255,255,255,.68);font-size:12px;cursor:pointer}
.mhome:hover{color:#fff}
.mbody{padding:16px 16px 18px;display:flex;flex-direction:column;gap:15px;flex:1}

/* 专家资料:学校展开成员,个人展示档案,两者共享同一层级 */
.mintro-block{display:flex;flex-direction:column;gap:9px}
.mintro{border:0;border-radius:16px;background:transparent;padding:14px 0}
.mintro-title{color:#141F1B;font-size:15px;font-weight:700;letter-spacing:-.01em}
.expert-intro-copy p{margin:0;color:#7A8981;font-size:11px;line-height:1.75}
.member-list-scroll{display:flex;gap:10px;overflow-x:auto;padding:1px 1px 5px;scroll-snap-type:x proximity;scrollbar-width:none;-ms-overflow-style:none}
.member-list-scroll::-webkit-scrollbar{display:none}
.member-profile{display:flex;align-items:flex-start;gap:12px;flex:0 0 min(244px,calc(50% - 5px));min-width:0;min-height:112px;padding:12px;border:1px solid #EDEEED;border-radius:12px;background:#fff;box-shadow:none;scroll-snap-align:start;transition:transform .4s var(--ease),box-shadow .4s var(--ease),border-color .4s var(--ease)}
.member-profile:hover{transform:translateY(-2px);border-color:#E1E6E2;box-shadow:0 8px 22px rgba(20,31,27,.06)}
.member-avatar{width:64px;height:64px;flex:0 0 64px;border:1px solid #DDE8E0;border-radius:50%;object-fit:cover;background:#EDF4EF;box-shadow:0 3px 9px rgba(0,0,0,.1)}
.member-copy{min-width:0;padding-top:1px}
.member-name{overflow:hidden;color:#23332B;font-size:12px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}
.member-copy p{display:-webkit-box;overflow:hidden;margin:4px 0 0;color:#89968F;font-size:10.5px;line-height:1.45;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.member-dots{display:flex;justify-content:center;gap:5px;margin-top:7px}
.member-dot{width:5px;height:5px;padding:0;border:0;border-radius:50%;background:#C9D9CF;cursor:pointer;transition:all .15s}
.member-dot:hover{background:#91B5A0}
.member-dot.active{width:15px;border-radius:999px;background:#AFCBBC}
.team-intro,.expert-intro{height:160px;box-sizing:border-box}
.expert-intro{min-height:160px}
.expert-intro-copy{min-width:0}
.m-divider{height:1px;flex:0 0 auto;margin:0 2px;background:linear-gradient(90deg,rgba(232,238,234,0),#E8EEEA 9%,#E8EEEA 91%,rgba(232,238,234,0))}

/* 压缩能力横条(图标呈现,深色) */
.cap{display:flex;align-items:center;gap:12px;padding:13px 0;border:0;border-radius:0;background:transparent;color:#141F1B}
.cic{width:40px;height:40px;flex:0 0 40px;display:grid;place-items:center;border-radius:10px;background:#EAF1EC;color:#141F1B;box-shadow:none}
.cic svg{width:21px;height:21px}
.cm{flex:1;min-width:0}
.cn{display:flex;align-items:center;gap:7px;min-width:0}
.cn-t,.agent-owner{overflow:hidden;font-size:14px;font-weight:600;letter-spacing:-.01em;text-overflow:ellipsis;white-space:nowrap}
.cn-topic{overflow:hidden;color:#7A7C7C;font-size:12px;text-overflow:ellipsis;white-space:nowrap}
.kd{display:inline-block;flex:0 0 auto;padding:1px 7px;border-radius:6px;border:1px solid #E3E4E3;color:#7A7C7C;font-size:10px;font-weight:600;letter-spacing:.2px;line-height:1.7}
.cp{overflow:hidden;margin-top:3px;color:#7A7C7C;font-size:11.5px;line-height:1.5;text-overflow:ellipsis;white-space:nowrap}
.cr{flex:0 0 auto;display:flex;align-items:center;gap:11px}
.cu{color:#9A9A9A;font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums}
.ccall{flex:0 0 auto;padding:7px 16px;border:1px solid #ECECEC;border-radius:999px;background:#fff;color:#141F1B;font-size:12px;font-weight:600;cursor:pointer;transition:background .25s var(--ease),border-color .25s var(--ease),color .25s var(--ease),transform .3s var(--ease)}
.ccall:active{transform:scale(.96)}
.ccall:hover{background:#F6F6F6}
.ccall.primary{background:#141F1B;border-color:#141F1B;color:#fff}
.ccall.primary:hover{background:#2C3632;border-color:#2C3632}

/* 老师作品(带封面),两列清单 */
.made{padding-top:2px}
.co-grid{display:flex;flex-direction:column;gap:3px}
.co-item{display:flex;flex-direction:column;gap:7px;min-width:0;padding:9px 7px;border:0;border-radius:11px;background:none;color:#141F1B;text-align:left;cursor:pointer;transition:background .25s var(--ease)}
.co-item:hover{background:#F6F7F6}
.co-line{display:flex;align-items:center;gap:5px;min-width:0;overflow:hidden;white-space:nowrap}
.co-avatar{width:22px;height:22px;flex:0 0 22px;border-radius:50%;object-fit:cover;background:#F6F6F6;box-shadow:inset 0 0 0 1px rgba(20,31,27,.06)}
.co-creator{flex:0 0 auto;font-size:11.5px;font-weight:600}
.co-use{flex:0 0 auto;color:#9A9A9A;font-size:11px}
.co-agent{min-width:0;overflow:hidden;color:#5F756A;font-size:11px;text-overflow:ellipsis}
.co-generated{flex:0 0 auto;color:#9A9A9A;font-size:11px}
.co-result{display:flex;align-items:center;gap:8px;min-width:0;padding-left:27px}
.co-cover{width:34px;height:34px;flex:0 0 34px;border-radius:8px;object-fit:cover;background:#EFEFEF;box-shadow:inset 0 0 0 1px rgba(20,31,27,.06);transition:transform .5s var(--ease)}
.co-item:hover .co-cover{transform:scale(1.06)}
.co-title{flex:1;min-width:0;overflow:hidden;font-size:12px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}
.co-uses{flex:0 0 auto;color:#9A9A9A;font-size:10.5px;white-space:nowrap}
.kn-more{display:flex;justify-content:center;margin-top:16px}
.kn-more button{padding:10px 22px;border:1px solid #E3E4E3;border-radius:999px;background:#fff;color:#141F1B;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 1px 2px rgba(20,31,27,.03);transition:transform .3s var(--ease),border-color .25s var(--ease),box-shadow .3s var(--ease)}
.kn-more button:hover{border-color:#CFD3D0;transform:translateY(-1px);box-shadow:0 6px 16px rgba(20,31,27,.06)}
.kn-more button:active{transform:scale(.98)}

/* 编辑精选 · App Store */
.ep{margin-top:80px}
.ep-hero{display:flex;align-items:center;gap:22px;padding:24px 26px;border:1px solid #EDEDED;border-radius:20px;background:#fff;box-shadow:0 1px 2px rgba(20,31,27,.03),0 8px 22px rgba(20,31,27,.03);margin-bottom:14px;transition:transform .45s var(--ease),box-shadow .45s var(--ease),border-color .45s var(--ease)}
.ep-hero:hover{transform:translateY(-2px);border-color:#E3E4E3;box-shadow:0 2px 4px rgba(20,31,27,.04),0 14px 34px rgba(20,31,27,.06)}
.ep-ic{width:56px;height:56px;flex:0 0 56px;display:grid;place-items:center;border-radius:16px}
.ep-ic svg{width:34px;height:34px}
.ep-ic.sk,.ep-ic.ag{background:transparent;color:#141F1B;box-shadow:none}
.ep-info{flex:1;min-width:0}
.ep-eb{color:#9A9A9A;font-size:11px;font-weight:600;letter-spacing:.06em}
.ep-nm{margin:5px 0 6px;font-size:19px;font-weight:600;letter-spacing:-.02em}
.ep-ds{margin:0;color:#7A7C7C;font-size:13px;line-height:1.6}
.ep-side{display:flex;flex-direction:column;align-items:flex-end;gap:9px;flex:0 0 auto}
.ep-get{padding:9px 22px;border:1px solid #ECECEC;border-radius:999px;background:#fff;color:#141F1B;font-size:13px;font-weight:600;cursor:pointer;transition:background .25s var(--ease),border-color .25s var(--ease),color .25s var(--ease),transform .3s var(--ease)}
.ep-get:active{transform:scale(.96)}
.ep-get:hover{background:#F6F6F6}
.ep-get.primary{background:#141F1B;border-color:#141F1B;color:#fff}
.ep-get.primary:hover{background:#2C3632;border-color:#2C3632}
.ep-cnt{color:#9A9A9A;font-size:11.5px}
.ep-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 32px;padding:6px 22px;border:1px solid #EDEDED;border-radius:20px;background:#fff;box-shadow:0 1px 2px rgba(20,31,27,.03),0 8px 22px rgba(20,31,27,.03)}
.ep-row{display:flex;align-items:center;gap:14px;padding:15px 4px;border-bottom:1px solid #F1F1F1;transition:background .25s var(--ease)}
.ep-row:nth-last-child(-n+2){border-bottom:0}
.ep-row .rk{width:16px;flex:0 0 16px;text-align:center;color:#B8BBB9;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.ep-rowic{width:44px;height:44px;flex:0 0 44px;display:grid;place-items:center;border-radius:12px}
.ep-rowic svg{width:26px;height:26px}
.ep-rowic.sk,.ep-rowic.ag{background:transparent;color:#141F1B;box-shadow:none}
.ep-m{flex:1;min-width:0}
.ep-m .n{font-size:14px;font-weight:600}
.ep-m .s2{overflow:hidden;margin-top:3px;color:#7A7C7C;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:1.5}
.ep-m .s{overflow:hidden;margin-top:3px;color:#9A9A9A;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
.ep-r{position:relative;display:flex;align-items:center;justify-content:flex-end;flex:0 0 auto;min-width:74px;min-height:32px}
.ep-getsm{position:absolute;right:0;top:50%;transform:translateY(-50%);opacity:0;pointer-events:none;padding:6px 16px;border:1px solid #E3E4E3;border-radius:999px;background:#fff;color:#141F1B;font-size:12px;font-weight:600;cursor:pointer;transition:opacity .3s var(--ease),background .25s var(--ease),border-color .25s var(--ease),color .25s var(--ease),transform .3s var(--ease)}
.ep-row:hover .ep-getsm,.ep-row:focus-within .ep-getsm{opacity:1;pointer-events:auto}
.ep-getsm:active{transform:translateY(-50%) scale(.95)}
.ep-getsm:hover{background:#F6F6F6}
.ep-getsm.primary{background:#141F1B;border-color:#141F1B;color:#fff}
.ep-getsm.primary:hover{background:#2C3632;border-color:#2C3632}
.ep-r .cnt{color:#9A9A9A;font-size:11px;transition:opacity .25s var(--ease)}
.ep-row:hover .cnt{opacity:0}

/* 探索全部 · youmind */
.ex{margin-top:80px}
.ex-tabs{display:flex;gap:26px;margin-bottom:16px;border-bottom:1px solid #ECECEC}
.ex-tabs button{position:relative;padding:2px 0 14px;border:0;background:none;color:#9A9A9A;font-size:17px;font-weight:600;letter-spacing:-.02em;cursor:pointer;transition:color .3s var(--ease)}
.ex-tabs button:hover{color:#141F1B}
.ex-tabs button.active{color:#141F1B}
.ex-tabs button.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:#141F1B;border-radius:2px}
.skill-filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px}
.skill-filters button{padding:7px 14px;border:0;border-radius:999px;background:transparent;color:#7A7C7C;font-size:12px;cursor:pointer;transition:background .15s,color .15s}
.skill-filters button:hover{color:#141F1B}
.skill-filters button.active{background:#141F1B;color:#fff}
.ex-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.excard{position:relative;display:flex;flex-direction:column;padding:17px 17px 15px;border:1px solid #EDEDED;border-radius:18px;background:#fff;box-shadow:0 1px 2px rgba(20,31,27,.03),0 6px 18px rgba(20,31,27,.025);transition:transform .45s var(--ease),box-shadow .45s var(--ease),border-color .45s var(--ease)}
.excard:hover{transform:translateY(-3px);border-color:#E3E4E3;box-shadow:0 2px 4px rgba(20,31,27,.04),0 14px 34px rgba(20,31,27,.07)}
.ex-top{display:flex;align-items:center;gap:11px;padding-right:46px}
.ex-tile{width:40px;height:40px;flex:0 0 40px;display:grid;place-items:center;border-radius:11px}
.ex-tile svg{width:26px;height:26px}
.ex-tile.sk,.ex-tile.ag{background:transparent;color:#141F1B;box-shadow:none}
.ex-h{flex:1;min-width:0}
.ex-t{font-size:14.5px;font-weight:600;letter-spacing:-.01em;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ex-kd{display:flex;align-items:center;gap:7px;margin-top:4px;color:#9A9A9A;font-size:11px}
.ex-get{position:absolute;top:15px;right:15px;z-index:2;opacity:0;transform:translateY(-4px);pointer-events:none;padding:6px 15px;border:1px solid #E3E4E3;border-radius:999px;background:rgba(255,255,255,.72);backdrop-filter:saturate(180%) blur(8px);-webkit-backdrop-filter:saturate(180%) blur(8px);color:#141F1B;font-size:12px;font-weight:600;cursor:pointer;transition:opacity .35s var(--ease),transform .35s var(--ease),background .25s var(--ease),border-color .25s var(--ease)}
.excard:hover .ex-get,.excard:focus-within .ex-get{opacity:1;transform:none;pointer-events:auto}
.ex-get:hover{background:#F4F5F4}
.ex-get:active{transform:scale(.96)}
.ex-get.primary{background:#141F1B;border-color:#141F1B;color:#fff}
.ex-get.primary:hover{background:#2C3632;border-color:#2C3632}
.ex-d{display:-webkit-box;overflow:hidden;margin:12px 0 0;color:#7A7C7C;font-size:12.5px;line-height:1.55;-webkit-box-orient:vertical;-webkit-line-clamp:2;min-height:39px}
.ex-f{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;padding-top:11px;border-top:1px solid #ECECEC}
.ex-au{display:flex;align-items:center;gap:7px;min-width:0;overflow:hidden;color:#7A7C7C;font-size:11.5px;white-space:nowrap;text-overflow:ellipsis}
.ex-au img{width:20px;height:20px;flex:0 0 20px;border-radius:50%;object-fit:cover;background:#F6F6F6;box-shadow:inset 0 0 0 1px rgba(20,31,27,.06)}
.ex-met{flex:0 0 auto;color:#9A9A9A;font-size:11.5px}
.ex-met b{color:#141F1B;font-weight:600;font-variant-numeric:tabular-nums;margin-right:3px}
.skills-empty{padding:56px 0;text-align:center;color:#9A9A9A}

/* Agent 召唤弹窗(沿用) */
.agent-dialog{position:fixed;inset:0;z-index:220;display:grid;place-items:center;padding:20px}
.agent-backdrop{position:absolute;inset:0;border:0;background:rgba(12,18,15,.45);cursor:pointer}
.agent-panel{position:relative;width:min(560px,calc(100vw - 32px));box-sizing:border-box;padding:24px;border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(10,15,12,.24)}
.agent-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}
.agent-head span{color:#7A7C7C;font-size:11px;font-weight:600}
.agent-head h2{margin:5px 0 0;font-size:22px}
.agent-head>button{width:32px;height:32px;border:0;border-radius:50%;background:#F6F6F6;color:#7A7C7C;font-size:20px;cursor:pointer}
.agent-panel>p{margin:12px 0 20px;color:#7A7C7C;font-size:13px;line-height:1.65}
.agent-example{padding:15px;border-radius:13px;background:#F6F6F6}
.agent-example>span{display:block;margin-bottom:9px;color:#7A7C7C;font-size:10.5px}
.agent-example button{padding:0;border:0;background:none;color:#141F1B;text-align:left;font-size:13px;cursor:pointer}
.agent-input{display:flex;align-items:center;gap:8px;margin-top:16px;padding:9px 10px;border:1px solid #ECECEC;border-radius:12px}
.agent-input>span{padding:5px 7px;border-radius:7px;background:#F6F6F6;color:#141F1B;font-size:11px;white-space:nowrap}
.agent-input input{min-width:0;flex:1;border:0;outline:0;font-size:12px}
.agent-input button{padding:8px 12px;border:0;border-radius:8px;background:#141F1B;color:#fff;font-size:11px}

@media(max-width:1180px){.ex-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:1000px){.skills-hero{align-items:flex-start;flex-direction:column;gap:16px}.skills-search{width:100%}.kn-grid{grid-template-columns:1fr}}
@media(max-width:860px){.ex-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ep-list{grid-template-columns:1fr}.ep-hero{flex-wrap:wrap}.ep-side{align-items:flex-start;width:100%}}
@media(max-width:640px){.hundred-schools-banner{display:block;min-height:0;padding:26px 24px}.hundred-schools-banner h2{font-size:23px}.hundred-schools-actions{align-items:stretch;flex-direction:column}.hundred-schools-actions button{width:100%}.mbar{flex-wrap:wrap;gap:9px;padding:14px 14px}.mwho{flex-basis:calc(100% - 70px)}.mhome{margin-left:auto}.member-profile{flex-basis:min(270px,86vw)}.co-line{gap:4px}.co-agent{font-size:10.5px}.co-result{padding-left:26px}.co-uses{display:none}}
@media(max-width:520px){.ex-grid{grid-template-columns:1fr}.cap{flex-wrap:wrap}.cr{width:100%;justify-content:space-between}}
</style>
