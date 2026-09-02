export function getAdaptedAttribution(resource, parent) {
  if (!resource?.forkedFrom || !parent) return null

  return {
    adapterName: resource.author.name,
    originalResourceId: parent.id,
    originalAuthorInitial: parent.author.name.slice(0, 1),
    originalAuthorName: parent.author.name,
    originalTitle: parent.title,
    sourceVersion: resource.forkedFromVersion || parent.versions.at(-1)?.v || '',
  }
}

export function getResourceCredits(resource, parent) {
  if (resource?.forkedFrom && parent) {
    return [
      { role: '原创作者', name: parent.author.name, resourceId: parent.id },
      { role: '改编者', name: resource.author.name, resourceId: null },
    ]
  }

  return resource?.author
    ? [{ role: '原创作者', name: resource.author.name, resourceId: null }]
    : []
}
