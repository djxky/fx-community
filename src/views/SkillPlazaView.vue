<script setup>
import { computed, ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import { MASTERS } from '../data/masters'
import { SKILL_CATALOG, SKILL_CATEGORIES, filterSkills } from '../data/skills'
import '../styles/community.css'

const activeCategory = ref('全部')
const query = ref('')
const featuredExperts = MASTERS.filter((master) => master.kind === 'expert').slice(0, 3)
const featuredSkills = SKILL_CATALOG.filter((skill) => skill.featured)
const visibleSkills = computed(() => filterSkills(SKILL_CATALOG, activeCategory.value, query.value))

const authorAliases = {
  王崧舟工作室: '王崧舟 · 诗意语文工作室',
  海淀数学教研室: '海淀区教师进修学校 · 数学教研室',
  人民教育出版社: '人民教育出版社 · 数学编辑部',
}

function fallbackAvatar(name) {
  const colors = ['#EDE2D3', '#DDE9E2', '#E3E3F0', '#E8E0D7']
  const color = colors[name.charCodeAt(0) % colors.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="${color}"/><text x="32" y="39" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#3f4541">${name.slice(0, 1)}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function getAuthorAvatar(author) {
  const matchedName = authorAliases[author] || author
  const profile = MASTERS.find((master) => master.name === matchedName)
  return profile?.portrait || profile?.logo || fallbackAvatar(author)
}
</script>

<template>
  <div id="view-skills">
    <div class="page">
      <Sidebar active="skills" />
      <main class="skills-main community-main">
        <div class="skills-shell community-body">
          <header class="skills-hero">
            <h1>技能广场</h1>
          </header>

          <section class="expert-entry" aria-labelledby="expert-entry-title">
            <div class="expert-entry-head">
              <div class="expert-title-wrap">
                <span class="expert-spark" aria-hidden="true">✦</span>
                <div><h2 id="expert-entry-title">专家入驻</h2><p>把一线名师的方法沉淀成可复用技能</p></div>
              </div>
            </div>
            <div class="expert-list">
              <article v-for="expert in featuredExperts" :key="expert.name" class="expert-item">
                <img :src="expert.portrait" :alt="expert.name" />
                <div class="expert-copy">
                  <h3>{{ expert.name }}</h3>
                  <p class="expert-cred">{{ expert.cred }}</p>
                  <p class="expert-bio">{{ expert.bio }}</p>
                  <div class="expert-stats"><span><b>{{ expert.use }}</b> 人使用</span></div>
                </div>
              </article>
            </div>
          </section>

          <section class="skills-section" aria-labelledby="skills-featured-title">
            <div class="skills-section-head">
              <div><h2 id="skills-featured-title">编辑精选</h2></div>
            </div>
            <div class="featured-grid">
              <article v-for="skill in featuredSkills" :key="skill.id" class="featured-card">
                <div class="featured-cover"><img :src="skill.cover" :alt="skill.title + '封面'" /><span>{{ skill.subject }}</span></div>
                <div class="featured-body">
                  <h3>{{ skill.title }}</h3><p>{{ skill.description }}</p>
                  <div class="featured-meta">
                    <div class="skill-author"><img class="skill-author-avatar" :src="getAuthorAvatar(skill.author)" :alt="skill.author" />{{ skill.author }}</div>
                    <span class="featured-install"><b>{{ skill.metrics.install }}</b> 次安装</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="skills-section explore-section" aria-labelledby="skills-explore-title">
            <div class="skills-section-head explore-head">
              <div><p class="section-index">02</p><h2 id="skills-explore-title">探索技能</h2></div>
              <p>按学科浏览，或直接搜索教学任务与作者。</p>
            </div>
            <div class="explore-toolbar">
              <div class="skill-filters" aria-label="技能分类">
                <button v-for="category in SKILL_CATEGORIES" :key="category" type="button" :class="{ active: activeCategory === category }" @click="activeCategory = category">{{ category }}</button>
              </div>
              <label class="skills-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
                <input v-model="query" type="search" placeholder="搜技能名称、学科或作者" />
              </label>
            </div>
            <div class="skills-grid">
              <article v-for="skill in visibleSkills" :key="skill.id" class="skill-row">
                <img :src="skill.cover" :alt="skill.title + '封面'" />
                <div class="skill-row-copy">
                  <div class="skill-row-meta">
                    <span class="skill-row-author"><img class="skill-author-avatar" :src="getAuthorAvatar(skill.author)" :alt="skill.author" />{{ skill.author }}</span>
                    <span>{{ skill.subject }}</span>
                  </div>
                  <h3>{{ skill.title }}</h3><p>{{ skill.description }}</p>
                </div>
                <div class="skill-row-actions">
                  <span><b>{{ skill.metrics.use }}</b> 人使用</span>
                  <button v-if="skill.status === 'available'" type="button" class="skill-open nav-skill">查看详情</button>
                  <button v-else type="button" class="skill-open is-disabled" disabled>即将开放</button>
                </div>
              </article>
            </div>
            <p v-if="visibleSkills.length === 0" class="skills-empty">没有找到匹配的技能，换个关键词试试。</p>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.skills-main{color:#171817}.skills-hero{text-align:center;padding:64px 20px 40px}.skills-kicker{margin:0 0 16px;color:#7c807d;font-size:13px;font-weight:700;letter-spacing:.2em}.skills-hero h1{margin:0;font-family:Georgia,'Songti SC',serif;font-size:clamp(42px,5.1vw,72px);font-weight:500;line-height:1.08;letter-spacing:-.055em}.skills-hero>p:last-child{max-width:560px;margin:22px auto 0;color:#747775;font-size:15px;line-height:1.7}.expert-entry{padding:26px 34px 20px;border:1px solid #dedfdd;border-radius:24px;box-shadow:0 8px 24px rgba(20,24,21,.035)}.expert-entry-head,.skills-section-head,.explore-toolbar{display:flex;align-items:center;justify-content:space-between;gap:24px}.expert-title-wrap{display:flex;align-items:flex-start;gap:14px}.expert-spark{margin-top:1px;color:#555a56;font-size:24px}.expert-entry h2,.skills-section h2{margin:0;font-size:25px;letter-spacing:-.035em}.expert-entry-head p{margin:6px 0 0;color:#929491;font-size:13px}.expert-more{border:0;background:none;color:#555a56;font-size:13px;cursor:pointer}.expert-more span{margin-left:5px}.expert-list{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-top:26px}.expert-item{display:flex;align-items:center;gap:16px;min-width:0;padding:8px;border-radius:16px;cursor:pointer;transition:background .18s}.expert-item:hover{background:#f5f5f2}.expert-item img{width:76px;height:76px;flex:0 0 76px;border-radius:50%;object-fit:cover}.expert-item h3{margin:0 0 7px;font-size:19px}.expert-item p{margin:0;color:#999b99;font-size:13px;line-height:1.45}.expert-dots{display:flex;justify-content:center;gap:12px;margin-top:17px}.expert-dots i{width:8px;height:8px;border-radius:50%;background:#dedfdd}.expert-dots i:first-child{background:#262826}.skills-section{margin-top:64px}.skills-section-head{align-items:flex-end;margin-bottom:22px}.skills-section-head>div{display:flex;align-items:baseline;gap:14px}.skills-section-head>p{margin:0;color:#858885;font-size:13px}.section-index{margin:0;color:#b1b3b0;font-family:Georgia,serif;font-size:12px}.featured-grid{display:grid;grid-template-columns:repeat(var(--community-columns),minmax(0,1fr));gap:var(--community-gap)}.featured-card{overflow:hidden;border:1px solid #e5e6e3;border-radius:16px;background:#fff;transition:transform .18s,box-shadow .18s}.featured-card:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(26,30,27,.08)}.featured-cover{position:relative;aspect-ratio:4/3;overflow:hidden;background:#efefec}.featured-cover img{width:100%;height:100%;display:block;object-fit:cover}.featured-cover>span{position:absolute;top:12px;left:12px;padding:5px 9px;border-radius:999px;background:rgba(24,27,25,.82);color:#fff;font-size:11px}.featured-body{padding:16px}.featured-body h3,.skill-row h3{margin:0;font-size:17px;letter-spacing:-.025em}.featured-body>p{height:42px;overflow:hidden;margin:8px 0 14px;color:#737673;font-size:12.5px;line-height:1.65}.skill-author{display:flex;align-items:center;gap:7px;color:#666966;font-size:12px}.skill-author>span{display:grid;width:22px;height:22px;place-items:center;border-radius:50%;background:#f0f0ed;color:#4b504c;font-weight:700}.featured-foot{display:flex;align-items:baseline;gap:4px;margin-top:14px;padding-top:13px;border-top:1px solid #eeeeeb}.featured-foot b{font-size:15px}.featured-foot span{color:#999b99;font-size:11px}.explore-section{padding-top:4px}.explore-toolbar{margin-bottom:18px;padding:14px 0;border-top:1px solid #ecece9;border-bottom:1px solid #ecece9}.skill-filters{display:flex;flex-wrap:wrap;gap:6px}.skill-filters button{padding:8px 13px;border:0;border-radius:999px;background:transparent;color:#737673;font-size:12.5px;cursor:pointer}.skill-filters button.active{background:#1c201d;color:#fff}.skills-search{display:flex;align-items:center;gap:8px;width:270px;padding:9px 12px;border:1px solid #e1e2df;border-radius:10px;color:#8d908d;background:#fafaf8}.skills-search input{width:100%;border:0;outline:0;background:transparent;color:#222;font:inherit;font-size:12px}.skills-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.skill-row{display:grid;grid-template-columns:104px minmax(0,1fr) auto;gap:16px;align-items:center;padding:12px;border:1px solid #e7e8e5;border-radius:14px;background:#fff}.skill-row>img{width:104px;height:88px;border-radius:10px;object-fit:cover}.skill-row-meta{display:flex;gap:10px;margin-bottom:7px;color:#8a8d8a;font-size:11px}.skill-row-copy p{display:-webkit-box;overflow:hidden;margin:7px 0 0;color:#747774;font-size:12px;line-height:1.55;-webkit-box-orient:vertical;-webkit-line-clamp:2}.skill-row-actions{align-self:stretch;display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;min-width:90px;padding:4px 2px}.skill-row-actions>span{color:#969996;font-size:11px}.skill-row-actions b{color:#282b29}.skill-open{padding:8px 12px;border:0;border-radius:8px;background:#1c201d;color:#fff;font-size:11.5px;font-weight:600;cursor:pointer}.skill-open.is-disabled{border:1px solid #e3e4e1;background:#f5f5f2;color:#a1a3a1;cursor:not-allowed}.skills-empty{padding:56px 0;text-align:center;color:#929592}.expert-item:focus-visible,.expert-more:focus-visible,.skill-filters button:focus-visible,.skill-open:focus-visible{outline:2px solid #1c201d;outline-offset:2px}
@media(max-width:1100px){.expert-list{gap:14px}.expert-item img{width:62px;height:62px;flex-basis:62px}.skills-grid{grid-template-columns:1fr}}
@media(max-width:760px){.skills-hero{padding:42px 8px 30px}.skills-hero h1{font-size:38px}.expert-entry{padding:22px 18px 17px}.expert-entry-head{align-items:flex-start}.expert-more{display:none}.expert-list{grid-template-columns:1fr;gap:7px}.expert-item:nth-child(n+3){display:none}.expert-item img{width:58px;height:58px;flex-basis:58px}.skills-section{margin-top:48px}.skills-section-head,.explore-toolbar{align-items:flex-start;flex-direction:column}.skills-search{width:100%;box-sizing:border-box}.skill-row{grid-template-columns:76px minmax(0,1fr)}.skill-row>img{width:76px;height:76px}.skill-row-actions{grid-column:2;flex-direction:row;align-items:center}.skills-section-head>p{max-width:260px}}
.skills-hero{text-align:left;padding:30px 0 18px;border-bottom:1px solid #ecece9}.skills-hero h1{font-family:inherit;font-size:28px;font-weight:650;line-height:1.3;letter-spacing:-.035em}.expert-entry{margin-top:22px;padding:24px 28px}.expert-list{align-items:stretch;gap:18px;margin-top:22px}.expert-item{align-items:flex-start;padding:14px;border:1px solid #ecece9;border-radius:16px;cursor:default;transition:none}.expert-item:hover{background:transparent}.expert-item img{width:68px;height:68px;flex-basis:68px}.expert-copy{min-width:0}.expert-item h3{margin-bottom:5px}.expert-item p.expert-cred{display:-webkit-box;overflow:hidden;color:#737673;font-size:12px;line-height:1.5;-webkit-box-orient:vertical;-webkit-line-clamp:2}.expert-item p.expert-bio{display:-webkit-box;min-height:57px;overflow:hidden;margin-top:10px;color:#858885;font-size:12px;line-height:1.6;-webkit-box-orient:vertical;-webkit-line-clamp:3}.expert-stats{display:flex;gap:16px;margin-top:12px;padding-top:10px;border-top:1px solid #eeeeeb;color:#999b99;font-size:11px}.expert-stats b{color:#303431;font-size:12px}.skills-section{margin-top:48px}
@media(max-width:1100px){.expert-list{grid-template-columns:1fr}.expert-item p.expert-bio{min-height:auto}.expert-item img{width:64px;height:64px;flex-basis:64px}}
@media(max-width:760px){.skills-hero{padding:22px 0 14px}.skills-hero h1{font-size:24px}.expert-entry{margin-top:16px;padding:20px 16px}.expert-list{gap:10px}.expert-item:nth-child(n+3){display:flex}.expert-item{padding:12px}.expert-item p.expert-bio{-webkit-line-clamp:2}.skills-section{margin-top:38px}}
.skills-section{margin-top:72px}.skills-section-head{margin-bottom:38px}.skills-section-head #skills-featured-title{font-family:Georgia,'Songti SC',serif;font-size:38px;font-weight:500}.featured-grid{gap:var(--community-gap)}.featured-card{border-radius:18px;box-shadow:none}.featured-cover{aspect-ratio:16/9;margin:14px 14px 0;border-radius:13px}.featured-body{padding:18px 18px 16px}.featured-body h3{font-size:18px}.featured-body>p{height:auto;min-height:43px;margin:10px 0 20px;font-size:13px;line-height:1.65;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}.featured-meta{display:flex;align-items:center;justify-content:space-between;gap:12px}.featured-install{white-space:nowrap;color:#999b99;font-size:11px}.featured-install b{color:#6f736f;font-weight:600}.explore-section{margin-top:86px}.explore-section .skills-section-head{margin-bottom:30px}.explore-toolbar{margin-bottom:28px;padding-block:18px}.skills-grid{gap:18px}
@media(max-width:1100px){.skills-section-head{margin-bottom:30px}}
@media(max-width:760px){.skills-section{margin-top:48px}.skills-section-head #skills-featured-title{font-size:32px}.featured-cover{margin:12px 12px 0}.explore-section{margin-top:64px}.featured-meta{align-items:flex-end}}
.skill-author-avatar{width:24px;height:24px;flex:0 0 24px;border-radius:50%;object-fit:cover;background:#f0f0ed}.skill-author>.skill-author-avatar{display:block;width:24px;height:24px}.skill-row-meta{align-items:center}.skill-row-author{display:flex;align-items:center;gap:7px;color:#656965;font-weight:500}.skill-row-author+.skill-row-author{margin-left:0}
</style>
