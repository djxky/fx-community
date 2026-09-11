# Resource Detail v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the resource detail first screen around the current 飞象老师 application-detail hierarchy, with a persistent right-side detail/discussion panel and preserved application data.

**Architecture:** Keep the existing data-driven `ResView.vue` renderer and raw HTML slot model. Add a right-panel renderer that switches between detail content and the existing activity/comments content in-place; keep the bottom author/action strip and move versions/adaptations below the first screen. Preserve the prototype state switcher as a compact control so it does not compete with the real page hierarchy.

**Tech Stack:** Vue 3 `<script setup>`, raw HTML slot rendering, CSS media queries, Node test runner, Vite single-file build.

**Spec:** `docs/superpowers/specs/2026-09-11-resource-detail-v2-design.md`

## Global Constraints

- Keep application data and cumulative-use chart visible in the right detail panel.
- Comments are not rendered as a modal or drawer; they switch into the right panel in place.
- Keep existing resource/app action semantics and original/adapted attribution.
- Do not implement comment submission, deletion, pinning, or backend behavior.
- Do not sync `飞象社区原型-vue.html` or publish unless separately requested.
- Preserve unrelated dirty worktree changes and stage only resource-detail v2 files.

---

### Task 1: Define right-panel state contract

**Files:**
- Create: `src/resource-detail-v2.mjs`
- Modify: `src/views/ResView.vue`
- Test: `tests/resource-detail-v2.test.mjs`

**Interfaces:**
- Consumes: panel mode values from the detail-page click delegation.
- Produces: `getResourcePanelState(rawMode)`, `renderPanelTabs(activePanel)`, `renderPanelState(activePanel)`, and `renderPanelLayout(parts)` consumed by `ResView.vue` and the raw template.

- [ ] **Step 1: Write the failing test**

```js
test('v2 详情栏默认包含简介和应用数据，讨论栏包含动态与评论入口', () => {
  assert.equal(typeof v2.getResourcePanelState, 'function')
  assert.equal(typeof v2.renderPanelTabs, 'function')
  assert.deepEqual(v2.getResourcePanelState('detail'), { activePanel: 'detail' })
  assert.match(v2.renderPanelTabs('detail'), /详情/)
  assert.match(v2.renderPanelTabs('discussion'), /讨论/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/resource-detail-v2.test.mjs`
Expected: FAIL because the v2 panel-state module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create the small pure state module and import it from `ResView.vue`. Keep the data chart markup intact; the view-level detail/discussion helpers will reuse the current activity list and comment list rather than inventing a second data source.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/resource-detail-v2.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/resource-detail-v2.mjs src/views/ResView.vue tests/resource-detail-v2.test.mjs
git commit -m "feat: add resource detail v2 panel renderers"
```

### Task 2: Recompose the raw detail page

**Files:**
- Modify: `src/views/raw/res.html`
- Modify: `src/views/ResView.vue`
- Test: `tests/resource-detail-v2.test.mjs`

**Interfaces:**
- Consumes: `__RES_DETAIL_PANEL__`, `__RES_DISCUSSION_PANEL__`, `__RES_ACTIONS__`, existing preview and attribution slots.
- Produces: a first-screen `fg-v2-layout` with left preview/author/actions and right panel tabs; lower sections retain version, adaptation, about and contributors content.

- [ ] **Step 1: Write the failing test**

```js
test('v2 页面把详情面板放在预览右侧，并把讨论作为同栏切换内容', () => {
  const html = v2.renderPanelLayout({ preview: 'PREVIEW', authorActions: 'AUTHOR_ACTIONS', detail: 'DETAIL', discussion: 'DISCUSSION', lower: 'LOWER' })
  assert.match(html, /class="fg-v2-layout"/)
  assert.match(html, /data-panel="detail"/)
  assert.match(html, /data-panel="discussion"/)
  assert.ok(html.indexOf('fg-v2-panel') < html.indexOf('fg-versions'))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/resource-detail-v2.test.mjs`
Expected: FAIL because the v2 layout helper is missing.

- [ ] **Step 3: Write minimal implementation**

Add `renderPanelLayout(parts)` to produce the left preview/author-actions column and right detail/discussion panel slots. In the raw template, place those slots beside each other, preserve the chart in the detail panel, and leave versions/adaptations after the first-screen block. Add two tab buttons with `data-panel` attributes and a `data-v2-panel-state` container for the in-place switch.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/resource-detail-v2.test.mjs tests/resource-navigation.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/ResView.vue src/views/raw/res.html tests/resource-detail-v2.test.mjs
git commit -m "feat: compose resource detail v2 layout"
```

### Task 3: Add in-place panel interaction and responsive styling

**Files:**
- Modify: `src/views/ResView.vue`
- Modify: `src/styles/global.css`
- Test: `tests/resource-detail-v2.test.mjs`

**Interfaces:**
- Consumes: `data-panel="detail|discussion"`, `data-v2-panel-state`, existing preview click delegation.
- Produces: click behavior that swaps right-panel visibility without dialogs, plus mobile stacking and independent discussion scrolling.

- [ ] **Step 1: Write the failing test**

```js
test('v2 面板状态切换只改变右栏内容，不创建弹窗或抽屉', () => {
  assert.equal(typeof v2.getResourcePanelState, 'function')
  assert.deepEqual(v2.getResourcePanelState('discussion'), { activePanel: 'discussion' })
  assert.match(v2.renderPanelState('discussion'), /data-active-panel="discussion"/)
  assert.doesNotMatch(v2.renderPanelState('discussion'), /modal|drawer|dialog/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/resource-detail-v2.test.mjs`
Expected: FAIL because the panel-state helpers and interaction are missing.

- [ ] **Step 3: Write minimal implementation**

Add `getResourcePanelState` and `renderPanelState` helpers, delegate clicks from the page root, and toggle only the right-panel detail/discussion regions. Add CSS for a two-column first screen, compact tab treatment, chart preservation, and a single-column mobile layout with the panel below the preview.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/resource-detail-v2.test.mjs tests/resource-actions.test.mjs tests/resource-activity.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/ResView.vue src/styles/global.css tests/resource-detail-v2.test.mjs
git commit -m "feat: add resource detail v2 panel interaction"
```

### Task 4: Verify build and browser behavior

**Files:**
- No source changes expected.

- [ ] **Step 1: Run focused tests**

Run: `node --test tests/resource-detail-v2.test.mjs tests/resource-actions.test.mjs tests/resource-activity.test.mjs tests/resource-navigation.test.mjs`
Expected: all focused tests pass.

- [ ] **Step 2: Build the Vite artifact**

Run: `npm run build`
Expected: `dist/index.html` is generated successfully.

- [ ] **Step 3: Start a preview server**

Run: `npm run preview -- --host 127.0.0.1 --port 4173`
Expected: local server reports `http://127.0.0.1:4173/`.

- [ ] **Step 4: Verify visible states**

Open `/?view=res&resource=res-order-game`; confirm detail panel shows the title, application summary and cumulative-use chart. Click `讨论`; confirm only the right panel changes to activity/comments. Check resource actions, owner app actions, adapted attribution, and mobile stacking.

- [ ] **Step 5: Commit only the verified v2 source**

```bash
git status --short
git diff --check HEAD~1
```

Do not stage generated `dist/index.html`, formal HTML, or unrelated module changes.
