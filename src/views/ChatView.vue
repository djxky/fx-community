<script setup>
import { ref } from 'vue'
import CommunityPublishModal from '../components/CommunityPublishModal.vue'

// 复刻线上对话页（#/chat）：左侧对话 + 右侧文件预览，顶部「发布」进发布弹窗
const work = {
  title: '改编《英语词汇连连看游戏》',
  fileName: '单词练练看 - 科技版.html',
  // 以下为 AI 根据对话预填，老师在发布弹窗里确认 / 修改
  intro: '英语词汇配对小游戏：学生先点英文单词、再点对应中文释义完成配对，带发音、计分和计时。适合课堂导入或课末巩固 5–10 分钟，也可以布置成课后自练。',
  tags: { subject: '英语', textbook: '人教版', volume: '高中选择性必修第一册', chapter: 'Unit 1 People of Achievement' },
  labels: ['课堂练习'],
  suggestedLabels: ['课堂练习', '互动探究', '作业练习', '单词游戏'],
}
const words = ['phone number', 'age', 'China', 'hobby']

const publishOpen = ref(false)
const published = ref(false)
const toast = ref('')
let toastTimer = 0

function showToast(message) {
  toast.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toast.value = '' }, 1800)
}
function handlePublished() {
  publishOpen.value = false
  published.value = true
  showToast('发布成功')
}
</script>

<template>
  <div id="view-chat">
    <div class="chat-page">
      <section class="chat-col">
        <header class="chat-head">
          <h1 class="chat-title">{{ work.title }}</h1>
          <button type="button" class="chat-publish" data-track="/click/chat/publish | 点击发布 | 无" @click="publishOpen = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 10 14" /><path d="m21 3-7 18-4-7-7-4 18-7Z" /></svg>
            {{ published ? '已发布' : '发布' }}
          </button>
        </header>

        <div class="chat-scroll">
          <div class="chat-file">
            <span class="chat-file-ic"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg></span>
            <span class="chat-file-name">{{ work.fileName }}</span>
            <span class="chat-file-view">查看</span>
          </div>

          <div class="chat-user">制作一个同款教学动画，具体要求包括：改为浅色模式</div>
          <div class="chat-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
            {{ work.fileName }} 调整浅色视觉
          </div>

          <div class="chat-file">
            <span class="chat-file-ic"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg></span>
            <span class="chat-file-name">{{ work.fileName }}</span>
            <span class="chat-file-view">查看</span>
            <span class="chat-file-dl">下载</span>
          </div>

          <div class="chat-ai">
            <p>已完成并发布浅色模式版《单词练练看》。</p>
            <h3>修改内容</h3>
            <ul>
              <li>将深色科技背景改为浅色渐变背景。</li>
              <li>将主容器、信息栏和词汇卡片调整为浅色半透明风格。</li>
              <li>优化文字、边框和阴影对比度，确保清晰易读。</li>
              <li>保留原有单词配对、计分、计时、发音、重新开始和完成撒花等功能。</li>
            </ul>
            <h3>使用方式</h3>
            <ul>
              <li>点击英文单词，再点击对应的中文释义完成配对。</li>
              <li>点击单词旁的发音按钮可播放读音。</li>
              <li>“开始新游戏”会随机生成新题目。</li>
              <li>“重新开始”会清零得分并保留当前词汇。</li>
              <li>支持电脑、平板和手机使用。</li>
            </ul>
          </div>
          <div class="chat-ai-actions">
            <button type="button" class="chat-regen">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>重新生成
            </button>
            <span class="chat-thumb"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 18.5 21H7V10l4-8a3 3 0 0 1 4 3.9Z" /></svg></span>
            <span class="chat-sep"></span>
            <span class="chat-thumb"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V3M9 18.1 10 14H4.2a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 5.5 3H17v11l-4 8a3 3 0 0 1-4-3.9Z" /></svg></span>
          </div>
        </div>

        <div class="chat-input">
          <div class="chat-input-ph">输入修改意见或继续追问</div>
          <div class="chat-input-bar">
            <span class="chat-tool chat-tool-sq"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg></span>
            <span class="chat-tool"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><circle cx="12" cy="12" r="3" /></svg>教学动画</span>
            <span class="chat-tool">更多<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6" /></svg></span>
            <span class="chat-mic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg></span>
            <span class="chat-send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg></span>
          </div>
        </div>
        <div class="chat-ai-note">内容由AI生成</div>
      </section>

      <section class="preview-col">
        <header class="preview-head">
          <h2>文件预览</h2>
          <div class="preview-icons">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </div>
        </header>

        <div class="preview-card">
          <div class="preview-stage">
            <div class="game">
              <div class="game-title">⚡ 单词练练看</div>
              <div class="game-sub">科技驱动的英语词汇学习体验</div>
              <div class="game-board">
                <div class="game-stats"><span>模式: 个人信息词汇</span><span>得分: 0</span><span>时间: 00:24</span></div>
                <div v-for="w in words" :key="w" class="game-word">{{ w }}<span class="game-sound">🔈</span></div>
              </div>
            </div>
          </div>
          <div class="preview-files">
            <div class="preview-files-label">生成文件 2/2</div>
            <div class="preview-files-row">
              <div class="preview-file"><span class="chat-file-ic sm"></span><span>单词练练看 - 科…</span></div>
              <div class="preview-file on"><span class="chat-file-ic sm"></span><span>单词练练看 -…</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg></div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <CommunityPublishModal v-if="publishOpen" :work="work" @close="publishOpen = false" @published="handlePublished" />
    <div v-if="toast" class="chat-toast" role="status">{{ toast }}</div>
  </div>
</template>

<style scoped>
.chat-page { display:flex; height:100vh; background:#fff; color:#141F1B; }
.chat-col { position:relative; display:flex; flex-direction:column; flex:0 0 522px; min-width:0; height:100vh; border-right:1px solid #EFEFEF; }
.chat-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 22px 10px 20px; }
.chat-title { margin:0; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:16px; font-weight:500; }
.chat-publish { display:inline-flex; align-items:center; gap:6px; flex-shrink:0; border:0; border-radius:8px; padding:7px 10px; background:none; color:#141F1B; font-size:14px; font-weight:500; cursor:pointer; }
.chat-publish:hover { background:#F2F2F2; }
.chat-scroll { flex:1 1 auto; min-height:0; overflow-y:auto; padding:6px 22px 18px 20px; }
.chat-file { display:flex; align-items:center; gap:12px; height:80px; margin-bottom:16px; border:.5px solid rgba(0,0,0,.06); border-radius:16px; padding:0 18px; background:#F7F7F7; }
.chat-file-ic { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:32px; height:36px; border-radius:6px 12px 6px 6px; background:linear-gradient(135deg,#34B35A,#1E9E48); box-shadow:6px 4px 0 #CDEBD5; }
.chat-file-ic.sm { width:20px; height:24px; box-shadow:4px 3px 0 #CDEBD5; }
.chat-file-name { flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:16px; font-weight:500; }
.chat-file-view { flex-shrink:0; border:1px solid #E3E4E3; border-radius:10px; padding:9px 14px; background:#fff; font-size:13px; font-weight:500; }
.chat-file-dl { flex-shrink:0; border-radius:10px; padding:10px 18px; background:#141F1B; color:#fff; font-size:13px; font-weight:500; }
.chat-user { max-width:440px; margin:0 0 12px; border-radius:12px; padding:15px 20px; background:#303332; color:#fff; font-size:16px; font-weight:500; line-height:26px; }
.chat-chip { display:inline-flex; align-items:center; gap:6px; margin-bottom:16px; border:.5px solid rgba(0,0,0,.06); border-radius:43px; padding:5px 12px; background:#F7F7F7; font-size:12px; }
.chat-ai { padding:0 8px; font-size:16px; line-height:26px; }
.chat-ai p { margin:0 0 8px; }
.chat-ai h3 { margin:6px 0 0; font-size:16px; font-weight:500; }
.chat-ai ul { margin:0; padding-left:32px; }
.chat-ai li { margin:4px 0; }
.chat-ai-actions { display:flex; align-items:center; gap:14px; margin-top:18px; }
.chat-regen { display:inline-flex; align-items:center; gap:4px; border:1px solid #ECECEC; border-radius:16px; padding:6px 12px; background:#fff; color:#7A7C7C; font-size:14px; cursor:pointer; }
.chat-thumb { display:flex; color:#7A7C7C; }
.chat-sep { width:1px; height:12px; background:#E3E4E3; }
.chat-input { margin:0 22px 0 20px; border:1px solid #E3E4E3; border-radius:24px; padding:18px 18px 14px; box-shadow:0 2px 12px rgba(0,0,0,.03); }
.chat-input-ph { height:84px; color:#9A9A9A; font-size:16px; }
.chat-input-bar { display:flex; align-items:center; gap:8px; }
.chat-tool { display:inline-flex; align-items:center; gap:5px; height:38px; border:1px solid #ECECEC; border-radius:10px; padding:0 11px; color:#141F1B; font-size:14px; }
.chat-tool-sq { width:38px; justify-content:center; padding:0; }
.chat-mic { display:flex; align-items:center; justify-content:center; width:38px; height:38px; margin-left:auto; border:1px solid #ECECEC; border-radius:10px; }
.chat-send { display:flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:50%; background:#C9CBCA; }
.chat-ai-note { padding:8px 0 6px; color:#C3C3C3; font-size:12px; text-align:center; }
.preview-col { display:flex; flex-direction:column; flex:1 1 auto; min-width:0; height:100vh; padding:16px 22px 24px; background:#fff; }
.preview-head { display:flex; align-items:center; justify-content:space-between; padding:4px 0 14px 8px; }
.preview-head h2 { margin:0; font-size:20px; font-weight:500; }
.preview-icons { display:flex; align-items:center; gap:20px; color:#141F1B; }
.preview-icons svg { cursor:pointer; }
.preview-card { display:flex; flex-direction:column; flex:1 1 auto; min-height:0; border:1px solid #EFEFEF; border-radius:16px; overflow:hidden; }
.preview-stage { flex:1 1 auto; min-height:0; overflow:hidden; padding:26px 34px 0; }
.game { height:100%; overflow:hidden; padding:24px 22px; background:radial-gradient(circle at 20% 10%, #EEF0FF 0, #F2EEFB 45%, #F8EEF4 100%); text-align:center; }
.game-title { font-size:44px; font-weight:800; line-height:1.2; background:linear-gradient(90deg,#4F46E5,#7C3AED); -webkit-background-clip:text; background-clip:text; color:transparent; }
.game-sub { margin-top:14px; color:#4B5563; font-size:20px; }
.game-board { margin:32px auto 0; max-width:580px; border-radius:26px; padding:30px 22px; background:linear-gradient(180deg,rgba(255,244,230,.8),rgba(255,236,242,.7)); box-shadow:0 10px 30px rgba(124,58,237,.08); }
.game-stats { display:flex; justify-content:space-between; border:1px solid rgba(99,102,241,.25); border-radius:14px; padding:22px 22px; background:rgba(238,240,255,.7); color:#4F46E5; font-size:22px; font-weight:700; }
.game-word { position:relative; margin-top:18px; border:2px solid rgba(129,140,248,.45); border-radius:12px; padding:22px 0; background:rgba(237,233,254,.55); color:#3F3CBB; font-size:17px; font-weight:600; }
.game-sound { position:absolute; right:12px; top:50%; display:flex; align-items:center; justify-content:center; width:32px; height:32px; margin-top:-16px; border-radius:50%; background:#F5A524; font-size:14px; }
.preview-files { flex-shrink:0; padding:18px 20px 22px; background:#fff; }
.preview-files-label { font-size:14px; font-weight:500; letter-spacing:.5px; }
.preview-files-row { display:flex; gap:12px; margin-top:14px; }
.preview-file { display:flex; align-items:center; gap:14px; width:230px; height:58px; border:1px solid transparent; border-radius:10px; padding:0 20px; background:#F4F4F4; font-size:16px; font-weight:500; }
.preview-file span:nth-child(2) { flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.preview-file.on { border-color:#9A9A9A; background:#F4F4F4; }
.chat-toast { position:fixed; left:50%; top:36px; z-index:100; transform:translateX(-50%); border-radius:10px; padding:10px 18px; background:rgba(20,31,27,.92); color:#fff; font-size:14px; box-shadow:0 8px 24px rgba(0,0,0,.14); }
@media (max-width:1100px) { .chat-col { flex-basis:440px; } .game-title { font-size:34px; } }
</style>
