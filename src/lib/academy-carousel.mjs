export function setupAcademyCarousel(
  root,
  {
    intervalMs = 5000,
    windowObject = globalThis.window,
    documentObject = globalThis.document,
  } = {},
) {
  const hero = root?.querySelector?.('.hero')
  const radios = Array.from(hero?.querySelectorAll?.('input[name="hs"]') ?? [])
  const dots = Array.from(hero?.querySelectorAll?.('.dots label[for^="hs"]') ?? [])

  if (!hero || radios.length < 2 || !windowObject || !documentObject) return () => {}

  let timerId = null
  let pausedByHover = false
  let pausedByFocus = false

  const stopTimer = () => {
    if (timerId === null) return
    windowObject.clearInterval(timerId)
    timerId = null
  }

  const isPageVisible = () => documentObject.visibilityState !== 'hidden'
  const isViewVisible = () =>
    typeof root.getClientRects !== 'function' || root.getClientRects().length > 0

  const advance = () => {
    if (pausedByHover || pausedByFocus || !isPageVisible() || !isViewVisible()) return

    const currentIndex = radios.findIndex((radio) => radio.checked)
    const nextIndex = (Math.max(currentIndex, 0) + 1) % radios.length
    radios[nextIndex].checked = true
  }

  const startTimer = () => {
    stopTimer()
    if (!isPageVisible()) return
    timerId = windowObject.setInterval(advance, intervalMs)
  }

  const handleDotClick = () => startTimer()
  const handleMouseEnter = () => {
    pausedByHover = true
    stopTimer()
  }
  const handleMouseLeave = () => {
    pausedByHover = false
    startTimer()
  }
  const handleFocusIn = (event) => {
    if (!event.target?.matches?.(':focus-visible')) return
    pausedByFocus = true
    stopTimer()
  }
  const handleFocusOut = (event) => {
    if (!pausedByFocus) return
    if (event.relatedTarget && hero.contains(event.relatedTarget)) return
    pausedByFocus = false
    startTimer()
  }
  const handleVisibilityChange = () => {
    if (isPageVisible()) startTimer()
    else stopTimer()
  }

  dots.forEach((dot) => dot.addEventListener('click', handleDotClick))
  hero.addEventListener('mouseenter', handleMouseEnter)
  hero.addEventListener('mouseleave', handleMouseLeave)
  hero.addEventListener('focusin', handleFocusIn)
  hero.addEventListener('focusout', handleFocusOut)
  documentObject.addEventListener('visibilitychange', handleVisibilityChange)
  startTimer()

  return () => {
    stopTimer()
    dots.forEach((dot) => dot.removeEventListener('click', handleDotClick))
    hero.removeEventListener('mouseenter', handleMouseEnter)
    hero.removeEventListener('mouseleave', handleMouseLeave)
    hero.removeEventListener('focusin', handleFocusIn)
    hero.removeEventListener('focusout', handleFocusOut)
    documentObject.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}
