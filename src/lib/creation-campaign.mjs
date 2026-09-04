import { directions, tagOptions, emptyDraft, createSubmissionState, toggleTag, escapeHtml as esc } from './creation-submission.mjs'

// In-memory demo data only. No creator information is sent or persisted.
const examples = [
  { id: 'FXAI26-00001', title: '古诗意境互动学习地图', direction: 2, time: '2026-09-18 14:32', url: 'https://feixiang.example/work/poetry-map', status: '已提交', example: true },
  { id: 'FXAI26-00002', title: '班级成长记录工作台', direction: 3, time: '2026-09-16 09:20', url: 'https://feixiang.example/work/class-growth', status: '已提交', example: true },
]
const fields = { title: 'workTitle', url: 'workUrl', description: 'description', creator: 'creator', phone: 'phone', identity: 'identity', region: 'region', organization: 'organization', coCreators: 'coCreators' }

export function setupCreationCampaign(academyRoot) {
  const root = academyRoot?.querySelector('.creation-campaign')
  if (!root) return () => {}
  const $ = id => root.querySelector('#cc-' + id)
  const state = createSubmissionState(examples)
  let draft = emptyDraft()
  let editingId = null
  let pendingWithdrawal = null
  let toastTimer
  let focusFrame
  const form = $('submissionForm')
  const dialog = $('withdrawDialog')

  function toast(message) {
    $('toast').textContent = message
    $('toast').classList.add('show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2600)
  }
  function showView(id) {
    root.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === 'cc-' + id))
    root.querySelector('.demo-note').hidden = !['submissionsView', 'successView'].includes(id)
    academyRoot.querySelector('.main').scrollTop = 0
    cancelAnimationFrame(focusFrame)
    focusFrame = requestAnimationFrame(() => {
      const target = id === 'formView' ? $('workTitle') : $(id).querySelector('h2,button')
      if (target?.tagName === 'H2') target.tabIndex = -1
      target?.focus({ preventScroll: true })
    })
  }
  function readForm() {
    for (const [key, id] of Object.entries(fields)) draft[key] = $(id).value
    draft.agreed = $('agreeRules').checked
  }
  function renderTags() {
    root.querySelectorAll('.chips').forEach(group => {
      const key = group.dataset.group
      group.innerHTML = tagOptions[key].map(value => `<button type="button" class="chip${draft[key].includes(value) ? ' selected' : ''}" aria-pressed="${draft[key].includes(value)}">${esc(value)}</button>`).join('')
    })
  }
  function fillForm() {
    for (const [key, id] of Object.entries(fields)) $(id).value = draft[key] || ''
    $('agreeRules').checked = draft.agreed
    $('confirmSubmit').disabled = !draft.agreed
    $('confirmSubmit').textContent = editingId ? '保存修改' : '确认提交作品'
    $('descCount').textContent = draft.description.length
    renderTags()
  }
  function chooseDirection(index) {
    draft.direction = Number(index)
    const direction = directions[draft.direction]
    if (!direction) return
    $('selectedNumber').textContent = String(draft.direction + 1).padStart(2, '0')
    $('selectedName').textContent = direction.name
    $('directionTip').textContent = direction.tip
    fillForm()
    showView('formView')
  }
  function startNew() {
    draft = emptyDraft()
    editingId = null
    fillForm()
    showView('directionView')
  }
  function renderSubmissions() {
    $('submissionCount').textContent = state.records.length
    $('submissionList').innerHTML = state.records.length ? state.records.map(item => `<article class="submission-item">
      <div><div class="submission-top"><span class="direction-label">${esc(directions[item.direction].name)}</span><span class="status">${esc(item.status)}${item.example ? ' · 示例' : ''}</span></div><h3>${esc(item.title)}</h3><p>提交时间：${esc(item.time)} · ${esc(item.url)}</p></div>
      <div class="item-actions"><button data-action="view" data-id="${esc(item.id)}">查看作品</button><button data-action="edit" data-id="${esc(item.id)}">修改信息</button><button data-action="withdraw" data-id="${esc(item.id)}">撤回投稿</button></div>
    </article>`).join('') : '<div class="empty-note">还没有投稿作品。选择一个方向，提交你的第一件作品。</div>'
  }
  function onClick(event) {
    const target = event.target
    if (target.closest('label[for="lp-campaign"]')) showView('landingView')
    if (!root.contains(target)) return
    if (target.closest('#cc-returnAcademy')) {
      academyRoot.querySelector('#lp-home').checked = true
      academyRoot.querySelector('.main').scrollTop = 0
      academyRoot.querySelector('label[for="lp-campaign"]')?.focus({ preventScroll: true })
    } else if (target.closest('.chooseDirection')) startNew()
    else if (target.closest('.goLanding')) showView('landingView')
    else if (target.closest('.goDirections')) { readForm(); showView('directionView') }
    else if (target.closest('[data-direction]')) chooseDirection(target.closest('[data-direction]').dataset.direction)
    else if (target.closest('#cc-mySubmissionsBtn, #cc-viewMineAfterSuccess')) { renderSubmissions(); showView('submissionsView') }
    else if (target.closest('.chips .chip')) {
      const chip = target.closest('.chip')
      const group = chip.closest('.chips')
      const key = group.dataset.group
      const value = chip.textContent
      const previous = draft[key]
      const next = toggleTag(previous, value, Number(group.dataset.max))
      if (previous.length === next.length) toast(`最多选择 ${group.dataset.max} 个标签`)
      draft[key] = next
      chip.classList.toggle('selected', next.includes(value))
      chip.setAttribute('aria-pressed', String(next.includes(value)))
    } else if (target.closest('[data-action]')) {
      const button = target.closest('[data-action]')
      const record = state.records.find(item => item.id === button.dataset.id)
      if (!record) return
      if (button.dataset.action === 'view') {
        if (record.example) toast('这是一条演示投稿，未关联真实作品')
        else window.open(record.url, '_blank', 'noopener,noreferrer')
      } else if (button.dataset.action === 'edit') {
        editingId = record.id
        draft = state.getDraft(record.id)
        chooseDirection(draft.direction)
      } else {
        pendingWithdrawal = record.id
        dialog.showModal()
      }
    } else if (target.closest('#cc-cancelWithdraw')) { dialog.close(); pendingWithdrawal = null }
    else if (target.closest('#cc-confirmWithdraw')) {
      const removed = state.withdraw(pendingWithdrawal, true)
      dialog.close()
      pendingWithdrawal = null
      renderSubmissions()
      toast(removed ? '已撤回投稿' : '征集已截止，无法撤回')
    }
  }
  function onInput(event) {
    if (event.target === $('description')) $('descCount').textContent = event.target.value.length
    if (event.target === $('agreeRules')) $('confirmSubmit').disabled = !event.target.checked
  }
  function onSubmit(event) {
    if (event.target !== form) return
    event.preventDefault()
    event.stopPropagation()
    readForm()
    if (!form.checkValidity()) { form.reportValidity(); return }
    const result = state.save(draft, editingId)
    if (!result.ok) { toast(Object.values(result.errors)[0]); return }
    const item = result.record
    $('successView').querySelector('h2').textContent = editingId ? '修改已保存！' : '投稿成功！'
    const values = [['投稿方向', directions[item.direction].name], ['作品名称', item.title], ['投稿时间', item.time], ['投稿编号', item.id], ['作品链接', item.url]]
    $('successMeta').innerHTML = values.map(([label, value]) => `<div><small>${label}</small><b>${esc(value)}</b></div>`).join('')
    renderSubmissions()
    editingId = null
    draft = emptyDraft()
    fillForm()
    showView('successView')
  }
  $('miniDirections').innerHTML = directions.map((direction, index) => `<button class="mini-direction" data-direction="${index}"><small>DIRECTION ${String(index + 1).padStart(2, '0')}</small><b>${esc(direction.name)}</b><span>${esc(direction.title)}</span></button>`).join('')
  fillForm()
  renderSubmissions()
  root.querySelector('.demo-note').hidden = true
  academyRoot.addEventListener('click', onClick)
  root.addEventListener('input', onInput)
  root.addEventListener('change', onInput)
  root.addEventListener('submit', onSubmit)
  return () => {
    clearTimeout(toastTimer)
    cancelAnimationFrame(focusFrame)
    dialog.close()
    academyRoot.removeEventListener('click', onClick)
    root.removeEventListener('input', onInput)
    root.removeEventListener('change', onInput)
    root.removeEventListener('submit', onSubmit)
  }
}
