<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import raw from './raw/skill.html?raw'
import Sidebar from '../components/Sidebar.vue'

const viewRoot = ref(null)
let cleanupSkillActions = null
let previewTimer = null

function setupSkillActions() {
  const root = viewRoot.value
  const installButton = root?.querySelector('.skill-install')
  const tryButton = root?.querySelector('.skill-try')
  const menuTrigger = root?.querySelector('.skill-install-menu-trigger')
  const menu = root?.querySelector('.skill-install-menu')
  const demo = root?.querySelector('.sk-demo')
  if (!root || !installButton || !tryButton || !menuTrigger || !menu || !demo) return () => {}

  let installed = false
  let enabled = true
  let menuOpen = false

  function renderInstallState() {
    installButton.textContent = installed ? (enabled ? '✓ 已安装' : '已停用') : '安装'
    installButton.disabled = installed
    installButton.setAttribute('aria-pressed', String(installed))
    menuTrigger.hidden = !installed
    menuTrigger.setAttribute('aria-expanded', String(installed && menuOpen))
    menu.hidden = !installed || !menuOpen
  }

  function showToast(message) {
    const toast = document.createElement('div')
    toast.className = 'fx-toast'
    toast.setAttribute('role', 'status')
    toast.textContent = message
    document.body.appendChild(toast)
    window.setTimeout(() => toast.remove(), 1600)
  }

  function previewSkill() {
    if (previewTimer) window.clearTimeout(previewTimer)
    demo.style.borderColor = '#141F1B'
    demo.style.boxShadow = '0 0 0 3px #141F1B, 0 8px 24px rgba(20,16,10,.12)'
    demo.scrollIntoView({ behavior: 'smooth', block: 'center' })
    previewTimer = window.setTimeout(() => {
      demo.style.borderColor = ''
      demo.style.boxShadow = ''
      previewTimer = null
    }, 1600)
  }

  function handleClick(event) {
    const target = event.target
    if (!(target instanceof Element)) return

    if (target.closest('.skill-install')) {
      installed = true
      enabled = true
      menuOpen = false
      renderInstallState()
      showToast('已安装到我的技能包')
      return
    }
    if (target.closest('.skill-try')) {
      previewSkill()
      return
    }
    if (target.closest('.skill-install-menu-trigger') && installed) {
      menuOpen = !menuOpen
      renderInstallState()
      return
    }

    const menuAction = target.closest('[data-skill-menu-action]')
    if (menuAction && installed) {
      if (menuAction.getAttribute('data-skill-menu-action') === 'uninstall') {
        installed = false
        enabled = true
        menuOpen = false
        showToast('已从我的技能包卸载')
      } else {
        enabled = false
        menuOpen = false
        showToast('技能已停用')
      }
      renderInstallState()
      return
    }

    if (menuOpen && !target.closest('.skill-install-menu')) {
      menuOpen = false
      renderInstallState()
    }
  }

  root.addEventListener('click', handleClick)
  renderInstallState()
  return () => root.removeEventListener('click', handleClick)
}

onMounted(() => { cleanupSkillActions = setupSkillActions() })
onBeforeUnmount(() => {
  cleanupSkillActions?.()
  if (previewTimer) window.clearTimeout(previewTimer)
})
</script>

<template>
  <div id="view-skill" ref="viewRoot">
    <div class="page">
      <Sidebar active="community" />
      <div style="display:contents" v-html="raw"></div>
    </div>
  </div>
</template>
