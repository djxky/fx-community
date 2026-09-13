import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  TASKS_BY_SCENE,
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
  { title: '家校沟通', scene: 'classcare', task: 'home-school', subject: '全学科', stage: '通用', form: '沟通模板' },
  { title: '集体备课', scene: 'research', task: 'co-planning', subject: '化学', stage: '高中', form: '教案' },
]

test('任务域使用教师工作语言并按确认顺序返回', () => {
  assert.deepEqual(availableScenes(POSTS), [
    { key: 'all', label: '全部' },
    { key: 'prep', label: '教学与备课' },
    { key: 'classroom', label: '课堂与学情' },
    { key: 'assessment', label: '作业与评价' },
    { key: 'classcare', label: '班级与家校' },
    { key: 'research', label: '教研与成长' },
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

test('学段与学科随当前场景收敛，内容形态不作为教师筛选项', () => {
  assert.deepEqual(availableFacetOptions(POSTS, 'classroom'), {
    subjects: ['数学', '英语'],
    stages: ['初中', '小学'],
  })
})

test('题单收进作业与评价下的作业设计，而不是单独做内容类型', () => {
  assert.ok(TASKS_BY_SCENE.assessment.some((task) => task.key === 'homework-design' && task.label === '作业设计'))
})
