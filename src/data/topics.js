// 专题：名称 / 简介 / 作者。本期一个专题只收专题作者本人的作品；
// 专题内资源仍按资源上的 topicMembership.id 归属。
export const TOPICS = {
  'classic-remix': {
    id: 'classic-remix',
    title: '整本书阅读 · 经典重构',
    intro: '把鲁迅的经典篇目重构成可推演、可讨论、可迁移的课堂，一篇一种课型。',
    author: { accountId: 'teacher-lin-ruoshui', name: '林若水', avatar: null },
    // 老师创建专题时选择是否发布到社区；发布后出现在发现页，场景用于发现页分类筛选
    community: { published: true, scene: 'classroom', task: 'interact' },
  },
}
