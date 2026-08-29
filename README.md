# 飞象老师 · 教师社区(可点击原型)

中国教师第一社区的产品原型。**小红书的皮 + Figma 的核 + AI 焊死**:刷到 → 一键改成我的、当场生成 → 我的又成别人可刷可 fork 的。

技术上是一个 **Vue 3 + Vite** 应用,构建产物是**单个自包含 HTML**(`vite-plugin-singlefile` 把 JS/CSS/图片全部内联),因此可以:

- 直接 `file://` 双击打开;
- 挂到 **GitHub Pages** 给一个链接;
- 作为一次性文件分享。

---

## 开发

```bash
npm install
npm run dev        # 本地开发服务器 + 热更新
npm run build      # 产出 dist/index.html(单文件,自包含)
npm run preview    # 预览构建产物
```

## 目录结构

```
src/
  main.js               入口
  App.vue               顶层:渲染所有视图 + 挂载点击委托
  store.js              极简状态路由(store.view)
  styles/global.css     设计系统 + 全站样式(单一来源)
  components/
    Sidebar.vue         左侧导航(共享组件:社区/飞象学院/头像菜单)
  composables/
    delegation.js       全局点击委托:视图切换 + 视图内小交互
  views/
    DiscoverView.vue    发现(灵感流)
    LocalView.vue       本地(同城资源)
    RankView.vue        排行榜(维度×指标 卡片墙)
    AcademyView.vue     飞象学院(分层培训)
    CreatorView.vue     创作者中心(后台数据/上升阶梯)
    StudioView.vue      名师主页(含「专题」tab)
    ResView.vue         资源详情
    SkillView.vue       技能详情
    ShareView.vue       分享名片
    ReportView.vue      年度报告
    raw/*.html          各视图当前的 HTML 内容(从原型迁移,组件内 v-html 注入)
```

> 迁移策略:顶层路由、左侧导航(Sidebar)、点击交互已组件化;各视图正文当前是从既有原型迁移过来的 HTML(`raw/*.html`,用 `v-html` 注入),保证 1:1 还原。后续可逐块把卡片抽成真正的 Vue 组件、用 class 替换内联样式。

## 设计系统

`src/styles/global.css` 落地《飞象社区-设计系统与风格规范》:

- **主色 = 近黑 `#141F1B`**(不是绿);数据数字、主按钮、导航选中都走近黑。
- **金色 = 全站唯一保留彩色,只给荣誉/认证**(名师金环、里程碑徽章)。
- **红色 `#FF4832` = 只做警示/直播/删改。**
- 字重 500 封顶做强调、大数字 ≤700;圆角 16/10/8;发丝边框、几乎无阴影;留白给足。

判定合格最快的问题:除了金色荣誉和偶发警示红,截图里还能看到第三种彩色吗?能 = 超标。

## 部署到 GitHub Pages

已内置 `.github/workflows/deploy.yml`:push 到 `main` 分支即自动 `npm run build` 并把 `dist/` 部署到 Pages。首次需在仓库 **Settings → Pages → Source** 选 **GitHub Actions**。之后 push 完拿到的 Pages 链接即可给他人使用。

也可手动:`npm run build` 后把 `dist/index.html` 传到任意静态托管。

## 视图导航

顶部社区 tab:发现 · 关注 · 本地 · 排行榜。左侧:社区 / 飞象学院 / 我的知识库。创作者中心、我的主页、分享名片、年度报告 收在左下角**头像菜单**里。
