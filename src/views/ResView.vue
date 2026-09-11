<script setup>
import { computed, reactive, ref, watch } from 'vue'
import raw from './raw/res.html?raw'
import { RESOURCES_BY_ID } from '../data/resources'
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

  return `<div class="rd-topic-strip" aria-label="${escapeHtml(membership.label)}">
    <span>${escapeHtml(membership.label)}</span>
    <span class="rd-topic-dot" aria-hidden="true">·</span>
    <strong>${escapeHtml(membership.title)}</strong>
  </div>`
}

const ACTION_ICONS = {
  favorite: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 4 4.1.6-3 3 .7 4.4L12 17l-3.7 2 .7-4.4-3-3 4.1-.6z"></path></svg>',
  share: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"></path><path d="M7 9l5-5 5 5"></path><path d="M5 13v6h14v-6"></path></svg>',
  adapt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 4 4.1.6-3 3 .7 4.4L12 17l-3.7 2 .7-4.4-3-3 4.1-.6z"></path></svg>',
}

function renderResourceActions(actions, favoriteCount) {
  const lightweight = actions.filter((action) => action.emphasis === 'lightweight').map((action) => {
    if (action.key === 'favorite') {
      return `<button class="fg-action-link fg-favorite" type="button" title="收藏" aria-label="收藏" aria-pressed="false">${ACTION_ICONS.favorite}<span class="fg-action-label">${action.label}</span><span class="fg-action-count" data-count="${favoriteCount}">${formatNumber(favoriteCount)}</span></button>`
    }

    return `<label for="fg-share-toggle" class="fg-action-link fg-share-action" title="分享" aria-label="分享" role="button" tabindex="0">${ACTION_ICONS.share}<span class="fg-action-label">${action.label}</span></label>`
  }).join('')

  const buttons = actions.filter((action) => action.emphasis !== 'lightweight').map((action) => {
    if (action.key === 'adapt') {
      return `<button class="fg-action-button fg-action-outline nav-adapt" type="button">${ACTION_ICONS.adapt}${action.label}</button>`
    }

    const handlerClass = action.key === 'copy' ? ' fg-save-copy' : ''
    return `<button class="fg-action-button fg-action-solid fg-action-${action.key}${handlerClass}" type="button">${action.label}</button>`
  }).join('')

  return `<div class="fg-action-lightweight">${lightweight}</div><div class="fg-action-buttons">${buttons}</div>`
}

const ACTIVITY_ICONS = {
  adapt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M17 7L7 17"></path><path d="M7 11V7h4"></path></svg>',
  favorite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"></path></svg>',
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

function renderRecentActivities(resource) {
  const activities = getRecentResourceActivities(resource)
  const rows = activities.map((activity) => renderActivityRow(activity)).join('')
  const duplicateRows = activities.map((activity) => renderActivityRow(activity, true)).join('')

  return `<section class="fg-activity-card" aria-labelledby="fg-activity-title">
    <div class="fg-activity-head">
      <div>
        <span class="fg-activity-kicker">资源动态</span>
        <h3 id="fg-activity-title">最近动态</h3>
      </div>
      <span class="fg-activity-live"><i aria-hidden="true"></i>持续更新</span>
    </div>
    <div class="fg-activity-viewport" role="list" aria-label="关于这个资源的最近动态">
      <div class="fg-activity-track">${rows}${duplicateRows}</div>
    </div>
  </section>`
}

function renderResourceDiscussionPanel(resource) {
  const activities = renderRecentActivities(resource)
  return `<section class="fg-v2-discussion-panel" aria-labelledby="fg-v2-discussion-title">
    <div class="fg-v2-discussion-head"><div><span class="fg-v2-data-kicker">社区反馈</span><h3 id="fg-v2-discussion-title">讨论 <span>86</span></h3></div><button type="button" class="fg-v2-follow-link">参与讨论</button></div>
    ${activities}
    <div class="fg-v2-comment-list" aria-label="精选评论">
      <article class="fg-v2-comment"><div class="fg-v2-comment-avatar">王</div><div><strong>王慧老师</strong><p>“先发人物关系卡”特别适合基础弱的班，学生进入状态快多了。</p><small>👍 62 · 3 天前</small></div></article>
      <article class="fg-v2-comment"><div class="fg-v2-comment-avatar is-warm">李</div><div><strong>李敏老师</strong><p>学生为了当“首席检察官”，提前把课文读了三遍。</p><small>👍 41 · 5 天前</small></div></article>
      <article class="fg-v2-comment"><div class="fg-v2-comment-avatar is-muted">周</div><div><strong>周涛老师</strong><p>我做了一个 1 课时简化版，已经发布到改编版本区。</p><small>👍 28 · 1 周前</small></div></article>
    </div>
    <button type="button" class="fg-v2-more-comments">查看全部 86 条讨论 <span aria-hidden="true">→</span></button>
  </section>`
}

function renderResourceAboutPanel(resource) {
  const contributor = resource.contributors[0]?.name || resource.author.name
  return `<section class="fg-v2-about-panel" aria-labelledby="fg-v2-about-title">
    <div class="fg-v2-section-kicker">关于这个资源</div>
    <h2 id="fg-v2-about-title">${escapeHtml(resource.title)}</h2>
    <p>让学生在${escapeHtml(resource.fit.subject)}课堂中，通过角色扮演与文本证据重构人物处境，形成自己的判断。</p>
    <p>这份资源把课堂目标拆成可直接使用的环节，老师可以根据班级基础调整节奏，也可以在此基础上继续改编。</p>
    <p class="fg-v2-about-note">使用建议：先让学生进入情境，再开始讨论；${escapeHtml(contributor)}老师的改法已被作者采纳。</p>
  </section>`
}

function renderResourceVersionsPanel(resource) {
  const versions = resource.versions.slice(-3).reverse().map((version, index) => `<div class="fg-v2-version-row"><span class="fg-v2-version-dot${index ? '' : ' is-current'}"></span><div><strong>${escapeHtml(version.v)}</strong><small>${index ? '历史版本' : '最新版本'}</small><p>${escapeHtml(version.note || '持续优化课堂使用体验。')}</p></div></div>`).join('')
  const forks = resource.forks.map((id) => RESOURCES_BY_ID[id]).filter(Boolean).map((fork) => `<div class="fg-v2-fork-row"><div class="fg-v2-fork-avatar">${escapeHtml(fork.author.name.slice(0, 1))}</div><div><strong>${escapeHtml(fork.title)}</strong><p>${escapeHtml(fork.author.name)} · ${formatNumber(fork.stats.use)} 位老师使用</p></div><span>改编</span></div>`).join('')
  return `<section class="fg-v2-versions-panel" aria-labelledby="fg-v2-versions-title"><div class="fg-v2-section-kicker">版本与改编</div><div class="fg-v2-version-head"><h2 id="fg-v2-versions-title">版本与改编</h2><span>${formatNumber(resource.stats.adapt)} 个版本</span></div><div class="fg-v2-version-list">${versions}</div><div class="fg-v2-fork-title">社区改编</div>${forks || '<div class="fg-v2-empty">暂无社区改编</div>'}</section>`
}

function renderResourceDetailPanel(resource) {
  const mode = getResourcePanelState(panelState.value).activePanel
  const detail = `${renderResourceAboutPanel(resource)}<section class="fg-v2-tags-panel"><div class="fg-v2-section-kicker">作品标签</div><div class="fg-v2-tags"><span>${escapeHtml(resource.topic.split('·')[0])}</span><span>${escapeHtml(resource.fit.lessonType)}</span><span>${escapeHtml(resource.kind)}</span></div></section>`
  const discussion = renderResourceDiscussionPanel(resource)
  const versions = renderResourceVersionsPanel(resource)
  return `<div class="fg-v2-panel-inner">${renderPanelTabs(mode)}${renderPanelState(mode)}
    <div class="fg-v2-panel-content" data-v2-panel-content>
      <section class="fg-v2-panel-section" data-v2-panel="detail"${mode === 'detail' ? '' : ' hidden'}>${detail}</section>
      <section class="fg-v2-panel-section" data-v2-panel="discussion"${mode === 'discussion' ? '' : ' hidden'}>${discussion}</section>
      <section class="fg-v2-panel-section" data-v2-panel="versions"${mode === 'versions' ? '' : ' hidden'}>${versions}</section>
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
  const actions = getResourceActions({
    contentType: resource.contentType,
    isOwner: isResourceOwner(resource, store.currentUser),
    isAdapted: Boolean(resource.forkedFrom),
  })
  const slots = {
    __RES_FIT__: fitLabel,
    __RES_AUTHOR_INITIAL__: resource.author.avatar || resource.author.name.slice(0, 1),
    __RES_AUTHOR_NAME__: resource.author.name,
    __RES_TITLE__: resource.title,
    __RES_GOAL__: resource.goal,
    __RES_KIND__: kindLabel,
    __RES_USE__: formatNumber(resource.stats.use),
    __RES_ADAPT__: formatNumber(resource.stats.adapt),
    __RES_ACTIONS__: renderResourceActions(actions, resource.stats.star),
    __RES_RECENT_ACTIVITY__: renderRecentActivities(resource),
    __RES_STATE_SWITCHER__: renderStatePreview(previewState, previewEnabled.value),
    __RES_CONTRIBUTOR_NAME__: contributor.name,
    __RES_LATEST_VERSION__: latestVersion.v,
    __RES_CREDIT_ROWS__: renderResourceCredits(resource),
    __RES_CONTRIBUTOR_COUNT__: resource.contributors.length,
    __RES_CONTRIBUTORS__: renderContributors(resource.contributors),
    __RES_TOPIC_MEMBERSHIP__: renderTopicMembership(resource),
    __RES_DETAIL_PANEL__: renderResourceDetailPanel(resource),
    __RES_TOPIC_LABEL__: topicLabel,
    __RES_TOPIC__: resource.topic.replaceAll('·', ' · '),
    __RES_PREVIEW_CLASS__: slideResource ? 'is-slides' : 'is-app',
    __RES_PREVIEW_RAIL__: slideResource ? renderSlideRail() : '',
    __RES_PREVIEW_LABEL__: slideResource ? '课件 · 1 / 6' : `${kindLabel} · 运行预览`,
  }

  let html = renderSlots(template, slots, ['__RES_ACTIONS__', '__RES_RECENT_ACTIVITY__', '__RES_STATE_SWITCHER__', '__RES_CONTRIBUTORS__', '__RES_PREVIEW_RAIL__', '__RES_CREDIT_ROWS__', '__RES_TOPIC_MEMBERSHIP__', '__RES_DETAIL_PANEL__'])

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
    <span class="nm">${escapeHtml(resource.author.name)} <span class="vf" aria-label="认证教师"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span></span>
    <span class="fg-adapted-inline"><span aria-hidden="true">·</span><span>改编作品</span><span aria-hidden="true">·</span><span class="fg-origin-inline" data-resource-id="${escapeHtml(attribution.originalResourceId)}" role="link" tabindex="0" aria-label="查看原作：${escapeHtml(attribution.originalTitle)}">原作 ${escapeHtml(attribution.originalAuthorName)} <span aria-hidden="true">↗</span></span></span>
  </div>`
}

function renderAdaptedAboutSource(attribution) {
  return `<div class="fg-origin-about" data-resource-id="${escapeHtml(attribution.originalResourceId)}" role="link" tabindex="0" aria-label="查看原作：${escapeHtml(attribution.originalTitle)}">
    <div class="fg-origin-about-avatar">${escapeHtml(attribution.originalAuthorInitial)}</div>
    <div class="fg-origin-about-copy">
      <div class="fg-origin-about-meta"><span class="fg-origin-about-label">原创来源</span><strong>${escapeHtml(attribution.originalAuthorName)}</strong><em>原创作者</em></div>
      <div class="fg-origin-about-work">${escapeHtml(attribution.originalTitle)}</div>
      <small>基于原作 <b>${escapeHtml(attribution.sourceVersion)}</b> 改编</small>
    </div>
    <span class="fg-origin-about-link">查看原作 <span aria-hidden="true">→</span></span>
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
  const attribution = getAdaptedAttribution(resource, parent)
  let html = renderMotherResourceHtml(template, resource)
  const authorLine = renderAdaptedAuthorLine(resource, attribution)
  const aboutSource = renderAdaptedAboutSource(attribution)
  const adaptedCover = renderAdaptedCover(resource, parent)

  html = html.replace('<main style=', '<main class="fg-adapted-detail" style=')
  html = html.replace('<div class="fg-hero fg-v2-layout">', '<div class="fg-hero fg-v2-layout fg-adapted-hero">')
  html = html.replace('<div class="fg-prev">', `<div class="fg-prev fg-adapted-prev">${adaptedCover}`)
  html = html.replace(
    /<div class="fg-author nav-studio">[\s\S]*?<\/div>\s*<p class="fg-summary">/,
    `${authorLine}<p class="fg-summary">`,
  )
  html = html.replace('<div id="fg-about">', `<div id="fg-about">${aboutSource}`)
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
  const panel = event.target.closest('[data-panel]')
  if (panel) {
    const nextPanel = getResourcePanelState(panel.dataset.panel).activePanel
    panelState.value = nextPanel
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
})

const renderedRaw = computed(() => {
  const resource = currentResource.value
  return resource.forkedFrom
    ? renderAdaptedResourceHtml(raw, resource)
    : renderMotherResourceHtml(raw, resource)
})
</script>

<template>
  <div id="view-res">
    <div class="page" @click="handlePreviewClick">
      <div style="display:contents" v-html="renderedRaw"></div>
    </div>
  </div>
</template>
