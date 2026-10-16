// Presenter deck: navigation, fragments, scaling, QR code and the live widgets.
(function () {
  const { api, esc, baseHref } = window.Live
  const SLIDES = window.SLIDES
  const stage = document.getElementById('stage')
  const SHAPES = ['▲', '◆', '●', '■']
  const WORD_COLORS = ['#0B2540', '#1C7C9C', '#FF5A36', '#2E9E6B', '#D9A21B', '#12365A']

  // ---------- presenter key ----------
  const qs = new URLSearchParams(location.search)
  if (qs.get('key')) localStorage.setItem('agileKey', qs.get('key'))
  let KEY = localStorage.getItem('agileKey') || ''
  let keyOk = false
  async function checkKey () {
    if (!KEY) { keyOk = false; return false }
    try { await api('api/admin/ping?key=' + encodeURIComponent(KEY)); keyOk = true } catch (_) { keyOk = false }
    return keyOk
  }
  const withKey = p => p + (p.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(KEY)

  // ---------- build slides ----------
  const els = SLIDES.map((def, i) => {
    const s = document.createElement('section')
    s.className = 'slide ' + (def.cls || '')
    s.dataset.index = i
    s.innerHTML = def.html
    stage.appendChild(s)
    return s
  })

  function fit () {
    const k = Math.min(window.innerWidth / 1600, window.innerHeight / 900)
    stage.style.transform = `scale(${k})`
  }
  window.addEventListener('resize', fit)
  fit()

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
    const changed = i !== idx || !els[i].classList.contains('active')
    if (changed) {
      els[idx].classList.remove('active')
      leave(idx)
      idx = i
      els[idx].classList.add('active')
      enter(idx)
    }
    step = st
    applyStep(idx, step)
    history.replaceState(null, '', '#' + (idx + 1) + (step ? '.' + step : ''))
    document.getElementById('nav-count').textContent = `${idx + 1} / ${SLIDES.length}`
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

  // ---------- widgets lifecycle ----------
  const timers = []
  function every (ms, fn) { fn(); timers.push(setInterval(fn, ms)) }
  function leave () { while (timers.length) clearInterval(timers.pop()) }
  function enter (i) {
    const el = els[i]
    el.querySelectorAll('.live[data-q]').forEach(w => mountLive(w))
    if (el.querySelector('[data-join]')) mountJoin(el)
    el.querySelectorAll('[data-board]').forEach(b => every(2500, () => renderBoard(b, Number(b.dataset.board) || 10)))
    el.querySelectorAll('[data-podium]').forEach(p => every(3000, () => renderPodium(p)))
  }

  // ---------- QR ----------
  let publicUrl = ''
  function joinUrl () {
    if (publicUrl) {
      return /join(\.html)?\/?$/.test(publicUrl) ? publicUrl : publicUrl.replace(/\/?$/, '/') + 'join.html'
    }
    return baseHref() + 'join.html'
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
  setInterval(refreshPlayers, 3000)

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
        if (t && keyOk) act(w, 'hide', { word: t.dataset.word })
      })
    }
  }

  async function act (w, action, extra = {}) {
    const id = w.dataset.q
    if (!keyOk) { openSettings('Enter the presenter key to run live questions.'); return }
    if (action === 'reset' && !confirm('Reset all answers to this question?')) return
    try {
      await api(`api/admin/question/${id}/${action}`, { method: 'POST', body: Object.assign({ key: KEY }, extra) })
      await pollLive(w)
    } catch (e) { w.querySelector('.msg').textContent = e.message }
  }

  async function pollLive (w) {
    const id = w.dataset.q
    if (!keyOk) {
      if (!w.dataset.built) {
        try { const q = await api('api/public/question/' + id); buildLive(w, q); w.dataset.built = '1' } catch (e) { w.innerHTML = `<p class="msg">${esc(e.message)}</p>` }
      }
      const m = w.querySelector('.msg')
      if (m) m.textContent = 'Presenter key missing: press , to open settings'
      return
    }
    let d
    try { d = await api(withKey('api/admin/question/' + id)) } catch (e) {
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

  // ---------- settings ----------
  const settings = document.getElementById('settings')
  function openSettings (msg) {
    document.getElementById('set-key').value = KEY
    document.getElementById('set-url').value = publicUrl
    document.getElementById('key-status').textContent = msg || (keyOk ? 'Key accepted: live controls are on.' : 'No valid key yet: the live controls are off.')
    settings.hidden = false
    document.getElementById('set-key').focus()
  }
  document.getElementById('set-close').onclick = () => { settings.hidden = true }
  document.getElementById('nav-menu').onclick = () => openSettings()
  document.getElementById('set-save').onclick = async () => {
    KEY = document.getElementById('set-key').value.trim()
    localStorage.setItem('agileKey', KEY)
    const ok = await checkKey()
    document.getElementById('key-status').textContent = ok ? 'Key accepted: live controls are on.' : 'This key was rejected. Check adminKey in config.json.'
    if (ok) {
      const url = document.getElementById('set-url').value.trim()
      try { await api('api/admin/config', { method: 'POST', body: { key: KEY, publicUrl: url } }); publicUrl = url } catch (_) {}
      drawAllQr()
      els[idx].querySelectorAll('.live').forEach(w => { w.dataset.built = ''; pollLive(w) })
      settings.hidden = true
    }
  }
  async function resetAll (keepPlayers) {
    if (!keyOk) { document.getElementById('key-status').textContent = 'Save a valid key first.'; return }
    const msg = keepPlayers ? 'Clear every answer and score? Students stay joined.' : 'Clear every answer, score and student? Everyone will need to join again.'
    if (!confirm(msg)) return
    await api('api/admin/reset-all', { method: 'POST', body: { key: KEY, keepPlayers } })
    document.getElementById('key-status').textContent = keepPlayers ? 'All answers cleared.' : 'Answers and students cleared.'
    refreshPlayers()
  }
  document.getElementById('set-reset-answers').onclick = () => resetAll(true)
  document.getElementById('set-reset-all').onclick = () => resetAll(false)

  // ---------- QR overlay ----------
  const overlay = document.getElementById('qr-overlay')
  const toggleQr = () => { overlay.hidden = !overlay.hidden }
  document.getElementById('hud').onclick = toggleQr
  document.getElementById('qr-close').onclick = toggleQr

  // ---------- keyboard ----------
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) { if (e.key === 'Escape') settings.hidden = true; return }
    if (!settings.hidden) { if (e.key === 'Escape') settings.hidden = true; return }
    const k = e.key
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next() }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev() }
    else if (k === 'Home') show(0, 0)
    else if (k === 'End') show(SLIDES.length - 1, 0)
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}) }
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
  document.getElementById('nav-next').onclick = next
  document.getElementById('nav-prev').onclick = prev
  window.addEventListener('hashchange', () => { const [i, s] = fromHash(); if (i !== idx || s !== step) show(i, s) })

  // ---------- start ----------
  ;(async function init () {
    try { publicUrl = (await api('api/config')).publicUrl || '' } catch (_) {}
    await checkKey()
    drawAllQr()
    refreshPlayers()
    const [i, s] = fromHash()
    idx = i
    els[i].classList.add('active')
    enter(i)
    show(i, s)
    if (!keyOk) setTimeout(() => openSettings('Enter the presenter key once to run live questions. It is saved in this browser.'), 600)
  })()
})()
