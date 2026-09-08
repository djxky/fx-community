import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  availableScenes,
  availableTasks,
  availableFacetOptions,
  filterDiscoverPosts,
} from '../src/lib/discover-taxonomy.mjs'

const POSTS = [
  { title: '互动课件', scene: 'classroom', task: 'interact', subject: '数学', stage: '初中', form: '互动课件' },
  { title: '课堂游戏', scene: 'classroom', task: 'practice', subject: '英语', stage: '小学', form: '教学游戏' },
  { title: '单元教案', scene: 'prep', task: 'design', subject: '语文', stage: '初中', form: '教案' },
  { title: '学情应用', scene: 'assessment', task: 'analytics', subject: '数学', stage: '高中', form: '应用工具' },
]

test('场景入口只返回当前有内容的分类并保留全部', () => {
  assert.deepEqual(availableScenes(POSTS).map((item) => item.key), [
    'all', 'prep', 'classroom', 'assessment',
  ])
})

test('具体任务只返回所选场景下有内容的选项', () => {
  assert.deepEqual(availableTasks(POSTS, 'classroom').map((item) => item.key), [
    'all', 'interact', 'practice',
  ])
  assert.deepEqual(availableTasks(POSTS, 'all'), [])
})

test('场景、任务和收纳筛选条件可以组合过滤真实内容', () => {
  assert.deepEqual(filterDiscoverPosts(POSTS, {
    scene: 'classroom',
    task: 'interact',
    subject: '数学',
    stage: '初中',
    form: '互动课件',
  }).map((item) => item.title), ['互动课件'])

  assert.equal(filterDiscoverPosts(POSTS, {
    scene: 'classroom',
    subject: '语文',
  }).length, 0)
})

test('收纳筛选项随当前场景收敛，不展示无结果选项', () => {
  assert.deepEqual(availableFacetOptions(POSTS, 'classroom'), {
    subjects: ['数学', '英语'],
    stages: ['初中', '小学'],
    forms: ['互动课件', '教学游戏'],
  })
})
