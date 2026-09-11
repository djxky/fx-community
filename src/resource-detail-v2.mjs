const VALID_PANEL_MODES = new Set(['detail', 'discussion'])

export function getResourcePanelState(mode) {
  return { activePanel: VALID_PANEL_MODES.has(mode) ? mode : 'detail' }
}

export function renderPanelTabs(activePanel = 'detail') {
  const mode = getResourcePanelState(activePanel).activePanel
  return `<div class="fg-v2-panel-tabs" role="tablist" aria-label="资源详情面板">
    <button class="fg-v2-panel-tab${mode === 'detail' ? ' is-active' : ''}" type="button" data-panel="detail" role="tab" aria-selected="${mode === 'detail'}">详情</button>
    <button class="fg-v2-panel-tab${mode === 'discussion' ? ' is-active' : ''}" type="button" data-panel="discussion" role="tab" aria-selected="${mode === 'discussion'}">讨论</button>
  </div>`
}

export function renderPanelState(activePanel = 'detail') {
  const mode = getResourcePanelState(activePanel).activePanel
  return `<div class="fg-v2-panel-state" data-v2-panel-state data-active-panel="${mode}" aria-live="polite"></div>`
}

export function renderPanelLayout({ preview = '', authorActions = '', detail = '', discussion = '', lower = '' } = {}) {
  return `<section class="fg-v2-layout">
    <div class="fg-v2-left">${preview}${authorActions}</div>
    <aside class="fg-v2-panel">
      <div class="fg-v2-panel-head">${renderPanelTabs('detail')}</div>
      ${renderPanelState('detail')}
      <div class="fg-v2-panel-content" data-v2-panel-content>
        <section class="fg-v2-panel-section" data-v2-panel="detail">${detail}</section>
        <section class="fg-v2-panel-section" data-v2-panel="discussion" hidden>${discussion}</section>
      </div>
    </aside>
  </section>
  <section class="fg-v2-lower">${lower}</section>`
}
