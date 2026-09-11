const LIGHTWEIGHT_ACTIONS = [
  { key: 'favorite', label: '收藏', emphasis: 'lightweight' },
  { key: 'share', label: '分享', emphasis: 'lightweight' },
]

const RESOURCE_ACTIONS = [
  ...LIGHTWEIGHT_ACTIONS,
  { key: 'adapt', label: '改编', emphasis: 'secondary' },
  { key: 'download', label: '下载', emphasis: 'primary' },
]

const GUEST_APP_ACTIONS = [
  ...LIGHTWEIGHT_ACTIONS,
  { key: 'adapt', label: '改编', emphasis: 'secondary' },
  { key: 'copy', label: '复制副本', emphasis: 'primary' },
]

const OWNER_APP_ACTIONS = [
  ...LIGHTWEIGHT_ACTIONS,
  { key: 'edit', label: '编辑', emphasis: 'primary' },
]

export function isResourceOwner(resource, currentUser) {
  const authorAccountId = resource?.author?.accountId
  const currentAccountId = currentUser?.accountId
  return Boolean(authorAccountId && currentAccountId && authorAccountId === currentAccountId)
}

export function getResourceActions({ contentType, isOwner }) {
  if (contentType === 'app') return isOwner ? OWNER_APP_ACTIONS : GUEST_APP_ACTIONS
  return RESOURCE_ACTIONS
}
