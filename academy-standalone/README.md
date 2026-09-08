# 飞象老师 AI 教学工坊（独立工程）

这是从飞象社区原型中拆出的 AI 教学工坊源码工程。它不依赖仓库外的文件，可单独交给研发安装、运行、修改和构建。

独立版只展示教学工坊内容，不渲染社区侧栏，也不预留侧栏空间。内容默认全宽，两侧保留 24px 常规内边距（小屏 20px），课程网格自适应 1–4 列。宿主可在外部自行提供导航。

## 开发与构建

```bash
npm install
npm run dev
npm run build
npm run preview
```

建议使用 Node.js 20.19+ 或 22.12+。

构建产物位于 `dist/`。`index.html`、JavaScript、CSS 和图片会分文件输出；部署时请上传整个 `dist/`，不要只复制 `index.html`。

## 目录说明

- `src/views/AcademyView.vue`：教学工坊页面入口与资源装配。
- `src/views/raw/academy.html`：教学工坊首页、课程详情、直播详情和预约弹窗结构。
- `src/data/`：课程目录与视频链接数据。
- `src/lib/`：筛选、轮播、课程切换、投稿与宿主通信逻辑。
- `src/styles/`：教学工坊及独立壳层样式。
- `src/assets/academy/`：教学工坊专用图片；大图已做交付压缩。

## 接入现有登录与路由

在应用挂载前注入宿主适配器。未登录用户点击“提交审核”时会被拦截并调用真实登录弹窗；不要在本工程里复制账号体系。

```js
window.FEIXIANG_ACADEMY_INTEGRATION = {
  isLoggedIn: () => authStore.isLoggedIn,
  openLogin: () => loginDialog.open(),
  navigate: (view) => router.push({ name: view }),
}
```

如果宿主暂时没有传适配器，本工程会派发以下浏览器事件，便于非 Vue 宿主接入：

- `academy:request-login`：请求打开登录弹窗。
- `academy:navigate`：保留的宿主导航扩展事件，`event.detail.view` 为目标页面；独立版不展示侧栏导航。

独立预览默认允许完成本地模拟提交；正式接入时必须提供 `isLoggedIn` 与 `openLogin`。
