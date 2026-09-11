const DEFAULT_RESOURCE_ACTIVITIES = [
  { actor: '周涛', action: '改编了这个资源', type: 'adapt', time: '3 分钟前' },
  { actor: '李敏', action: '收藏了这个资源', type: 'favorite', time: '12 分钟前' },
  { actor: '王芳', action: '下载了这个资源', type: 'download', time: '28 分钟前' },
  { actor: '陈见微', action: '收藏了这个资源', type: 'favorite', time: '1 小时前' },
  { actor: '沈知微', action: '下载了这个资源', type: 'download', time: '2 小时前' },
]

export function getRecentResourceActivities(resource = {}) {
  const contributorName = resource.contributors?.find((contributor) => contributor?.name)?.name

  return DEFAULT_RESOURCE_ACTIVITIES.map((activity, index) => ({
    ...activity,
    ...(index === 0 && contributorName ? { actor: contributorName } : {}),
  }))
}
