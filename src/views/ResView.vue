<script setup>
import { computed } from 'vue'
import raw from './raw/res.html?raw'
import adaptedRaw from './raw/res-adapted.html?raw'
import Sidebar from '../components/Sidebar.vue'
import { RESOURCES_BY_ID } from '../data/resources'
import { store } from '../store'

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
  const kind = resource.kind.toLowerCase()
  return resource.kind === '课件' || kind.includes('ppt') || kind.includes('演示文稿')
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
    __RES_CONTRIBUTOR_COUNT__: resource.contributors.length,
    __RES_CONTRIBUTORS__: renderContributors(resource.contributors),
    __RES_TOPIC_LABEL__: topicLabel,
    __RES_TOPIC__: resource.topic.replaceAll('·', ' · '),
    __RES_PREVIEW_CLASS__: slideResource ? 'is-slides' : 'is-app',
    __RES_PREVIEW_RAIL__: slideResource ? renderSlideRail() : '',
    __RES_PREVIEW_LABEL__: slideResource ? '课件 · 1 / 6' : `${kindLabel} · 运行预览`,
  }

  let html = renderSlots(template, slots, ['__RES_CONTRIBUTORS__', '__RES_PREVIEW_RAIL__'])

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
  return html
}

function renderVersionSummary(versions) {
  return versions.map(({ v, note }, index) => `<div style="display:flex;gap:12px;padding:9px 0;border-top:${index ? '1px solid #EFEFEF' : 'none'};">
    <div style="flex-shrink:0;width:9px;height:9px;border-radius:50%;background:${index ? '#D4D4D4' : '#141F1B'};margin-top:5px;"></div>
    <div style="min-width:0;"><span style="font-size:13.5px;font-weight:600;color:#141F1B;">${escapeHtml(v)}</span><div style="font-size:13px;color:#7A7C7C;margin-top:2px;line-height:1.5;">${escapeHtml(note)}</div></div>
  </div>`).join('')
}

function renderDownstreamForks(resource) {
  const forks = resource.forks.map((id) => RESOURCES_BY_ID[id]).filter(Boolean)
  if (!forks.length) return '<div style="font-size:13px;color:#9A9A9A;padding:12px 0;">暂无下一级改编</div>'
  return forks.map(renderForkCard).join('')
}

function renderAdaptedResourceHtml(template, resource) {
  const parent = RESOURCES_BY_ID[resource.forkedFrom] || RESOURCES_BY_ID[DEFAULT_RESOURCE_ID]
  const latestVersion = resource.versions.at(-1)
  const versionRange = `${resource.versions[0].v}→${latestVersion.v}`
  const fitLabel = `${resource.fit.subject} · ${resource.fit.grade} · ${resource.fit.lessonType}`
  const parentLabel = `改编自 ${parent.author.name}《${parent.title}》`
  const slots = {
    __RES_PARENT_ID__: parent.id,
    __RES_PARENT_LABEL__: parentLabel,
    __RES_PARENT_AUTHOR__: parent.author.name,
    __RES_PARENT_CERT__: parent.author.cert || '认证教师',
    __RES_PARENT_INITIAL__: parent.author.avatar || parent.author.name.slice(0, 1),
    __RES_PARENT_TITLE__: parent.title,
    __RES_PARENT_USE__: formatNumber(parent.stats.use),
    __RES_PARENT_ADAPT__: formatNumber(parent.stats.adapt),
    __RES_FIT__: `${resource.fit.subject} · ${resource.fit.lessonType}`,
    __RES_FIT_DETAIL__: fitLabel,
    __RES_AUTHOR_INITIAL__: resource.author.avatar || resource.author.name.slice(0, 1),
    __RES_AUTHOR_NAME__: resource.author.name,
    __RES_AUTHOR_CERT__: resource.author.cert,
    __RES_TITLE__: resource.title,
    __RES_KIND__: resource.kind.includes('/') ? resource.kind.split('/').reverse().join(' · ') : resource.kind,
    __RES_USE__: formatNumber(resource.stats.use),
    __RES_ADAPT__: formatNumber(resource.stats.adapt),
    __RES_DIFF__: resource.goal,
    __RES_VERSION_RANGE__: versionRange,
    __RES_LATEST_VERSION__: latestVersion.v,
    __RES_RESOURCE_ID__: resource.id,
    __RES_TOPIC_LABEL__: resource.topic.split('·')[0],
    __RES_VERSION_SUMMARY__: renderVersionSummary(resource.versions),
    __RES_DOWNSTREAM_FORKS__: renderDownstreamForks(resource),
  }
  return renderSlots(template, slots, ['__RES_VERSION_SUMMARY__', '__RES_DOWNSTREAM_FORKS__'])
}

const currentResource = computed(() => RESOURCES_BY_ID[store.resourceId] || RESOURCES_BY_ID[DEFAULT_RESOURCE_ID])
const renderedRaw = computed(() => {
  const resource = currentResource.value
  return resource.forkedFrom
    ? renderAdaptedResourceHtml(adaptedRaw, resource)
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
