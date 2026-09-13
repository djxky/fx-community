import { getActivityApi } from './activity-login.mjs'

// 弹窗控制器只处理课堂投稿；活动、字段校验和 Cookie 登录校验统一由 API 适配器负责。
// 每次账户事件推进版本，旧请求不能把其他账户的成功信息或工作坊列表写回当前表单。
export function createAcademySubmissionController(root, api = getActivityApi()) {
  const modal = root.querySelector('.academy-submission-modal')
  const form = modal?.querySelector('.academy-submission-form')
  const success = modal?.querySelector('.academy-submission-success')
  // 表单与成功确认是互斥状态：同时驱动 DOM 隐藏和紧凑布局，不能只重置输入值。
  // 每次重新打开/账户变化回到填写态，防止沿用上次成功信息；不在这里发起任何请求。
  const setView = submitted => {
    if (!modal || !form || !success) return
    modal.dataset.state = submitted ? 'success' : 'form'
    modal.setAttribute('aria-labelledby', submitted ? 'academy-submission-success-title' : 'academy-submission-title')
    form.hidden = submitted
    success.hidden = !submitted
    if (submitted && !modal.hidden) success.querySelector('button')?.focus()
  }
  let options = [], saving = false, loading = false, revision = 0, disposed = false, account = null
  const retryButton = form?.querySelector('[data-academy-workshops-retry]')
  const toast = modal?.querySelector('[data-academy-submission-toast]')
  let toastTimer = null
  // 由提交处理器统一执行约束校验，避免浏览器提前拦截 submit，导致 toast 没有机会显示。
  // 仅关闭自动气泡，不移除 required/type/长度约束；销毁时恢复原有表单行为。
  const originalNoValidate = form?.noValidate
  if (form) form.noValidate = true
  // 加载错误只给用户可操作的提示，不透传服务端占位信息；定时器随控制器销毁，
  // 重试或账户变化时立即收起旧提示，避免旧请求的反馈污染新的表单状态。
  const hideToast = () => {
    if (toastTimer !== null) window.clearTimeout(toastTimer)
    toastTimer = null
    if (toast) { toast.hidden = true; toast.textContent = '' }
  }
  const notify = message => {
    hideToast()
    if (!toast || modal.hidden) return
    toast.textContent = message; toast.hidden = false
    toastTimer = window.setTimeout(hideToast, 4000)
  }
  // 清除不可用的旧选项，但不重置其他字段；失败/空列表都保留重试入口。
  const showOptionState = message => {
    options = []
    const select = form.elements.workshopId
    const option = select.ownerDocument.createElement('option')
    option.value = ''; option.textContent = message
    select.replaceChildren(option)
  }
  // 所有提交错误共用悬浮提示，不再把错误塞在滚动表单底部；空消息只清理旧状态。
  // 保留适配器的中文业务原因，屏蔽英文占位和底层异常；始终使用 textContent 防止 HTML 注入。
  const error = message => {
    const node = modal?.querySelector('.academy-submission-error')
    if (node) node.textContent = ''
    if (!message) { hideToast(); return }
    notify(typeof message === 'string' && /[\u4e00-\u9fff]/.test(message) ? message : '提交失败，请稍后重试。')
  }
  // 只提示按表单顺序找到的首个无效字段，用户修正后再继续；原生校验与 API 业务校验都保留。
  const validateForm = () => {
    const field = Array.from(form.elements).find(element => element.willValidate && !element.validity.valid)
    if (!field) return true
    const names = { workshopId: '工作坊', workUrl: '作品链接', province: '省份', city: '城市或行政区', school: '学校全称', teacherId: '教师 ID', certificateName: '证书姓名', email: '证书发放邮箱' }
    const label = names[field.name] || '该项信息'
    let message = `请检查${label}的填写格式。`
    if (field.validity.valueMissing) message = field.name === 'workshopId' ? '请选择工作坊。' : `请填写${label}。`
    else if (field.validity.typeMismatch) message = `请填写有效的${label}。`
    else if (field.validity.tooShort) message = `${label}至少需要填写 ${field.minLength} 个字符。`
    else if (field.validity.tooLong) message = `${label}不能超过 ${field.maxLength} 个字符。`
    error(message)
    field.focus()
    return false
  }
  const update = () => {
    if (!form) return
    Array.from(form.elements).forEach(element => { element.disabled = saving })
    form.elements.workshopId.disabled = saving || loading || !options.length
    form.querySelector('[type="submit"]').disabled = saving || loading || !options.length
    form.querySelector('[type="submit"]').textContent = saving ? '提交中…' : '提交作品'
    if (retryButton) retryButton.disabled = saving || loading
  }
  const loadOptions = async () => {
    if (!form || loading || disposed) return
    const previous = form.elements.workshopId.value
    loading = true; const version = revision
    hideToast(); error(''); showOptionState('正在加载工作坊…'); update()
    try {
      const items = await api.workshops()
      if (disposed || version !== revision) return
      options = items
      const select = form.elements.workshopId
      select.replaceChildren()
      const placeholder = root.ownerDocument?.createElement('option') || root.createElement('option')
      placeholder.value = ''; placeholder.textContent = '请选择工作坊'; select.appendChild(placeholder)
      // 使用 textContent，服务端活动名称不能作为 HTML 插入；不自动替用户选择活动。
      items.forEach(item => {
        const option = placeholder.cloneNode()
        option.value = item.workshopId; option.textContent = item.workshopName; select.appendChild(option)
      })
      if (items.some(item => item.workshopId === previous)) select.value = previous
      if (!items.length) showOptionState('暂无可投稿的工作坊')
      if (retryButton) retryButton.hidden = items.length > 0
    } catch (err) {
      if (!disposed && version === revision) {
        showOptionState('加载失败')
        if (retryButton) retryButton.hidden = false
        notify('工作坊加载失败，请重试。')
      }
    } finally {
      if (!disposed && version === revision) { loading = false; update() }
    }
  }
  const open = event => {
    if (!modal || !event.target?.closest?.('[data-academy-submit-open]')) return false
    modal.hidden = false
    if (!saving) { setView(false); void loadOptions() }
    return true
  }
  const submit = async event => {
    if (event.target !== form) return false
    event.preventDefault()
    if (saving || loading || !options.length) return false
    if (!validateForm()) return false
    const draft = Object.fromEntries(Array.from(form.elements).filter(e => e.name).map(e => [e.name, e.value]))
    const version = revision
    saving = true; error(''); update()
    try {
      const nextAccount = await api.checkLogin()
      if (disposed || version !== revision) return false
      if (account !== null && account !== nextAccount) {
        account = nextAccount; form.reset(); error('账号已切换，请重新填写后提交。'); return false
      }
      account = nextAccount
      await api.saveWorkshop(draft, options)
      if (disposed || version !== revision) return false
      form.reset(); setView(true)
      return true
    } catch (err) {
      if (!disposed && version === revision) error(err.message || '提交失败，请重试。')
      return false
    } finally {
      saving = false
      if (!disposed) update()
    }
  }
  const onSession = event => {
    hideToast()
    revision++; loading = false; options = []
    if (event.detail?.reason === 'account-changed') { account = null; form?.reset() }
    if (form) { setView(false); update() }
    // 登录成功只恢复选择项，不自动重放提交；保留同一账号的草稿供用户再次确认。
    if (modal && !modal.hidden && event.detail?.reason === 'login') void loadOptions()
  }
  const retry = event => { if (event.target?.closest?.('[data-academy-workshops-retry]')) void loadOptions() }
  root.addEventListener('click', retry)
  window.addEventListener('academy:session-changed', onSession)
  return { open, submit, destroy() {
    hideToast()
    if (form) form.noValidate = originalNoValidate
    disposed = true; revision++
    root.removeEventListener('click', retry); window.removeEventListener('academy:session-changed', onSession)
  } }
}

// 关闭不会取消已到达服务器的写入，也不会再次发送；控制器仍防止重复点击。
export function closeAcademySubmission(event, root = globalThis.document) {
  if (!event.target?.closest?.('[data-academy-submit-close]')) return false
  const modal = root.querySelector('.academy-submission-modal')
  if (!modal) return false
  modal.hidden = true
  return true
}
