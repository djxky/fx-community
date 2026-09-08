import {
  closeAcademySubmission,
  handleAcademySubmissionClick,
  submitAcademyWork,
} from './academy-submission.mjs'

const navigationTargets = [
  ['.nav-rank, .nav-home', 'home'],
  ['.nav-discover', 'discover'],
  ['.nav-skills', 'skills'],
  ['.nav-academy', 'academy'],
  ['.nav-mylib', 'mylib'],
  ['.nav-creator', 'creator'],
  ['.nav-notify', 'notify'],
]

export function shouldRequireLogin(integration) {
  return typeof integration?.isLoggedIn === 'function' && !integration.isLoggedIn()
}

function dispatchHostEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

function requestLogin(integration) {
  if (typeof integration?.openLogin === 'function') integration.openLogin()
  else dispatchHostEvent('academy:request-login', { source: 'work-submission' })
}

function navigate(integration, view) {
  if (view === 'academy') return
  if (typeof integration?.navigate === 'function') integration.navigate(view)
  else dispatchHostEvent('academy:navigate', { view })
}

export function installAcademyHostBridge(root = document, integration = {}) {
  const closeMenus = () => {
    root.querySelectorAll('.avatar-menu').forEach((menu) => { menu.style.display = 'none' })
    root.querySelectorAll('.avatar-trigger').forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'))
  }

  const onSubmit = (event) => {
    if (!event.target?.matches?.('.academy-submission-form')) return
    if (shouldRequireLogin(integration)) {
      event.preventDefault()
      event.stopImmediatePropagation()
      requestLogin(integration)
      return
    }
    submitAcademyWork(event, root)
  }

  const onClick = (event) => {
    const submissionButton = event.target?.closest?.('.academy-submission-submit[type="submit"]')
    if (submissionButton && shouldRequireLogin(integration)) {
      event.preventDefault()
      event.stopImmediatePropagation()
      requestLogin(integration)
      return
    }

    if (closeAcademySubmission(event, root)) return
    if (handleAcademySubmissionClick(event, root) === 'open') return

    const avatarTrigger = event.target?.closest?.('.avatar-trigger')
    if (avatarTrigger) {
      const menu = avatarTrigger.parentElement?.querySelector?.('.avatar-menu')
      const wasOpen = menu?.style.display === 'block'
      closeMenus()
      if (menu) menu.style.display = wasOpen ? 'none' : 'block'
      avatarTrigger.setAttribute('aria-expanded', wasOpen ? 'false' : 'true')
      return
    }
    if (!event.target?.closest?.('.avatar-menu')) closeMenus()

    const courseLink = event.target?.closest?.('label[for^="lp-"]')
    if (courseLink) {
      requestAnimationFrame(() => {
        root.querySelectorAll('#view-academy .main').forEach((main) => { main.scrollTop = 0 })
        window.scrollTo(0, 0)
      })
      return
    }

    for (const [selector, view] of navigationTargets) {
      if (event.target?.closest?.(selector)) {
        navigate(integration, view)
        return
      }
    }
  }

  const onKeydown = (event) => {
    if (event.key !== 'Escape') return
    const modal = root.querySelector('.academy-submission-modal:not([hidden])')
    if (modal) modal.hidden = true
    closeMenus()
  }

  root.addEventListener('submit', onSubmit)
  root.addEventListener('click', onClick)
  root.addEventListener('keydown', onKeydown)

  return () => {
    root.removeEventListener('submit', onSubmit)
    root.removeEventListener('click', onClick)
    root.removeEventListener('keydown', onKeydown)
  }
}
