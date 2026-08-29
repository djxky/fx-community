import { show } from '../store'

// 全局点击委托:顶层视图切换走 store(响应式),视图内部的小交互(tab/榜单维度/筛选/头像菜单)保留 DOM 操作。
// 这套逻辑沿用原型里跑通的委托,只把 show() 换成写 store.view。
export function installDelegation() {
  function closeMenus() {
    document.querySelectorAll('.avatar-menu').forEach(function (mn) { mn.style.display = 'none' })
  }
  function go(which) {
    closeMenus()
    show(which)
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
  function switchTab(view) {
    var d = document.getElementById('view-discover'); if (!d) return
    var db = d.querySelector('#disc-body'), fb = d.querySelector('#feed-body')
    if (!db || !fb) return
    d.querySelectorAll('.ntab').forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-view') === view) })
    db.style.display = (view === 'feed') ? 'none' : ''
    fb.style.display = (view === 'feed') ? '' : 'none'
    var m = d.querySelector('main'); if (m) m.scrollTop = 0
  }
  function switchSPanel(id) {
    var v = document.getElementById('view-studio'); if (!v) return
    v.querySelectorAll('.spanel').forEach(function (p) { p.style.display = (p.id === id) ? '' : 'none' })
    v.querySelectorAll('.stab').forEach(function (t) { t.classList.toggle('son', t.getAttribute('data-stab') === id) })
    var body = v.querySelector('.sbody'); if (body) body.classList.toggle('norail', id !== 's-dt')
    var m = v.querySelector('main'); if (m) m.scrollTop = 0
  }

  document.addEventListener('click', function (e) {
    // 头像下拉菜单
    var trig = e.target.closest('.avatar-trigger')
    if (trig) {
      var mn = trig.parentElement.querySelector('.avatar-menu')
      var open = mn && mn.style.display === 'block'
      closeMenus(); if (mn) mn.style.display = open ? 'none' : 'block'
      return
    }
    if (!e.target.closest('.avatar-menu')) closeMenus()

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
    var tb = e.target.closest('.ntab'); if (tb) { switchTab(tb.getAttribute('data-view')); return }
    var map = [
      ['.nav-res', 'res'], ['.nav-skill', 'skill'], ['.nav-studio', 'studio'],
      ['.nav-mypage', 'studio'], ['.nav-discover', 'discover'], ['.nav-rank', 'rank'],
      ['.nav-local', 'local'], ['.nav-academy', 'academy'], ['.nav-share', 'share'],
      ['.nav-report', 'report'], ['.nav-creator', 'creator'],
      ['.nav-monthly', 'monthly'], ['.nav-activity', 'activity'], ['.nav-lineage', 'lineage'], ['.nav-notify', 'notify'],
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
