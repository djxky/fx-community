import { COVERS } from './covers'
import { PORTRAITS } from './portraits'

// 排行榜落地 = 多榜单墙(类热搜)。每个榜带具体内容(封面/头像/数字),不做纯文字。
// layout: 'cover'(资源,带封面缩略) | 'avatar'(人,带头像) | 'inst'(机构,带图标)
export const BOARDS = [
  {
    key: 'classroom', title: '真实课堂使用榜', tag: '飞象独有', hot: true, period: '本周',
    desc: '真的被带进课堂的,不是刷出来的', layout: 'cover',
    items: [
      { name: '谁杀了祥林嫂 · 沉浸式剧本杀', sub: '林若水 · 语文', metric: '3.2万', unit: '课堂使用', cover: COVERS[0] },
      { name: '圆柱体积 · 天坛拆柱互动课件', sub: '李明 · 数学', metric: '2.8万', unit: '课堂使用', cover: COVERS[3] },
      { name: '挖金矿口算游戏', sub: '小叶老师 · 数学', metric: '2.1万', unit: '课堂使用', cover: COVERS[6] },
      { name: 'AI 服务员点餐 · 口语闯关', sub: '陈红 · 英语', metric: '1.9万', unit: '课堂使用', cover: COVERS[4] },
      { name: '作文批改 skill · 逐句点评', sub: '沈砚 · 语文', metric: '1.5万', unit: '课堂使用', cover: COVERS[2] },
    ],
  },
  {
    key: 'influence', title: '名师影响力榜', hot: false, period: '本月',
    desc: '被最多老师追随的一群人', layout: 'avatar',
    items: [
      { name: '刘彭芝', sub: '数学特级 · 人大附中', metric: '46.2万', unit: '关注', portrait: PORTRAITS[0], expert: true },
      { name: '苏窈', sub: '英语特级 · 省名师工作室', metric: '15.8万', unit: '关注', portrait: PORTRAITS[1], expert: true },
      { name: '沈知微', sub: '数学特级 · 人教版教材组', metric: '13.2万', unit: '关注', portrait: PORTRAITS[2], expert: true },
      { name: '王建国', sub: '语文正高 · 江苏省教研室', metric: '9.4万', unit: '关注', initial: '王' },
      { name: '郭承宇', sub: '信息科技高级 · AI 教育', metric: '7.1万', unit: '关注', initial: '郭' },
    ],
  },
  {
    key: 'rising', title: '新锐创作者榜', tag: '扶持新人', hot: false, period: '本周',
    desc: '这周冒头最快的素人,你可能是下一个', layout: 'avatar',
    items: [
      { name: '小叶老师', sub: '深圳南山小学 · 数学', metric: '+2,400', unit: '新增关注', initial: '叶' },
      { name: '陈红', sub: '广州执信中学 · 英语', metric: '+1,860', unit: '新增关注', initial: '陈' },
      { name: '刘洋', sub: '上外附中 · 英语', metric: '+1,530', unit: '新增关注', initial: '刘' },
      { name: '沈砚', sub: '杭州文澜中学 · 语文', metric: '+1,290', unit: '新增关注', initial: '沈' },
      { name: '李明', sub: '北京十一学校 · 数学', metric: '+1,120', unit: '新增关注', initial: '李' },
    ],
  },
  {
    key: 'surging', title: '本周飙升榜', hot: false, period: '本周',
    desc: '使用量涨得最快的资源', layout: 'cover',
    items: [
      { name: 'AI 训练营 · 学生教电脑认猫认狗', sub: '张伟 · 信息科技', metric: '+240%', up: true, cover: COVERS[7] },
      { name: '分层作业 skill · 一键出 ABC 三套', sub: '张伟 · 信息科技', metric: '+186%', up: true, cover: COVERS[5] },
      { name: '给课文写 Abstract · 说明文精读', sub: '刘洋 · 英语', metric: '+152%', up: true, cover: COVERS[8] },
      { name: '挖金矿口算游戏', sub: '小叶老师 · 数学', metric: '+134%', up: true, cover: COVERS[6] },
      { name: '天坛拆柱 · 圆柱体积', sub: '李明 · 数学', metric: '+119%', up: true, cover: COVERS[3] },
    ],
  },
  {
    key: 'institution', title: '名校 · 教研组 · 出版社榜', tag: '机构', hot: false, period: '本月',
    desc: '整建制在贡献的组织', layout: 'inst',
    items: [
      { name: '人民教育出版社 · 数学编辑部', sub: '出版社', metric: '12.4万', unit: '使用', icon: 'book' },
      { name: '海淀区数学教研室', sub: '教研组', metric: '6.8万', unit: '使用', icon: 'people' },
      { name: '王崧舟 · 诗意语文工作室', sub: '工作室', metric: '7.3万', unit: '使用', icon: 'studio' },
      { name: '北京十一学校 · 学科基地', sub: '名校', metric: '5.5万', unit: '使用', icon: 'school' },
      { name: '南京市玄武区语文教研组', sub: '教研组', metric: '3.9万', unit: '使用', icon: 'people' },
    ],
  },
  {
    key: 'newest', title: '最新优质', tag: '编辑精选', hot: false, period: '今日',
    desc: '刚上架、已经被课堂验证的', layout: 'cover',
    items: [
      { name: '文言文默写闯关 · 初中必背 61 篇', sub: '王建国 · 语文', metric: '2 小时前', cover: COVERS[0] },
      { name: '物理力学一模复盘 · 分层讲义', sub: '刘涛 · 物理', metric: '5 小时前', cover: COVERS[3] },
      { name: '英语听说任务链 · 直播回放拆解', sub: '苏窈 · 英语', metric: '今天', cover: COVERS[4] },
      { name: '整本书阅读 · 经典重构第 4 讲', sub: '林若水 · 语文', metric: '今天', cover: COVERS[2] },
      { name: '跨学科项目 · 校园人流计数', sub: '张伟 · 信息科技', metric: '昨天', cover: COVERS[7] },
    ],
  },
]
