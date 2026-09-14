// 发现页里的专题卡：只放老师创建专题时选择「发布到社区」、且至少有 1 个资源的专题。
// 封面取专题内第一个资源（卡片叠放效果在卡片组件里画）；学科 / 学段由专题内资源推出（不一致时留空，不参与该项筛选）。

const STAGES = ['小学', '初中', '高中']

function stageOf(grade = '') {
  return STAGES.find((stage) => grade.includes(stage)) || '通用'
}

function sameValue(values) {
  const unique = [...new Set(values.filter(Boolean))]
  return unique.length === 1 ? unique[0] : ''
}

export function buildTopicPosts(topics, resources, fallbackCovers = []) {
  return Object.values(topics)
    .filter((topic) => topic.community?.published)
    .map((topic) => {
      const items = resources.filter((resource) => resource.topicMembership?.id === topic.id)
      const author = topic.author?.name || items[0]?.author?.name || ''
      return {
        kind: 'topic',
        to: 'topic',
        topicId: topic.id,
        title: topic.title,
        count: items.length,
        badge: `专题 · ${items.length} 个资源`,
        cover: items[0]?.cover || fallbackCovers[0] || '',
        author,
        avatar: author.slice(0, 1),
        verify: '',
        scene: topic.community.scene,
        task: topic.community.task,
        subject: sameValue(items.map((resource) => resource.fit?.subject)),
        stage: sameValue(items.map((resource) => stageOf(resource.fit?.grade))),
        // 累计使用 = 专题内全部资源的使用人数相加
        evi: { use: items.reduce((sum, resource) => sum + Number(resource.stats?.use || 0), 0).toLocaleString('en-US'), star: '' },
      }
    })
    .filter((post) => post.count > 0)
}

// 专题卡混进推荐流：第一个放在第 position + 1 张，之后每隔 every 张资源再放一个。
export function mixTopicPosts(posts, topicPosts, position = 2, every = 6) {
  const result = [...posts]
  topicPosts.forEach((topicPost, i) => {
    result.splice(Math.min(position + i * (every + 1), result.length), 0, topicPost)
  })
  return result
}
