const VALID_CONTENT_TYPES = new Set(['resource', 'app'])
const VALID_VIEWERS = new Set(['guest', 'owner'])
const VALID_SOURCES = new Set(['original', 'adapted'])

function normalizeState(state = {}) {
  return {
    contentType: VALID_CONTENT_TYPES.has(state.contentType) ? state.contentType : 'resource',
    viewer: VALID_VIEWERS.has(state.viewer) ? state.viewer : 'guest',
    source: VALID_SOURCES.has(state.source) ? state.source : 'original',
  }
}

export function getResourcePreviewState(resource, currentUser) {
  return {
    contentType: resource?.contentType === 'app' ? 'app' : 'resource',
    viewer: resource?.author?.accountId === currentUser?.accountId ? 'owner' : 'guest',
    source: resource?.forkedFrom ? 'adapted' : 'original',
  }
}

export function createPreviewResource(rawState, { currentUser, resourcesById }) {
  const state = normalizeState(rawState)
  const original = state.contentType === 'app'
    ? resourcesById['res-order-game']
    : resourcesById['res-xianglin']
  const existingAdaptation = state.contentType === 'resource'
    ? resourcesById['res-xl-zhoutao']
    : null

  if (!original || (state.contentType === 'resource' && !existingAdaptation)) {
    throw new Error(`缺少${state.contentType === 'app' ? '应用' : '资源'}状态预览样例`)
  }

  const base = state.source === 'adapted' && existingAdaptation ? existingAdaptation : original
  const guestAdapter = resourcesById['res-xl-limin']?.author || {
    accountId: 'teacher-li-min',
    name: '李敏',
    type: '人',
    cert: '认证教师',
    avatar: null,
  }
  const author = state.viewer === 'owner'
    ? { ...base.author, accountId: currentUser.accountId, name: currentUser.name }
    : state.contentType === 'app' && state.source === 'adapted'
      ? { ...guestAdapter }
      : { ...base.author }
  const previewId = `preview-${state.contentType}-${state.viewer}-${state.source}`

  if (state.source === 'adapted') {
    return {
      ...base,
      id: previewId,
      contentType: state.contentType,
      title: state.contentType === 'app' ? `${original.title} · 班级改编版` : base.title,
      author,
      forkedFrom: original.id,
      forkedFromVersion: original.versions.at(-1)?.v || 'V1',
      forks: [],
      contributors: [],
    }
  }

  const { forkedFromVersion: _forkedFromVersion, ...originalFields } = base
  return {
    ...originalFields,
    id: previewId,
    contentType: state.contentType,
    author,
    forkedFrom: null,
  }
}

export function getResourcePreviewStateFromSearch(search) {
  const params = new URLSearchParams(search)
  const state = {
    contentType: params.get('previewType'),
    viewer: params.get('previewViewer'),
    source: params.get('previewSource'),
  }
  const valid = params.get('preview') === '1'
    && VALID_CONTENT_TYPES.has(state.contentType)
    && VALID_VIEWERS.has(state.viewer)
    && VALID_SOURCES.has(state.source)

  return {
    enabled: valid,
    state: valid ? state : null,
  }
}

export function buildResourcePreviewUrl(pathname, search, rawState) {
  const state = normalizeState(rawState)
  const params = new URLSearchParams(search)
  params.set('preview', '1')
  params.set('previewType', state.contentType)
  params.set('previewViewer', state.viewer)
  params.set('previewSource', state.source)
  return `${pathname}?${params.toString()}`
}

export function clearResourcePreviewUrl(pathname, search) {
  const params = new URLSearchParams(search)
  params.delete('preview')
  params.delete('previewType')
  params.delete('previewViewer')
  params.delete('previewSource')
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
