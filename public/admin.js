// Admin console: sign in, lesson sessions, per-session personalization, results, account.
(function () {
  const { api, esc, withShare, baseHref, slideTitle, slideKey } = window.Live
  const $ = id => document.getElementById(id)
  const SLIDES = window.SLIDES || []
  let me = null
  let sessions = []
  let activeId = null
  let editing = null // { session, config, defaultQuestions }
  let photo = null

  const msg = (id, text, kind) => { const n = $(id); n.textContent = text || ''; n.className = 'msg' + (kind ? ' ' + kind : '') }
  const fmtDate = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  $('link-deck').href = withShare(baseHref() + 'index.html')
  $('link-join').href = withShare(baseHref() + 'join.html')
  $('e-preview').href = withShare(baseHref() + 'index.html')

  // ---------- auth ----------
  async function boot () {
    let d
    try { d = await api('auth/me') } catch (e) { $('auth').hidden = false; msg('login-msg', 'The server is not reachable: ' + e.message, 'err'); return }
    me = d.user
    if (me && me.roles.includes('admin')) return showApp()
    $('app').hidden = true
    $('auth').hidden = false
    $('who').hidden = true
    $('logout').hidden = true
    if (d.needsSetup) showSignup('setup')
    else showLogin(me ? 'This account is not an admin.' : '')
  }
  function showLogin (text) {
    $('login-box').hidden = false
    $('signup-box').hidden = true
    msg('login-msg', text, 'err')
  }
  function showSignup (mode) {
    $('login-box').hidden = true
    $('signup-box').hidden = false
    $('signup-box').dataset.mode = mode
    $('signup-title').textContent = mode === 'setup' ? 'Create the first admin account' : 'Create your admin account'
    $('signup-hint').textContent = mode === 'setup'
      ? 'No admin exists yet. Enter the setup code from config.json (setupCode) to create the first one.'
      : 'Use the invite code an admin sent you.'
    $('s-code-name').textContent = mode === 'setup' ? 'Setup code' : 'Invite code'
    $('show-login').hidden = mode === 'setup'
  }
  $('show-signup').onclick = e => { e.preventDefault(); showSignup('invite') }
  $('show-login').onclick = e => { e.preventDefault(); showLogin('') }
  $('login-form').addEventListener('submit', async e => {
    e.preventDefault()
    try {
      await api('auth/login', { method: 'POST', body: { email: $('l-email').value, password: $('l-pass').value } })
      $('l-pass').value = ''
      boot()
    } catch (err) { msg('login-msg', err.message, 'err') }
  })
  $('signup-form').addEventListener('submit', async e => {
    e.preventDefault()
    const body = { name: $('s-name').value, email: $('s-email').value, password: $('s-pass').value }
    if ($('signup-box').dataset.mode === 'setup') body.setupCode = $('s-code').value.trim()
    else body.inviteCode = $('s-code').value.trim()
    try {
      await api('auth/signup', { method: 'POST', body })
      $('s-pass').value = ''
      boot()
    } catch (err) { msg('signup-msg', err.message, 'err') }
  })
  $('logout').onclick = async () => {
    try { await api('auth/logout', { method: 'POST', body: {} }) } catch (_) {}
    me = null
    boot()
  }

  // ---------- tabs ----------
  function tab (name) {
    document.querySelectorAll('[role=tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === name)))
    document.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== name })
  }
  document.querySelectorAll('[role=tab]').forEach(b => { b.onclick = () => { tab(b.dataset.tab); if (b.dataset.tab === 'results') loadResults($('r-session').value) } })

  async function showApp () {
    $('auth').hidden = true
    $('app').hidden = false
    $('who').hidden = false
    $('who').textContent = 'Signed in as ' + (me.name || me.email)
    $('logout').hidden = false
    await loadSessions()
    if (sessions.length) await openEdit(activeId || sessions[0].id)
    try { $('cfg-url').value = (await api('api/config')).publicUrl || '' } catch (_) {}
  }

  // ---------- sessions ----------
  async function loadSessions () {
    try {
      const d = await api('api/admin/sessions')
      sessions = d.sessions
      activeId = d.activeId
    } catch (e) { msg('sess-msg', e.message, 'err'); return }
    $('sess-rows').innerHTML = sessions.map(s => `
      <tr>
        <td><b>${esc(s.name)}</b></td>
        <td>${fmtDate(s.eventDate)}</td>
        <td>${esc(s.place || '—')}</td>
        <td><span class="status ${s.status}">${s.status}</span></td>
        <td>${s.players}</td>
        <td>${s.answers}</td>
        <td style="max-width:260px;font-size:14px">${esc(chapterNames(s.chapters))}</td>
        <td style="white-space:nowrap">
          <button class="btn ghost small" data-edit="${s.id}">Personalize</button>
          <button class="btn ghost small" data-res="${s.id}">Results</button>
          ${s.status !== 'active' ? `<button class="btn go small" data-act="${s.id}">Activate</button> <button class="btn danger small" data-del="${s.id}">Delete</button>` : ''}
        </td>
      </tr>`).join('') || '<tr><td colspan="8">No sessions yet.</td></tr>'
    const opts = sessions.map(s => `<option value="${s.id}">${esc(s.name)}${s.status === 'active' ? ' (active)' : ''}</option>`).join('')
    $('e-session').innerHTML = opts
    $('r-session').innerHTML = opts
    $('n-copy').innerHTML = '<option value="">Defaults</option>' + opts
    $('n-copy').value = activeId || ''
    if (editing) $('e-session').value = editing.session.id
    document.querySelectorAll('[data-edit]').forEach(b => { b.onclick = () => { openEdit(b.dataset.edit); tab('edit') } })
    document.querySelectorAll('[data-res]').forEach(b => { b.onclick = () => { $('r-session').value = b.dataset.res; tab('results'); loadResults(b.dataset.res) } })
    document.querySelectorAll('[data-act]').forEach(b => { b.onclick = () => activate(b.dataset.act) })
    document.querySelectorAll('[data-del]').forEach(b => {
      b.onclick = async () => {
        const s = sessions.find(x => String(x.id) === b.dataset.del)
        if (!confirm(`Delete “${s.name}” with its ${s.players} students and ${s.answers} answers? This cannot be undone.`)) return
        try { await api('api/admin/sessions/' + s.id, { method: 'DELETE' }); msg('sess-msg', 'Session deleted.', 'ok'); loadSessions() } catch (e) { msg('sess-msg', e.message, 'err') }
      }
    })
  }

  async function activate (id) {
    const s = sessions.find(x => String(x.id) === String(id))
    if (!confirm(`Make “${s ? s.name : id}” the active session? The deck and the student page switch to it; the current one is archived with all its results.`)) return
    try {
      await api(`api/admin/sessions/${id}/activate`, { method: 'POST', body: {} })
      msg('sess-msg', 'Active session changed. Reload the presenter page to see it.', 'ok')
      msg('e-msg', 'This is now the active session. Reload the presenter page to see it.', 'ok')
      await loadSessions()
      if (editing && String(editing.session.id) === String(id)) openEdit(id)
    } catch (e) { msg('sess-msg', e.message, 'err') }
  }

  $('new-form').addEventListener('submit', async e => {
    e.preventDefault()
    try {
      const d = await api('api/admin/sessions', { method: 'POST', body: { name: $('n-name').value, eventDate: $('n-date').value, place: $('n-place').value, copyFrom: $('n-copy').value || null } })
      msg('new-msg', 'Session created as a draft. Personalize it, then activate it on the day.', 'ok')
      $('new-form').reset()
      await loadSessions()
      await openEdit(d.session.id)
      tab('edit')
    } catch (err) { msg('new-msg', err.message, 'err') }
  })

  // ---------- personalize ----------
  function slideKeys () {
    const seen = {}
    return SLIDES.map(d => {
      let k = slideKey(d)
      if (seen[k]) { seen[k]++; k = k + '-' + seen[k] } else seen[k] = 1
      return k
    })
  }
  function setPhoto (v) {
    photo = v || 'speaker.jpg'
    $('e-photo-img').src = /^(data:|https?:)/.test(photo) ? photo : withShare(baseHref() + photo)
  }
  async function openEdit (id) {
    msg('e-msg', '')
    let d
    try { d = await api('api/admin/sessions/' + id) } catch (e) { msg('e-msg', e.message, 'err'); return }
    editing = { session: d.session, config: d.config, defaultQuestions: d.defaultQuestions }
    const s = d.session
    const c = d.config
    const sp = c.speaker || {}
    $('e-session').value = s.id
    $('e-status').textContent = s.status
    $('e-status').className = 'status ' + s.status
    $('e-activate').hidden = s.status === 'active'
    $('e-name').value = s.name || ''
    $('e-date').value = s.eventDate || ''
    $('e-place').value = s.place || ''
    $('e-tag').value = c.tag || ''
    $('e-title').value = c.title || ''
    $('e-subtitle').value = c.subtitle || ''
    $('e-sname').value = sp.name || ''
    $('e-srole').value = sp.role || ''
    $('e-slinkedin').value = sp.linkedin || ''
    $('e-semail').value = sp.email || ''
    $('e-sbio').value = sp.bio || ''
    $('e-sfocus').value = (sp.focus || []).join(', ')
    setPhoto(sp.photo)
    bioCount()
    const keys = slideKeys()
    const hidden = new Set(c.hiddenSlides || [])
    renderStructure(c)
    const custom = Array.isArray(c.questions)
    document.querySelector(`input[name=qmode][value=${custom ? 'custom' : 'default'}]`).checked = true
    $('q-custom').hidden = !custom
    $('e-questions').value = JSON.stringify(custom ? c.questions : d.defaultQuestions, null, 2)
  }
  // ---------- chapters ----------
  const CHAPTERS = window.CHAPTERS || []
  const PRESETS = {
    all: CHAPTERS.map(c => c.id),
    agile: ['intro', 'agile', 'scrum', 'wrapup'],
    agentic: ['intro', 'ai', 'agentic', 'future', 'wrapup'],
    platform: ['intro', 'platform', 'agentic', 'wrapup']
  }
  const chapterNames = list => !Array.isArray(list) || !list.length ? 'All chapters' : CHAPTERS.filter(c => list.includes(c.id)).map(c => c.title).join(', ')
  const selectedChapters = () => [...$('e-chapters').querySelectorAll('input:checked')].map(cb => cb.value)
  function renderStructure (c) {
    const keys = slideKeys()
    const hidden = new Set(c.hiddenSlides || [])
    const sel = Array.isArray(c.chapters) && c.chapters.length ? new Set(c.chapters) : null
    $('e-chapters').innerHTML = CHAPTERS.map(ch => {
      const n = SLIDES.filter(d => d.chapter === ch.id).length
      const q = SLIDES.filter(d => d.chapter === ch.id && d.q).length
      const on = !sel || sel.has(ch.id)
      return `<label class="chap"><input type="checkbox" value="${ch.id}" ${on ? 'checked' : ''}><span><b>${esc(ch.title)}</b><small>${n} slides${q ? ` · ${q} live question${q > 1 ? 's' : ''}` : ''}</small><em>${esc(ch.desc)}</em></span></label>`
    }).join('')
    $('e-slides').innerHTML = CHAPTERS.map(ch => {
      const items = SLIDES.map((def, i) => ({ def, i })).filter(x => x.def.chapter === ch.id)
      if (!items.length) return ''
      return `<div class="sl-group" data-ch="${ch.id}"><h4>${esc(ch.title)}</h4>${items.map(({ def, i }) => `<label class="${hidden.has(keys[i]) ? 'off' : ''}"><input type="checkbox" data-key="${esc(keys[i])}" ${hidden.has(keys[i]) ? '' : 'checked'}><span class="n">${i + 1}</span>${esc(slideTitle(def))}</label>`).join('')}</div>`
    }).join('')
    $('e-slides').querySelectorAll('input').forEach(cb => { cb.onchange = () => { cb.parentElement.classList.toggle('off', !cb.checked); syncChapters() } })
    $('e-chapters').querySelectorAll('input').forEach(cb => { cb.onchange = syncChapters })
    syncChapters()
  }
  function syncChapters () {
    const sel = new Set(selectedChapters())
    $('e-chapters').querySelectorAll('label.chap').forEach(l => l.classList.toggle('on', l.querySelector('input').checked))
    $('e-slides').querySelectorAll('.sl-group').forEach(g => g.classList.toggle('skip', !sel.has(g.dataset.ch)))
    const slides = [...$('e-slides').querySelectorAll('.sl-group:not(.skip) input:checked')].length
    $('e-ch-summary').textContent = sel.size
      ? `${sel.size} of ${CHAPTERS.length} chapters selected · ${slides} slides in this lesson`
      : 'Select at least one chapter.'
  }
  document.querySelectorAll('[data-preset]').forEach(b => {
    b.onclick = () => {
      const want = new Set(PRESETS[b.dataset.preset] || [])
      $('e-chapters').querySelectorAll('input').forEach(cb => { cb.checked = want.has(cb.value) })
      syncChapters()
    }
  })

  $('e-session').onchange = () => openEdit($('e-session').value)
  $('sl-all').onclick = e => { e.preventDefault(); $('e-slides').querySelectorAll('input').forEach(cb => { cb.checked = true; cb.parentElement.classList.remove('off') }); syncChapters() }
  const bioCount = () => { $('e-sbio-count').textContent = $('e-sbio').value.length + ' / 600 characters' }
  $('e-sbio').oninput = bioCount
  document.querySelectorAll('input[name=qmode]').forEach(r => { r.onchange = () => { $('q-custom').hidden = document.querySelector('input[name=qmode]:checked').value !== 'custom' } })
  $('q-reset').onclick = () => { $('e-questions').value = JSON.stringify(editing.defaultQuestions, null, 2) }
  function parseQuestions () {
    const list = JSON.parse($('e-questions').value)
    if (!Array.isArray(list)) throw new Error('The questions must be a JSON list: [ { … }, { … } ]')
    return list
  }
  $('q-check').onclick = () => {
    try { const l = parseQuestions(); msg('e-msg', `The JSON is valid: ${l.length} questions. Saving checks each question too.`, 'ok') } catch (e) { msg('e-msg', 'The JSON is not valid: ' + e.message, 'err') }
  }

  $('e-photo').onchange = () => {
    const f = $('e-photo').files[0]
    if (!f) return
    const img = new Image()
    img.onload = () => {
      const size = 400
      const c = document.createElement('canvas')
      c.width = size; c.height = size
      const s = Math.min(img.width, img.height)
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      setPhoto(c.toDataURL('image/jpeg', 0.84))
      URL.revokeObjectURL(img.src)
      msg('e-msg', 'New photo ready: save changes to keep it.', '')
    }
    img.onerror = () => msg('e-msg', 'This file is not an image the browser can read.', 'err')
    img.src = URL.createObjectURL(f)
  }
  $('e-photo-default').onclick = () => { setPhoto('speaker.jpg'); $('e-photo').value = ''; msg('e-msg', 'Default photo selected: save changes to keep it.', '') }

  $('e-save').onclick = async () => {
    if (!editing) return
    let questions = null
    if (document.querySelector('input[name=qmode]:checked').value === 'custom') {
      try { questions = parseQuestions() } catch (e) { msg('e-msg', 'The questions JSON is not valid: ' + e.message, 'err'); return }
    }
    const hiddenSlides = [...$('e-slides').querySelectorAll('input')].filter(cb => !cb.checked).map(cb => cb.dataset.key)
    const chapters = selectedChapters()
    if (!chapters.length) { msg('e-msg', 'Select at least one chapter to present.', 'err'); return }
    const config = Object.assign({}, editing.config, {
      tag: $('e-tag').value.trim(),
      title: $('e-title').value.trim(),
      subtitle: $('e-subtitle').value.trim(),
      speaker: {
        name: $('e-sname').value.trim(),
        role: $('e-srole').value.trim(),
        photo,
        bio: $('e-sbio').value.trim(),
        focus: $('e-sfocus').value.split(',').map(x => x.trim()).filter(Boolean),
        linkedin: $('e-slinkedin').value.trim(),
        email: $('e-semail').value.trim()
      },
      hiddenSlides,
      chapters: chapters.length === CHAPTERS.length ? null : chapters,
      questions
    })
    $('e-save').disabled = true
    try {
      await api('api/admin/sessions/' + editing.session.id, { method: 'PUT', body: { name: $('e-name').value, eventDate: $('e-date').value, place: $('e-place').value, config } })
      editing.config = config
      msg('e-msg', editing.session.status === 'active' ? 'Saved. Reload the presenter page to see the changes.' : 'Saved.', 'ok')
      loadSessions()
    } catch (e) { msg('e-msg', e.message, 'err') } finally { $('e-save').disabled = false }
  }
  $('e-activate').onclick = () => editing && activate(editing.session.id)

  // ---------- results ----------
  async function loadResults (id) {
    if (!id) return
    let d
    try { d = await api('api/admin/sessions/' + id) } catch (e) { $('r-summary').textContent = e.message; return }
    const r = d.results
    const answered = r.questions.filter(q => q.total > 0).length
    $('r-summary').textContent = `${fmtDate(d.session.eventDate)} · ${d.session.place || 'no place set'} · ${r.players} students · ${answered} of ${r.questions.length} questions answered`
    $('r-board').innerHTML = r.leaderboard.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.name)}</td><td>${p.score.toLocaleString('en-US')}</td></tr>`).join('') || '<tr><td colspan="3">No students joined.</td></tr>'
    $('r-questions').innerHTML = r.questions.map(q => {
      const max = Math.max(1, q.total)
      const rows = q.type === 'wordcloud'
        ? (q.words.length ? q.words.map(w => `<div class="o"><div class="track"><i style="width:${w.n / max * 100}%"></i><span>${esc(w.text)}</span></div><span>${w.n}</span></div>`).join('') : '<p class="hint">No words yet.</p>')
        : q.options.map((o, i) => `<div class="o ${q.correct === i ? 'right' : ''}"><div class="track"><i style="width:${o.n / max * 100}%"></i><span>${q.correct === i ? '✓ ' : ''}${esc(o.text)}</span></div><span>${o.n}</span></div>`).join('')
      return `<div class="q"><b>${esc(q.prompt)}</b><span class="hint">${q.type} · ${q.total} answers</span>${rows}</div>`
    }).join('')
  }
  $('r-session').onchange = () => loadResults($('r-session').value)
  $('r-export').onclick = async () => {
    const id = $('r-session').value
    try {
      const d = await api(`api/admin/sessions/${id}/export`)
      const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `session-${id}-${(d.session.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`
      document.body.appendChild(a); a.click(); a.remove()
    } catch (e) { $('r-summary').textContent = e.message }
  }

  // ---------- account ----------
  $('pw-form').addEventListener('submit', async e => {
    e.preventDefault()
    try {
      await api('auth/password', { method: 'POST', body: { current: $('pw-cur').value, next: $('pw-new').value } })
      $('pw-form').reset()
      msg('pw-msg', 'Password changed.', 'ok')
    } catch (err) { msg('pw-msg', err.message, 'err') }
  })
  $('inv-go').onclick = async () => {
    try {
      const body = { roles: ['admin'] }
      if ($('inv-email').value.trim()) body.email = $('inv-email').value.trim()
      const d = await api('auth/invites', { method: 'POST', body })
      msg('inv-msg', `Invite code: ${d.code} (valid until ${new Date(d.expiresAt).toLocaleDateString('en-GB')})`, 'ok')
    } catch (err) { msg('inv-msg', err.message, 'err') }
  }
  $('cfg-save').onclick = async () => {
    try {
      const d = await api('api/admin/config', { method: 'POST', body: { publicUrl: $('cfg-url').value } })
      $('cfg-url').value = d.publicUrl
      msg('cfg-msg', 'Saved. The QR code uses it after the presenter page reloads.', 'ok')
    } catch (err) { msg('cfg-msg', err.message, 'err') }
  }

  boot()
})()
