function selectedFilterKey(root, group) {
  const input = root.querySelector(`input[name="${group}"]:checked`)
  return input?.id?.replace(`${group}-`, '') || 'all'
}

function cardMatches(card, key) {
  return key === 'all' || card.classList.contains(`cat-${key}`)
}

export function hasMatchingAcademyCourse(cards, useKey, typeKey) {
  return Array.from(cards).some((card) => (
    cardMatches(card, useKey) && cardMatches(card, typeKey)
  ))
}

export function syncAcademyCourseEmptyState(root) {
  const emptyState = root?.querySelector?.('.course-empty')
  if (!emptyState) return false

  const cards = root.querySelectorAll('.course-library .course-card')
  const useKey = selectedFilterKey(root, 'course-use')
  const typeKey = selectedFilterKey(root, 'course-type')
  const hasCourses = hasMatchingAcademyCourse(cards, useKey, typeKey)

  emptyState.hidden = hasCourses
  return !hasCourses
}

export function setupAcademyCourseEmptyState(root) {
  if (!root?.addEventListener) return () => {}

  const handleChange = (event) => {
    if (!event.target?.matches?.('input[name="course-use"], input[name="course-type"]')) return
    syncAcademyCourseEmptyState(root)
  }

  root.addEventListener('change', handleChange)
  syncAcademyCourseEmptyState(root)

  return () => root.removeEventListener('change', handleChange)
}
