import { show, store } from '../store'
import {
  buildResourceUrl,
  getResourceNavigationState,
  getResourceRouteFromSearch,
  isResourceActivationKey,
} from '../resource-navigation.mjs'
import { buildViewUrl, getViewRouteFromSearch } from '../view-navigation.mjs'
import { RESOURCES_BY_ID } from '../data/resources'
import {
  closeAcademySubmission,
  handleAcademySubmissionClick,
  submitAcademyWork,
} from '../lib/academy-submission.mjs'

// 全局点击委托:顶层视图切换走 store(响应式),视图内部的小交互(tab/榜单维度/筛选/头像菜单)保留 DOM 操作。
// 这套逻辑沿用原型里跑通的委托,只把 show() 换成写 store.view。
export function installDelegation() {
  function closeMenus() {
    document.querySelectorAll('.avatar-menu').forEach(function (mn) { mn.style.display = 'none' })
  }
  function go(which, options) {
    var opts = options || {}
    closeMenus()
    show(which)
    if (opts.syncUrl !== false && which !== 'res') {
      var viewUrl = buildViewUrl(window.location.pathname, which)
      if (window.location.pathname + window.location.search !== viewUrl) {
        window.history.pushState({ view: which }, '', viewUrl)
      }
    }
    window.scrollTo(0, 0)
    // 下一帧把该视图 main 滚到顶
    requestAnimationFrame(function () {
      document.querySelectorAll('#view-' + which + ' main').forEach(function (x) { x.scrollTop = 0 })
    })
  }
  function applyResType(rt) {
    var d = document.getElementById('view-discover'); if (!d) return
    d.querySelectorAll('.cgrid .pcard').forEach(function (c) {
      c.style.display = (rt === 'all' || c.getAttribute('data-t') === rt) ? '' : 'none'
    })
  }
  function normalizeCommunityTabs() {
    var rankTabs = document.querySelector('#view-rank .tbar-tabs')
    if (!rankTabs) return
    rankTabs.querySelectorAll('.nav-feed, .nav-local').forEach(function (tab) { tab.remove() })
    var rankTab = rankTabs.querySelector('.nav-rank')
    var discoverTab = rankTabs.querySelector('.nav-discover')
    if (rankTab && discoverTab) rankTabs.insertBefore(rankTab, discoverTab)
  }
  function switchSPanel(id) {
    var v = document.getElementById('view-studio'); if (!v) return
    v.querySelectorAll('.spanel').forEach(function (p) { p.style.display = (p.id === id) ? '' : 'none' })
    v.querySelectorAll('.stab').forEach(function (t) { t.classList.toggle('son', t.getAttribute('data-stab') === id) })
    var body = v.querySelector('.sbody'); if (body) body.classList.toggle('norail', id !== 's-dt')
    var m = v.querySelector('main'); if (m) m.scrollTop = 0
  }
  function showToast(message) {
    var toast = document.createElement('div')
    toast.className = 'fx-toast'
    toast.setAttribute('role', 'status')
    toast.textContent = message
    document.body.appendChild(toast)
    window.setTimeout(function () { toast.remove() }, 1600)
  }

  normalizeCommunityTabs()

  window.addEventListener('popstate', function () {
    var resourceRoute = getResourceRouteFromSearch(
      window.location.search,
      new Set(Object.keys(RESOURCES_BY_ID)),
    )
    if (resourceRoute) {
      store.resourceId = resourceRoute.resourceId
      go(resourceRoute.view, { syncUrl: false })
      return
    }
    var viewRoute = getViewRouteFromSearch(window.location.search)
    if (viewRoute) {
      go(viewRoute.view, { syncUrl: false })
      return
    }
    go('rank', { syncUrl: false })
  })

  document.addEventListener('keydown', function (e) {
    var resourceLink = e.target.closest('[data-resource-id][role="link"]')
    if (!resourceLink || !isResourceActivationKey(e.key)) return
    e.preventDefault()
    resourceLink.click()
  })

  document.addEventListener('submit', function (e) {
    submitAcademyWork(e, document)
  })

  document.addEventListener('click', function (e) {
    if (closeAcademySubmission(e, document)) return
    if (handleAcademySubmissionClick(e, document) === 'open') return

    // 头像下拉菜单
    var trig = e.target.closest('.avatar-trigger')
    if (trig) {
      var mn = trig.parentElement.querySelector('.avatar-menu')
      var open = mn && mn.style.display === 'block'
      closeMenus(); if (mn) mn.style.display = open ? 'none' : 'block'
      return
    }
    if (!e.target.closest('.avatar-menu')) closeMenus()

    // AI 教学工坊课程详情:进入/返回时把 academy 滚动容器复位到顶部(纯 CSS radio 切换不会重置滚动)
    var lpLabel = e.target.closest('label[for^="lp-"]')
    if (lpLabel) {
      requestAnimationFrame(function () {
        document.querySelectorAll('#view-academy .main').forEach(function (x) { x.scrollTop = 0 })
        window.scrollTo(0, 0)
      })
      return
    }

    var slideThumb = e.target.closest('.fg-slide-thumb')
    if (slideThumb) {
      var slideRail = slideThumb.closest('.fg-slide-rail')
      var slideShell = slideThumb.closest('.fg-preview-shell')
      var slideThumbs = Array.from(slideRail.querySelectorAll('.fg-slide-thumb'))
      var slideIndex = slideThumbs.indexOf(slideThumb)
      slideThumbs.forEach(function (item) {
        var isCurrent = item === slideThumb
        item.classList.toggle('is-active', isCurrent)
        if (isCurrent) item.setAttribute('aria-current', 'page')
        else item.removeAttribute('aria-current')
      })
      var slideLabel = slideShell && slideShell.querySelector('.fg-prevbar .fg-chip')
      if (slideLabel) slideLabel.textContent = '课件 · ' + (slideIndex + 1) + ' / ' + slideThumbs.length
      return
    }

    var detailTab = e.target.closest('.fg-tab[data-section]')
    if (detailTab) {
      var detailView = detailTab.closest('#view-res')
      var tabRow = detailTab.closest('.fg-tabs')
      var sectionId = detailTab.getAttribute('data-section')
      var section = detailView && detailView.querySelector('#' + sectionId)
      if (!section && sectionId === 'fg-versions') {
        var lineageLink = detailView.querySelector('.nav-lineage')
        section = lineageLink && lineageLink.parentElement && lineageLink.parentElement.parentElement
      }
      tabRow.querySelectorAll('.fg-tab').forEach(function (item) { item.classList.toggle('on', item === detailTab) })
      if (section) section.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
      return
    }

    var resourceLink = e.target.closest('[data-resource-id]')
    if (resourceLink) {
      var resourceNavigation = getResourceNavigationState(
        resourceLink.getAttribute('data-resource-id'),
        new Set(Object.keys(RESOURCES_BY_ID)),
      )
      if (resourceNavigation) {
        store.resourceId = resourceNavigation.resourceId
        var resourceUrl = buildResourceUrl(window.location.pathname, resourceNavigation.resourceId)
        if (window.location.pathname + window.location.search !== resourceUrl) {
          window.history.pushState(resourceNavigation, '', resourceUrl)
        }
        go(resourceNavigation.view, { syncUrl: false })
      }
      return
    }

    // 一键改编 -> 改前改后 modal
    if (e.target.closest('.nav-adapt')) {
      var vv = e.target.closest('#view-res, #view-skill, [id^="view-"]')
      var md = vv && vv.querySelector('.adapt-modal')
      if (md) md.style.display = 'flex'
      return
    }
    if (e.target.closest('.adapt-close') || e.target.classList.contains('adapt-backdrop')) {
      document.querySelectorAll('.adapt-modal').forEach(function (m) { m.style.display = 'none' })
      return
    }

    var saveCopy = e.target.closest('.fg-save-copy')
    if (saveCopy) {
      saveCopy.textContent = '已保存'
      saveCopy.classList.add('is-done')
      return
    }
    var favorite = e.target.closest('.fg-favorite')
    if (favorite) {
      var isSaved = favorite.classList.toggle('is-done')
      var favoriteLabel = favorite.querySelector('.fg-action-label')
      if (favoriteLabel) favoriteLabel.textContent = isSaved ? '已收藏' : '收藏'
      var favoriteCount = favorite.querySelector('.fg-action-count')
      if (favoriteCount) {
        var count = Number(favoriteCount.getAttribute('data-count') || favoriteCount.textContent.replace(/,/g, ''))
        count += isSaved ? 1 : -1
        favoriteCount.setAttribute('data-count', String(count))
        favoriteCount.textContent = count.toLocaleString('en-US')
      }
      favorite.setAttribute('aria-pressed', isSaved ? 'true' : 'false')
      return
    }
    var shareAction = e.target.closest('.fg-share-action')
    if (shareAction) {
      if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).catch(function () {})
      showToast('链接已复制')
      return
    }

    // 评论三入口(我用过 / 我有改进 / 我想问作者)
    var ft = e.target.closest('.fbtype')
    if (ft) {
      var frow = ft.parentElement
      frow.querySelectorAll('.fbtype').forEach(function (c) {
        c.style.background = '#fff'; c.style.color = '#141F1B'; c.style.border = '1px solid #ECECEC'
      })
      ft.style.background = '#141F1B'; ft.style.color = '#fff'; ft.style.border = 'none'
      var ph = { used: '说说你在课堂上怎么用的、效果如何…', improve: '补充用法,或提出一个改编建议…', ask: '针对教学设计,问作者一个问题…' }[ft.getAttribute('data-ft')]
      var box = frow.parentElement.querySelector('.fbinput span')
      if (box && ph) box.textContent = ph
      return
    }

    var sp = e.target.closest('[data-stab]'); if (sp) { switchSPanel(sp.getAttribute('data-stab')); return }
    var map = [
      ['.nav-res', 'res'], ['.nav-skill', 'skill'], ['.nav-studio', 'studio'],
      ['.nav-mypage', 'studio'], ['.nav-discover', 'discover'], ['.nav-rank', 'rank'],
      ['.nav-academy', 'academy'], ['.nav-share', 'share'],
      ['.nav-report', 'report'], ['.nav-creator', 'creator'],
      ['.nav-monthly', 'monthly'], ['.nav-activity', 'activity'], ['.nav-lineage', 'lineage'], ['.nav-notify', 'notify'], ['.nav-mylib', 'mylib'],
    ]
    for (var i = 0; i < map.length; i++) {
      if (e.target.closest(map[i][0])) { go(map[i][1]); return }
    }
    var rkt = e.target.closest('.rk-tab')
    if (rkt) {
      var rrow = rkt.parentElement
      rrow.querySelectorAll('.rk-tab').forEach(function (c) { c.classList.remove('on') })
      rkt.classList.add('on')
      var dim = rkt.getAttribute('data-dim')
      if (dim) {
        var vr = document.getElementById('view-rank')
        vr.querySelectorAll('.rk-cards').forEach(function (l) { l.style.display = (l.getAttribute('data-dim') === dim) ? '' : 'none' })
      }
      return
    }
    var t2 = e.target.closest('.tchip2')
    if (t2) { var r = t2.parentElement; r.querySelectorAll('.tchip2').forEach(function (c) { c.classList.remove('on') }); t2.classList.add('on'); return }
    var chip = e.target.closest('.chip')
    if (chip) {
      var row = chip.parentElement
      row.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on') })
      chip.classList.add('on')
      if (chip.hasAttribute('data-rt')) applyResType(chip.getAttribute('data-rt'))
      return
    }
  })
}
