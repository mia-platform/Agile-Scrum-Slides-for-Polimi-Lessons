// Agile Scrum Polimi Live — presenter deck + student mobile page + live Q&A backend.
// One service: serves the static pages in /public and the JSON API under /api.
const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ROOT = __dirname
const DATA_DIR = path.join(ROOT, 'data')
const STATE_FILE = path.join(DATA_DIR, 'state.json')
const QUESTIONS_FILE = path.join(ROOT, 'questions.json')
const CONFIG_FILE = path.join(ROOT, 'config.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function readJson (file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch (_) { return fallback }
}

const baseConfig = readJson(CONFIG_FILE, {})
const ADMIN_KEY = process.env.ADMIN_KEY || baseConfig.adminKey || 'agile-polimi'

// ---- questions --------------------------------------------------------------
function loadQuestions () {
  const list = readJson(QUESTIONS_FILE, [])
  const map = {}
  for (const q of list) map[q.id] = q
  return map
}
let QUESTIONS = loadQuestions()
fs.watchFile(QUESTIONS_FILE, { interval: 2000 }, () => { QUESTIONS = loadQuestions() })

// ---- state ------------------------------------------------------------------
function emptyState () {
  return { current: null, players: {}, runs: {}, publicUrl: baseConfig.publicUrl || '' }
}
let state = Object.assign(emptyState(), readJson(STATE_FILE, {}))

let saveTimer = null
function save () {
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    fs.writeFile(STATE_FILE, JSON.stringify(state), () => {})
  }, 400)
}

function run (qid) {
  if (!state.runs[qid]) state.runs[qid] = { status: 'idle', startedAt: null, endsAt: null, revealed: false, answers: {}, hidden: [] }
  return state.runs[qid]
}

function tick () {
  const now = Date.now()
  for (const [qid, r] of Object.entries(state.runs)) {
    if (r.status === 'open' && r.endsAt && now > r.endsAt) {
      r.status = 'closed'
      save()
    }
    if (!QUESTIONS[qid]) continue
  }
}
setInterval(tick, 500)

function normWord (s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 24)
}

function results (qid) {
  const q = QUESTIONS[qid]
  const r = run(qid)
  const answers = Object.values(r.answers)
  const out = { count: answers.length }
  if (q.type === 'wordcloud') {
    const freq = {}
    for (const a of answers) {
      const w = normWord(a.value)
      if (!w || r.hidden.includes(w)) continue
      freq[w] = (freq[w] || 0) + 1
    }
    out.words = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 60).map(([text, n]) => ({ text, n }))
  } else {
    out.counts = (q.options || []).map((_, i) => answers.filter(a => a.value === i).length)
    if (q.type === 'quiz') out.correctCount = answers.filter(a => a.value === q.correct).length
  }
  return out
}

function scores () {
  const totals = {}
  for (const pid of Object.keys(state.players)) totals[pid] = 0
  for (const r of Object.values(state.runs)) {
    for (const [pid, a] of Object.entries(r.answers)) {
      if (totals[pid] !== undefined) totals[pid] += a.points || 0
    }
  }
  return Object.entries(totals)
    .map(([pid, score]) => ({ pid, name: state.players[pid].name, score }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
}

function publicQuestion (qid) {
  const q = QUESTIONS[qid]
  if (!q) return null
  const r = run(qid)
  return {
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: q.options || [],
    status: r.status,
    endsAt: r.endsAt,
    revealed: r.revealed,
    correct: r.revealed && q.type === 'quiz' ? q.correct : null
  }
}

// ---- app --------------------------------------------------------------------
const app = express()
app.use(express.json({ limit: '50kb' }))
app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next() })

function isAdmin (req) {
  const k = (req.body && req.body.key) || req.query.key
  return k === ADMIN_KEY
}
function admin (req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Wrong presenter key' })
  next()
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// Student: join with a nickname
app.post('/api/public/join', (req, res) => {
  let name = String((req.body && req.body.name) || '').trim().replace(/\s+/g, ' ').slice(0, 20)
  if (!name) return res.status(400).json({ error: 'Type a nickname to join' })
  const taken = new Set(Object.values(state.players).map(p => p.name.toLowerCase()))
  let unique = name
  let n = 2
  while (taken.has(unique.toLowerCase())) unique = `${name} ${n++}`
  const pid = crypto.randomBytes(8).toString('hex')
  state.players[pid] = { name: unique, joinedAt: Date.now() }
  save()
  res.json({ pid, name: unique })
})

// Student: polling state
app.get('/api/public/state', (req, res) => {
  tick()
  const pid = String(req.query.pid || '')
  const me = state.players[pid]
  const board = scores()
  const out = {
    serverNow: Date.now(),
    players: Object.keys(state.players).length,
    known: !!me,
    current: state.current ? publicQuestion(state.current) : null
  }
  if (me) {
    const idx = board.findIndex(b => b.pid === pid)
    out.me = { name: me.name, score: board[idx] ? board[idx].score : 0, rank: idx + 1 }
    if (state.current) {
      const a = run(state.current).answers[pid]
      out.myAnswer = a ? { value: a.value, points: a.points || 0 } : null
    }
  }
  res.json(out)
})

// Student: answer the open question
app.post('/api/public/answer', (req, res) => {
  tick()
  const { pid, qid } = req.body || {}
  let { value } = req.body || {}
  if (!state.players[pid]) return res.status(404).json({ error: 'Join again: the session was reset' })
  const q = QUESTIONS[qid]
  if (!q) return res.status(404).json({ error: 'Unknown question' })
  const r = run(qid)
  if (r.status !== 'open') return res.status(409).json({ error: 'Answers are closed' })
  if (r.answers[pid] && q.type !== 'wordcloud') return res.status(409).json({ error: 'You already answered' })
  const now = Date.now()
  let points = 0
  if (q.type === 'wordcloud') {
    value = normWord(value)
    if (!value) return res.status(400).json({ error: 'Type a word' })
    points = r.answers[pid] ? r.answers[pid].points : (q.points || 0)
  } else {
    value = Number(value)
    if (!Number.isInteger(value) || value < 0 || value >= (q.options || []).length) return res.status(400).json({ error: 'Pick an option' })
    if (q.type === 'quiz' && value === q.correct) {
      const base = q.points || 1000
      const total = (r.endsAt - r.startedAt) || 1
      const left = Math.max(0, Math.min(1, (r.endsAt - now) / total))
      points = Math.round(base / 2 + (base / 2) * left)
    } else if (q.type === 'poll') {
      points = q.points || 0
    }
  }
  r.answers[pid] = { value, at: now, points }
  save()
  res.json({ ok: true })
})

// Public question text (no answer key), used when the presenter key is missing
app.get('/api/public/question/:id', (req, res) => {
  const q = publicQuestion(req.params.id)
  if (!q) return res.status(404).json({ error: 'Unknown question id: ' + req.params.id })
  res.json(q)
})

// Public leaderboard
app.get('/api/leaderboard', (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 10)
  res.json({ players: Object.keys(state.players).length, top: scores().slice(0, limit).map(({ name, score }) => ({ name, score })) })
})

// Public config needed by the presenter page (QR target)
app.get('/api/config', (_req, res) => res.json({ publicUrl: state.publicUrl || '' }))

// ---- presenter (admin) ----
app.get('/api/admin/ping', admin, (_req, res) => res.json({ ok: true }))

app.get('/api/admin/question/:id', admin, (req, res) => {
  tick()
  const q = QUESTIONS[req.params.id]
  if (!q) return res.status(404).json({ error: 'Unknown question id: ' + req.params.id })
  const r = run(q.id)
  res.json({
    serverNow: Date.now(),
    question: q,
    status: r.status,
    startedAt: r.startedAt,
    endsAt: r.endsAt,
    revealed: r.revealed,
    current: state.current === q.id,
    players: Object.keys(state.players).length,
    results: results(q.id)
  })
})

app.post('/api/admin/question/:id/:action', admin, (req, res) => {
  const q = QUESTIONS[req.params.id]
  if (!q) return res.status(404).json({ error: 'Unknown question id' })
  const r = run(q.id)
  const now = Date.now()
  switch (req.params.action) {
    case 'start': {
      // close any other open question
      for (const [id, other] of Object.entries(state.runs)) {
        if (id !== q.id && other.status === 'open') other.status = 'closed'
      }
      const seconds = Number(req.body.seconds) || q.timer || 0
      r.status = 'open'
      r.revealed = false
      r.startedAt = now
      r.endsAt = seconds > 0 ? now + seconds * 1000 : null
      state.current = q.id
      break
    }
    case 'stop':
      if (r.status === 'open') r.status = 'closed'
      break
    case 'reveal':
      if (r.status === 'open') r.status = 'closed'
      r.revealed = true
      state.current = q.id
      break
    case 'reset':
      state.runs[q.id] = { status: 'idle', startedAt: null, endsAt: null, revealed: false, answers: {}, hidden: [] }
      if (state.current === q.id) state.current = null
      break
    case 'hide': {
      const w = normWord(req.body.word)
      if (w && !r.hidden.includes(w)) r.hidden.push(w)
      break
    }
    default:
      return res.status(400).json({ error: 'Unknown action' })
  }
  save()
  res.json({ ok: true })
})

app.post('/api/admin/reset-all', admin, (req, res) => {
  const keepPlayers = !!(req.body && req.body.keepPlayers)
  const players = keepPlayers ? state.players : {}
  const publicUrl = state.publicUrl
  state = emptyState()
  state.players = players
  state.publicUrl = publicUrl
  save()
  res.json({ ok: true })
})

app.post('/api/admin/config', admin, (req, res) => {
  if (typeof req.body.publicUrl === 'string') state.publicUrl = req.body.publicUrl.trim()
  save()
  res.json({ ok: true, publicUrl: state.publicUrl })
})

// ---- static pages ----
app.use(express.static(path.join(ROOT, 'public'), { extensions: ['html'] }))
app.get('/join', (_req, res) => res.sendFile(path.join(ROOT, 'public', 'join.html')))

const port = Number(process.env.PORT) || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`Agile live deck listening on port ${port}`)
})
