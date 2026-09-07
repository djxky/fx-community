<script setup>
import { computed } from 'vue'
import { store } from '../store'
const props = defineProps({ active: { type: String, default: '' } }) // 'home' | 'community' | 'skills' | 'academy' | 'mylib' | 'me' | ''
const homeOn = computed(() => props.active === 'home')
const sqOn = computed(() => props.active === 'community')
const skOn = computed(() => props.active === 'skills')
const acOn = computed(() => props.active === 'academy')
const mlOn = computed(() => props.active === 'mylib')
const meOn = computed(() => props.active === 'me')
function collapse() { store.sidebarCollapsed = true }
function expand() { store.sidebarCollapsed = false }
const history = [
  '改编《古文沉浸式漫游·桃花源记》',
  '生成 AI 写作编辑器应用方案代码',
  '魔法冥想盆灵感捕捉应用代码',
  '分层阅读',
  '飞花令',
  '教师生成绘本题目',
]
</script>

<template>
  <aside v-if="!store.sidebarCollapsed" class="side">
    <div class="side-brand-row" style="display:flex; align-items:center; justify-content:space-between; padding:4px 6px 14px;">
      <span class="side-brand" style="font-weight:600; font-size:19px; color:#141F1B; letter-spacing:0.5px;">飞象老师<span style="font-size:9px; vertical-align:super;">®</span></span>
      <svg class="side-collapse" @click="collapse" title="收起侧边栏" style="cursor:pointer;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M9 4v16"></path></svg>
    </div>

    <button class="side-new" style="display:flex; align-items:center; justify-content:center; gap:8px; background:#141F1B; color:#fff; border:none; border-radius:11px; padding:12px; font-size:14.5px; font-weight:600; cursor:pointer;">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v8M8 12h8"></path></svg>
      新建任务
    </button>

    <nav class="side-navs" aria-label="主导航" style="display:flex; flex-direction:column; gap:3px; margin-top:16px;">
      <button type="button" class="nav nav-home nav-rank" :class="{ on: homeOn }" :aria-current="homeOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"></path><path d="M9 15h6"></path></svg>首页
      </button>
      <button type="button" class="nav nav-discover" :class="{ on: sqOn }" :aria-current="sqOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"></circle><path d="M3.5 19a5.5 5.5 0 0 1 11 0"></path><circle cx="17" cy="8" r="2.6"></circle><path d="M15.5 13.6A5 5 0 0 1 21 18.5"></path></svg>灵感
      </button>
      <button type="button" class="nav nav-skills" :class="{ on: skOn }" :aria-current="skOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="4"></rect><path d="m9 9-2 3 2 3M15 9l2 3-2 3M11.5 16l1-8"></path></svg>技能广场
      </button>
      <button type="button" class="nav nav-academy" :class="{ on: acOn }" :aria-current="acOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"></path><path d="M6 12v4.5c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5V12"></path></svg>AI 教学工坊
      </button>
      <button type="button" class="nav nav-mylib" :class="{ on: mlOn }" :aria-current="mlOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 19h9.7a4.3 4.3 0 0 0 .7-8.5A6.2 6.2 0 0 0 6 8.8 5.1 5.1 0 0 0 7.5 19Z"></path></svg>我的知识库
      </button>
    </nav>

    <div class="side-divider" style="height:1px; background:#EFEFEF; margin:18px 6px 16px;"></div>
    <div class="side-history-label" style="font-size:12.5px; color:#9A9A9A; padding:0 8px 8px;">
      <span>历史任务</span>
      <button type="button" class="side-history-search" aria-label="搜索历史任务">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>
      </button>
    </div>
    <div class="side-history" style="display:flex; flex-direction:column; gap:2px; overflow:hidden;">
      <div v-for="(h, i) in history" :key="i" class="side-history-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-5 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"></path><path d="M8 11h.01M12 11h.01M16 11h.01"></path></svg>
        <span>{{ h }}</span>
      </div>
    </div>

    <div class="side-footer" style="margin-top:auto; padding-top:14px;">
      <button class="side-campus">切换校园版
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
      </button>
      <div class="avatar-wrap" style="position:relative; margin-top:14px;">
        <button type="button" class="avatar-trigger" :class="{ on: meOn }" aria-haspopup="menu" aria-expanded="false" style="display:flex; align-items:center; gap:10px; padding:6px 6px; border-radius:10px; cursor:pointer;">
          <div class="avatar" style="width:36px; height:36px; background:#ECECEC; color:#141F1B; font-size:14px;">樱<span class="user-unread-dot" aria-label="3 条未读消息"></span></div>
          <div class="side-user-copy" style="flex-grow:1; min-width:0;">
            <div style="font-size:13.5px; font-weight:600; color:#141F1B;">樱桃小魔丸子🔥</div>
            <div style="font-size:11.5px; color:#9A9A9A;">剩余积分：1025</div>
          </div>
          <svg class="side-user-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"></path></svg>
        </button>
        <div class="avatar-menu" role="menu" style="display:none; position:absolute; left:0; right:0; bottom:calc(100% + 8px); background:#fff; border:1px solid #ECECEC; border-radius:12px; box-shadow:0 4px 24px rgba(89,98,84,0.10); padding:6px; z-index:60;">
          <button type="button" class="amenu-item nav-notify" role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.7 21a2 2 0 01-3.4 0"></path></svg>消息<span class="menu-unread">3</span>
          </button>
          <div class="amenu-item nav-creator" style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;font-size:13.5px;color:#141F1B;font-weight:500;cursor:pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13z"></path></svg>创作者中心
          </div>
          <div class="amenu-item nav-mypage" style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;font-size:13.5px;color:#141F1B;font-weight:500;cursor:pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"></circle><path d="M5.5 20a6.5 6.5 0 0113 0"></path></svg>我的主页
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- 收起态:窄图标栏 -->
  <aside v-else class="side-mini">
    <div class="sm-top">
      <svg @click="expand" title="展开侧边栏" class="sm-toggle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M9 4v16"></path></svg>
      <div class="sm-ic sm-new" title="新建任务">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
      </div>
      <button type="button" class="sm-ic nav-home nav-rank" :class="{ on: homeOn }" title="首页" :aria-current="homeOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"></path><path d="M9 15h6"></path></svg>
      </button>
      <button type="button" class="sm-ic nav-discover" :class="{ on: sqOn }" title="灵感" :aria-current="sqOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"></circle><path d="M3.5 19a5.5 5.5 0 0 1 11 0"></path><circle cx="17" cy="8" r="2.6"></circle><path d="M15.5 13.6A5 5 0 0 1 21 18.5"></path></svg>
      </button>
      <button type="button" class="sm-ic nav-skills" :class="{ on: skOn }" title="技能广场" :aria-current="skOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="4"></rect><path d="m9 9-2 3 2 3M15 9l2 3-2 3M11.5 16l1-8"></path></svg>
      </button>
      <button type="button" class="sm-ic nav-academy" :class="{ on: acOn }" title="AI 教学工坊" :aria-current="acOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"></path><path d="M6 12v4.5c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5V12"></path></svg>
      </button>
      <button type="button" class="sm-ic nav-mylib" :class="{ on: mlOn }" title="我的知识库" :aria-current="mlOn ? 'page' : undefined">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 19h9.7a4.3 4.3 0 0 0 .7-8.5A6.2 6.2 0 0 0 6 8.8 5.1 5.1 0 0 0 7.5 19Z"></path></svg>
      </button>
    </div>
    <div class="sm-bot">
      <div class="avatar-wrap" style="position:relative;">
        <button type="button" class="avatar-trigger sm-av" :class="{ on: meOn }" title="樱桃小魔丸子" aria-haspopup="menu" aria-expanded="false">樱<span class="sm-dot" aria-label="3 条未读消息"></span></button>
        <div class="avatar-menu" role="menu" style="display:none; position:absolute; left:calc(100% + 8px); bottom:0; width:168px; background:#fff; border:1px solid #ECECEC; border-radius:12px; box-shadow:0 4px 24px rgba(89,98,84,0.10); padding:6px; z-index:60;">
          <button type="button" class="amenu-item nav-notify" role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.7 21a2 2 0 01-3.4 0"></path></svg>消息<span class="menu-unread">3</span>
          </button>
          <div class="amenu-item nav-creator" style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;font-size:13.5px;color:#141F1B;font-weight:500;cursor:pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13z"></path></svg>创作者中心
          </div>
          <div class="amenu-item nav-mypage" style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;font-size:13.5px;color:#141F1B;font-weight:500;cursor:pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"></circle><path d="M5.5 20a6.5 6.5 0 0113 0"></path></svg>我的主页
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.side {
  padding:16px 14px 12px;
}
.side-brand-row {
  min-height:48px;
}
.side-new {
  min-height:40px;
}
.side-mini {
  width:var(--fx-sidebar-compact-width); flex-shrink:0; box-sizing:border-box;
  height:100dvh; position:sticky; top:0;
  display:flex; flex-direction:column; align-items:center;
  padding:16px 0; border-right:1px solid #EFEFEF; background:#FFFFFF;
}
.sm-top { display:flex; flex-direction:column; align-items:center; gap:6px; }
.sm-toggle { cursor:pointer; margin-bottom:8px; padding:5px; border-radius:9px; box-sizing:content-box; }
.sm-toggle:hover { background:#F6F6F6; }
.sm-ic { position:relative; width:40px; height:40px; padding:0; border:0; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#141F1B; background:transparent; cursor:pointer; }
.sm-ic:hover { background:#F6F6F6; }
.sm-ic.on { background:#EFEFEF; }
.sm-new { background:#141F1B; }
.sm-new:hover { background:#2C3632; }
.sm-dot { position:absolute; top:7px; right:8px; width:7px; height:7px; border-radius:50%; background:#FF4832; border:1.5px solid #fff; }
.sm-bot { margin-top:auto; }
.sm-av { width:38px; height:38px; border-radius:50%; background:#ECECEC; color:#141F1B; font-size:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.sm-av.on { box-shadow:0 0 0 2px #141F1B; }
.side-navs .nav { width:100%; min-height:40px; border:0; background:transparent; color:#141F1B; text-align:left; }
.side-navs .nav.on { background:#EFEFEF; }
.side-history-label { display:flex; align-items:center; justify-content:space-between; }
.side-history-search { width:28px; height:28px; padding:0; border:0; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#7A7C7C; background:transparent; cursor:pointer; }
.side-history-search:hover { background:#F6F6F6; color:#141F1B; }
.side-history-item { min-width:0; display:flex; align-items:center; gap:8px; padding:7px 8px; color:#7A7C7C; font-size:13px; line-height:1.35; white-space:nowrap; }
.side-history-item svg { flex:0 0 auto; }
.side-history-item span { min-width:0; overflow:hidden; text-overflow:ellipsis; }
.side-campus { width:100%; min-height:40px; display:flex; align-items:center; justify-content:center; gap:6px; padding:9px; border:0; border-radius:10px; color:#141F1B; background:linear-gradient(100deg, #aaff78 0%, #8dff9c 50%, #a8ffd7 100%); box-shadow:inset 0 0 18px rgba(255,255,255,.38); font-size:13.5px; font-weight:600; cursor:pointer; }
.side-campus:hover { filter:saturate(1.05) brightness(.99); }
.avatar-trigger { width:100%; border:0; background:transparent; text-align:left; }
.avatar-trigger.on { background:#EFEFEF; }
.avatar { position:relative; }
.user-unread-dot { position:absolute; top:-1px; right:-1px; width:8px; height:8px; border-radius:50%; background:#FF4832; border:2px solid #fff; }
.avatar-menu .amenu-item { width:100%; display:flex; align-items:center; gap:10px; padding:9px 10px; border:0; border-radius:8px; background:#fff; color:#141F1B; text-align:left; font-size:13.5px; font-weight:500; cursor:pointer; }
.menu-unread { margin-left:auto; min-width:20px; padding:1px 6px; border-radius:999px; background:#FF4832; color:#fff; text-align:center; font-size:11px; font-weight:700; }
.avatar-menu .amenu-item:hover { background:#F6F6F6; }

@media (max-width:1199px) {
  .side-mini { width:var(--fx-sidebar-compact-width); }
}

@media (max-width:1023px) {
  .side-mini { width:var(--fx-sidebar-mobile-width); }
}
</style>
