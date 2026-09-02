export function getAdaptedAttribution(resource, parent) {
  if (!resource?.forkedFrom || !parent) return null

  return {
    adapterName: resource.author.name,
    originalResourceId: parent.id,
    originalAuthorName: parent.author.name,
    originalTitle: parent.title,
    sourceVersion: resource.forkedFromVersion || parent.versions.at(-1)?.v || '',
  }
}
