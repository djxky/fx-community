<script setup>
import { computed } from 'vue'
import raw from './raw/res.html?raw'
import Sidebar from '../components/Sidebar.vue'
import { RESOURCES_BY_ID } from '../data/resources'
import { store } from '../store'
import { bindForkCardResourceIds, isSlideResourceKind } from '../resource-navigation.mjs'
import { getAdaptedAttribution, getResourceCredits, getResourceTopicMembership } from '../resource-attribution.mjs'

const DEFAULT_RESOURCE_ID = 'res-xianglin'

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
  const slots = {
    __RES_FIT__: fitLabel,
    __RES_AUTHOR_INITIAL__: resource.author.avatar || resource.author.name.slice(0, 1),
    __RES_AUTHOR_NAME__: resource.author.name,
    __RES_TITLE__: resource.title,
    __RES_GOAL__: resource.goal,
    __RES_KIND__: kindLabel,
    __RES_USE__: formatNumber(resource.stats.use),
    __RES_ADAPT__: formatNumber(resource.stats.adapt),
    __RES_CONTRIBUTOR_NAME__: contributor.name,
    __RES_LATEST_VERSION__: latestVersion.v,
    __RES_CREDIT_ROWS__: renderResourceCredits(resource),
    __RES_CONTRIBUTOR_COUNT__: resource.contributors.length,
    __RES_CONTRIBUTORS__: renderContributors(resource.contributors),
    __RES_TOPIC_MEMBERSHIP__: renderTopicMembership(resource),
    __RES_TOPIC_LABEL__: topicLabel,
    __RES_TOPIC__: resource.topic.replaceAll('·', ' · '),
    __RES_PREVIEW_CLASS__: slideResource ? 'is-slides' : 'is-app',
    __RES_PREVIEW_RAIL__: slideResource ? renderSlideRail() : '',
    __RES_PREVIEW_LABEL__: slideResource ? '课件 · 1 / 6' : `${kindLabel} · 运行预览`,
  }

  let html = renderSlots(template, slots, ['__RES_CONTRIBUTORS__', '__RES_PREVIEW_RAIL__', '__RES_CREDIT_ROWS__', '__RES_TOPIC_MEMBERSHIP__'])

  html = html.replace('data-count="1334">1,334', `data-count="${resource.stats.star}">${formatNumber(resource.stats.star)}`)
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
  html = html.replace('<div class="fg-hero">', '<div class="fg-hero fg-adapted-hero">')
  html = html.replace('<div class="fg-prev">', `<div class="fg-prev fg-adapted-prev">${adaptedCover}`)
  html = html.replace(
    /<div class="fg-author nav-studio">[\s\S]*?<\/div>\s*<p class="fg-summary">/,
    `${authorLine}<p class="fg-summary">`,
  )
  html = html.replace('<div id="fg-about">', `<div id="fg-about">${aboutSource}`)
  html = html.replace('<button class="fg-use fg-save-copy">保存副本</button>', '<button class="fg-use fg-save-copy">使用此版本</button>')
  html = html.replace('>改编</button></div>', '>继续改编</button></div>')
  return html
}

const currentResource = computed(() => RESOURCES_BY_ID[store.resourceId] || RESOURCES_BY_ID[DEFAULT_RESOURCE_ID])
const renderedRaw = computed(() => {
  const resource = currentResource.value
  return resource.forkedFrom
    ? renderAdaptedResourceHtml(raw, resource)
    : renderMotherResourceHtml(raw, resource)
})
</script>

<template>
  <div id="view-res">
    <div class="page">
      <Sidebar active="community" />
      <div style="display:contents" v-html="renderedRaw"></div>
    </div>
  </div>
</template>
