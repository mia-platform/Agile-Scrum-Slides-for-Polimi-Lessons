// Presenter deck: navigation, fragments, scaling, QR code and the live widgets.
// The active session (titles, speaker, hidden slides) comes from /api/deck; live controls
// need an admin signed in (cookie session from /auth).
(function () {
  const { api, esc, baseHref, withShare, slideKey } = window.Live
  const ALL = window.SLIDES
  let SLIDES = ALL
  const stage = document.getElementById('stage')
  // Export to PDF: index.html?print=1 lays every slide out as a page (admins can add &session=ID)
  const PQS = new URLSearchParams(location.search)
  const PRINT = PQS.has('print')
  const PRINT_SESSION = PQS.get('session')
  const PREVIEW_KEY = PQS.get('preview')
  const START_KEY = PQS.get('slide')
  let slideEntries = []
  const SHAPES = ['▲', '◆', '●', '■']
  const WORD_COLORS = ['#0B2540', '#1C7C9C', '#FF5A36', '#2E9E6B', '#D9A21B', '#12365A']

  // ---------- admin session ----------
  let authed = false
  let me = null
  async function checkAuth () {
    try {
      const d = await api('auth/me')
      me = d.user
      authed = !!(me && me.roles && me.roles.includes('admin'))
    } catch (_) { authed = false; me = null }
    return authed
  }

  // ---------- deck configuration ----------
  let deck = { hiddenSlides: [], speaker: {} }
  const get = (obj, p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
  function assetUrl (v) {
    if (!v) return ''
    if (/^(data:|https?:)/.test(v)) return v
    return withShare(baseHref() + v.replace(/^\/+/, ''))
  }
  function applyDeck (root) {
    root.querySelectorAll('[data-deck]').forEach(n => {
      const v = get(deck, n.dataset.deck)
      if (v != null && v !== '') n.textContent = v
    })
    root.querySelectorAll('[data-deck-img]').forEach(n => {
      const v = get(deck, n.dataset.deckImg)
      if (v) n.src = assetUrl(v)
    })
    root.querySelectorAll('[data-deck-list]').forEach(n => {
      const v = get(deck, n.dataset.deckList) || []
      n.innerHTML = v.map(x => `<span>${esc(x)}</span>`).join('')
    })
    root.querySelectorAll('[data-media-src]').forEach(n => {
      const m = (deck.media || {})[n.dataset.mediaSrc]
      if (!m) return
      const u = window.Live.apiUrl('api/media/' + n.dataset.mediaSrc)
      n.setAttribute('href', u + (u.includes('?') ? '&' : '?') + 'v=' + m.v)
    })
    root.querySelectorAll('[data-media-credit]').forEach(n => {
      const m = (deck.media || {})[n.dataset.mediaCredit]
      n.textContent = m && m.credit ? m.credit : ''
    })
    root.querySelectorAll('[data-agenda]').forEach(n => {
      const sel = Array.isArray(deck.chapters) && deck.chapters.length ? deck.chapters : null
      const list = window.DeckOrder.orderedChapters(deck).filter(c => (!sel || sel.includes(c.id)) && c.id !== 'intro' && c.id !== 'wrapup')
      n.innerHTML = list.map((c, i) => `<div class="stop"><b>${i + 1}</b><div><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p></div></div>`).join('')
    })
  }
  function keysFor (list) {
    const seen = {}
    return list.map(d => {
      let k = slideKey(d)
      if (seen[k]) { seen[k]++; k = k + '-' + seen[k] } else seen[k] = 1
      return k
    })
  }

  // ---------- build slides ----------
  let els = []
  function build () {
    const keys = keysFor(ALL)
    const hidden = new Set(deck.hiddenSlides || [])
    const sel = Array.isArray(deck.chapters) && deck.chapters.length ? new Set(deck.chapters) : null
    const media = deck.media || {}
    const replaced = new Set(ALL.filter(d => d.needsMedia && media[d.needsMedia]).flatMap(d => d.replaces || []))
    const ordered = window.DeckOrder.orderSlides(ALL, deck)
    slideEntries = ordered.filter(x => !hidden.has(x.key) && (!sel || sel.has(x.def.chapter)) && (!x.def.needsMedia || media[x.def.needsMedia]) && !replaced.has(x.key))
    if (!slideEntries.length) slideEntries = ordered
    if (PREVIEW_KEY) slideEntries = ordered.filter(x => x.key === PREVIEW_KEY)
    SLIDES = slideEntries.map(x => x.def)
    if (!SLIDES.length) throw new Error('This slide is unavailable')
    stage.innerHTML = ''
    els = SLIDES.map((def, i) => {
      const s = document.createElement('section')
      s.className = 'slide ' + (def.cls || '')
      s.dataset.index = i
      s.innerHTML = def.html
      applyDeck(s)
      stage.appendChild(s)
      return s
    })
    if (deck.title) document.title = deck.title
  }

  function fit () {
    if (PRINT) return
    const viewport = document.getElementById('viewport')
    const k = Math.min(viewport.clientWidth / 1600, viewport.clientHeight / 900)
    stage.style.transform = `scale(${k}) translate(-50%, -50%)`
  }
  window.addEventListener('resize', fit)
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit)
  if (window.ResizeObserver) new ResizeObserver(fit).observe(document.getElementById('viewport'))
  fit()

  // Fullscreen must start from a click or keyboard gesture.
  const fullscreenButton = document.getElementById('nav-fullscreen')
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement
  let controlsTimer
  function revealControls () {
    clearTimeout(controlsTimer)
    document.body.classList.remove('controls-idle')
    if (fullscreenElement()) controlsTimer = setTimeout(() => {
      if (document.getElementById('settings').hidden && document.getElementById('qr-overlay').hidden && document.getElementById('slide-jump').hidden) document.body.classList.add('controls-idle')
    }, 2400)
  }
  function syncFullscreen () {
    const active = !!fullscreenElement()
    document.body.classList.toggle('is-fullscreen', active)
    fullscreenButton.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen')
    fullscreenButton.setAttribute('aria-pressed', String(active))
    fullscreenButton.title = active ? 'Exit fullscreen (F or Esc)' : 'Fullscreen (F)'
    revealControls()
    fit()
  }
  async function toggleFullscreen () {
    try {
      if (fullscreenElement()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen
        await exit.call(document)
      } else {
        const root = document.documentElement
        const request = root.requestFullscreen || root.webkitRequestFullscreen
        if (!request) throw new Error('Fullscreen unavailable')
        await request.call(root)
      }
    } catch (_) {
      alert('Fullscreen is unavailable in this embedded preview. Open the presentation in a browser window, then click Fullscreen or press F.')
    }
  }
  fullscreenButton.onclick = toggleFullscreen
  document.addEventListener('fullscreenchange', syncFullscreen)
  document.addEventListener('webkitfullscreenchange', syncFullscreen)
  document.addEventListener('pointermove', revealControls, { passive:true })
  document.addEventListener('pointerdown', revealControls, { passive:true })
  document.addEventListener('keydown', revealControls)
  syncFullscreen()

  // ---------- navigation ----------
  let idx = 0
  let step = 0
  const fromHash = () => {
    const m = /^#(\d+)(?:\.(\d+))?/.exec(location.hash)
    return m ? [Math.min(SLIDES.length - 1, Math.max(0, Number(m[1]) - 1)), Number(m[2] || 0)] : [0, 0]
  }

  function applyStep (i, st) {
    const el = els[i]
    el.querySelectorAll('[data-step]').forEach(f => {
      const from = Number(f.dataset.step)
      const until = f.dataset.until != null ? Number(f.dataset.until) : Infinity
      f.classList.toggle('on', st >= from && st <= until)
    })
    const def = SLIDES[i]
    if (def.onStep) { try { def.onStep(el, st) } catch (e) { console.error(e) } }
  }

  function show (i, st) {
    if (PRINT) return
    const changed = i !== idx || !els[i].classList.contains('active')
    if (changed) {
      if (els[idx]) els[idx].classList.remove('active')
      leave()
      idx = i
      els[idx].classList.add('active')
      enter(idx)
    }
    step = st
    document.documentElement.style.setProperty('--presentation-bg', getComputedStyle(els[idx]).backgroundColor)
    applyStep(idx, step)
    history.replaceState(null, '', location.search + '#' + (idx + 1) + (step ? '.' + step : ''))
    const ch = (window.CHAPTERS || []).find(c => c.id === SLIDES[idx].chapter)
    document.getElementById('nav-count').textContent = `${idx + 1} / ${SLIDES.length}` + (ch ? ` · ${ch.title}` : '') + ' ▾'
    document.getElementById('jump-number').value = idx + 1
    document.querySelector('#progress i').style.width = ((idx + 1) / SLIDES.length * 100) + '%'
  }
  function next () {
    const max = SLIDES[idx].steps || 0
    if (step < max) show(idx, step + 1)
    else if (idx < SLIDES.length - 1) show(idx + 1, 0)
  }
  function prev () {
    if (step > 0) show(idx, step - 1)
    else if (idx > 0) show(idx - 1, SLIDES[idx - 1].steps || 0)
  }

  // ---------- slide chooser ----------
  const jump = document.getElementById('slide-jump')
  const jumpNumber = document.getElementById('jump-number')
  const jumpSelect = document.getElementById('jump-select')
  const jumpFrame = document.getElementById('jump-preview')
  const jumpButton = document.getElementById('nav-count')
  function previewJump (i) {
    const entry = slideEntries[i]
    if (!entry) return
    jumpNumber.value = i + 1
    jumpSelect.value = String(i)
    jumpFrame.src = window.SlidePreview.url(entry.key, deck.sessionId)
  }
  function closeJump () {
    jump.hidden = true
    jumpButton.setAttribute('aria-expanded', 'false')
    jumpFrame.src = 'about:blank'
    revealControls()
    jumpButton.focus()
  }
  function openJump () {
    jumpSelect.innerHTML = slideEntries.map((entry, i) => `<option value="${i}">${i + 1}. ${esc(window.Live.slideTitle(entry.def))}</option>`).join('')
    jumpNumber.max = SLIDES.length
    jump.hidden = false
    jumpButton.setAttribute('aria-expanded', 'true')
    revealControls()
    previewJump(idx)
    jumpNumber.focus()
    jumpNumber.select()
  }
  function jumpToNumber () {
    const number = jumpNumber.valueAsNumber
    if (!Number.isInteger(number) || number < 1 || number > SLIDES.length) { jumpNumber.reportValidity(); return }
    closeJump()
    show(number - 1, 0)
  }
  jumpButton.onclick = () => jump.hidden ? openJump() : closeJump()
  document.getElementById('jump-close').onclick = closeJump
  jumpSelect.onchange = () => previewJump(Number(jumpSelect.value))
  jumpNumber.oninput = () => {
    const i = jumpNumber.valueAsNumber - 1
    if (Number.isInteger(i) && i >= 0 && i < SLIDES.length) previewJump(i)
  }
  document.getElementById('jump-form').onsubmit = e => { e.preventDefault(); jumpToNumber() }
  document.getElementById('jump-present').onclick = jumpToNumber
  document.addEventListener('pointerdown', e => {
    if (!jump.hidden && !jump.contains(e.target) && !jumpButton.contains(e.target)) closeJump()
  })

  // ---------- widgets lifecycle ----------
  const timers = []
  function every (ms, fn) { fn(); timers.push(setInterval(fn, ms)) }
  function leave () { while (timers.length) clearInterval(timers.pop()); activeLive = null }
  function enter (i) {
    const el = els[i]
    const def = SLIDES[i]
    if (def.onEnter) { try { def.onEnter(el) } catch (e) { console.error(e) } }
    el.querySelectorAll('.live[data-q]').forEach(w => mountLive(w))
    if (el.querySelector('[data-join]')) mountJoin(el)
    el.querySelectorAll('[data-board]').forEach(b => every(2500, () => renderBoard(b, Number(b.dataset.board) || 10)))
    el.querySelectorAll('[data-podium]').forEach(p => every(3000, () => renderPodium(p)))
  }

  // ---------- QR ----------
  function joinUrl () {
    const publicUrl = deck.publicUrl || ''
    if (publicUrl) {
      try {
        const u = new URL(publicUrl)
        if (!/join(\.html)?\/?$/.test(u.pathname)) u.pathname = u.pathname.replace(/\/?$/, '/') + 'join.html'
        return u.toString()
      } catch (_) {
        return publicUrl
      }
    }
    return withShare(baseHref() + 'join.html')
  }
  function drawQr (node, size) {
    if (!node) return
    node.innerHTML = ''
    if (!window.QRCode) { node.textContent = joinUrl(); return }
    // eslint-disable-next-line no-new
    new window.QRCode(node, { text: joinUrl(), width: size, height: size, colorDark: '#0B2540', colorLight: '#FFFFFF', correctLevel: window.QRCode.CorrectLevel.M })
  }
  function drawAllQr () {
    drawQr(document.getElementById('hud-qr'), 128)
    drawQr(document.getElementById('qr-big'), 520)
    document.getElementById('qr-url').textContent = joinUrl()
    els.forEach(el => {
      const q = el.querySelector('[data-qr]')
      if (q) { drawQr(q, 408); el.querySelector('[data-url]').textContent = joinUrl() }
    })
  }

  let players = 0
  let names = []
  async function refreshPlayers () {
    try {
      const d = await api('api/leaderboard?limit=50')
      players = d.players
      names = d.top.map(t => t.name)
    } catch (_) { /* keep last value */ }
    document.getElementById('hud-players').textContent = players
    document.getElementById('qr-players').textContent = players
  }
  if (!PREVIEW_KEY) setInterval(refreshPlayers, 3000)

  function mountJoin (el) {
    every(2000, async () => {
      await refreshPlayers()
      el.querySelector('[data-players]').textContent = players
      el.querySelector('[data-names]').innerHTML = names.slice(0, 40).map(n => `<span>${esc(n)}</span>`).join('')
    })
  }

  // ---------- leaderboard ----------
  async function renderBoard (node, limit) {
    try {
      const d = await api('api/leaderboard?limit=' + limit)
      node.innerHTML = d.top.length
        ? d.top.map((p, i) => `<div class="row"><span class="pos">${i + 1}</span><span>${esc(p.name)}</span><span class="pts">${p.score.toLocaleString('en-US')}</span></div>`).join('')
        : '<p class="empty">No points yet. Scan the QR code and answer the next question.</p>'
    } catch (e) { node.innerHTML = `<p class="empty">${esc(e.message)}</p>` }
  }
  async function renderPodium (node) {
    try {
      const d = await api('api/leaderboard?limit=3')
      const t = d.top
      const key = JSON.stringify(t)
      if (node.dataset.key === key) return
      node.dataset.key = key
      const slot = (p, n) => p
        ? `<div class="p p${n}"><div class="nm">${esc(p.name)}</div><div class="sc">${p.score.toLocaleString('en-US')} pts</div><div class="block">${n}</div></div>`
        : `<div class="p p${n}"><div class="nm">—</div><div class="sc">&nbsp;</div><div class="block">${n}</div></div>`
      node.innerHTML = slot(t[1], 2) + slot(t[0], 1) + slot(t[2], 3)
    } catch (e) { node.innerHTML = `<p class="empty">${esc(e.message)}</p>` }
  }

  // ---------- live question widget ----------
  let activeLive = null
  let clockOffset = 0

  function typeLabel (q) {
    if (q.type === 'quiz') return `Quiz · up to ${(q.points || 1000).toLocaleString('en-US')} pts`
    if (q.type === 'poll') return 'Poll'
    return 'Word cloud'
  }

  function buildLive (w, q) {
    const opts = q.type === 'wordcloud'
      ? '<div class="cloud"><p class="empty">Words will appear here as students send them.</p></div>'
      : `<div class="opts">${(q.options || []).map((o, i) => `<div class="opt o${i}" data-i="${i}"><span class="fill"></span><span class="sh">${SHAPES[i]}</span><span class="txt">${esc(o)}</span><span class="n"></span></div>`).join('')}</div>`
    w.innerHTML = `
      <div class="q-head"><span class="q-type ${q.type}">${typeLabel(q)}</span><span class="msg"></span></div>
      <h3 class="q-prompt">${esc(q.prompt)}</h3>
      ${opts}
      <div class="tbar" hidden><i></i></div>
      <div class="bar-row">
        <div class="status"><span class="dot"></span><span class="st-text">Ready</span></div>
        <span class="count">0</span><span style="font-size:22px">answers</span>
        <span class="timer"></span>
        <button class="btn go" data-act="start">Start</button>
        <button class="btn stop" data-act="stop">Stop</button>
        ${q.type === 'quiz' ? '<button class="btn" data-act="reveal">Reveal</button>' : ''}
        <button class="btn ghost" data-act="reset">Reset</button>
      </div>`
    w.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => act(w, b.dataset.act)))
    if (q.type === 'wordcloud') {
      w.querySelector('.cloud').addEventListener('click', e => {
        const t = e.target.closest('.w')
        if (t && authed) act(w, 'hide', { word: t.dataset.word })
      })
    }
  }

  async function act (w, action, extra = {}) {
    const id = w.dataset.q
    if (!authed) { openSettings('Sign in to run live questions.'); return }
    if (action === 'reset' && !confirm('Reset all answers to this question?')) return
    try {
      await api(`api/admin/question/${id}/${action}`, { method: 'POST', body: extra })
      await pollLive(w)
    } catch (e) {
      if (e.status === 401 || e.status === 403) { authed = false; openSettings('Your session expired: sign in again.') }
      const m = w.querySelector('.msg'); if (m) m.textContent = e.message
    }
  }

  async function pollLive (w) {
    const id = w.dataset.q
    if (!authed) {
      if (!w.dataset.built) {
        try { const q = await api('api/public/question/' + id); buildLive(w, q); w.dataset.built = '1' } catch (e) { w.innerHTML = `<p class="msg">${esc(e.message)}</p>` }
      }
      const m = w.querySelector('.msg')
      if (m) m.textContent = 'Not signed in: press , to sign in and run this question'
      return
    }
    let d
    try { d = await api('api/admin/question/' + id) } catch (e) {
      if (e.status === 401 || e.status === 403) { authed = false; w.dataset.built = ''; return pollLive(w) }
      const m = w.querySelector('.msg'); if (m) m.textContent = e.message
      return
    }
    clockOffset = d.serverNow - Date.now()
    if (w.dataset.built !== '2') { buildLive(w, d.question); w.dataset.built = '2' }
    w._data = d
    renderLive(w, d)
  }

  function renderLive (w, d) {
    const q = d.question
    const r = d.results
    w.querySelector('.msg').textContent = ''
    w.querySelector('.count').textContent = r.count
    const dot = w.querySelector('.dot')
    dot.className = 'dot ' + d.status
    const label = { idle: 'Ready to start', open: 'Answers open', closed: d.revealed ? 'Answer revealed' : 'Answers closed' }[d.status]
    w.querySelector('.st-text').textContent = `${label} · ${d.players} joined`
    w.querySelector('[data-act="start"]').textContent = d.status === 'idle' ? 'Start' : 'Restart'
    w.querySelector('[data-act="stop"]').disabled = d.status !== 'open'
    const rev = w.querySelector('[data-act="reveal"]')
    if (rev) rev.disabled = d.status === 'idle' || d.revealed
    w.classList.toggle('revealed', !!d.revealed)

    if (q.type === 'wordcloud') {
      const cloud = w.querySelector('.cloud')
      const words = r.words || []
      if (!words.length) { cloud.innerHTML = '<p class="empty">Words will appear here as students send them.</p>'; return }
      const max = words[0].n
      cloud.innerHTML = words.map((x, i) => {
        const size = Math.round(28 + 74 * (x.n / max))
        return `<span class="w" data-word="${esc(x.text)}" title="Click to hide" style="font-size:${size}px;color:${WORD_COLORS[i % WORD_COLORS.length]}">${esc(x.text)}</span>`
      }).join('')
      return
    }
    const hide = q.type === 'quiz' && d.status === 'open'
    const total = Math.max(1, r.count)
    w.querySelectorAll('.opt').forEach((o, i) => {
      const n = (r.counts || [])[i] || 0
      o.querySelector('.n').textContent = hide ? '' : n
      o.querySelector('.fill').style.width = hide ? '0' : (n / total * 100) + '%'
      o.classList.toggle('right', !!d.revealed && i === q.correct)
      o.classList.toggle('wrong', !!d.revealed && i !== q.correct)
    })
  }

  function tickTimer () {
    const w = activeLive
    if (!w || !w._data) return
    const d = w._data
    const t = w.querySelector('.timer')
    const bar = w.querySelector('.tbar')
    if (d.status === 'open' && d.endsAt) {
      const left = Math.max(0, d.endsAt - (Date.now() + clockOffset))
      t.textContent = Math.ceil(left / 1000) + 's'
      t.classList.toggle('low', left < 5000)
      bar.hidden = false
      bar.querySelector('i').style.width = (left / (d.endsAt - d.startedAt) * 100) + '%'
      if (left === 0 && !w._closing) { w._closing = true; setTimeout(() => { w._closing = false; pollLive(w) }, 600) }
    } else {
      t.textContent = ''
      bar.hidden = true
    }
  }
  setInterval(tickTimer, 250)

  function mountLive (w) {
    activeLive = w
    every(1000, () => pollLive(w))
  }

  // ---------- presenter panel ----------
  const settings = document.getElementById('settings')
  const $ = id => document.getElementById(id)
  $('open-admin').href = withShare(baseHref() + 'admin.html')
  $('open-pdf').href = withShare(baseHref() + 'index.html?print=1')
  function renderPanel (msg) {
    $('signin-box').hidden = authed
    $('signed-box').hidden = !authed
    $('si-who').textContent = me ? (me.name || me.email) : ''
    $('key-status').textContent = msg || ''
  }
  function openSettings (msg) {
    renderPanel(msg)
    settings.hidden = false
    if (!authed) $('si-email').focus()
  }
  $('set-close').onclick = () => { settings.hidden = true }
  $('nav-menu').onclick = () => openSettings()
  $('signin-form').addEventListener('submit', async e => {
    e.preventDefault()
    try {
      await api('auth/login', { method: 'POST', body: { email: $('si-email').value, password: $('si-pass').value } })
      $('si-pass').value = ''
      await checkAuth()
      if (!authed) { renderPanel('This account is not an admin.'); return }
      renderPanel('Signed in.')
      els[idx].querySelectorAll('.live').forEach(w => { w.dataset.built = ''; pollLive(w) })
      setTimeout(() => { settings.hidden = true }, 600)
    } catch (err) { renderPanel(err.message) }
  })
  $('si-out').onclick = async () => {
    try { await api('auth/logout', { method: 'POST', body: {} }) } catch (_) {}
    authed = false; me = null
    renderPanel('Signed out.')
    els[idx].querySelectorAll('.live').forEach(w => { w.dataset.built = ''; pollLive(w) })
  }
  async function resetAll (keepPlayers) {
    const msg = keepPlayers ? 'Clear every answer and score of this session? Students stay joined.' : 'Clear every answer, score and student of this session? Everyone will need to join again.'
    if (!confirm(msg)) return
    try {
      await api('api/admin/reset-all', { method: 'POST', body: { keepPlayers } })
      renderPanel(keepPlayers ? 'All answers cleared.' : 'Answers and students cleared.')
      refreshPlayers()
    } catch (e) { renderPanel(e.message) }
  }
  $('set-reset-answers').onclick = () => resetAll(true)
  $('set-reset-all').onclick = () => resetAll(false)

  // ---------- QR overlay ----------
  const overlay = $('qr-overlay')
  const toggleQr = () => { overlay.hidden = !overlay.hidden }
  $('hud').onclick = toggleQr
  $('qr-close').onclick = toggleQr

  // ---------- keyboard ----------
  document.addEventListener('keydown', e => {
    if (PREVIEW_KEY) return
    if (!jump.hidden) { if (e.key === 'Escape') { e.preventDefault(); closeJump() }; return }
    if (e.target.closest('button, a') && (e.key === 'Enter' || e.key === ' ')) return
    if (e.target.closest('input, textarea, select')) { if (e.key === 'Escape') settings.hidden = true; return }
    if (!settings.hidden) { if (e.key === 'Escape') settings.hidden = true; return }
    const k = e.key
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next() }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev() }
    else if (k === 'Home') show(0, 0)
    else if (k === 'End') show(SLIDES.length - 1, 0)
    else if (k === 'f' || k === 'F') { e.preventDefault(); toggleFullscreen() }
    else if (k === 'q' || k === 'Q') toggleQr()
    else if (k === 'Escape') overlay.hidden = true
    else if (k === ',') openSettings()
    else if (k === 'h' || k === 'H') document.body.classList.toggle('hide-hud')
    else {
      const w = els[idx].querySelector('.live[data-q]')
      if (!w) return
      if (k === 's' || k === 'S') act(w, 'start')
      else if (k === 'x' || k === 'X') act(w, 'stop')
      else if (k === 'r' || k === 'R') act(w, 'reveal')
    }
  })
  $('nav-next').onclick = next
  $('nav-prev').onclick = prev
  window.addEventListener('hashchange', () => { const [i, s] = fromHash(); if (i !== idx || s !== step) show(i, s) })

  // ---------- start ----------
  // ---------- export to PDF ----------
  async function printDeck () {
    document.body.classList.add('print-mode')
    window.removeEventListener('resize', fit)
    stage.style.transform = ''
    const zoom = () => document.documentElement.style.setProperty('--pz', Math.min(1, (window.innerWidth - 40) / 1600))
    zoom()
    window.addEventListener('resize', zoom)
    const bar = document.createElement('div')
    bar.id = 'print-bar'
    bar.innerHTML = '<b>' + esc(deck.title || 'Deck') + '</b><span>' + SLIDES.length + ' slides</span><span id="print-status">Preparing the pages…</span>' +
      '<button class="btn" id="print-go" disabled>Save as PDF</button>' +
      '<small>In the print dialog pick “Save as PDF” as the destination: page size, margins and backgrounds are already set.</small>'
    document.body.prepend(bar)
    await refreshPlayers()
    els.forEach((el, i) => {
      const def = SLIDES[i]
      el.classList.add('active')
      try { if (def.onEnter) def.onEnter(el) } catch (e) { console.error(e) }
      applyStep(i, def.steps || 0)
      el.querySelectorAll('.live[data-q]').forEach(w => pollLive(w))
      el.querySelectorAll('[data-board]').forEach(b => renderBoard(b, Number(b.dataset.board) || 10))
      el.querySelectorAll('[data-podium]').forEach(p => renderPodium(p))
      const jp = el.querySelector('[data-players]')
      if (jp) jp.textContent = players
    })
    drawAllQr()
    const imgs = [...document.images].map(img => img.complete ? null : new Promise(resolve => { img.onload = img.onerror = resolve }))
    await Promise.all([document.fonts ? document.fonts.ready : null, ...imgs])
    await new Promise(resolve => setTimeout(resolve, 2200))
    document.getElementById('print-status').textContent = 'Ready'
    const go = document.getElementById('print-go')
    go.disabled = false
    go.onclick = () => window.print()
    window.print()
  }

  ;(async function init () {
    try { deck = Object.assign(deck, await api('api/deck' + (PRINT_SESSION ? '?session=' + encodeURIComponent(PRINT_SESSION) : ''))) } catch (e) { console.warn('Deck settings unavailable, using defaults:', e.message) }
    build()
    await checkAuth()
    if (PRINT) return printDeck()
    if (PREVIEW_KEY) {
      document.body.classList.add('single-preview')
      const el = els[0]
      const def = SLIDES[0]
      el.classList.add('active')
      document.documentElement.style.setProperty('--presentation-bg', getComputedStyle(el).backgroundColor)
      if (def.onEnter) { try { def.onEnter(el) } catch (_) {} }
      for (let st = 0; st <= (def.steps || 0); st++) applyStep(0, st)
      el.querySelectorAll('.live[data-q]').forEach(w => pollLive(w))
      return
    }
    drawAllQr()
    refreshPlayers()
    let [i, s] = fromHash()
    if (START_KEY) { const target = slideEntries.findIndex(x => x.key === START_KEY); if (target >= 0) { i = target; s = 0 } }
    idx = i
    els[i].classList.add('active')
    enter(i)
    show(i, s)
    if (!authed) setTimeout(() => openSettings('Sign in once to run live questions. The session lasts 7 days in this browser.'), 600)
  })()
})()
