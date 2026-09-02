function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function bindForkCardResourceIds(html, resourceIds) {
  let cardIndex = 0
  return html.replace(/<div class="nav-res fg-community-remix-card"(?![^>]*data-resource-id)/g, (openingTag) => {
    const resourceId = resourceIds[cardIndex++]
    return resourceId
      ? `${openingTag} data-resource-id="${escapeAttribute(resourceId)}" role="link" tabindex="0"`
      : openingTag
  })
}

export function getResourceNavigationState(resourceId, availableResourceIds) {
  if (!resourceId || !availableResourceIds.has(resourceId)) return null
  return {
    view: 'res',
    resourceId,
  }
}

export function buildResourceUrl(pathname, resourceId) {
  const params = new URLSearchParams({
    view: 'res',
    resource: resourceId,
  })
  return `${pathname}?${params.toString()}`
}

export function getResourceRouteFromSearch(search, availableResourceIds) {
  const params = new URLSearchParams(search)
  if (params.get('view') !== 'res') return null
  return getResourceNavigationState(params.get('resource'), availableResourceIds)
}

export function isSlideResourceKind(kind) {
  const normalizedKind = String(kind).toLowerCase()
  return normalizedKind.includes('课件')
    || normalizedKind.includes('ppt')
    || normalizedKind.includes('演示文稿')
}

export function isResourceActivationKey(key) {
  return key === 'Enter' || key === ' '
}
