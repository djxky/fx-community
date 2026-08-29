<script setup>
defineProps({ m: { type: Object, required: true } })
const TYPE_LABEL = { press: '出版社', research: '教研组', school: '名校', studio: '工作室' }
</script>

<template>
  <div class="mc nav-studio">
    <div class="mc-top">
      <!-- 名师:真实头像 + 金环;机构:图标底 -->
      <div v-if="m.kind === 'expert'" class="mc-av ring" :class="{ initial: !m.portrait }">
        <img v-if="m.portrait" :src="m.portrait" alt="" />
        <span v-else>{{ m.initial }}</span>
      </div>
      <div v-else class="mc-av inst">
        <svg v-if="m.icon === 'book'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 00-2 2z"></path><path d="M19 3v18"></path></svg>
        <svg v-else-if="m.icon === 'people'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"></circle><path d="M3.5 19a5.5 5.5 0 0111 0"></path><circle cx="17" cy="8" r="2.6"></circle><path d="M15.5 13.6A5 5 0 0121 18.5"></path></svg>
        <svg v-else-if="m.icon === 'school'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-5h6v5"></path></svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"></path></svg>
      </div>

      <div class="mc-head">
        <div class="mc-name">
          {{ m.name }}
          <span v-if="m.kind === 'expert'" class="mc-ck" title="认证名师">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
          </span>
          <span v-else class="mc-type">{{ TYPE_LABEL[m.kind] }}</span>
        </div>
        <div class="mc-cred">{{ m.cred }}</div>
      </div>
    </div>

    <div class="mc-bio">{{ m.bio }}</div>

    <div class="mc-foot">
      <div class="mc-stat"><b>{{ m.use }}</b><span>位老师使用</span></div>
      <div class="mc-stat"><b>{{ m.follow }}</b><span>关注</span></div>
      <button class="mc-follow">+ 关注</button>
    </div>
  </div>
</template>

<style scoped>
.mc { flex:0 0 auto; width:340px; box-sizing:border-box; background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:18px; cursor:pointer; transition:box-shadow .15s; display:flex; flex-direction:column; }
.mc:hover { box-shadow:0 4px 24px rgba(89,98,84,0.06); }
.mc-top { display:flex; gap:13px; align-items:flex-start; }
.mc-av { width:54px; height:54px; border-radius:50%; flex-shrink:0; overflow:hidden; }
.mc-av img { width:100%; height:100%; object-fit:cover; }
.mc-av.ring { box-shadow:0 0 0 2px #fff, 0 0 0 3.5px #D9AF3C; }
.mc-av.inst { border-radius:14px; background:#F6F6F6; display:flex; align-items:center; justify-content:center; }
.mc-av.initial { background:#ECECEC; color:#141F1B; font-size:19px; font-weight:600; display:flex; align-items:center; justify-content:center; }
/* 预留两行名字高度,让不同长度的名字下方(职衔/简介)对齐 */
.mc-head { min-width:0; padding-top:1px; min-height:46px; }
.mc-name { font-size:15.5px; font-weight:600; color:#141F1B; line-height:1.35; display:flex; align-items:flex-start; flex-wrap:wrap; gap:6px; }
.mc-ck { display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border-radius:50%; background:#D9AF3C; margin-top:2px; }
.mc-type { font-size:11px; font-weight:500; color:#7A7C7C; background:#F6F6F6; border:1px solid #ECECEC; padding:1px 7px; border-radius:6px; margin-top:1px; }
.mc-cred { font-size:12px; color:#7A7C7C; margin-top:6px; line-height:1.5; }
.mc-bio { font-size:12.5px; color:#7A7C7C; line-height:1.6; margin-top:12px; height:60px; overflow:hidden; }
/* 数字+关注锁到卡片底部,跨卡对齐 */
.mc-foot { display:flex; align-items:center; gap:18px; margin-top:auto; padding-top:16px; }
.mc-stat { display:flex; flex-direction:column; }
.mc-stat b { font-size:16px; font-weight:700; color:#141F1B; }
.mc-stat span { font-size:11px; color:#9A9A9A; margin-top:2px; }
.mc-follow { margin-left:auto; align-self:center; background:#141F1B; color:#fff; border:none; border-radius:9px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; white-space:nowrap; }
.mc-follow:hover { background:#2C3632; }
</style>
