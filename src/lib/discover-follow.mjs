// 发现页「关注」：顶部关注对象头像行 + 按作者看资源。
// 关注对象取自关注动态（同一作者只出现一次，按最近动态顺序）；老师和机构都在。

export function buildFollowAuthors(feed) {
  const authors = new Map()
  for (const item of feed) {
    if (authors.has(item.actor)) continue
    authors.set(item.actor, {
      name: item.actor,
      portrait: item.portrait || '',
      mark: item.mark || item.actor.slice(0, 1),
      org: item.actorType === 'org',
      expert: Boolean(item.expert),
    })
  }
  return [...authors.values()]
}

export function feedItemToPost(item) {
  const resource = item.resource
  return {
    to: resource.to || 'res',
    cover: resource.cover,
    badge: resource.meta?.split(' · ')[0] || '资源',
    author: item.actor,
    avatar: item.mark || item.actor.slice(0, 1),
    verify: item.expert ? 'expert' : '',
    title: resource.title,
    meta: resource.meta,
    verified: false,
    evi: { use: resource.use, adapt: '', star: resource.save },
    scene: resource.scene,
    task: resource.task,
    subject: resource.subject,
    stage: resource.stage,
    form: resource.form,
  }
}

// 全部关注对象的资源：关注动态里的资源在前，再补上推荐内容里这些作者发布的；按标题去重。
export function buildFollowPosts(feed, posts) {
  const followed = new Set(feed.map((item) => item.actor))
  const titles = new Set()
  return [...feed.map(feedItemToPost), ...posts.filter((post) => followed.has(post.author))]
    .filter((post) => {
      if (titles.has(post.title)) return false
      titles.add(post.title)
      return true
    })
}

// 未选中头像 → 全部；选中 → 只看该作者。
export function filterByAuthor(posts, author) {
  return author ? posts.filter((post) => post.author === author) : posts
}
