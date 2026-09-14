const URL_VIEWS = ['academy', 'skills', 'studio', 'creator', 'chat']

export function getViewRouteFromSearch(search) {
  const params = new URLSearchParams(search)
  const view = params.get('view')
  return URL_VIEWS.includes(view) ? { view } : null
}

export function buildViewUrl(pathname, view) {
  return URL_VIEWS.includes(view) ? `${pathname}?view=${view}` : pathname
}
