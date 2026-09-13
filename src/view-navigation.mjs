export function getViewRouteFromSearch(search) {
  const params = new URLSearchParams(search)
  const view = params.get('view')
  return ['academy', 'skills', 'studio'].includes(view) ? { view } : null
}

export function buildViewUrl(pathname, view) {
  return ['academy', 'skills', 'studio'].includes(view) ? `${pathname}?view=${view}` : pathname
}
