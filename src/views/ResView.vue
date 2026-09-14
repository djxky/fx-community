<script setup>
import { computed, reactive, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import raw from './raw/res.html?raw'
import { RESOURCES_BY_ID } from '../data/resources'
import { COVERS } from '../data/covers'
import { store } from '../store'
import { bindForkCardResourceIds, isSlideResourceKind } from '../resource-navigation.mjs'
import { getAdaptedAttribution, getResourceCredits, getResourceTopicMembership } from '../resource-attribution.mjs'
import { getResourceActions, isResourceOwner } from '../resource-actions.mjs'
import { getRecentResourceActivities } from '../resource-activity.mjs'
import { getResourcePanelState, renderPanelState, renderPanelTabs } from '../resource-detail-v2.mjs'
import {
  buildResourcePreviewUrl,
  clearResourcePreviewUrl,
  createPreviewResource,
  getResourcePreviewState,
  getResourcePreviewStateFromSearch,
} from '../resource-state-preview.mjs'

const DEFAULT_RESOURCE_ID = 'res-xianglin'
const panelState = ref('detail')

// —— 交互状态（收藏 / 评论 / 回复 / toast）——
const interactions = reactive({
  resourceId: null,
  favorited: false,
  starDelta: 0,
  toast: '',
  toastAction: '',
  composerOpen: false,
  replyingTo: null,
  comments: [],
  seq: 900,
  count: 86,
  moreState: 'idle', // idle → loading（触底自动加载）
  visibleCount: 8, // 首屏 8 条，触底 +8
})

function seedInteractions(resource) {
  interactions.resourceId = resource.id
  interactions.favorited = false
  interactions.starDelta = 0
  interactions.composerOpen = false
  interactions.replyingTo = null
  interactions.seq = 900
  interactions.moreState = 'idle'
  interactions.visibleCount = 8
  interactions.comments = buildSeedComments()
  interactions.count = interactions.comments.length
}

const SEED_TONES = ['', 'is-warm', 'is-muted']
const SEED_TEXTS = [
  { name: '陈见微老师', text: '证据卡这个设计太巧了，学生开始主动翻书找依据，不再等我给结论。', time: '2 小时前' },
  { name: '沈知微老师', text: '时长有点紧，我删了一个环节正好一课时，整体节奏很顺。', time: '5 小时前' },
  { name: '赵雪老师', text: '第一次用这种角色扮演式教学，没想到全班参与度这么高。', time: '昨天 21:36' },
  { name: '孙宁老师', text: '任务单能不能再放一个空白模板？想按自己班的学情改一改。', time: '昨天 08:12' },
  { name: '吴敏老师', text: '拿去上了公开课，评委反馈说思路很清晰，谢谢作者。', time: '2 天前' },
  { name: '郑华老师', text: '小组分工那块我按人数调整了下，配套素材很齐全，省了不少备课时间。', time: '2 天前' },
  { name: '冯磊老师', text: '建议加一份课后延伸问题清单，孩子们意犹未尽。', time: '4 天前' },
  { name: '蒋文老师', text: '基础弱的班也能带得动，关键是前面的铺垫做足了。', time: '6 天前' },
  { name: '韩雪老师', text: '把结论式讨论改成找证据，这个方向我很认同。', time: '09-04' },
  { name: '杨帆老师', text: '素材清晰、环节完整，改编空间也大，已收藏。', time: '09-03' },
  { name: '朱丽老师', text: '学生复盘的时候引用了原文好几处，效果超出预期。', time: '08-30' },
  { name: '秦岭老师', text: '我加了一轮辩论环节，课堂气氛更足了，回头也发个改编版。', time: '08-28' },
  { name: '许静老师', text: '第一次带整本书阅读，这套流程给了我很大信心。', time: '08-22' },
  { name: '何伟老师', text: '难度梯度分得好，好几个层次的学生都有事做。', time: '08-20' },
  { name: '罗敏老师', text: '课件配图很讲究，投影出来质感也在线。', time: '08-13' },
]
function buildSeedComments() {
  const base = [
    { id: 'c1', name: '王慧老师', initial: '王', tone: '', text: '“先发人物关系卡”特别适合基础弱的班，学生进入状态快多了。', pinned: true, time: '3 天前', authorReply: '谢谢你的反馈，我也把这套卡片放进了最新版本。', mine: false, replies: [] },
    { id: 'c2', name: '李敏老师', initial: '李', tone: 'is-warm', text: '学生为了当“首席检察官”，提前把课文读了三遍。', pinned: false, time: '5 天前', mine: false, replies: [] },
    { id: 'c3', name: '周涛老师', initial: '周', tone: 'is-muted', text: '我做了一个 1 课时简化版，已经发布到改编版本区。', pinned: false, time: '09-05', mine: false, replies: [
      { id: 'c3r1', name: '李敏老师', initial: '李', tone: 'is-warm', text: '求链接，正好想找个简化版！', replyToName: '', time: '6 天前', mine: false },
    ] },
  ]
  const more = SEED_TEXTS.map((c, i) => ({
    id: `cs${i + 1}`, name: c.name, initial: c.name.slice(0, 1), tone: SEED_TONES[i % 3],
    text: c.text, pinned: false, time: c.time, mine: false, replies: [],
  }))
  return [...base, ...more]
}

function isAuthorView() { return previewEnabled.value && previewState.viewer === 'owner' }
function nextId() { return `c${++interactions.seq}` }
function findComment(id) {
  for (const c of interactions.comments) {
    if (c.id === id) return { node: c, parent: null }
    for (const r of c.replies) if (r.id === id) return { node: r, parent: c }
  }
  return null
}
function showToast(msg, action = '') {
  interactions.toast = msg
  interactions.toastAction = action
  clearTimeout(showToast._t)
  showToast._t = setTimeout(() => { interactions.toast = ''; interactions.toastAction = '' }, 2600)
}
function onToastClick() {
  if (!interactions.toastAction) return
  const target = interactions.toastAction
  clearTimeout(showToast._t)
  interactions.toast = ''; interactions.toastAction = ''
  store.view = target
}
function sortedComments() {
  return [...interactions.comments].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
}

function readInput(kind) {
  const el = document.querySelector(`#view-res [data-act-input="${kind}"]`)
  return el ? el.value.trim() : ''
}
function focusInput(kind) {
  requestAnimationFrame(() => {
    const el = document.querySelector(`#view-res [data-act-input="${kind}"]`)
    if (el) { el.focus({ preventScroll: true }) }
  })
}
// 整页 v-html 重渲染会重建右栏滚动容器、scrollTop 归零 —— 改交互状态时保存并还原滚动位置
function preserveScroll(fn) {
  const scroller = document.querySelector('#view-res .fg-hero-l-scroll')
  const top = scroller ? scroller.scrollTop : 0
  fn()
  const restore = () => {
    const s = document.querySelector('#view-res .fg-hero-l-scroll')
    if (s && s.scrollTop !== top) s.scrollTop = top
  }
  nextTick(() => { restore(); requestAnimationFrame(restore) })
}
function meInitial() { return String(store.currentUser.name || '我').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').slice(0, 1) || '我' }
function speaker() {
  if (isAuthorView()) {
    const a = currentResource.value.author
    return { name: a.name, initial: a.avatar || String(a.name).slice(0, 1), isAuthor: true, mine: true }
  }
  return { name: store.currentUser.name, initial: meInitial(), isAuthor: false, mine: true }
}
function submitComment() {
  const text = readInput('comment')
  if (!text) { interactions.composerOpen = false; return }
  const who = speaker()
  interactions.comments.push({ id: nextId(), name: who.name, initial: who.initial, tone: 'is-warm', text, likes: 0, liked: false, pinned: false, time: '刚刚', mine: who.mine, isAuthor: who.isAuthor, replies: [] })
  interactions.count += 1
  interactions.composerOpen = false
}
function submitReply(id) {
  const text = readInput('reply')
  const found = findComment(id)
  const target = found ? (found.parent || found.node) : null
  if (!text || !target) { interactions.replyingTo = null; return }
  const who = speaker()
  // 回复的是某条回复（而非顶层评论）→ 记录被回复者昵称，正文前缀「回复 @某某」
  const replyToName = found.parent ? found.node.name : ''
  target.replies.push({ id: nextId(), name: who.name, initial: who.initial, tone: 'is-muted', text, replyToName, time: '刚刚', mine: who.mine, isAuthor: who.isAuthor })
  interactions.count += 1
  interactions.replyingTo = null
}
function togglePin(id) {
  const found = findComment(id)
  if (!found || found.parent) return
  found.node.pinned = !found.node.pinned
}
function removeNode(id) {
  const found = findComment(id)
  if (!found) return
  if (found.parent) found.parent.replies = found.parent.replies.filter((r) => r.id !== id)
  else interactions.comments = interactions.comments.filter((c) => c.id !== id)
  interactions.count = Math.max(0, interactions.count - 1)
}
function handleAction(act, id) {
  preserveScroll(() => runAction(act, id))
}
function runAction(act, id) {
  switch (act) {
    case 'favorite':
      interactions.favorited = !interactions.favorited
      interactions.starDelta = interactions.favorited ? 1 : 0
      if (interactions.favorited) showToast('收藏成功，可前往「我的知识库」查看', 'mylib')
      break
    case 'comment-open': interactions.replyingTo = null; interactions.composerOpen = true; focusInput('comment'); break
    case 'comment-cancel': interactions.composerOpen = false; break
    case 'comment-submit': submitComment(); break
    case 'reply-open': interactions.composerOpen = false; interactions.replyingTo = id; focusInput('reply'); break
    case 'reply-cancel': interactions.replyingTo = null; break
    case 'reply-submit': submitReply(id); break
    case 'pin': togglePin(id); break
    case 'delete': removeNode(id); break
    default: break
  }
}

function renderCmtActions(node, isReply) {
  const author = isAuthorView()
  const parts = [`<button class="fg-cmt-act" data-act="reply-open" data-id="${node.id}" type="button">回复</button>`]
  if (!isReply && author) parts.push(`<button class="fg-cmt-act" data-act="pin" data-id="${node.id}" type="button">${node.pinned ? '取消置顶' : '置顶'}</button>`)
  if (author || node.mine) parts.push(`<button class="fg-cmt-act fg-cmt-del" data-act="delete" data-id="${node.id}" type="button">删除</button>`)
  return `<div class="fg-cmt-actions">${parts.join('')}</div>`
}
function renderReply(r) {
  return `<div class="fg-cmt-reply"><div class="fg-v2-comment-avatar ${r.tone || 'is-muted'}">${escapeHtml(r.initial)}</div><div class="fg-cmt-body"><div class="fg-v2-comment-meta"><strong>${escapeHtml(r.name)}</strong>${r.isAuthor ? '<span class="fg-cmt-author-badge">作者</span>' : ''}</div><p>${r.replyToName ? `回复 <b class="fg-cmt-reply-to">@${escapeHtml(r.replyToName)}</b>：` : ''}${escapeHtml(r.text)}</p><small>${escapeHtml(r.time)}</small>${renderCmtActions(r, true)}</div></div>`
}
function renderComment(c) {
  const replies = c.replies.map(renderReply).join('')
  const authorReply = c.authorReply ? `<div class="fg-v2-author-reply"><strong>作者回复</strong><span>${escapeHtml(c.authorReply)}</span></div>` : ''
  return `<article class="fg-v2-comment${c.pinned ? ' is-pinned' : ''}"><div class="fg-v2-comment-avatar ${c.tone}">${escapeHtml(c.initial)}</div><div class="fg-cmt-body"><div class="fg-v2-comment-meta"><strong>${escapeHtml(c.name)}</strong>${c.isAuthor ? '<span class="fg-cmt-author-badge">作者</span>' : ''}${c.pinned ? '<span class="fg-v2-pinned-badge">置顶</span>' : ''}</div><p>${escapeHtml(c.text)}</p><small>${escapeHtml(c.time)}</small>${authorReply}${renderCmtActions(c, false)}${replies ? `<div class="fg-cmt-replies">${replies}</div>` : ''}</div></article>`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US')
}

function renderContributors(contributors) {
  return contributors.map(({ name }) => {
    const initial = name.slice(0, 1)
    return `<div class="au-cc-p"><div class="a" style="background:#ECECEC;">${escapeHtml(initial)}</div><div class="n">${escapeHtml(name)}</div></div>`
  }).join('')
}

function isSlideResource(resource) {
  return isSlideResourceKind(resource.kind)
}

function renderSlideRail() {
  const labels = ['封面', '情境', '探究', '建模', '练习', '小结']
  return `<div class="fg-slide-rail" aria-label="课件页面">
    ${labels.map((label, index) => `<button class="fg-slide-thumb${index === 0 ? ' is-active' : ''}" type="button"${index === 0 ? ' aria-current="page"' : ''} aria-label="第 ${index + 1} 页：${label}"><span class="fg-slide-thumb-art"><b>${index + 1}</b><i>${label}</i></span><span>${index + 1}</span></button>`).join('')}
  </div>`
}

function renderSlots(template, slots, htmlSlots = []) {
  let html = template
  for (const [slot, value] of Object.entries(slots)) {
    html = html.replaceAll(slot, htmlSlots.includes(slot) ? value : escapeHtml(value))
  }
  return html
}

function renderForkCard(fork) {
  const latestVersion = fork.versions.at(-1)?.v || 'V1'
  const parent = RESOURCES_BY_ID[fork.forkedFrom]
  const parentLabel = parent ? `${parent.title}(${parent.author.name})` : '原版'
  return `<div class="nav-res fg-community-remix-card" data-resource-id="${escapeHtml(fork.id)}" style="border:1px solid #ECECEC;border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:14px;margin-bottom:10px;cursor:pointer;">
    <div class="avatar" style="width:34px;height:34px;background:#ECECEC;color:#141F1B;font-size:13px;flex-shrink:0;">${escapeHtml(fork.author.name.slice(0, 1))}</div>
    <div style="flex-grow:1;min-width:0;">
      <div style="font-size:13.5px;font-weight:600;color:#141F1B;">${escapeHtml(fork.title)} <span style="font-size:11px;font-weight:500;color:#7A7C7C;background:#F6F6F6;border:1px solid #ECECEC;padding:1px 7px;border-radius:6px;margin-left:4px;">改编</span><span style="font-size:10.5px;color:#8A6D00;background:#FFF6DF;border:1px solid #FBEFC6;padding:1px 7px;border-radius:6px;margin-left:4px;">已署名原作者</span></div>
      <div style="font-size:12px;color:#7A7C7C;margin-top:3px;line-height:1.5;">${escapeHtml(fork.author.name)} · 基于 ${escapeHtml(latestVersion)} · ${escapeHtml(fork.goal)}</div>
      <div style="font-size:11.5px;color:#9A9A9A;margin-top:5px;display:flex;align-items:center;gap:5px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v6a3 3 0 003 3h6"></path><path d="M15 9l3 3-3 3"></path></svg>${escapeHtml(parentLabel)} → ${escapeHtml(fork.title)}</div>
    </div>
    <div style="text-align:right;flex-shrink:0;"><div style="font-size:14px;font-weight:700;color:#141F1B;">${formatNumber(fork.stats.use)}</div><div style="font-size:10.5px;color:#9A9A9A;">使用 · ${formatNumber(fork.stats.adapt)} 次改编</div></div>
    <button style="flex-shrink:0;background:#141F1B;color:#fff;border:none;border-radius:9px;padding:8px 15px;font-size:13px;font-weight:500;cursor:pointer;">使用</button>
  </div>`
}

function renderForkSection(resource) {
  const forks = resource.forks.map((id) => RESOURCES_BY_ID[id]).filter(Boolean)
  const cards = forks.length ? forks.map(renderForkCard).join('') : '<div style="font-size:13px;color:#9A9A9A;padding:12px 0;">暂无社区改编</div>'
  return `<div class="fg-community-remix-heading" style="font-size:13px;color:#9A9A9A;font-weight:600;margin:20px 0 12px;">社区改编 · ${formatNumber(resource.stats.adapt)} 个版本</div>${cards}</div></div>`
}

function renderResourceCredits(resource) {
  const parent = resource.forkedFrom ? RESOURCES_BY_ID[resource.forkedFrom] : null
  const shieldIcon = '<span class="ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>'

  return getResourceCredits(resource, parent).map((credit) => {
    const linkAttributes = credit.resourceId
      ? ` class="fg-inforow fg-credit-link" data-resource-id="${escapeHtml(credit.resourceId)}" role="link" tabindex="0" aria-label="查看原创作者 ${escapeHtml(credit.name)} 的原作"`
      : ' class="fg-inforow"'
    const linkMark = credit.resourceId ? '<span class="fg-credit-arrow" aria-hidden="true">↗</span>' : ''

    return `<div${linkAttributes}>${shieldIcon}${escapeHtml(credit.role)} <b style="margin-left:auto;">${escapeHtml(credit.name)}${linkMark}</b></div>`
  }).join('')
}

function renderTopicMembership(resource) {
  const membership = getResourceTopicMembership(resource)
  if (!membership) return ''

  return `<div class="rd-topic-strip" data-track="/click/resourceDetailPage/topic | 进入所属专题 | 无" aria-label="${escapeHtml(membership.label)}">
    <span>${escapeHtml(membership.label)}</span>
    <span class="rd-topic-dot" aria-hidden="true">·</span>
    <strong>${escapeHtml(membership.title)}</strong>
  </div>`
}

const ACTION_ICONS = {
  favorite: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>',
  share: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"></path><path d="M7 9l5-5 5 5"></path><path d="M5 13v6h14v-6"></path></svg>',
  adapt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 4 4.1.6-3 3 .7 4.4L12 17l-3.7 2 .7-4.4-3-3 4.1-.6z"></path></svg>',
}

function renderFavoriteAction(action, favoriteCount) {
  return `<button class="fg-action-link fg-favorite" type="button" title="收藏" aria-label="收藏" aria-pressed="false">${ACTION_ICONS.favorite}<span class="fg-action-label">${action.label}</span><span class="fg-action-count" data-count="${favoriteCount}">${formatNumber(favoriteCount)}</span></button>`
}

function renderShareAction(action) {
  return `<label for="fg-share-toggle" class="fg-action-link fg-share-action" title="分享" aria-label="分享" role="button" tabindex="0">${ACTION_ICONS.share}<span class="fg-action-label">${action.label}</span></label>`
}

function renderResourceActions(actions, favoriteCount) {
  const lightweight = actions.filter((action) => action.emphasis === 'lightweight').map((action) => action.key === 'favorite'
    ? renderFavoriteAction(action, favoriteCount)
    : renderShareAction(action)).join('')

  const buttons = actions.filter((action) => action.emphasis !== 'lightweight').map((action) => {
    if (action.key === 'adapt') {
      return `<button class="fg-action-button fg-action-outline nav-adapt" type="button">${ACTION_ICONS.adapt}${action.label}</button>`
    }

    const handlerClass = action.key === 'copy' ? ' fg-save-copy' : ''
    return `<button class="fg-action-button fg-action-solid fg-action-${action.key}${handlerClass}" type="button">${action.label}</button>`
  }).join('')

  return `<div class="fg-action-lightweight">${lightweight}</div><div class="fg-action-buttons">${buttons}</div>`
}

function renderResourcePrimaryActions(actions) {
  return renderResourceActions(actions.filter((action) => action.emphasis !== 'lightweight'), 0)
}

function renderDiscussionActionBar(actions, favoriteCount) {
  const share = actions.find((action) => action.key === 'share')
  const comment = '<button class="fg-action-link fg-comment-action" data-act="comment-open" type="button" aria-label="评论"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 6.5A3.5 3.5 0 018.5 3h7A3.5 3.5 0 0119 6.5v5a3.5 3.5 0 01-3.5 3.5H11l-4.5 4v-4.3A3.5 3.5 0 015 11.5z"></path></svg><span class="fg-action-label">评论</span><span class="fg-action-count">86</span></button>'
  return `${comment}${share ? renderShareAction(share) : ''}`
}

function renderResourceDetailHead(resource) {
  return `<h1>${escapeHtml(resource.title)}</h1>`
}

function renderResourceFit(resource) {
  const grade = String(resource.fit.grade || '').split('·').pop()
  const parts = [...new Set([resource.fit.subject, grade, resource.fit.textbook, resource.fit.lessonType, resource.kind].map((p) => String(p || '').trim()).filter(Boolean))]
  if (!parts.length) return ''
  return `<div class="fg-res-fit" aria-label="适配信息">${parts.map((p) => `<span>${escapeHtml(p)}</span>`).join('<i class="fg-res-fit-dot" aria-hidden="true">·</i>')}</div>`
}

function renderResourceStats(resource) {
  const s = resource.stats || {}
  const useIcon = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"></path><circle cx="9.5" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>'
  const starIcon = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>'
  const items = []
  if (s.use != null) items.push(`<span class="fg-res-metric" aria-label="使用人数">${useIcon}<b>${formatNumber(s.use)}</b><i>使用</i></span>`)
  if (s.star != null) {
    const starCount = (s.star || 0) + interactions.starDelta
    const favBody = starCount > 0 ? `<b>${formatNumber(starCount)}</b>` : '<i>收藏</i>'
    items.push(`<button class="fg-res-metric fg-res-metric-fav${interactions.favorited ? ' is-on' : ''}" data-act="favorite" data-track="/click/resourceDetailPage/favorite | 收藏资源 | 无" type="button" aria-label="收藏" aria-pressed="${interactions.favorited}">${starIcon}${favBody}</button>`)
  }
  if (!items.length) return ''
  return `<div class="fg-res-metrics">${items.join('')}</div>`
}

function renderResourceIcon(resource) {
  if (resource.contentType !== 'app') return ''
  const icon = resource.id === 'res-order-game' ? '🍽️' : '✦'
  return `<div class="fg-v2-app-icon" aria-hidden="true">${icon}</div>`
}

const ACTIVITY_ICONS = {
  adapt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M17 7L7 17"></path><path d="M7 11V7h4"></path></svg>',
  favorite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"></path><path d="M7.5 10.5L12 15l4.5-4.5"></path><path d="M5 20h14"></path></svg>',
}

function formatActivityActor(actor) {
  return actor.endsWith('老师') ? actor : `${actor}老师`
}

function renderActivityRow(activity, duplicate = false) {
  const icon = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.favorite
  const hiddenAttribute = duplicate ? ' aria-hidden="true"' : ''

  return `<div class="fg-activity-item is-${escapeHtml(activity.type)}" role="listitem"${hiddenAttribute}>
    <span class="fg-activity-icon">${icon}</span>
    <span class="fg-activity-copy"><strong>${escapeHtml(formatActivityActor(activity.actor))}</strong> ${escapeHtml(activity.action)}</span>
    <time>${escapeHtml(activity.time)}</time>
  </div>`
}

function renderRecentActivities(resource, limit = 2, withHeader = true) {
  const activities = getRecentResourceActivities(resource).slice(0, limit)
  const rows = activities.map((activity) => renderActivityRow(activity)).join('')
  const duplicateRows = activities.map((activity) => renderActivityRow(activity, true)).join('')

  return `<section class="fg-activity-card${withHeader ? '' : ' is-compact'}"${withHeader ? ' data-sec="5"' : ''} aria-labelledby="fg-activity-title">
    ${withHeader ? `<div class="fg-activity-head">
      <h3 id="fg-activity-title">最近动态</h3>
    </div>` : ''}
    <div class="fg-activity-viewport" role="list" aria-label="关于这个资源的最近动态">
      <div class="fg-activity-track">${rows}${duplicateRows}</div>
    </div>
  </section>`
}

function renderComposerPanel(kind, submitAct, cancelAct, id, opts = {}) {
  const idAttr = id ? ` data-id="${id}"` : ''
  const hint = opts.hint ? `<div class="fg-live-reply-hint">${opts.hint}</div>` : ''
  const cancelBtn = opts.hideCancel ? '' : `<button class="fg-live-cancel-btn" data-act="${cancelAct}" type="button">取消</button>`
  const placeholder = opts.placeholder || (kind === 'reply' ? '回复…' : '说点什么…')
  return `<div class="fg-live-panel">
    ${hint}
    <input class="fg-live-input" data-act-input="${kind}" type="text" placeholder="${placeholder}" maxlength="200">
    <div class="fg-live-bar">
      <div class="fg-live-send-group">
        ${cancelBtn}
        <button class="fg-live-send" data-act="${submitAct}"${idAttr} type="button">发送</button>
      </div>
    </div>
  </div>`
}

function renderComposerFooter(resource) {
  if (interactions.replyingTo) {
    const found = findComment(interactions.replyingTo)
    const name = found ? found.node.name : ''
    const quote = found ? found.node.text : ''
    const hint = `<div class="fg-live-reply-hint-main"><span class="fg-live-reply-to">回复 <b>@${escapeHtml(name)}</b></span><span class="fg-live-reply-quote">${escapeHtml(quote)}</span></div>`
    return `<div class="fg-composer-footer is-composing">${renderComposerPanel('reply', 'reply-submit', 'reply-cancel', interactions.replyingTo, { hint, placeholder: '写下你的回复…' })}</div>`
  }
  if (interactions.composerOpen) {
    return `<div class="fg-composer-footer is-composing">${renderComposerPanel('comment', 'comment-submit', 'comment-cancel')}</div>`
  }
  const actions = getResourceActions({
    contentType: resource.contentType,
    isOwner: isResourceOwner(resource, store.currentUser),
    isAdapted: Boolean(resource.forkedFrom),
  })
  const discussionActions = renderDiscussionActionBar(actions, resource.stats.star)
  return `<div class="fg-composer-footer"><div class="fg-v2-discussion-composer" aria-label="参与讨论">
    <button class="fg-v2-comment-input" data-act="comment-open" data-track="/click/resourceDetailPage/comment | 发表评论 | 无" type="button">说点什么…</button>
    <div class="fg-v2-discussion-actions">${discussionActions}</div>
  </div></div>`
}

// 讨论底部：触底自动加载（无「加载更多」按钮）——加载中转圈、还有则放哨兵、到底显示没有更多
function renderMoreFooter(hasMore) {
  if (interactions.moreState === 'loading') {
    return '<div class="fg-v2-comment-more"><span class="fg-spinner" aria-hidden="true"></span>加载中…</div>'
  }
  if (hasMore) {
    return '<div class="fg-v2-comment-more" data-more-sentinel aria-hidden="true"></div>'
  }
  return '<div class="fg-v2-comment-more is-end">— 没有更多了 —</div>'
}
function renderResourceDiscussionPanel(resource) {
  const sorted = sortedComments()
  const shown = sorted.slice(0, interactions.visibleCount)
  const hasMore = interactions.visibleCount < sorted.length
  const list = shown.map(renderComment).join('')
  return `<section class="fg-v2-discussion-panel" data-sec="6" aria-labelledby="fg-v2-discussion-title">
    <div class="fg-v2-discussion-head"><h3 id="fg-v2-discussion-title">讨论 <span>${formatNumber(interactions.count)}</span></h3></div>
    <div class="fg-v2-comment-list" aria-label="精选评论">${list}</div>
    ${renderMoreFooter(hasMore)}
  </section>`
}

function renderFooterAuthor(resource) {
  return `<div class="fg-author nav-studio">
    <div class="av">${escapeHtml(resource.author.avatar || resource.author.name.slice(0, 1))}</div>
    <span class="nm">${escapeHtml(resource.author.name)}</span>
  </div>`
}

function renderResourceIntro(resource) {
  const extra = resource.contentType === 'app'
    ? '面向班级、教师和家长的互动练习场景，支持多角色体验、课堂任务和结果反馈。老师可以直接带入课堂使用，也能按班级情况自由调整环节、素材和节奏；学生在真实情境里边玩边学，课后还能继续巩固。整套流程经过一线课堂打磨，兼顾参与度与学习目标，帮助不同基础的孩子都跟得上、有收获。'
    : '整套资源围绕核心目标设计，环节完整、材料齐备，拿到即可直接带入课堂，省去从零备课的时间。它同样支持二次改编——你可以按班级基础增删环节、替换素材、调整时长与难度，让它更贴合自己学生的实际情况。设计上兼顾了课堂参与度与学习目标的达成，既能调动学生，也能把该讲清的知识点讲透。'
  return `<p class="fg-summary">${escapeHtml(resource.goal)}</p><p class="fg-summary fg-summary-extra">${extra}</p>`
}

function renderResourceAboutPanel(resource) {
  return ''
}

function renderResourceVersionsPanel(resource) {
  const forkCards = resource.forks.map((id) => RESOURCES_BY_ID[id]).filter(Boolean).map((fork) => `<div class="fg-v2-fork-row" data-resource-id="${escapeHtml(fork.id)}" data-track="/click/resourceDetailPage/viewFork | 查看改编作品 | 无" role="link" tabindex="0" aria-label="查看改编作品：${escapeHtml(fork.title)}"><img class="fg-v2-fork-cover" src="${fork.cover || COVERS[0]}" alt="" loading="lazy"><div class="fg-v2-fork-copy"><strong>${escapeHtml(fork.title)}</strong><p>${escapeHtml(fork.author.name)} · ${formatNumber(fork.stats.use)} 位老师使用</p></div><span class="fg-v2-fork-go" aria-hidden="true">查看</span></div>`).join('')
  const body = forkCards || '<p class="fg-v2-forks-empty">还没有人改编这个作品，来做第一个改编版本吧。</p>'
  return `<section class="fg-v2-versions-panel" data-sec="4" aria-labelledby="fg-v2-versions-title"><div class="fg-v2-version-head"><h2 id="fg-v2-versions-title">优质改编</h2><span>${formatNumber(resource.stats.adapt)} 个改编</span></div><div class="fg-v2-fork-list">${body}</div></section>`
}

function renderResourceDetailPanel(resource) {
  const discussion = renderRecentActivities(resource, 3, true) + renderResourceDiscussionPanel(resource)
  const versions = renderResourceVersionsPanel(resource)
  return `<div class="fg-v2-panel-inner">
    <div class="fg-v2-panel-content" data-v2-panel-content>
      <section class="fg-v2-panel-section" data-v2-panel="versions">${versions}</section>
      <section class="fg-v2-panel-section" data-v2-panel="discussion">${discussion}</section>
    </div>
  </div>`
}

const PREVIEW_OPTIONS = [
  {
    key: 'contentType',
    label: '内容',
    options: [{ value: 'resource', label: '资源' }, { value: 'app', label: '应用' }],
  },
  {
    key: 'viewer',
    label: '视角',
    options: [{ value: 'guest', label: '客态' }, { value: 'owner', label: '主态' }],
  },
  {
    key: 'source',
    label: '来源',
    options: [{ value: 'original', label: '原创' }, { value: 'adapted', label: '改编' }],
  },
]

function renderStatePreview(state, enabled) {
  const summary = `${state.viewer === 'owner' ? '主态' : '客态'} · ${state.source === 'adapted' ? '改编' : '原创'}${state.contentType === 'app' ? '应用' : '资源'}`
  const groups = PREVIEW_OPTIONS.map((group) => `<div class="fg-state-group" role="group" aria-label="${group.label}">
    <span>${group.label}</span>
    <div class="fg-state-segments">
      ${group.options.map((option) => `<button class="fg-state-option${state[group.key] === option.value ? ' is-selected' : ''}" type="button" data-preview-dimension="${group.key}" data-preview-value="${option.value}" aria-pressed="${state[group.key] === option.value}">${option.label}</button>`).join('')}
    </div>
  </div>`).join('')

  return `<section class="fg-state-preview${enabled ? ' is-active' : ''}" aria-label="详情页状态预览器">
    <div class="fg-state-heading">
      <span class="fg-state-eyebrow">仅原型预览</span>
      <strong>详情状态</strong>
      <em>${escapeHtml(summary)}</em>
    </div>
    <div class="fg-state-controls">${groups}</div>
    <button class="fg-state-reset" type="button" data-preview-reset${enabled ? '' : ' disabled'}>还原真实数据</button>
  </section>`
}

function replaceMotherForkSection(html, resource) {
  return html.replace(
    /<div style="font-size:13px;color:#9A9A9A;font-weight:600;margin:20px 0 12px;">社区改编 · [\s\S]*?<\/div><\/div>(?=\n\s*<\/div>\n\s*<div>\n\s*<div class="fg-sec-h">🤝 共创贡献)/,
    renderForkSection(resource),
  )
}

function renderMotherResourceHtml(template, resource) {
  const contributor = resource.contributors[0] || { name: resource.author.name, contribution: '' }
  const latestVersion = resource.versions.at(-1)
  const versionRange = `${resource.versions[0].v}→${latestVersion.v}`
  const kindLabel = resource.kind.includes('/') ? resource.kind.split('/').reverse().join(' · ') : resource.kind
  const fitLabel = `${resource.fit.subject} · ${resource.fit.lessonType}`
  const topicLabel = resource.topic.split('·')[0]
  const slideResource = isSlideResource(resource)
  const isAdapted = Boolean(resource.forkedFrom)
  const adaptedParent = isAdapted ? (RESOURCES_BY_ID[resource.forkedFrom] || RESOURCES_BY_ID[DEFAULT_RESOURCE_ID]) : null
  const adaptedAttribution = isAdapted ? getAdaptedAttribution(resource, adaptedParent) : null
  const actions = getResourceActions({
    contentType: resource.contentType,
    isOwner: isResourceOwner(resource, store.currentUser),
    isAdapted,
  })
  const slots = {
    __RES_FIT__: fitLabel,
    __RES_AUTHOR_INITIAL__: resource.author.avatar || resource.author.name.slice(0, 1),
    __RES_AUTHOR_NAME__: resource.author.name,
    __RES_TITLE__: resource.title,
    __RES_GOAL__: resource.goal,
    __RES_INTRO__: renderResourceIntro(resource),
    __RES_KIND__: kindLabel,
    __RES_USE__: formatNumber(resource.stats.use),
    __RES_STAR__: formatNumber(resource.stats.star),
    __RES_ADAPT__: formatNumber(resource.stats.adapt),
    __RES_ACTIONS__: renderResourceActions(actions, resource.stats.star),
    __RES_DETAIL_HEAD__: renderResourceDetailHead(resource),
    __RES_APP_ICON__: renderResourceIcon(resource),
    __RES_FIT_LINE__: renderResourceFit(resource),
    __RES_STATS__: renderResourceStats(resource),
    __RES_PRIMARY_ACTIONS__: renderResourcePrimaryActions(actions),
    __RES_FOOTER_ACTIVITY__: renderRecentActivities(resource, 2, false),
    __RES_RECENT_ACTIVITY__: renderRecentActivities(resource),
    __RES_STATE_SWITCHER__: renderStatePreview(previewState, previewEnabled.value),
    __RES_CONTRIBUTOR_NAME__: contributor.name,
    __RES_LATEST_VERSION__: latestVersion.v,
    __RES_CREDIT_ROWS__: renderResourceCredits(resource),
    __RES_CONTRIBUTOR_COUNT__: resource.contributors.length,
    __RES_CONTRIBUTORS__: renderContributors(resource.contributors),
    __RES_TOPIC_MEMBERSHIP__: renderTopicMembership(resource),
    __RES_DETAIL_PANEL__: renderResourceDetailPanel(resource),
    __RES_FOOTER_AUTHOR__: renderFooterAuthor(resource),
    __RES_ORIGIN__: isAdapted ? `<section class="fg-v2-origin-panel">${renderAdaptedAboutSource(adaptedAttribution)}</section>` : '',
    __RES_COMPOSER_FOOTER__: renderComposerFooter(resource),
    __RES_TOPIC_LABEL__: topicLabel,
    __RES_TOPIC__: resource.topic.replaceAll('·', ' · '),
    __RES_PREVIEW_CLASS__: slideResource ? 'is-slides' : 'is-app',
    __RES_PREVIEW_SRC__: resource.cover || COVERS[0],
    __RES_PREVIEW_RAIL__: slideResource ? renderSlideRail() : '',
    __RES_PREVIEW_LABEL__: slideResource ? '课件 · 1 / 6' : `${kindLabel} · 运行预览`,
  }

  let html = renderSlots(template, slots, ['__RES_ACTIONS__', '__RES_FOOTER_ACTIONS__', '__RES_DETAIL_HEAD__', '__RES_APP_ICON__', '__RES_FIT_LINE__', '__RES_STATS__', '__RES_INTRO__', '__RES_PRIMARY_ACTIONS__', '__RES_FOOTER_ACTIVITY__', '__RES_RECENT_ACTIVITY__', '__RES_STATE_SWITCHER__', '__RES_CONTRIBUTORS__', '__RES_PREVIEW_RAIL__', '__RES_PREVIEW_SRC__', '__RES_CREDIT_ROWS__', '__RES_TOPIC_MEMBERSHIP__', '__RES_DETAIL_PANEL__', '__RES_FOOTER_AUTHOR__', '__RES_ORIGIN__', '__RES_COMPOSER_FOOTER__'])

  html = html.replace('社区改编 · 12 个版本', `社区改编 · ${formatNumber(resource.stats.adapt)} 个版本`)
  html = html.replace('查看改编脉络 · 23 个版本', `查看改编脉络 · ${versionRange}`)

  const timelineVersions = resource.versions.slice(-3).reverse()
  let timelineIndex = 0
  html = html.replace(/>(V12|V11|V10)<\/span>/g, (match) => {
    const version = timelineVersions[timelineIndex++]
    return version ? `>${escapeHtml(version.v)}</span>` : match
  })
  html = html.replace('审讯环节拆成两轮,节奏更稳。', escapeHtml(timelineVersions[0]?.note || ''))
  html = html.replace('加入"人物关系卡",基础弱的班先发再开审。', escapeHtml(timelineVersions[1]?.note || ''))
  html = html.replace('首个完整六幕沉浸式版本发布。', escapeHtml(timelineVersions[2]?.note || ''))
  html = html.replaceAll('V12', escapeHtml(latestVersion.v))
  html = html.replaceAll('采纳 @王慧', `采纳 @${escapeHtml(contributor.name)}`)
  html = html.replace('<div style="margin-top:26px;border-top:1px solid #ECECEC;padding-top:22px;">', '<div class="fg-version-section" style="margin-top:26px;border-top:1px solid #ECECEC;padding-top:22px;">')
  html = html.replace('<div style="font-size:13px;color:#9A9A9A;font-weight:600;margin-bottom:2px;">作者迭代</div>', '<div class="fg-author-iteration-heading" style="font-size:13px;color:#9A9A9A;font-weight:600;margin-bottom:2px;">作者迭代</div>')
  html = html.replaceAll('<div style="display:flex;gap:12px;padding:9px 0;">', '<div class="fg-author-version" style="display:flex;gap:12px;padding:9px 0;">')
  html = replaceMotherForkSection(html, resource)
  html = html.replace('<div style="font-size:13px;color:#9A9A9A;font-weight:600;margin:20px 0 12px;">社区改编', '<div class="fg-community-remix-heading" style="font-size:13px;color:#9A9A9A;font-weight:600;margin:20px 0 12px;">社区改编')
  html = html.replaceAll('<div class="nav-res" style="border:1px solid #ECECEC;', '<div class="nav-res fg-community-remix-card" style="border:1px solid #ECECEC;')
  html = bindForkCardResourceIds(html, resource.forks)
  return html
}

function renderAdaptedAuthorLine(resource, attribution) {
  return `<div class="fg-author fg-adapted-author nav-studio">
    <div class="av">${escapeHtml(resource.author.avatar || resource.author.name.slice(0, 1))}</div>
    <span class="nm">${escapeHtml(resource.author.name)}</span>
    <span class="fg-adapted-inline"><span aria-hidden="true">·</span><span>改编作品</span></span>
  </div>`
}

function renderAdaptedAboutSource(attribution) {
  return `<div class="fg-cite" data-resource-id="${escapeHtml(attribution.originalResourceId)}" role="link" tabindex="0" aria-label="查看原作：${escapeHtml(attribution.originalTitle)}">
    <div class="fg-cite-body">
      <span class="fg-cite-label">创作来源</span>
      <p class="fg-cite-ref">引用自 <b>${escapeHtml(attribution.originalAuthorName)}</b>《${escapeHtml(attribution.originalTitle)}》<span class="fg-cite-ver">· ${escapeHtml(attribution.sourceVersion)} 版本</span></p>
    </div>
    <span class="fg-cite-link">查看原作 <span aria-hidden="true">→</span></span>
  </div>`
}

function renderAdaptedCover(resource, parent) {
  const editionName = resource.title.replace(/^《[^》]+》\s*/, '')
  return `<div class="fg-adapted-cover" role="img" aria-label="${escapeHtml(resource.title)}封面">
    <div class="fg-cover-paper-mark" aria-hidden="true">审</div>
    <div class="fg-cover-topline">
      <span>飞象教师改编稿</span>
      <span>1 课时 · 6 页</span>
    </div>
    <div class="fg-cover-docket">
      <span>《祝福》庭审课</span>
      <i>课堂改编本</i>
    </div>
    <div class="fg-cover-edition">${escapeHtml(editionName)}</div>
    <div class="fg-cover-rule" aria-hidden="true"><span></span><b>先关系卡，再开庭</b></div>
    <div class="fg-cover-credit">
      <span><b>${escapeHtml(resource.author.name)}</b> 改编</span>
      <span>原作 · ${escapeHtml(parent.author.name)}</span>
    </div>
    <div class="fg-cover-seal" aria-hidden="true">改编</div>
  </div>`
}

function renderAdaptedResourceHtml(template, resource) {
  const parent = RESOURCES_BY_ID[resource.forkedFrom] || RESOURCES_BY_ID[DEFAULT_RESOURCE_ID]
  let html = renderMotherResourceHtml(template, resource)
  const adaptedCover = renderAdaptedCover(resource, parent)

  html = html.replace('<main style=', '<main class="fg-adapted-detail" style=')
  html = html.replace('<div class="fg-hero fg-v2-layout">', '<div class="fg-hero fg-v2-layout fg-adapted-hero">')
  html = html.replace('<div class="fg-prev">', `<div class="fg-prev fg-adapted-prev">${adaptedCover}`)
  return html
}

const actualResource = computed(() => RESOURCES_BY_ID[store.resourceId] || RESOURCES_BY_ID[DEFAULT_RESOURCE_ID])
const initialPreview = getResourcePreviewStateFromSearch(window.location.search)
const previewEnabled = ref(initialPreview.enabled)
const previewState = reactive(
  initialPreview.state || getResourcePreviewState(actualResource.value, store.currentUser),
)
const currentResource = computed(() => previewEnabled.value
  ? createPreviewResource(previewState, { currentUser: store.currentUser, resourcesById: RESOURCES_BY_ID })
  : actualResource.value)

function replacePreviewUrl(url) {
  window.history.replaceState(window.history.state, '', url)
}

function handlePreviewClick(event) {
  // 左上角品牌 logo → 返回排行榜(灵感)
  if (event.target.closest('.fg-brand')) {
    store.view = 'rank'
    store.primaryNav = 'home'
    return
  }

  // 交互动作：收藏 / 评论 / 回复 / 点赞 / 置顶 / 删除
  const act = event.target.closest('[data-act]')
  if (act) {
    event.preventDefault()
    event.stopPropagation()
    handleAction(act.dataset.act, act.dataset.id)
    return
  }

  // 主操作反馈
  if (event.target.closest('.nav-adapt')) { event.stopPropagation(); showToast('已为你创建改编副本，正在进入改编…'); return }
  if (event.target.closest('.fg-save-copy')) { event.stopPropagation(); showToast('已复制副本到「我的空间」'); return }
  if (event.target.closest('.fg-action-download')) { event.stopPropagation(); showToast('开始下载资源包…'); return }

  const panel = event.target.closest('[data-panel]')
  if (panel) {
    const nextPanel = getResourcePanelState(panel.dataset.panel).activePanel
    panelState.value = nextPanel
    requestAnimationFrame(() => {
      const section = document.querySelector(`#view-res [data-v2-panel="${nextPanel}"]`)
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return
  }

  const reset = event.target.closest('[data-preview-reset]')
  if (reset) {
    previewEnabled.value = false
    Object.assign(previewState, getResourcePreviewState(actualResource.value, store.currentUser))
    replacePreviewUrl(clearResourcePreviewUrl(window.location.pathname, window.location.search))
    return
  }

  const option = event.target.closest('[data-preview-dimension][data-preview-value]')
  if (!option) return
  const dimension = option.dataset.previewDimension
  if (!Object.hasOwn(previewState, dimension)) return

  previewState[dimension] = option.dataset.previewValue
  previewEnabled.value = true
  replacePreviewUrl(buildResourcePreviewUrl(window.location.pathname, window.location.search, previewState))
}

watch(() => store.resourceId, () => {
  panelState.value = 'detail'
  previewEnabled.value = false
  Object.assign(previewState, getResourcePreviewState(actualResource.value, store.currentUser))
  seedInteractions(actualResource.value)
})

seedInteractions(actualResource.value)

const renderedRaw = computed(() => {
  const resource = currentResource.value
  return resource.forkedFrom
    ? renderAdaptedResourceHtml(raw, resource)
    : renderMotherResourceHtml(raw, resource)
})

// —— 讨论触底自动加载：观察底部哨兵，进入视口就加载下一页 ——
let moreObserver = null
function observeMore() {
  if (moreObserver) { moreObserver.disconnect(); moreObserver = null }
  if (interactions.moreState !== 'idle') return
  const sentinel = document.querySelector('#view-res [data-more-sentinel]')
  if (!sentinel) return
  const root = document.querySelector('#view-res .fg-hero-l-scroll') || null
  moreObserver = new IntersectionObserver((entries) => {
    const hasMore = interactions.visibleCount < sortedComments().length
    if (entries.some((e) => e.isIntersecting) && interactions.moreState === 'idle' && hasMore) {
      preserveScroll(() => { interactions.moreState = 'loading' })
      setTimeout(() => preserveScroll(() => {
        interactions.visibleCount += 8 // 加载下一批
        interactions.moreState = 'idle'
      }), 800)
    }
  }, { root, threshold: 0.1 })
  moreObserver.observe(sentinel)
}
watch(renderedRaw, () => nextTick(observeMore), { flush: 'post' })
onMounted(() => nextTick(observeMore))
onBeforeUnmount(() => { if (moreObserver) moreObserver.disconnect() })
</script>

<template>
  <div id="view-res">
    <div class="page" @click="handlePreviewClick">
      <div style="display:contents" v-html="renderedRaw"></div>
    </div>
    <transition name="fg-toast">
      <div v-if="interactions.toast" class="fg-toast" :class="{ 'is-link': interactions.toastAction }" role="status" @click="onToastClick">
        {{ interactions.toast }}<span v-if="interactions.toastAction" class="fg-toast-go">前往 →</span>
      </div>
    </transition>
  </div>
</template>
