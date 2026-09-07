<script setup>
import Sidebar from '../components/Sidebar.vue'
import { SKILL_CATALOG } from '../data/skills'
</script>

<template>
  <div id="view-skills">
    <div class="page">
      <Sidebar active="skills" />
      <main class="skills-main">
        <header class="skills-head">
          <div>
            <p class="skills-kicker">技能广场</p>
            <h1>把成熟的教学方法，安装成你的能力</h1>
            <p class="skills-lead">这里只收录可安装、可复用的教学技能。课堂作品与教学资源请去“灵感”。</p>
          </div>
          <div class="skills-search" role="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3-3"></path></svg>
            <span>搜技能名称、学科或作者…</span>
          </div>
        </header>

        <section class="skills-section" aria-labelledby="skills-featured-title">
          <div class="skills-section-head">
            <div>
              <h2 id="skills-featured-title">精选技能</h2>
              <p>先看清效果，再决定是否安装</p>
            </div>
            <span class="skills-count">{{ SKILL_CATALOG.length }} 个技能</span>
          </div>

          <div class="skills-grid">
            <article v-for="skill in SKILL_CATALOG" :key="skill.id" class="skill-card">
              <div class="skill-cover">
                <img :src="skill.cover" :alt="skill.title + '封面'" />
                <span class="skill-kind">{{ skill.kind }}</span>
                <span v-if="skill.status === 'coming-soon'" class="skill-soon-badge">即将开放</span>
              </div>
              <div class="skill-card-body">
                <div class="skill-meta"><span>{{ skill.subject }}</span><span>·</span><span>{{ skill.author }}</span></div>
                <h3>{{ skill.title }}</h3>
                <p>{{ skill.description }}</p>
                <div class="skill-card-foot">
                  <span><b>{{ skill.metrics.use }}</b> 使用</span>
                  <span><b>{{ skill.metrics.install }}</b> 安装</span>
                  <button v-if="skill.status === 'available'" type="button" class="skill-open nav-skill">查看详情</button>
                  <button v-else type="button" class="skill-open is-disabled" disabled>即将开放</button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.skills-main { height:100vh; overflow-y:auto; background:#F7F7F7; }
.skills-head { display:flex; align-items:flex-end; justify-content:space-between; gap:36px; padding:44px 44px 38px; color:#fff; background:linear-gradient(135deg,#141F1B 0%,#263A32 64%,#53685E 100%); }
.skills-kicker { margin:0 0 12px; color:#D6E2DC; font-size:13px; font-weight:700; letter-spacing:.12em; }
.skills-head h1 { max-width:720px; margin:0; font-size:32px; line-height:1.28; letter-spacing:-.04em; }
.skills-lead { max-width:680px; margin:13px 0 0; color:#C9D5D0; font-size:14px; line-height:1.7; }
.skills-search { flex:0 0 300px; display:flex; align-items:center; gap:9px; padding:11px 14px; border:1px solid rgba(255,255,255,.2); border-radius:11px; background:rgba(255,255,255,.1); color:#D6E2DC; font-size:13px; }
.skills-section { max-width:1220px; margin:0 auto; padding:30px 34px 64px; }
.skills-section-head { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:18px; }
.skills-section-head h2 { margin:0; font-size:21px; letter-spacing:-.02em; }
.skills-section-head p { margin:6px 0 0; color:#7A7C7C; font-size:13px; }
.skills-count { color:#9A9A9A; font-size:12px; }
.skills-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; }
.skill-card { overflow:hidden; border:1px solid #E7E9E8; border-radius:18px; background:#fff; box-shadow:0 2px 10px rgba(20,31,27,.04); }
.skill-cover { position:relative; aspect-ratio:16/7; overflow:hidden; background:#E8ECEA; }
.skill-cover img { width:100%; height:100%; object-fit:cover; display:block; }
.skill-kind,.skill-soon-badge { position:absolute; top:12px; padding:5px 10px; border-radius:999px; font-size:11px; font-weight:700; }
.skill-kind { left:12px; background:rgba(20,31,27,.82); color:#fff; }
.skill-soon-badge { right:12px; border:1px solid #FBEFC6; background:#FFF6DF; color:#8A6D00; }
.skill-card-body { padding:19px 20px 20px; }
.skill-meta { display:flex; gap:7px; color:#7A7C7C; font-size:12px; }
.skill-card h3 { margin:8px 0 7px; font-size:19px; letter-spacing:-.02em; }
.skill-card p { min-height:44px; margin:0; color:#656A67; font-size:13px; line-height:1.65; }
.skill-card-foot { display:flex; align-items:center; gap:14px; margin-top:18px; padding-top:15px; border-top:1px solid #EFEFEF; color:#8A8E8C; font-size:12px; }
.skill-card-foot b { color:#141F1B; font-weight:700; }
.skill-open { margin-left:auto; padding:8px 14px; border:0; border-radius:9px; background:#141F1B; color:#fff; font-size:12.5px; font-weight:600; cursor:pointer; }
.skill-open:hover { background:#2C3632; }
.skill-open.is-disabled { border:1px solid #E1E3E2; background:#F3F4F3; color:#A1A5A3; cursor:not-allowed; }
@media (max-width:900px) { .skills-head { align-items:flex-start; flex-direction:column; padding:34px 24px; } .skills-search { flex-basis:auto; width:min(100%,360px); } .skills-grid { grid-template-columns:1fr; } }
@media (max-width:600px) { .skills-head h1 { font-size:26px; } .skills-section { padding:24px 16px 46px; } }
</style>
