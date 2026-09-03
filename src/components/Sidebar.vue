<script setup>
import { computed } from 'vue'
import { store } from '../store'
const props = defineProps({ active: { type: String, default: '' } }) // 'community' | 'academy' | 'mylib' | ''
const sqOn = computed(() => props.active === 'community')
const acOn = computed(() => props.active === 'academy')
const mlOn = computed(() => props.active === 'mylib')
function collapse() { store.sidebarCollapsed = true }
function expand() { store.sidebarCollapsed = false }
const history = [
  '💬 改编《古文沉浸式漫游·桃花源记》',
  '💬 生成AI写作编辑器应用方案代码',
  '💬 🚧 魔法冥想盆灵感捕捉应用代码',
  '💬 🚧 分层阅读',
  '💬 ✅ 🚧 飞花令',
  '💬 ✅ 教师生成绘本题目',
]
</script>

<template>
  <aside v-if="!store.sidebarCollapsed" class="side">
    <div class="side-brand-row" style="display:flex; align-items:center; justify-content:space-between; padding:4px 6px 14px;">
      <span class="side-brand" style="font-weight:600; font-size:19px; color:#141F1B; letter-spacing:0.5px;">飞象老师<span style="font-size:9px; vertical-align:super;">®</span></span>
      <svg class="side-collapse" @click="collapse" title="收起侧边栏" style="cursor:pointer;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M9 4v16"></path></svg>
    </div>

    <button class="side-new" style="display:flex; align-items:center; justify-content:center; gap:8px; background:#141F1B; color:#fff; border:none; border-radius:11px; padding:12px; font-size:14.5px; font-weight:600; cursor:pointer;">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
      新建任务
    </button>

    <div class="side-navs" style="display:flex; flex-direction:column; gap:3px; margin-top:16px;">
      <div class="nav">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"></path><path d="M5 10v10h14V10"></path></svg>首页
      </div>
      <div class="nav nav-discover" :class="{ on: sqOn }" style="cursor:pointer;">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" :stroke="sqOn ? '#141F1B' : '#7A7C7C'" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"></circle><path d="M3.5 19a5.5 5.5 0 0111 0"></path><circle cx="17" cy="8" r="2.6"></circle><path d="M15.5 13.6A5 5 0 0121 18.5"></path></svg>灵感
      </div>
      <div class="nav nav-academy" :class="{ on: acOn }" style="cursor:pointer;">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" :stroke="acOn ? '#141F1B' : '#7A7C7C'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"></path><path d="M6 12v4.5c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5V12"></path></svg>AI 教学工坊
      </div>
      <div class="nav nav-mylib" :class="{ on: mlOn }" style="cursor:pointer;">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" :stroke="mlOn ? '#141F1B' : '#7A7C7C'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 00-2 2z"></path><path d="M19 3v18"></path></svg>我的知识库
      </div>
      <div class="nav nav-notify" style="cursor:pointer;">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.7 21a2 2 0 01-3.4 0"></path></svg>消息
        <span class="side-unread" style="margin-left:auto; font-size:11px; background:#FF4832; color:#fff; border-radius:999px; padding:0 6px; font-weight:600;">3</span>
      </div>
    </div>

    <div class="side-promo" style="display:flex; align-items:center; gap:9px; margin-top:12px; padding:10px 12px; background:#F6F6F6; border:1px solid #FBEFC6; border-radius:11px; cursor:pointer;">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E0A400" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"></rect><path d="M12 8v13M3 12h18M8 8a2.5 2.5 0 010-5c2 0 4 5 4 5M16 8a2.5 2.5 0 000-5c-2 0-4 5-4 5"></path></svg>
      <span style="font-size:13.5px; font-weight:600; color:#8A6D00; flex-grow:1;">晒应用赢双倍积分</span>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D9AF3C" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"></path></svg>
    </div>

    <div class="side-divider" style="height:1px; background:#EFEFEF; margin:16px 6px;"></div>
    <div class="side-history-label" style="font-size:12.5px; color:#9A9A9A; padding:0 8px 8px;">历史任务</div>
    <div class="side-history" style="display:flex; flex-direction:column; gap:2px; overflow:hidden;">
      <div v-for="(h, i) in history" :key="i" style="display:flex; align-items:center; gap:6px; padding:7px 10px; font-size:13px; color:#7A7C7C; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ h }}</div>
    </div>

    <div class="side-footer" style="margin-top:auto; padding-top:14px;">
      <button class="side-campus" style="width:100%; display:flex; align-items:center; justify-content:center; gap:6px; background:#EFEFEF; color:#141F1B; border:1px solid #D4D4D4; border-radius:10px; padding:9px; font-size:13.5px; font-weight:600; cursor:pointer;">切换校园版
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
      </button>
      <div class="avatar-wrap" style="position:relative; margin-top:14px;">
        <div class="avatar-trigger" style="display:flex; align-items:center; gap:10px; padding:6px 6px; border-radius:10px; cursor:pointer;">
          <div class="avatar" style="width:36px; height:36px; background:#ECECEC; color:#141F1B; font-size:14px;">樱</div>
          <div class="side-user-copy" style="flex-grow:1; min-width:0;">
            <div style="font-size:13.5px; font-weight:600; color:#141F1B;">樱桃小魔丸子🔥</div>
            <div style="font-size:11.5px; color:#9A9A9A;">剩余积分：1025</div>
          </div>
          <svg class="side-user-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"></path></svg>
        </div>
        <div class="avatar-menu" style="display:none; position:absolute; left:0; right:0; bottom:calc(100% + 8px); background:#fff; border:1px solid #ECECEC; border-radius:12px; box-shadow:0 4px 24px rgba(89,98,84,0.10); padding:6px; z-index:60;">
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
      <div class="sm-ic" title="首页">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"></path><path d="M5 10v10h14V10"></path></svg>
      </div>
      <div class="sm-ic nav-discover" :class="{ on: sqOn }" title="灵感">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" :stroke="sqOn ? '#141F1B' : '#7A7C7C'" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"></circle><path d="M3.5 19a5.5 5.5 0 0111 0"></path><circle cx="17" cy="8" r="2.6"></circle><path d="M15.5 13.6A5 5 0 0121 18.5"></path></svg>
      </div>
      <div class="sm-ic nav-academy" :class="{ on: acOn }" title="AI 教学工坊">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" :stroke="acOn ? '#141F1B' : '#7A7C7C'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"></path><path d="M6 12v4.5c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5V12"></path></svg>
      </div>
      <div class="sm-ic nav-mylib" :class="{ on: mlOn }" title="我的知识库">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" :stroke="mlOn ? '#141F1B' : '#7A7C7C'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 00-2 2z"></path><path d="M19 3v18"></path></svg>
      </div>
      <div class="sm-ic nav-notify" title="消息">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7A7C7C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.7 21a2 2 0 01-3.4 0"></path></svg>
        <span class="sm-dot"></span>
      </div>
    </div>
    <div class="sm-bot">
      <div class="avatar-wrap" style="position:relative;">
        <div class="avatar-trigger sm-av" title="樱桃小魔丸子">樱</div>
        <div class="avatar-menu" style="display:none; position:absolute; left:calc(100% + 8px); bottom:0; width:168px; background:#fff; border:1px solid #ECECEC; border-radius:12px; box-shadow:0 4px 24px rgba(89,98,84,0.10); padding:6px; z-index:60;">
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
.side-mini {
  width:var(--fx-sidebar-compact-width); flex-shrink:0; box-sizing:border-box;
  height:100dvh; position:sticky; top:0;
  display:flex; flex-direction:column; align-items:center;
  padding:16px 0; border-right:1px solid #EFEFEF; background:#FFFFFF;
}
.sm-top { display:flex; flex-direction:column; align-items:center; gap:6px; }
.sm-toggle { cursor:pointer; margin-bottom:8px; padding:5px; border-radius:9px; box-sizing:content-box; }
.sm-toggle:hover { background:#F6F6F6; }
.sm-ic { position:relative; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.sm-ic:hover { background:#F6F6F6; }
.sm-ic.on { background:#EFEFEF; }
.sm-new { background:#141F1B; }
.sm-new:hover { background:#2C3632; }
.sm-dot { position:absolute; top:7px; right:8px; width:7px; height:7px; border-radius:50%; background:#FF4832; border:1.5px solid #fff; }
.sm-bot { margin-top:auto; }
.sm-av { width:38px; height:38px; border-radius:50%; background:#ECECEC; color:#141F1B; font-size:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.avatar-menu .amenu-item:hover { background:#F6F6F6; }

@media (max-width:1199px) {
  .side-mini { width:var(--fx-sidebar-compact-width); }
}

@media (max-width:1023px) {
  .side-mini { width:var(--fx-sidebar-mobile-width); }
}
</style>
