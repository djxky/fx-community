<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ m: { type: Object, required: true } })
const logoFailed = ref(false)

watch(() => props.m.logo, () => {
  logoFailed.value = false
})

const handleLogoError = () => {
  logoFailed.value = true
}
</script>

<template>
  <div class="mc nav-studio">
    <div class="mc-top">
      <!-- 名师:真实头像 + 金环;机构:图标底 -->
      <div v-if="m.kind === 'expert'" class="mc-av ring" :class="{ initial: !m.portrait }">
        <img v-if="m.portrait" :src="m.portrait" alt="" />
        <span v-else>{{ m.initial }}</span>
      </div>
      <div v-else class="mc-av inst avatar-account" :class="{ publisher: m.kind === 'press' }">
        <img v-if="m.logo && !logoFailed" class="mc-logo" :src="m.logo" alt="" @error="handleLogoError" />
        <template v-else>
          <svg v-if="m.icon === 'book'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 00-2 2z"></path><path d="M19 3v18"></path></svg>
          <svg v-else-if="m.icon === 'people'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"></circle><path d="M3.5 19a5.5 5.5 0 0111 0"></path><circle cx="17" cy="8" r="2.6"></circle><path d="M15.5 13.6A5 5 0 0121 18.5"></path></svg>
          <svg v-else-if="m.icon === 'school'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-5h6v5"></path></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#141F1B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"></path></svg>
        </template>
      </div>

      <div class="mc-head">
        <div class="mc-name" :title="m.name">
          <span class="mc-name-text">{{ m.name }}</span>
          <span v-if="m.kind === 'expert'" class="mc-ck" title="认证名师">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
          </span>
        </div>
        <div class="mc-cred" :title="m.cred">{{ m.cred }}</div>
      </div>
    </div>

    <div class="mc-bio" :title="m.bio">{{ m.bio }}</div>

    <div class="mc-foot">
      <div class="mc-stat"><b>{{ m.use }}</b><span>位老师使用</span></div>
      <div class="mc-stat"><b>{{ m.follow }}</b><span>关注</span></div>
      <button class="mc-follow">+ 关注</button>
    </div>
  </div>
</template>

<style scoped>
.mc { flex:0 0 auto; width:340px; min-height:200px; box-sizing:border-box; background:#fff; border:1px solid #ECECEC; border-radius:var(--fx-radius-card); padding:16px; cursor:pointer; transition:transform .15s ease, border-color .15s ease, box-shadow .15s ease; display:flex; flex-direction:column; box-shadow:none; }
.mc:hover { border-color:#D4D4D4; box-shadow:var(--fx-shadow-float); transform:translateY(-2px); }
.mc-top { display:flex; gap:14px; align-items:flex-start; }
.mc-av { width:56px; height:56px; border-radius:50%; flex-shrink:0; overflow:hidden; }
.mc-av img { width:100%; height:100%; object-fit:cover; }
.mc-av .mc-logo { display:block; width:100%; height:100%; object-fit:cover; }
.mc-av.ring { box-shadow:0 0 0 2px #fff, 0 0 0 3.5px #D9AF3C; }
.mc-av.inst { border-radius:50%; background:#F6F6F6; padding:0; border:1px solid #ECECEC; box-sizing:border-box; display:flex; align-items:center; justify-content:center; }
.mc-av.publisher .mc-logo { object-fit:cover; object-position:left center; }
.mc-av.initial { background:#ECECEC; color:#141F1B; font-size:19px; font-weight:600; display:flex; align-items:center; justify-content:center; }
/* 预留两行名字高度,让不同长度的名字下方(职衔/简介)对齐 */
.mc-head { min-width:0; padding-top:1px; min-height:56px; }
.mc-name { min-width:0; font-size:16px; font-weight:600; color:#141F1B; line-height:22px; display:flex; align-items:center; gap:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.mc-name-text { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.mc-ck { display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border-radius:50%; background:#D9AF3C; margin-top:2px; }
.mc-cred { min-width:0; font-size:12px; color:#7A7C7C; margin-top:5px; line-height:18px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.mc-bio { min-width:0; font-size:13px; color:#7A7C7C; line-height:21px; margin-top:8px; min-height:42px; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; text-overflow:ellipsis; }
/* 数字+关注锁到卡片底部,跨卡对齐 */
.mc-foot { display:flex; align-items:center; gap:18px; margin-top:auto; padding-top:10px; flex-shrink:0; }
.mc-stat { display:flex; flex-direction:column; white-space:nowrap; flex-shrink:0; }
.mc-stat b { font-size:15px; font-weight:600; color:#141F1B; line-height:20px; }
.mc-stat span { font-size:11px; color:#9A9A9A; margin-top:2px; white-space:nowrap; }
.mc-follow { margin-left:auto; align-self:center; width:72px; height:36px; padding:0; display:inline-flex; align-items:center; justify-content:center; background:#141F1B; color:#fff; border:none; border-radius:var(--fx-radius-control); font-size:14px; font-weight:500; cursor:pointer; white-space:nowrap; }
.mc-follow:hover { background:#2C3632; }
</style>
