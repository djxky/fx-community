import { COVERS } from './covers'
import { PORTRAITS } from './portraits'

// 关注流示例数据：保留现有资源的使用人数与收藏数值，不添加额外评论摘要。
export const FEED = [
  {
    id: 'pep-math', actor: '人民教育出版社·数学编辑部', actorType: 'org', orgType: '出版社', mark: '人教',
    action: '发布了资源', icon: '＋', time: '2 小时前', text: '把六年级下册的关键概念整理成一份可以直接带进课堂的同步题单。',
    resource: { to: 'res', title: '圆的面积·同步题单', meta: '小学数学 · 六年级 · 人教版', cover: COVERS[3], use: '1,240', save: '3,420' },
    interactions: { like: '128', comment: '16' },
  },
  {
    id: 'haidian-math', actor: '海淀区教师进修学校·数学教研室', actorType: 'org', orgType: '教研组', mark: '海淀',
    action: '更新了资源', icon: '↻', time: '昨天 18:20', text: '六年级下册单元整体设计更新到第 4 版，补上了分层作业的课堂反馈。',
    resource: { to: 'res', title: '六年级下·单元整体设计', meta: '小学数学 · 六年级 · 单元设计', cover: COVERS[9], use: '3.2万', save: '5.8万' },
    interactions: { like: '236', comment: '28' },
  },
  {
    id: '十一-school', actor: '北京十一学校·学科课程基地', actorType: 'org', orgType: '名校', mark: '十一',
    action: '保存了资源', icon: '◇', time: '昨天 10:04', text: '把校本课例留作下一轮教研共备的起点。',
    resource: { to: 'res', title: '跨学科·数学建模', meta: '初中数学 · 校本课 · 项目学习', cover: COVERS[2], use: '986', save: '2,760' },
    interactions: { like: '184', comment: '21' },
  },
  {
    id: 'liupengzhi-favorite', actor: '刘彭芝', actorType: 'person', expert: true, portrait: PORTRAITS[0],
    action: '收藏了资源', icon: '★', time: '昨天 09:16', text: '一堂课把学生真正带进问题里，值得更多语文老师看到。',
    resource: { to: 'res', title: '我把《祝福》上成一场庭审 · 祥林嫂剧本杀', meta: '初中语文 · 九年级 · 统编版', cover: COVERS[0], use: '1,240', save: '3,420' },
    interactions: { like: '2,860', comment: '96' },
  },
  {
    id: 'suyao-save', actor: '苏窈', actorType: 'person', expert: true, portrait: PORTRAITS[1],
    action: '收藏了资源', icon: '☆', time: '周一 20:42', text: '这份口语活动的节奏很适合低门槛开口，我先收进课前热身。',
    resource: { to: 'res', title: '陈红《点餐口语游戏》', meta: '初中英语 · 口语 · 游戏化', cover: COVERS[4], use: '1,530', save: '4,100' },
    interactions: { like: '1,540', comment: '63' },
  },
  {
    id: 'wang-studio-share', actor: '王崧舟·诗意语文工作室', actorType: 'org', orgType: '工作室', mark: '诗意',
    action: '分享了资源', icon: '↗', time: '周一 16:08', text: '根据 12 个班的试教记录，重新整理了导入和小组讨论的衔接。',
    resource: { to: 'res', title: '《桃花源记》课例 · V6', meta: '初中语文 · 八年级 · 文言文', cover: COVERS[8], use: '902', save: '2,510' },
    interactions: { like: '316', comment: '34' },
  },
  {
    id: 'liming-adapt', actor: '李明', actorType: 'person', mark: '李',
    action: '改编了资源', icon: '⌘', time: '周日 14:32', text: '在原课例上加了一组真实测量任务，让公式从天坛的柱子里自己长出来。',
    resource: { to: 'res', title: '圆柱体积·天坛拆柱', meta: '小学数学 · 六年级 · 人教版', cover: COVERS[6], use: '986', save: '2,760' },
    interactions: { like: '402', comment: '42' },
  },
  {
    id: 'suyao-comment', actor: '苏窈', actorType: 'person', expert: true, portrait: PORTRAITS[1],
    action: '评论了资源', icon: '◌', time: '周日 11:05', text: '我在三年级试了一轮，学生先说再写，课堂秩序比预想更稳。',
    resource: { to: 'res', title: '分层作业·一课三练', meta: '小学英语 · 三年级 · 课堂练习', cover: COVERS[1], use: '405', save: '1,240' },
    interactions: { like: '96', comment: '18' },
  },
  {
    id: 'shenwei-update', actor: '沈知微', actorType: 'person', expert: true, portrait: PORTRAITS[2],
    action: '更新了资源', icon: '↻', time: '周六 19:26', text: '根据课堂反馈调整了题目顺序，让练习节奏更适合小组闯关。',
    resource: { to: 'res', title: '口算挖金矿·课堂版', meta: '小学数学 · 口算 · 游戏化', cover: COVERS[6], use: '902', save: '2,510' },
    interactions: { like: '722', comment: '31' },
  },
]
