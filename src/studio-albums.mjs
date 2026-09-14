import { formatCount } from './lib/format-count.mjs'

// 我的主页 · 专题（专题）管理：示例作品 / 示例专题 + 纯函数操作 + 渲染片段。
// 页面事件绑定见 composables/studio-albums.js。

export const ALBUM_NAME_MAX = 20
export const ALBUM_INTRO_MAX = 40

export const OWNER_WORKS = [
  { id: 'taohuayuan', title: '副本《古文沉浸式漫游·桃花源记》', type: '应用', use: 31, star: 88, cover: 'linear-gradient(135deg,#2A3A32,#141F1B)' },
  { id: 'layered-reading', title: 'AI 分层阅读', type: '应用', use: 56, star: 210, cover: 'linear-gradient(135deg,#1C2823,#141F1B)' },
  { id: 'luoluobi', title: '落落笔 · AI 写作编辑器', type: '应用', use: 47, star: 180, cover: 'linear-gradient(135deg,#1C2823,#141F1B)' },
  { id: 'class-pet', title: '改编《班级宠物乐园·一起进化吧！》', type: '应用', use: 24, star: 63, cover: 'linear-gradient(135deg,#B87333,#8A5A24)' },
  { id: 'feihualing', title: '诗云 · 飞花令', type: '应用', use: 12, star: 40, cover: 'linear-gradient(135deg,#2A3A32,#141F1B)' },
  { id: 'picture-book-questions', title: '教师生成绘本题目', type: '技能', use: 18, star: 52, cover: 'linear-gradient(135deg,#1C2823,#141F1B)' },
]

export const SEED_ALBUMS = [
  { id: 'album-poetry', name: '古诗文课堂互动', intro: '课前热身到课中漫游，一讲一个互动', workIds: ['feihualing', 'taohuayuan'] },
  { id: 'album-writing', name: '写作与分层阅读', intro: '', workIds: ['layered-reading', 'luoluobi'] },
]

const TRACK = (path, name, params) => `data-track="/click/teacherHomePage/${path} | ${name} | ${params}"`

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

export function albumLessons(album, works = OWNER_WORKS) {
  return album.workIds.map((id) => works.find((w) => w.id === id)).filter(Boolean)
}

export function albumSummary(album, works = OWNER_WORKS) {
  return `共 ${albumLessons(album, works).length} 个资源`
}

export function validateAlbumInfo(albums, draft) {
  const name = draft.name.trim()
  if (!name) return '请填写专题名称'
  if ([...name].length > ALBUM_NAME_MAX) return `专题名称最多 ${ALBUM_NAME_MAX} 个字`
  if (albums.some((a) => a.id !== draft.id && a.name.trim() === name)) return '已有同名专题，换个名字吧'
  return ''
}

export function validateAlbumWorks(draft) {
  return draft.workIds.length ? '' : '至少选 1 个作品'
}

// 已存在则原位更新，否则作为新专题放到最前
export function saveAlbum(albums, draft) {
  const album = { id: draft.id, name: draft.name.trim(), intro: draft.intro.trim(), workIds: [...draft.workIds] }
  if (albums.some((a) => a.id === album.id)) return albums.map((a) => (a.id === album.id ? album : a))
  return [album, ...albums]
}

export function deleteAlbum(albums, id) {
  return albums.filter((a) => a.id !== id)
}

function moveItem(list, index, delta) {
  const to = index + delta
  if (index < 0 || to < 0 || to >= list.length) return list
  const next = [...list]
  ;[next[index], next[to]] = [next[to], next[index]]
  return next
}

export function moveAlbum(albums, id, delta) {
  return moveItem(albums, albums.findIndex((a) => a.id === id), delta)
}

// 勾选顺序即讲次顺序
export function toggleWork(workIds, id) {
  return workIds.includes(id) ? workIds.filter((x) => x !== id) : [...workIds, id]
}

export function moveLesson(workIds, id, delta) {
  return moveItem(workIds, workIds.indexOf(id), delta)
}

export function isDraftDirty(draft, initial) {
  return draft.name.trim() !== initial.name.trim()
    || draft.intro.trim() !== initial.intro.trim()
    || draft.workIds.join() !== initial.workIds.join()
}

export function filterWorks(works, keyword) {
  const k = keyword.trim()
  return k ? works.filter((w) => w.title.includes(k)) : works
}

export function renderAlbumList(albums, openMenuId = '') {
  return albums.map((album, i) => {
    const menuOpen = openMenuId === album.id
    const menu = menuOpen ? `<div class="st-album-menu" role="menu">
      <button type="button" role="menuitem" data-album-act="edit" ${TRACK('albumEdit', '编辑专题', '无')}>编辑专题</button>
      <button type="button" role="menuitem" data-album-act="up"${i === 0 ? ' disabled' : ''} ${TRACK('albumMove', '调整专题顺序', 'direction#STRING')}>上移</button>
      <button type="button" role="menuitem" data-album-act="down"${i === albums.length - 1 ? ' disabled' : ''} ${TRACK('albumMove', '调整专题顺序', 'direction#STRING')}>下移</button>
      <button type="button" role="menuitem" class="is-danger" data-album-act="delete" ${TRACK('albumDelete', '删除专题', '无')}>删除专题</button>
    </div>` : ''
    const lessons = albumLessons(album).map((w, n) => `<div class="st-album-lesson">
        <div class="st-album-cover" style="background:${w.cover};"><span>第${n + 1}讲</span></div>
        <div class="st-album-lt">${escapeHtml(w.title)}</div>
      </div>`).join('')
    return `<div class="st-album" data-album-id="${escapeHtml(album.id)}" role="link" tabindex="0" aria-label="查看专题：${escapeHtml(album.name)}" ${TRACK('topicCard', '点击专题卡', 'position#INT')}>
    <div class="st-album-hd">
      <span class="st-album-name">${escapeHtml(album.name)}</span>
      <span class="st-album-meta">${escapeHtml(albumSummary(album))}</span>
      <span class="st-album-go">查看专题 ›</span>
      <span class="st-album-more-wrap">
        <button type="button" class="st-album-more" data-album-act="menu" aria-label="管理专题" aria-haspopup="menu" aria-expanded="${menuOpen}" ${TRACK('albumMenu', '打开专题管理菜单', '无')}>···</button>${menu}
      </span>
    </div>${album.intro ? `\n    <div class="st-album-intro">${escapeHtml(album.intro)}</div>` : ''}
    <div class="st-album-lessons">${lessons}</div>
  </div>`
  }).join('')
}

export function renderPickGrid(works, selectedIds, keyword = '') {
  if (!works.length) return '<div class="album-empty">还没有作品，先去创作吧</div>'
  const list = filterWorks(works, keyword)
  if (!list.length) return '<div class="album-empty">没有找到相关作品</div>'
  return list.map((w) => {
    const selected = selectedIds.includes(w.id)
    return `<div class="album-wk${selected ? ' sel' : ''}" data-work-id="${escapeHtml(w.id)}" role="checkbox" aria-checked="${selected}" tabindex="0" ${TRACK('albumPickWork', '专题勾选作品', 'resourceType#STRING')}><div class="album-wk-cov" style="background:${w.cover};"><span class="album-wk-chk"></span></div><div class="album-wk-t">${escapeHtml(w.title)}</div><div class="album-wk-m">${escapeHtml(w.type)} · ${formatCount(w.use)} 位老师使用</div></div>`
  }).join('')
}

export function renderLessonOrder(workIds, works = OWNER_WORKS) {
  const lessons = albumLessons({ workIds }, works)
  if (!lessons.length) return '<div class="album-order-empty">勾选作品后，按勾选顺序排成第 1 讲、第 2 讲…</div>'
  return lessons.map((w, i) => `<div class="album-order-row" data-work-id="${escapeHtml(w.id)}">
    <span class="album-order-no">第${i + 1}讲</span>
    <span class="album-order-t">${escapeHtml(w.title)}</span>
    <button type="button" class="album-order-btn" data-lesson-act="up" aria-label="上移"${i === 0 ? ' disabled' : ''} ${TRACK('albumLessonMove', '调整讲次顺序', 'direction#STRING')}>↑</button>
    <button type="button" class="album-order-btn" data-lesson-act="down" aria-label="下移"${i === lessons.length - 1 ? ' disabled' : ''} ${TRACK('albumLessonMove', '调整讲次顺序', 'direction#STRING')}>↓</button>
    <button type="button" class="album-order-btn" data-lesson-act="remove" aria-label="移出专题">✕</button>
  </div>`).join('')
}
