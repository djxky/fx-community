function getModal(root) {
  return root?.querySelector?.('.academy-submission-modal') || null
}

export function handleAcademySubmissionClick(event, root = globalThis.document) {
  const target = event.target?.closest?.('[data-academy-submit-open]')
  if (!target) return null

  const modal = getModal(root)
  const form = modal?.querySelector?.('.academy-submission-form')
  const success = modal?.querySelector?.('.academy-submission-success')
  if (!modal || !form || !success) return null

  modal.hidden = false
  form.hidden = false
  success.hidden = true
  modal.querySelector?.('select, input, button')?.focus?.()
  return 'open'
}

export function closeAcademySubmission(event, root = globalThis.document) {
  if (!event.target?.closest?.('[data-academy-submit-close]')) return false
  const modal = getModal(root)
  if (!modal) return false
  modal.hidden = true
  return true
}

export function submitAcademyWork(event, root = globalThis.document) {
  const form = event.target
  if (!form?.matches?.('.academy-submission-form')) return false
  event.preventDefault?.()
  if (!form.checkValidity?.()) {
    form.reportValidity?.()
    return false
  }

  const success = root?.querySelector?.('.academy-submission-success')
  if (!success) return false
  form.hidden = true
  success.hidden = false
  success.querySelector?.('button')?.focus?.()
  return true
}
