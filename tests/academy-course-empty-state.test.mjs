import assert from 'node:assert/strict'
import test from 'node:test'

async function loadEmptyState() {
  try {
    return await import('../src/lib/academy-course-empty-state.mjs')
  } catch {
    return {
      hasMatchingAcademyCourse: () => true,
      setupAcademyCourseEmptyState: () => () => {},
    }
  }
}

test('两层筛选没有共同课程时显示空状态，有匹配课程时隐藏', async () => {
  const { hasMatchingAcademyCourse } = await loadEmptyState()
  const cards = [
    { classList: { contains: (name) => ['cat-tips', 'cat-game'].includes(name) } },
    { classList: { contains: (name) => ['cat-case', 'cat-application'].includes(name) } },
  ]

  assert.equal(hasMatchingAcademyCourse(cards, 'tips', 'application'), false)
  assert.equal(hasMatchingAcademyCourse(cards, 'tips', 'game'), true)
  assert.equal(hasMatchingAcademyCourse(cards, 'all', 'application'), true)
})

test('筛选变化时同步空状态并在销毁时移除监听', async () => {
  const { setupAcademyCourseEmptyState } = await loadEmptyState()
  const emptyState = { hidden: true }
  const cards = [
    { classList: { contains: (name) => ['cat-tips', 'cat-game'].includes(name) } },
  ]
  let useKey = 'tips'
  let typeKey = 'application'
  let changeHandler = null
  let removedHandler = null
  const root = {
    querySelector: (selector) => {
      if (selector === '.course-empty') return emptyState
      if (selector === 'input[name="course-use"]:checked') return { id: `course-use-${useKey}` }
      if (selector === 'input[name="course-type"]:checked') return { id: `course-type-${typeKey}` }
      return null
    },
    querySelectorAll: () => cards,
    addEventListener: (eventName, handler) => {
      if (eventName === 'change') changeHandler = handler
    },
    removeEventListener: (eventName, handler) => {
      if (eventName === 'change') removedHandler = handler
    },
  }

  const cleanup = setupAcademyCourseEmptyState(root)
  assert.equal(emptyState.hidden, false)

  typeKey = 'game'
  changeHandler({ target: { matches: () => true } })
  assert.equal(emptyState.hidden, true)

  cleanup()
  assert.equal(removedHandler, changeHandler)
})
