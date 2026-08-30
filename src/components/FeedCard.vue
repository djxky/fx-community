<script setup>
import { ref } from 'vue'

const props = defineProps({ item: { type: Object, required: true } })
const liked = ref(false)
const commentOpen = ref(false)
const commentText = ref('')
const submittedComment = ref('')
const shareNotice = ref(false)
const likeCount = ref(Number(String(props.item.interactions.like).replace(/,/g, '')))
const commentCount = ref(Number(String(props.item.interactions.comment).replace(/,/g, '')))

function formatCount(value, compact = false) {
  if (compact && value >= 10000) {
    const wan = value / 10000
    return `${wan.toFixed(1).replace(/\.0$/, '')}万`
  }
  return value.toLocaleString('en-US')
}
function toggleLike() {
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
}
function submitComment() {
  const value = commentText.value.trim()
  if (!value) return
  submittedComment.value = value
  commentText.value = ''
  commentCount.value += 1
}
function shareResource() {
  if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(window.location.href).catch(() => {})
  shareNotice.value = true
  window.setTimeout(() => { shareNotice.value = false }, 1600)
}
</script>

<template>
  <article class="feed-card">
    <header class="feed-head">
      <div class="feed-avatar-wrap" :class="{ 'is-expert': item.expert, 'is-org': item.actorType === 'org' }">
        <img v-if="item.portrait" class="feed-avatar" :src="item.portrait" :alt="`${item.actor}头像`" />
        <span v-else class="feed-avatar feed-avatar-mono">{{ item.mark }}</span>
        <span v-if="item.expert" class="feed-cert" aria-label="认证专家">✓</span>
        <span v-else-if="item.actorType === 'org'" class="feed-org-type">{{ item.orgType }}</span>
      </div>
      <div class="feed-identity">
        <div class="feed-line">
          <span class="feed-name">{{ item.actor }}</span>
          <span v-if="item.expert" class="feed-verified">认证专家</span>
          <span class="feed-action-icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="feed-action">{{ item.action }}</span>
          <span class="feed-time">· {{ item.time }}</span>
        </div>
      </div>
    </header>

    <p v-if="item.text" class="feed-text">{{ item.text }}</p>

    <div class="feed-resource nav-res">
      <div class="feed-thumb"><img :src="item.resource.cover" :alt="`${item.resource.title}封面`" loading="lazy" /></div>
      <div class="feed-resource-body">
        <div class="feed-resource-title">{{ item.resource.title }}</div>
        <div class="feed-resource-meta">{{ item.resource.meta }}</div>
        <div class="feed-resource-stats">
          <span><b>{{ item.resource.use }}</b> 使用人数</span>
          <span><b>{{ item.resource.save }}</b> 收藏</span>
        </div>
      </div>
      <span class="feed-resource-arrow" aria-hidden="true">›</span>
    </div>

    <div v-if="commentOpen" class="feed-comment-form">
      <input v-model="commentText" type="text" maxlength="120" aria-label="评论内容" placeholder="写下你的评论…" @keydown.stop />
      <button type="button" @click.stop="submitComment">发布</button>
    </div>
    <div v-if="submittedComment" class="feed-submitted-comment">我：{{ submittedComment }}</div>

    <footer class="feed-actions">
      <button class="feed-act feed-act-like" :class="{ active: liked }" type="button" :aria-pressed="liked" @click.stop="toggleLike">
        <span aria-hidden="true">♡</span> 赞 {{ formatCount(likeCount) }}
      </button>
      <button class="feed-act feed-act-comment" type="button" @click.stop="commentOpen = !commentOpen">◌ 评论 {{ formatCount(commentCount) }}</button>
      <button class="feed-act feed-act-share" type="button" @click.stop="shareResource">↗ 分享</button>
      <span v-if="shareNotice" class="feed-toast" role="status">链接已复制</span>
    </footer>
  </article>
</template>

<style scoped>
.feed-card { display:flex; flex-direction:column; align-items:stretch; background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:20px 22px 16px; box-shadow:0 1px 2px rgba(20,16,10,.03),0 4px 18px rgba(20,16,10,.04); transition:border-color .18s ease, box-shadow .18s ease; }
.feed-card:hover { border-color:#DCDCDC; box-shadow:0 8px 28px rgba(20,16,10,.08); }
.feed-head { display:flex; align-items:flex-start; gap:12px; }
.feed-avatar-wrap { position:relative; width:44px; height:44px; flex:0 0 44px; }
.feed-avatar { width:44px; height:44px; display:block; object-fit:cover; border-radius:50%; background:#F0F0EE; }
.feed-avatar-mono { display:flex; align-items:center; justify-content:center; color:#141F1B; font-size:16px; font-weight:700; }
.feed-avatar-wrap.is-expert .feed-avatar { box-shadow:0 0 0 2px #fff,0 0 0 3px #D9AF3C; }
.feed-avatar-wrap.is-org .feed-avatar { border-radius:12px; background:#F3F3F1; border:1px solid #E5E5E2; font-size:12px; line-height:1.2; text-align:center; padding:4px; }
.feed-cert { position:absolute; right:-4px; bottom:-3px; width:17px; height:17px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; border-radius:50%; background:#D9AF3C; color:#fff; font-size:10px; font-weight:700; }
.feed-org-type { position:absolute; left:50%; bottom:-8px; transform:translateX(-50%); white-space:nowrap; padding:1px 6px; border-radius:6px; background:#F0F0EE; border:1px solid #E5E5E2; color:#6D706E; font-size:10px; line-height:15px; }
.feed-identity { min-width:0; padding-top:1px; }
.feed-line { display:flex; align-items:center; flex-wrap:wrap; gap:5px; min-height:22px; }
.feed-name { color:#141F1B; font-size:14px; font-weight:700; }
.feed-verified { padding:2px 7px; border-radius:6px; background:#FFF6DF; border:1px solid #FBEFC6; color:#8A6D00; font-size:10px; font-weight:700; }
.feed-action-icon { color:#7A7C7C; font-size:15px; font-weight:700; line-height:1; margin-left:3px; }
.feed-action { color:#141F1B; font-size:13.5px; font-weight:600; }
.feed-time { color:#9A9A9A; font-size:12px; }
.feed-text { margin:13px 0 0; color:#303331; font-size:14px; line-height:1.75; }
.feed-resource { display:flex; align-items:stretch; position:relative; margin-top:15px; min-height:92px; overflow:hidden; border:1px solid #E7E7E5; border-radius:12px; background:#FCFCFB; cursor:pointer; transition:border-color .18s ease, background .18s ease; }
.feed-resource:hover { border-color:#CFCFCB; background:#FAFAF8; }
.feed-thumb { width:136px; flex:0 0 136px; align-self:stretch; background:#EFEFEF; overflow:hidden; }
.feed-thumb img { width:100%; height:100%; display:block; object-fit:cover; }
.feed-resource-body { display:flex; flex-direction:column; min-width:0; padding:12px 38px 11px 14px; }
.feed-resource-title { color:#141F1B; font-size:14px; font-weight:700; line-height:1.45; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; }
.feed-resource-meta { margin-top:3px; color:#8C8E8C; font-size:11.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.feed-resource-stats { display:flex; align-items:center; flex-wrap:wrap; gap:12px; margin-top:auto; color:#9A9A9A; font-size:11px; }
.feed-resource-stats b { color:#141F1B; font-weight:700; font-variant-numeric:tabular-nums; }
.feed-resource-arrow { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#B0B2B0; font-size:24px; line-height:1; }
.feed-comment-form { display:flex; align-items:center; gap:8px; margin-top:12px; }
.feed-comment-form input { flex:1; min-width:0; border:1px solid #E7E7E5; border-radius:9px; padding:8px 10px; color:#141F1B; font:inherit; font-size:12px; outline:none; }
.feed-comment-form input:focus { border-color:#BEBEBA; }
.feed-comment-form button { border:0; border-radius:9px; padding:8px 14px; background:#141F1B; color:#fff; font-size:12px; cursor:pointer; }
.feed-submitted-comment { margin-top:8px; color:#6D706E; font-size:12px; line-height:1.5; }
.feed-actions { position:relative; display:flex; align-items:center; gap:20px; margin-top:auto; padding-top:14px; border-top:1px solid #F0F0EE; }
.feed-act { display:inline-flex; align-items:center; gap:4px; padding:0; border:0; background:none; color:#969896; font-size:12.5px; cursor:pointer; }
.feed-act:hover, .feed-act.active { color:#141F1B; }
.feed-act-share { margin-left:auto; color:#141F1B; font-weight:600; }
.feed-toast { position:absolute; right:0; bottom:34px; padding:7px 11px; border:1px solid #E7E7E5; border-radius:8px; background:#fff; color:#6D706E; font-size:11px; box-shadow:0 5px 18px rgba(20,16,10,.1); white-space:nowrap; }
@media (max-width:640px) {
  .feed-card { padding:16px 16px 14px; }
  .feed-thumb { width:104px; flex-basis:104px; }
  .feed-actions { gap:12px; }
}
</style>
