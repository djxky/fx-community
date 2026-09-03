export function getViewRouteFromSearch(search) {
  const params = new URLSearchParams(search)
  return params.get('view') === 'academy' ? { view: 'academy' } : null
}

export function buildViewUrl(pathname, view) {
  return view === 'academy' ? `${pathname}?view=academy` : pathname
}
