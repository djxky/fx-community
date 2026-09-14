# AI 教学工坊 9.9 验收节点映射

## 页面与状态帧

| 编号 | Motiff 对象 | Node ID / 图层 | 页面状态 | 当前可用性 |
|---|---|---|---|---|
| F01 | “9.9 验收”标题 | `64103:21898` | 区域定位 | 可读取，但不是目标根节点 |
| F02 | 工坊首页 | `61883:2415` / `image 91` | 默认首页、直播回放 | 扁平 PNG，只能视觉核对 |
| F03 | 课程列表展开态 | `61883:2415` / `image 92` | “展开更多”切到“收起” | 扁平 PNG，只能视觉核对 |
| F04 | 筛选空状态 | `61883:2415` / `image 93` | 无匹配课程 | 扁平 PNG，只能视觉核对 |
| F05 | 视频详情主体 | `61883:2415` / `image 95` | 课程目标与更多课程 | 扁平 PNG，只能视觉核对 |
| F06 | 视频详情顶部 | `61883:2415` / `image 96` | 返回入口与播放器顶部 | 扁平 PNG，只能视觉核对 |

## 九项改动映射

| 项 | 设计节点 | 现有源码位置 | 当前结论 |
|---|---|---|---|
| 1. 轮播指示点 | 用户确认规格 | `src/views/raw/academy.html` 中 `.hero .dots` 与选中 radio 规则 | 已实施，保持既有轮播逻辑 |
| 2. 视频卡片描边 | — | `.vcard`、`.lcard` | 用户取消，保持现状 |
| 3. 展开/收起按钮 | — | `.exp-btn`、`#repAll` | 用户取消，保持现状 |
| 4. 筛选标题冒号 | 用户确认文案 | `src/lib/academy-course-renderer.mjs` 的 `lf-label` | 已实施“用途：”“类型：” |
| 5. 视频时长标签 | `64103:21860` | `.vthumb .dur`、`.lthumb .dur`、`.pl-dur` | 已统一覆盖首页、课程列表、更多课程 |
| 6. 课程分类标签 | `64103:21858` | `.course-tags span` | 已按最新版 20px 总高实施 |
| 7. 筛选空状态图标 | 用户提供 `Component 7.svg` | `.course-empty-icon` | 已将 120×90 原始 SVG 落地并内联，保留现有文案 |
| 8. 视频详情返回入口 | — | 动态与静态详情返回入口 | 用户取消，保持现状 |
| 9. 课程目标圆点 | 用户补充图：#141F1B | `.lp-goals li::before` | 已使用 main v3 主文字语义 token |

## 主题 token 候选（仅记录，不代表未取数项已获批准）

以下 token 均已在宿主 main v3 文件中核对存在；实现阶段只能在设计精确值与用途吻合时选用：

| 设计用途 | 可用 token |
|---|---|
| 白色文字 / 白色描边 | `--musk-v3-semantic-text-inverse` / `--musk-v3-semantic-icon-inverse` |
| #7A7C7C 辅助文字 / 图标 | `--musk-v3-semantic-text-secondary` / `--musk-v3-semantic-icon-secondary` |
| #F6F6F6 浅背景 | `--musk-v3-semantic-page-subtle-bg` 或按最终组件用途核对对应 surface token |
| 10% 黑色浮层背景 | `--musk-v3-semantic-overlay-control-bg` |
| #ECECEC 默认描边 | `--musk-v3-semantic-border-default` |
| #E3E4E3 弱描边 | `--musk-v3-semantic-border-subtle` |
| #141F1B 主要文字 / 图标 | `--musk-v3-semantic-text-primary` / `--musk-v3-semantic-icon-default` |
| #303332 深中性色 | `--musk-v3-foundation-color-neutral-750`；仅当目标节点精确为该值且语义允许时使用 |

## 三件套状态

| Node ID | screenshot.png | content.html | node.json | 说明 |
|---|---:|---:|---:|---|
| `64103:21860` | MCP 可返回，未能落盘 | MCP 可返回，未能落盘 | 缺失 | 当前 MCP 无 saveDir/getNodes |
| `64103:21858` | MCP 可返回，未能落盘 | MCP 可返回，未能落盘 | 缺失 | 当前 MCP 无 saveDir/getNodes |
| 其余目标项 | 缺失 | 缺失 | 缺失 | 需要可读取的目标子节点 ID |

三件套完整数：`0 / 预计 8 个目标节点（展开/收起按两个状态计）`。
