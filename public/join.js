// Student mobile page: join with a nickname, answer the question that is live on the big screen.
(function () {
  const { api, esc } = window.Live
  const SHAPES = ['▲', '◆', '●', '■']
  const $ = id => document.getElementById(id)
  let pid = localStorage.getItem('agilePid') || ''
  let last = null
  let sig = ''
  let offset = 0
  let sending = false

  function screen (name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 's-' + name))
  }

  // ---------- join ----------
  $('join-form').addEventListener('submit', async e => {
    e.preventDefault()
    const name = $('name').value.trim()
    if (!name) { $('join-err').textContent = 'Type a nickname to join.'; return }
    $('join-btn').disabled = true
    $('join-err').textContent = ''
    try {
      const d = await api('api/public/join', { method: 'POST', body: { name } })
      pid = d.pid
      localStorage.setItem('agilePid', pid)
      sig = ''
      await poll()
    } catch (err) {
      $('join-err').textContent = err.message
    } finally { $('join-btn').disabled = false }
  })
  $('leave').addEventListener('click', () => {
    if (!confirm('Join again with a new nickname? Your points stay with the old one.')) return
    localStorage.removeItem('agilePid'); pid = ''; sig = ''; render(last)
  })

  // ---------- answering ----------
  async function answer (qid, value) {
    if (sending) return
    sending = true
    $('q-err').textContent = ''
    try {
      await api('api/public/answer', { method: 'POST', body: { pid, qid, value } })
      if (navigator.vibrate) navigator.vibrate(30)
      sig = ''
      await poll()
    } catch (err) {
      $('q-err').textContent = err.message
    } finally { sending = false }
  }
  $('word-form').addEventListener('submit', e => {
    e.preventDefault()
    const w = $('word').value.trim()
    if (!w) { $('q-err').textContent = 'Type a word first.'; return }
    if (last && last.current) answer(last.current.id, w)
  })

  // ---------- rendering ----------
  function render (d) {
    if (!d) return
    $('players').textContent = d.players + ' on board'
    if (!pid || !d.known) {
      $('me').hidden = true
      $('leave').hidden = true
      screen('join')
      if (pid && !d.known) { localStorage.removeItem('agilePid'); pid = '' }
      return
    }
    $('me').hidden = false
    $('leave').hidden = false
    $('me-name').textContent = d.me.name
    $('me-score').textContent = d.me.score.toLocaleString('en-US')
    $('me-rank').textContent = '#' + d.me.rank

    const q = d.current
    const newSig = JSON.stringify([q && q.id, q && q.status, q && q.revealed, d.myAnswer])
    if (newSig === sig) return
    const wasOpen = sig && JSON.parse(sig)[1] === 'open'
    sig = newSig

    if (!q || q.status === 'idle') {
      $('wait-title').textContent = 'You’re on board, ' + d.me.name
      $('wait-text').textContent = 'Watch the big screen: the next question will appear here.'
      screen('wait')
      return
    }
    if (q.status === 'open' && !wasOpen && navigator.vibrate) navigator.vibrate([60, 40, 60])
    screen('q')
    $('q-type').className = 'q-type ' + q.type
    $('q-type').textContent = q.type === 'quiz' ? 'Quiz' : q.type === 'poll' ? 'Poll' : 'Word cloud'
    $('prompt').textContent = q.prompt
    $('q-err').textContent = ''
    const mine = d.myAnswer
    const open = q.status === 'open'

    if (q.type === 'wordcloud') {
      $('opts').innerHTML = ''
      $('word-form').hidden = !open
      if (!open) $('word').value = ''
    } else {
      $('word-form').hidden = true
      $('opts').innerHTML = q.options.map((o, i) => {
        const cls = ['opt', 'o' + i]
        if (mine && mine.value === i) cls.push('mine')
        if (mine && mine.value !== i) cls.push('dim')
        if (!open && !mine) cls.push('dim')
        if (q.revealed && q.correct === i) cls.push('right')
        return `<button class="${cls.join(' ')}" data-i="${i}" ${open && !mine ? '' : 'disabled'}><span class="sh">${SHAPES[i]}</span><span>${esc(o)}</span></button>`
      }).join('')
      $('opts').querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => answer(q.id, Number(b.dataset.i))))
    }

    let res = ''
    if (open) {
      if (mine && q.type === 'wordcloud') res = `<div class="result"><h2>Sent: “${esc(mine.value)}”</h2><p>Send another word to replace it.</p></div>`
      else if (mine) res = '<div class="result"><div class="big">📨</div><h2>Answer sent</h2><p>Waiting for the others…</p></div>'
    } else if (q.type === 'quiz') {
      if (q.revealed) {
        const ok = mine && mine.value === q.correct
        res = ok
          ? `<div class="result good"><div class="big">🎉</div><h2>Correct! +${mine.points}</h2><p>Faster answers earn more points.</p></div>`
          : `<div class="result bad"><div class="big">🌊</div><h2>${mine ? 'Not this time' : 'No answer'}</h2><p>The right answer is highlighted above.</p></div>`
      } else {
        res = `<div class="result"><div class="big">⏱️</div><h2>Time’s up</h2><p>${mine ? 'Your answer is in.' : 'You didn’t answer this one.'} Watch the screen for the solution.</p></div>`
      }
    } else {
      res = `<div class="result"><div class="big">👀</div><h2>${mine ? 'Thanks!' : 'Closed'}</h2><p>Look at the results on the big screen.</p></div>`
    }
    $('result').innerHTML = res
  }

  function tick () {
    const q = last && last.current
    if (q && q.status === 'open' && q.endsAt) {
      const now = Date.now() + offset
      const left = Math.max(0, q.endsAt - now)
      $('timer').textContent = Math.ceil(left / 1000) + 's'
      $('tbar').hidden = false
      const total = Math.max(1, q.endsAt - (q.startedAt || q.endsAt - left))
      $('tbar').querySelector('i').style.width = Math.min(100, left / total * 100) + '%'
    } else {
      $('timer').textContent = ''
      $('tbar').hidden = true
    }
  }

  async function poll () {
    try {
      const d = await api('api/public/state?pid=' + encodeURIComponent(pid))
      offset = d.serverNow - Date.now()
      last = d
      render(d)
    } catch (err) {
      $('players').textContent = 'Connection lost, retrying…'
    }
  }

  screen(pid ? 'wait' : 'join')
  poll()
  setInterval(poll, 1200)
  setInterval(tick, 250)
})()
