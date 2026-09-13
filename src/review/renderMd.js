// Markdown → HTML（零依赖，过稿看板专用）。支持：
// # ## (可带 [NEW]/[UPDATED]) ### ####、> 引用、[!] 备注、[+]/[~] diff、
// --- 分隔、- / 1. 列表、| 表格 |、``` 代码、`码` **粗** *斜*、
// changelog（### v1.0 · 日期 + - [新增/修改/移除/修复] 文字）。
export function renderMd(md) {
  let inCode = false, codeLines = [], inTable = false, tableLines = [], inList = false
  const out = []
  const flushList = () => { if (inList) { out.push('</ul>'); inList = false } }
  const flushTable = () => {
    let h = '<table><thead><tr>' + tableLines[0].map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>'
    for (let i = 1; i < tableLines.length; i++) h += '<tr>' + tableLines[i].map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>'
    out.push(h + '</tbody></table>')
  }
  const inline = (s) => s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')

  ;(md || '').split('\n').forEach(line => {
    if (/^```/.test(line)) {
      if (inCode) { out.push('<pre><code>' + codeLines.join('\n') + '</code></pre>'); codeLines = [] }
      inCode = !inCode; return
    }
    if (inCode) { codeLines.push(line.replace(/</g, '&lt;')); return }
    if (/^\|.+\|$/.test(line)) {
      if (/^\|[\s:|-]+\|$/.test(line)) return
      const cells = line.split('|').filter((c, i, a) => i > 0 && i < a.length - 1).map(c => c.trim())
      flushList(); if (!inTable) { inTable = true; tableLines = [] } tableLines.push(cells); return
    }
    if (inTable) { flushTable(); inTable = false }
    const vm = line.match(/^###\s+(v[\d.]+)\s+·\s+(.+)$/i)
    if (vm) { flushList(); out.push('<div class="rp-ver"><span class="rp-ver-tag">' + vm[1] + '</span><span class="rp-ver-date">' + inline(vm[2]) + '</span></div>'); return }
    const cm = line.match(/^-\s+\[(新增|修改|移除|修复)\]\s+(.+)$/)
    if (cm) {
      const map = { 新增: 'new', 修改: 'upd', 移除: 'del', 修复: 'fix' }
      if (!inList) { out.push('<ul class="rp-changelog">'); inList = true }
      out.push('<li><span class="rp-ctag ' + map[cm[1]] + '">' + cm[1] + '</span>' + inline(cm[2]) + '</li>'); return
    }
    if (/^#\s/.test(line)) { flushList(); out.push('<h1>' + inline(line.replace(/^#\s+/, '')) + '</h1>'); return }
    if (/^##\s/.test(line)) {
      flushList(); let t = line.replace(/^##\s+/, ''); let badge = ''
      const bm = t.match(/\s*\[(NEW|UPDATED)\]\s*$/i)
      if (bm) { badge = ' <span class="rp-badge ' + bm[1].toLowerCase() + '">' + bm[1].toUpperCase() + '</span>'; t = t.replace(/\s*\[(NEW|UPDATED)\]\s*$/i, '') }
      const nm = t.match(/^(\d+)[.．]/); const id = nm ? ' id="rp-sec-' + nm[1] + '"' : '' // N 供页面角标定位
      out.push('<h2' + id + '>' + inline(t) + badge + '</h2>'); return
    }
    if (/^###\s/.test(line)) { flushList(); out.push('<h3>' + inline(line.replace(/^###\s+/, '')) + '</h3>'); return }
    if (/^####\s/.test(line)) { flushList(); out.push('<h4>' + inline(line.replace(/^####\s+/, '')) + '</h4>'); return }
    if (/^>\s+/.test(line)) { flushList(); out.push('<blockquote>' + inline(line.replace(/^>\s+/, '')) + '</blockquote>'); return }
    if (/^\[\+\]\s+/.test(line)) { flushList(); out.push('<div class="rp-diff add">' + inline(line.replace(/^\[\+\]\s+/, '')) + '</div>'); return }
    if (/^\[~\]\s+/.test(line)) { flushList(); out.push('<div class="rp-diff change">' + inline(line.replace(/^\[~\]\s+/, '')) + '</div>'); return }
    if (/^\[!\]\s+/.test(line)) { flushList(); out.push('<div class="prd-note">' + inline(line.replace(/^\[!\]\s*/, '')) + '</div>'); return }
    if (/^---$/.test(line)) { flushList(); out.push('<hr>'); return }
    if (/^[-*]\s/.test(line)) { if (!inList) { out.push('<ul>'); inList = true } out.push('<li>' + inline(line.replace(/^[-*]\s+/, '')) + '</li>'); return }
    if (/^\d+\.\s/.test(line)) { if (!inList) { out.push('<ul>'); inList = true } out.push('<li>' + inline(line.replace(/^\d+\.\s+/, '')) + '</li>'); return }
    flushList(); if (line.trim()) out.push('<p>' + inline(line) + '</p>')
  })
  flushList(); if (inTable) flushTable()
  return out.join('\n')
}
