import { directions, tagOptions, emptyDraft, createSubmissionState, toggleTag, escapeHtml as esc } from './creation-submission.mjs'
import { getActivityApi } from './activity-login.mjs'
import { isAllowedWorkLink } from './activity-api.mjs'

const fields = { title: 'workTitle', url: 'workUrl', description: 'description', creator: 'creator', phone: 'phone', identity: 'identity', region: 'region', organization: 'organization', coCreators: 'coCreators' }
// 返回入口的辅助名称同步新品牌；目标视图与状态机标识不变，保证投稿流程行为不受重命名影响。
const backRoutes = {
  landingView: { label: '返回', ariaLabel: '返回飞象学院', target: null },
  directionView: { label: '返回活动详情', ariaLabel: '返回活动详情', target: 'landingView' },
  formView: { label: '返回选择方向', ariaLabel: '返回选择方向', target: 'directionView' },
  successView: { label: '返回活动详情', ariaLabel: '返回活动详情', target: 'landingView' },
  submissionsView: { label: '返回活动详情', ariaLabel: '返回活动详情', target: 'landingView' },
}

export function setupCreationCampaign(academyRoot, api = getActivityApi()) {
  const root = academyRoot?.querySelector('.creation-campaign')
  if (!root) return () => {}
  const $ = id => root.querySelector('#cc-' + id)
  const state = createSubmissionState(api)
  let draft = emptyDraft()
  let editingId = null
  let disposed = false
  let viewRevision = 0
  let listError = ''
  let listReady = false
  let toastTimer
  let focusFrame
  let currentViewId = 'landingView'
  const form = $('submissionForm')


  function toast(message) {
    $('toast').textContent = message
    $('toast').classList.add('show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2600)
  }
  function showView(id) {
    if (state.saving) return
    viewRevision++
    currentViewId = id
    // 当前页不重复展示指向自己的入口；离开投稿列表时恢复，不影响其他活动页面。
    $('mySubmissionsBtn').hidden = id === 'submissionsView'
    root.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === 'cc-' + id))
    const backRoute = backRoutes[id] ?? backRoutes.landingView
    $('backLabel').textContent = backRoute.label
    $('returnAcademy').setAttribute('aria-label', backRoute.ariaLabel)
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
    $('confirmSubmit').disabled = state.saving || !draft.agreed
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
    // 没有 total 的分页接口不显示伪总数；内容经转义，链接打开前再次校验协议和主机。
    $('submissionList').innerHTML = state.records.length ? state.records.map(item => '<article class="submission-item">'
      + '<div><div class="submission-top"><span class="direction-label">' + esc(directions[item.direction]?.name || '作品')
      + '</span><span class="status">已提交</span></div><h3>' + esc(item.title) + '</h3><p>提交时间：' + esc(item.time) + '</p></div>'
      + '<div class="item-actions"><button data-action="view" data-id="' + esc(item.id) + '">查看作品</button><button data-action="edit" data-id="' + esc(item.id) + '">修改信息</button></div></article>').join('')
      : ''
    // 只有一次成功的查询返回空数组才是空状态。加载中、接口失败和账号失效都不能伪装成“无投稿”。
    // 翻页错误保留列表与游标，重试按钮继续请求原来的下一页；复用现有样式，不调整页面间距。
    const hasRecords = state.records.length > 0
    const message = listError || (state.loading || !listReady ? '正在加载投稿…' : hasRecords ? '' : '暂无投稿作品')
    $('listStatusMessage').textContent = message
    $('listStatusMessage').hidden = !message
    $('listStatus').className = hasRecords && !listError ? '' : 'empty-note'
    $('listStatus').hidden = hasRecords && !state.loading && !listError && !state.hasMore
    $('loadMore').hidden = !listError && (!hasRecords || !state.hasMore)
    $('loadMore').disabled = state.loading
    $('loadMore').textContent = state.loading ? '加载中…' : listError ? '重新加载' : '加载更多'
  }
  async function loadSubmissions(refresh = false) {
    listError = ''
    if (refresh) listReady = false
    const version = viewRevision
    const pending = state.load(refresh)
    renderSubmissions()
    try {
      await pending
      if (!disposed && version === viewRevision) listReady = true
    } catch (error) {
      if (disposed || version !== viewRevision) return
      // 原始服务端错误可能是英文占位消息或内部信息，列表统一提供中文提示和明确重试入口。
      listError = '投稿记录加载失败'
      if (error.code === 'ACCOUNT_CHANGED') clearAccountDraft()
    } finally { if (!disposed) renderSubmissions() }
  }
  function clearAccountDraft() {
    draft = emptyDraft(); editingId = null
    fillForm()
  }
  function onSessionChanged(event) {
    // 登录失效仅清理服务端缓存，保留当前草稿；真正切换账号才清除隐私字段及编辑 ID。
    state.reset()
    listReady = false
    listError = event.detail.reason === 'login' ? '' : '投稿记录加载失败'
    viewRevision++
    if (event.detail.reason === 'account-changed') {
      clearAccountDraft()
      toast('账号已切换，请重新填写投稿')
    }
    if (currentViewId === 'submissionsView' && event.detail.reason === 'login') void loadSubmissions(true)
    else renderSubmissions()
  }
  function onClick(event) {
    const target = event.target
    if (state.saving && root.contains(target)) { event.preventDefault(); return }
    if (target.closest('label[for="lp-campaign"]')) showView('landingView')
    if (!root.contains(target)) return
    if (target.closest('#cc-returnAcademy')) {
      const backRoute = backRoutes[currentViewId] ?? backRoutes.landingView
      if (backRoute.target) {
        if (currentViewId === 'formView') readForm()
        showView(backRoute.target)
      } else {
        academyRoot.querySelector('#lp-home').checked = true
        academyRoot.querySelector('.main').scrollTop = 0
        academyRoot.querySelector('label[for="lp-campaign"]')?.focus({ preventScroll: true })
      }
    } else if (target.closest('.chooseDirection')) startNew()
    else if (target.closest('.goLanding')) showView('landingView')
    else if (target.closest('.goDirections')) { readForm(); showView('directionView') }
    else if (target.closest('[data-direction]')) chooseDirection(target.closest('[data-direction]').dataset.direction)
    else if (target.closest('#cc-mySubmissionsBtn, #cc-viewMineAfterSuccess')) { showView('submissionsView'); void loadSubmissions(true) }
    else if (target.closest('#cc-loadMore')) void loadSubmissions()
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
        if (!isAllowedWorkLink(record.url)) toast('该作品链接不符合安全规则')
        else window.open(record.url, '_blank', 'noopener,noreferrer')
      } else if (button.dataset.action === 'edit') {
        editingId = record.id
        draft = state.getDraft(record.id)
        chooseDirection(draft.direction)
      }
    }
  }
  function onInput(event) {
    if (event.target === $('description')) $('descCount').textContent = event.target.value.length
    if (event.target === $('agreeRules')) $('confirmSubmit').disabled = state.saving || !event.target.checked
  }
  async function onSubmit(event) {
    if (event.target !== form) return
    event.preventDefault()
    event.stopPropagation()
    if (state.saving) return
    readForm()
    if (!form.checkValidity()) { form.reportValidity(); return }
    const wasEditing = editingId != null
    const version = viewRevision
    const pending = state.save(draft, editingId)
    // 禁用输入和导航，防止等待响应时更改数据却被旧响应清空；所有失败都会恢复。
    const controls = Array.from(form.elements)
    const disabled = controls.map(control => control.disabled)
    controls.forEach(control => { control.disabled = true })
    $('confirmSubmit').textContent = '正在提交…'
    let saved = null
    try {
      saved = await pending
      if (!saved || disposed || version !== viewRevision) return
      $('successView').querySelector('h2').textContent = wasEditing ? '修改已保存！' : '投稿成功！'
      // 新增与修改共用简洁成功页，只确认保存结果；详细信息统一在“我的投稿”查看。
      // 不再把作品链接、时间或内部编号填充到结果页，保存及列表刷新流程保持不变。
      editingId = null; draft = emptyDraft()
      showView('successView')
      // 保存后重置并重新读取服务端列表；列表失败不撤销已经成功的提交。
      void loadSubmissions(true)
    } catch (error) {
      if (!disposed && version === viewRevision) {
        if (error.code === 'ACCOUNT_CHANGED') clearAccountDraft()
        toast(error.message || '提交失败，请稍后重试')
      }
    } finally {
      if (!disposed) {
        controls.forEach((control, index) => { control.disabled = disabled[index] })
        $('confirmSubmit').disabled = !draft.agreed
        $('confirmSubmit').textContent = editingId ? '保存修改' : '确认提交作品'
        if (saved) fillForm()
      }
    }
  }
  $('miniDirections').innerHTML = directions.map((direction, index) => `<button class="mini-direction" data-direction="${index}"><small>DIRECTION ${String(index + 1).padStart(2, '0')}</small><b>${esc(direction.name)}</b><span>${esc(direction.title)}</span></button>`).join('')
  fillForm()
  renderSubmissions()
  window.addEventListener('academy:session-changed', onSessionChanged)
  academyRoot.addEventListener('click', onClick)
  root.addEventListener('input', onInput)
  root.addEventListener('change', onInput)
  root.addEventListener('submit', onSubmit)
  return () => {
    clearTimeout(toastTimer)
    cancelAnimationFrame(focusFrame)
    disposed = true
    state.reset()
    window.removeEventListener('academy:session-changed', onSessionChanged)
    academyRoot.removeEventListener('click', onClick)
    root.removeEventListener('input', onInput)
    root.removeEventListener('change', onInput)
    root.removeEventListener('submit', onSubmit)
  }
}
