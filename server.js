// Agile Scrum Polimi Live — presenter deck, student page, admin console and live Q&A backend.
// One service: static pages in /public, JSON API under /api, admin accounts under /auth.
// Storage: PostgreSQL (DATABASE_URL / PG* injected by the preview). Every lesson is a "session"
// row with its own configuration (titles, speaker, hidden slides, questions) and its own results.
const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { Pool, types } = require('pg')
types.setTypeParser(1082, v => v) // DATE columns as 'YYYY-MM-DD' strings

// vfs_scaffold_auth: the app's own admin accounts under /auth (login, sessions, roles); see auth/README.md.
const { mountAuth, requireUser, requireRole } = require('./auth')
const authStore = require('./auth/store')
const { hashPassword, verifyPassword } = require('./auth/password')

const ROOT = __dirname
const QUESTIONS_FILE = path.join(ROOT, 'questions.json')
const CONFIG_FILE = path.join(ROOT, 'config.json')
const SCHEMA_FILE = path.join(ROOT, 'db', 'init', '010_deck.sql')

function readJson (file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch (_) { return fallback }
}
const baseConfig = readJson(CONFIG_FILE, {})
const SETUP_CODE = process.env.SETUP_CODE || baseConfig.setupCode || ''

const pool = new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL, max: 8 } : { max: 8 })

// ---- defaults for a new session --------------------------------------------
function defaultConfig () {
  return {
    tag: 'DSD lesson · Politecnico di Milano',
    title: 'Introduction to Agile and Scrum',
    subtitle: 'Polimi, October 20, 2026 — Giulio Roggero',
    speaker: {
      name: 'Giulio Roggero',
      role: 'CTO & Co-Founder, Mia-Platform',
      photo: 'speaker.jpg',
      bio: 'Co-founder and CTO of Mia-Platform, the AI-native developer platform. 25+ years in software, from TV rating platforms at Nielsen to cloud native and agentic engineering. Co-founder of Agile Reloaded, host of Master The Vibe and Platmosphere, Politecnico di Milano alumnus and former Italian rowing champion: the boats in this deck are personal.',
      focus: ['Agentic SDLC', 'Platform Engineering', 'Business Composability', 'Data Fabric'],
      linkedin: 'linkedin.com/in/giulioroggero',
      email: 'giulio.roggero@mia-platform.eu'
    },
    hiddenSlides: [],
    chapters: null, // null: every chapter
    questions: null // null: use questions.json
  }
}
const fileQuestions = () => readJson(QUESTIONS_FILE, [])

// ---- live state of the ACTIVE session (in memory, written through to Postgres) ----
let live = null // { sessionId, current, players: {pid: {name}}, runs: {qid: run}, questions: {qid: q}, config }

function questionMap (cfg) {
  const list = Array.isArray(cfg.questions) && cfg.questions.length ? cfg.questions : fileQuestions()
  const map = {}
  for (const q of list) if (q && q.id) map[q.id] = q
  return map
}

let writes = Promise.resolve()
function persist (sql, params) {
  writes = writes.then(() => pool.query(sql, params)).catch(e => console.error('[db]', e.message))
  return writes
}

function emptyRun () { return { status: 'idle', startedAt: null, endsAt: null, revealed: false, answers: {}, hidden: [] } }
function run (qid) {
  if (!live.runs[qid]) live.runs[qid] = emptyRun()
  return live.runs[qid]
}
function saveRun (qid) {
  const r = run(qid)
  persist(`INSERT INTO deck_runs (session_id, question_id, status, started_at, ends_at, revealed, hidden)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (session_id, question_id) DO UPDATE SET status=EXCLUDED.status, started_at=EXCLUDED.started_at,
           ends_at=EXCLUDED.ends_at, revealed=EXCLUDED.revealed, hidden=EXCLUDED.hidden`,
  [live.sessionId, qid, r.status, r.startedAt ? new Date(r.startedAt) : null, r.endsAt ? new Date(r.endsAt) : null, r.revealed, JSON.stringify(r.hidden)])
}
function saveCurrent () {
  persist(`UPDATE deck_sessions SET config = jsonb_set(config, '{current}', $2::jsonb) WHERE id = $1`, [live.sessionId, JSON.stringify(live.current)])
}

async function loadActive () {
  let { rows } = await pool.query(`SELECT * FROM deck_sessions WHERE status = 'active' ORDER BY activated_at DESC NULLS LAST LIMIT 1`)
  if (!rows.length) {
    const cfg = defaultConfig()
    const ins = await pool.query(`INSERT INTO deck_sessions (name, event_date, place, status, config, activated_at)
      VALUES ($1, $2, $3, 'active', $4, now()) RETURNING *`, ['Polimi DSD — Agile and Scrum', '2026-10-20', 'Politecnico di Milano', cfg])
    rows = ins.rows
  }
  const s = rows[0]
  const cfg = Object.assign(defaultConfig(), s.config || {})
  const state = { sessionId: Number(s.id), current: cfg.current || null, players: {}, runs: {}, questions: questionMap(cfg), config: cfg }
  for (const p of (await pool.query('SELECT id, name FROM deck_players WHERE session_id = $1', [s.id])).rows) state.players[p.id] = { name: p.name }
  for (const r of (await pool.query('SELECT * FROM deck_runs WHERE session_id = $1', [s.id])).rows) {
    state.runs[r.question_id] = {
      status: r.status, revealed: r.revealed, hidden: r.hidden || [], answers: {},
      startedAt: r.started_at ? new Date(r.started_at).getTime() : null, endsAt: r.ends_at ? new Date(r.ends_at).getTime() : null
    }
  }
  for (const a of (await pool.query('SELECT * FROM deck_answers WHERE session_id = $1', [s.id])).rows) {
    if (!state.runs[a.question_id]) state.runs[a.question_id] = emptyRun()
    state.runs[a.question_id].answers[a.player_id] = { value: a.value, points: a.points, at: new Date(a.answered_at).getTime() }
  }
  live = state
}

async function getSetting (key, fallback) {
  const { rows } = await pool.query('SELECT value FROM deck_settings WHERE key = $1', [key])
  return rows.length ? rows[0].value : fallback
}
async function setSetting (key, value) {
  await pool.query('INSERT INTO deck_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, JSON.stringify(value)])
}

let readyPromise = null
function ready () {
  if (!readyPromise) {
    readyPromise = (async () => {
      await pool.query(fs.readFileSync(SCHEMA_FILE, 'utf8'))
      await pool.query(fs.readFileSync(path.join(ROOT, 'db', 'init', '020_media.sql'), 'utf8'))
      if ((await getSetting('publicUrl', null)) === null && baseConfig.publicUrl) await setSetting('publicUrl', baseConfig.publicUrl)
      await loadActive()
      console.log(`[deck] active session ${live.sessionId}: ${Object.keys(live.players).length} players`)
    })().catch(e => { readyPromise = null; throw e })
  }
  return readyPromise
}

// ---- live helpers ------------------------------------------------------------
function tick () {
  if (!live) return
  const now = Date.now()
  for (const [qid, r] of Object.entries(live.runs)) {
    if (r.status === 'open' && r.endsAt && now > r.endsAt) { r.status = 'closed'; saveRun(qid) }
  }
}
setInterval(tick, 500)

const normWord = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 24)

function results (qid) {
  const q = live.questions[qid]
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
  for (const pid of Object.keys(live.players)) totals[pid] = 0
  for (const r of Object.values(live.runs)) {
    for (const [pid, a] of Object.entries(r.answers)) if (totals[pid] !== undefined) totals[pid] += a.points || 0
  }
  return Object.entries(totals)
    .map(([pid, score]) => ({ pid, name: live.players[pid].name, score }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
}

function publicQuestion (qid) {
  const q = live.questions[qid]
  if (!q) return null
  const r = run(qid)
  return {
    id: q.id, type: q.type, prompt: q.prompt, options: q.options || [],
    status: r.status, startedAt: r.startedAt, endsAt: r.endsAt, revealed: r.revealed,
    correct: r.revealed && q.type === 'quiz' ? q.correct : null
  }
}

// ---- app ----------------------------------------------------------------------
const app = express()
app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next() })

// The first admin account needs the setup code from config.json, so nobody else can claim the console.
app.post('/auth/signup', express.json(), async (req, res, next) => {
  try {
    const users = await authStore.ready().then(() => authStore.countUsers())
    if (users === 0 && (!SETUP_CODE || (req.body && req.body.setupCode) !== SETUP_CODE)) {
      return res.status(403).json({ error: 'Enter the setup code from config.json to create the first admin' })
    }
  } catch (e) { return next(e) }
  next()
})
// Change password (extends the generated auth module).
app.post('/auth/password', express.json(), requireUser, async (req, res) => {
  const { current, next: nextPassword } = req.body || {}
  if (typeof nextPassword !== 'string' || nextPassword.length < 8) return res.status(400).json({ error: 'The new password must be at least 8 characters long' })
  const account = await authStore.findUserByEmail(req.user.email)
  if (!account || !(await verifyPassword(String(current || ''), account.passwordHash))) return res.status(401).json({ error: 'The current password is incorrect' })
  await authStore.setPasswordHash(account.id, await hashPassword(nextPassword))
  res.json({ ok: true })
})
mountAuth(app)

app.use(express.json({ limit: '4mb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api', (req, res, next) => ready().then(() => next(), e => res.status(503).json({ error: 'Database not ready: ' + e.message })))

const admin = requireRole('admin')
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

// ----- public: deck configuration of the active session -----
app.get('/api/deck', wrap(async (_req, res) => {
  const c = live.config
  res.json({
    sessionId: live.sessionId, tag: c.tag, title: c.title, subtitle: c.subtitle, speaker: c.speaker,
    hiddenSlides: c.hiddenSlides || [], chapters: c.chapters || null, chapterOrder: c.chapterOrder || null, slideOrder: c.slideOrder || null, publicUrl: await getSetting('publicUrl', ''),
    media: await mediaIndex()
  })
}))
app.get('/api/config', wrap(async (_req, res) => res.json({ publicUrl: await getSetting('publicUrl', '') })))

// ----- public: students -----
app.post('/api/public/join', (req, res) => {
  const name = String((req.body && req.body.name) || '').trim().replace(/\s+/g, ' ').slice(0, 20)
  if (!name) return res.status(400).json({ error: 'Type a nickname to join' })
  const taken = new Set(Object.values(live.players).map(p => p.name.toLowerCase()))
  let unique = name
  let n = 2
  while (taken.has(unique.toLowerCase())) unique = `${name} ${n++}`
  const pid = crypto.randomBytes(8).toString('hex')
  live.players[pid] = { name: unique }
  persist('INSERT INTO deck_players (id, session_id, name) VALUES ($1, $2, $3)', [pid, live.sessionId, unique])
  res.json({ pid, name: unique })
})

app.get('/api/public/state', (req, res) => {
  tick()
  const pid = String(req.query.pid || '')
  const me = live.players[pid]
  const out = { serverNow: Date.now(), players: Object.keys(live.players).length, known: !!me, current: live.current ? publicQuestion(live.current) : null }
  if (me) {
    const board = scores()
    const idx = board.findIndex(b => b.pid === pid)
    out.me = { name: me.name, score: board[idx] ? board[idx].score : 0, rank: idx + 1 }
    if (live.current) {
      const a = run(live.current).answers[pid]
      out.myAnswer = a ? { value: a.value, points: a.points || 0 } : null
    }
  }
  res.json(out)
})

app.post('/api/public/answer', (req, res) => {
  tick()
  const { pid, qid } = req.body || {}
  let { value } = req.body || {}
  if (!live.players[pid]) return res.status(404).json({ error: 'Join again: the session was reset' })
  const q = live.questions[qid]
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
      const left = r.endsAt ? Math.max(0, Math.min(1, (r.endsAt - now) / total)) : 1
      points = Math.round(base / 2 + (base / 2) * left)
    } else if (q.type === 'poll') {
      points = q.points || 0
    }
  }
  r.answers[pid] = { value, at: now, points }
  persist(`INSERT INTO deck_answers (session_id, question_id, player_id, value, points, answered_at) VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (session_id, question_id, player_id) DO UPDATE SET value=EXCLUDED.value, points=EXCLUDED.points, answered_at=EXCLUDED.answered_at`,
  [live.sessionId, qid, pid, JSON.stringify(value), points, new Date(now)])
  res.json({ ok: true })
})

app.get('/api/public/question/:id', (req, res) => {
  const q = publicQuestion(req.params.id)
  if (!q) return res.status(404).json({ error: 'Unknown question id: ' + req.params.id })
  res.json(q)
})

app.get('/api/leaderboard', (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 10)
  res.json({ players: Object.keys(live.players).length, top: scores().slice(0, limit).map(({ name, score }) => ({ name, score })) })
})

// ----- presenter: live controls (admin only) -----
app.get('/api/admin/ping', admin, (req, res) => res.json({ ok: true, user: req.user.email }))

app.get('/api/admin/question/:id', admin, (req, res) => {
  tick()
  const q = live.questions[req.params.id]
  if (!q) return res.status(404).json({ error: 'Unknown question id: ' + req.params.id })
  const r = run(q.id)
  res.json({
    serverNow: Date.now(), question: q, status: r.status, startedAt: r.startedAt, endsAt: r.endsAt, revealed: r.revealed,
    current: live.current === q.id, players: Object.keys(live.players).length, results: results(q.id)
  })
})

app.post('/api/admin/question/:id/:action', admin, (req, res) => {
  const q = live.questions[req.params.id]
  if (!q) return res.status(404).json({ error: 'Unknown question id' })
  const r = run(q.id)
  const now = Date.now()
  switch (req.params.action) {
    case 'start': {
      for (const [id, other] of Object.entries(live.runs)) {
        if (id !== q.id && other.status === 'open') { other.status = 'closed'; saveRun(id) }
      }
      const seconds = Number(req.body.seconds) || q.timer || 0
      Object.assign(r, { status: 'open', revealed: false, startedAt: now, endsAt: seconds > 0 ? now + seconds * 1000 : null })
      live.current = q.id
      saveCurrent()
      break
    }
    case 'stop':
      if (r.status === 'open') r.status = 'closed'
      break
    case 'reveal':
      if (r.status === 'open') r.status = 'closed'
      r.revealed = true
      live.current = q.id
      saveCurrent()
      break
    case 'reset':
      live.runs[q.id] = emptyRun()
      persist('DELETE FROM deck_answers WHERE session_id = $1 AND question_id = $2', [live.sessionId, q.id])
      if (live.current === q.id) { live.current = null; saveCurrent() }
      break
    case 'hide': {
      const w = normWord(req.body.word)
      if (w && !r.hidden.includes(w)) r.hidden.push(w)
      break
    }
    default:
      return res.status(400).json({ error: 'Unknown action' })
  }
  saveRun(q.id)
  res.json({ ok: true })
})

app.post('/api/admin/reset-all', admin, wrap(async (req, res) => {
  const keepPlayers = !!(req.body && req.body.keepPlayers)
  await writes
  await pool.query('DELETE FROM deck_answers WHERE session_id = $1', [live.sessionId])
  await pool.query('DELETE FROM deck_runs WHERE session_id = $1', [live.sessionId])
  if (!keepPlayers) await pool.query('DELETE FROM deck_players WHERE session_id = $1', [live.sessionId])
  live.runs = {}
  live.current = null
  if (!keepPlayers) live.players = {}
  saveCurrent()
  res.json({ ok: true })
}))

// Reset the results of any session (past or active). keepPlayers: keep the joined students.
app.post('/api/admin/sessions/:id/reset', admin, wrap(async (req, res) => {
  const id = Number(req.params.id)
  const keepPlayers = !!(req.body && req.body.keepPlayers)
  const { rows } = await pool.query('SELECT id FROM deck_sessions WHERE id = $1', [id])
  if (!rows.length) return res.status(404).json({ error: 'Session not found' })
  if (id === live.sessionId) {
    // Clear the live state first, so answers arriving during the reset are refused instead of re-saved.
    for (const r of Object.values(live.runs)) r.status = 'closed'
    live.runs = {}
    live.current = null
    if (!keepPlayers) live.players = {}
  }
  await writes
  await pool.query('DELETE FROM deck_answers WHERE session_id = $1', [id])
  await pool.query('DELETE FROM deck_runs WHERE session_id = $1', [id])
  if (!keepPlayers) await pool.query('DELETE FROM deck_players WHERE session_id = $1', [id])
  await pool.query(`UPDATE deck_sessions SET config = config - 'current' WHERE id = $1`, [id])
  res.json({ ok: true })
}))

app.post('/api/admin/config', admin, wrap(async (req, res) => {
  if (typeof req.body.publicUrl === 'string') await setSetting('publicUrl', req.body.publicUrl.trim())
  res.json({ ok: true, publicUrl: await getSetting('publicUrl', '') })
}))

// ----- slide images (uploaded from the admin console, stored in Postgres) -----
const MEDIA_NAME = /^[a-z0-9][a-z0-9-]{1,40}$/
const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
async function mediaIndex () {
  const { rows } = await pool.query('SELECT name, type, credit, updated_at, length(data) AS size FROM deck_media ORDER BY name')
  const out = {}
  for (const r of rows) out[r.name] = { v: new Date(r.updated_at).getTime(), type: r.type, credit: r.credit || '', size: Number(r.size) }
  return out
}
app.get('/api/media/:name', wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT type, data FROM deck_media WHERE name = $1', [req.params.name])
  if (!rows.length) return res.status(404).json({ error: 'No image named ' + req.params.name })
  res.set('Cache-Control', 'private, max-age=300').type(rows[0].type).send(rows[0].data)
}))
app.get('/api/admin/media', admin, wrap(async (_req, res) => res.json({ media: await mediaIndex() })))
app.put('/api/admin/media/:name', admin, wrap(async (req, res) => {
  const name = req.params.name
  if (!MEDIA_NAME.test(name)) return res.status(400).json({ error: 'Invalid image name' })
  const m = /^data:([a-z/+.-]+);base64,(.+)$/i.exec(String((req.body && req.body.dataUrl) || ''))
  if (!m || !MEDIA_TYPES.includes(m[1].toLowerCase())) return res.status(400).json({ error: 'Send a JPEG, PNG, WebP or GIF image' })
  const data = Buffer.from(m[2], 'base64')
  if (data.length > 3 * 1024 * 1024) return res.status(413).json({ error: 'The image is larger than 3 MB after resizing' })
  const credit = String((req.body && req.body.credit) || '').slice(0, 200)
  await pool.query(`INSERT INTO deck_media (name, type, data, credit, updated_at) VALUES ($1, $2, $3, $4, now())
    ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, data = EXCLUDED.data, credit = EXCLUDED.credit, updated_at = now()`, [name, m[1].toLowerCase(), data, credit])
  res.json({ ok: true, media: await mediaIndex() })
}))
app.patch('/api/admin/media/:name', admin, wrap(async (req, res) => {
  await pool.query('UPDATE deck_media SET credit = $2 WHERE name = $1', [req.params.name, String((req.body && req.body.credit) || '').slice(0, 200)])
  res.json({ ok: true, media: await mediaIndex() })
}))
app.delete('/api/admin/media/:name', admin, wrap(async (req, res) => {
  await pool.query('DELETE FROM deck_media WHERE name = $1', [req.params.name])
  res.json({ ok: true, media: await mediaIndex() })
}))

// ----- admin console: sessions -----
const toSession = s => ({
  id: Number(s.id), name: s.name, eventDate: s.event_date ? String(s.event_date).slice(0, 10) : null, place: s.place,
  status: s.status, createdAt: s.created_at, activatedAt: s.activated_at, archivedAt: s.archived_at,
  players: s.players !== undefined ? Number(s.players) : undefined, answers: s.answers !== undefined ? Number(s.answers) : undefined,
  chapters: s.config && Array.isArray(s.config.chapters) ? s.config.chapters : null
})

app.get('/api/admin/sessions', admin, wrap(async (_req, res) => {
  await writes
  const { rows } = await pool.query(`SELECT s.*,
      (SELECT count(*) FROM deck_players p WHERE p.session_id = s.id) AS players,
      (SELECT count(*) FROM deck_answers a WHERE a.session_id = s.id) AS answers
    FROM deck_sessions s ORDER BY COALESCE(s.event_date, s.created_at::date) DESC, s.id DESC`)
  res.json({ activeId: live.sessionId, sessions: rows.map(toSession) })
}))

function cleanConfig (c) {
  const d = defaultConfig()
  const cfg = Object.assign({}, d, c || {})
  cfg.speaker = Object.assign({}, d.speaker, (c && c.speaker) || {})
  if (!Array.isArray(cfg.speaker.focus)) cfg.speaker.focus = String(cfg.speaker.focus || '').split(',').map(s => s.trim()).filter(Boolean)
  if (!Array.isArray(cfg.hiddenSlides)) cfg.hiddenSlides = []
  if (cfg.chapters != null && (!Array.isArray(cfg.chapters) || !cfg.chapters.length)) cfg.chapters = null
  if (cfg.chapterOrder != null && !Array.isArray(cfg.chapterOrder)) cfg.chapterOrder = null
  if (cfg.slideOrder != null && (typeof cfg.slideOrder !== 'object' || Array.isArray(cfg.slideOrder))) cfg.slideOrder = null
  if (cfg.questions !== null && !Array.isArray(cfg.questions)) throw Object.assign(new Error('Questions must be a JSON list'), { status: 400 })
  if (Array.isArray(cfg.questions)) {
    for (const q of cfg.questions) {
      if (!q || !q.id || !['quiz', 'poll', 'wordcloud'].includes(q.type) || !q.prompt) throw Object.assign(new Error(`Each question needs id, type (quiz, poll or wordcloud) and prompt: check “${(q && q.id) || '?'}”`), { status: 400 })
      if (q.type !== 'wordcloud' && (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4)) throw Object.assign(new Error(`Question “${q.id}” needs 2 to 4 options`), { status: 400 })
      if (q.type === 'quiz' && !(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length)) throw Object.assign(new Error(`Question “${q.id}” needs a valid correct option index`), { status: 400 })
    }
  }
  delete cfg.current
  return cfg
}

app.post('/api/admin/sessions', admin, wrap(async (req, res) => {
  const { name, eventDate, place, copyFrom } = req.body || {}
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Give the session a name' })
  let cfg = defaultConfig()
  if (copyFrom) {
    const { rows } = await pool.query('SELECT config FROM deck_sessions WHERE id = $1', [copyFrom])
    if (rows.length) cfg = cleanConfig(rows[0].config)
  }
  const { rows } = await pool.query(`INSERT INTO deck_sessions (name, event_date, place, status, config) VALUES ($1, $2, $3, 'draft', $4) RETURNING *`,
    [String(name).trim(), eventDate || null, place || null, cfg])
  res.status(201).json({ session: toSession(rows[0]) })
}))

app.get('/api/admin/sessions/:id', admin, wrap(async (req, res) => {
  await writes
  const id = Number(req.params.id)
  const { rows } = await pool.query('SELECT * FROM deck_sessions WHERE id = $1', [id])
  if (!rows.length) return res.status(404).json({ error: 'Session not found' })
  const cfg = cleanConfig(rows[0].config)
  const board = await pool.query(`SELECT p.name, COALESCE(SUM(a.points), 0)::int AS score
    FROM deck_players p LEFT JOIN deck_answers a ON a.player_id = p.id AND a.session_id = p.session_id
    WHERE p.session_id = $1 GROUP BY p.id, p.name ORDER BY score DESC, p.name LIMIT 50`, [id])
  const counts = await pool.query(`SELECT question_id, value, count(*)::int AS n FROM deck_answers WHERE session_id = $1 GROUP BY 1, 2`, [id])
  const players = await pool.query('SELECT count(*)::int AS n FROM deck_players WHERE session_id = $1', [id])
  const qs = questionMap(cfg)
  const perQuestion = Object.values(qs).map(q => {
    const mine = counts.rows.filter(c => c.question_id === q.id)
    const total = mine.reduce((s, c) => s + c.n, 0)
    if (q.type === 'wordcloud') return { id: q.id, type: q.type, prompt: q.prompt, total, words: mine.map(c => ({ text: c.value, n: c.n })).sort((a, b) => b.n - a.n).slice(0, 15) }
    return { id: q.id, type: q.type, prompt: q.prompt, total, correct: q.type === 'quiz' ? q.correct : null, options: (q.options || []).map((o, i) => ({ text: o, n: (mine.find(c => c.value === i) || { n: 0 }).n })) }
  })
  res.json({ session: toSession(rows[0]), config: cfg, defaultQuestions: fileQuestions(), results: { players: players.rows[0].n, leaderboard: board.rows, questions: perQuestion } })
}))

app.put('/api/admin/sessions/:id', admin, wrap(async (req, res) => {
  const id = Number(req.params.id)
  const { name, eventDate, place, config } = req.body || {}
  let cfg
  try { cfg = cleanConfig(config) } catch (e) { return res.status(e.status || 400).json({ error: e.message }) }
  if (id === live.sessionId) cfg.current = live.current
  const { rows } = await pool.query(`UPDATE deck_sessions SET name = COALESCE($2, name), event_date = $3, place = $4, config = $5 WHERE id = $1 RETURNING *`,
    [id, name ? String(name).trim() : null, eventDate || null, place || null, cfg])
  if (!rows.length) return res.status(404).json({ error: 'Session not found' })
  if (id === live.sessionId) { live.config = Object.assign(defaultConfig(), cfg); live.questions = questionMap(live.config) }
  res.json({ session: toSession(rows[0]) })
}))

app.post('/api/admin/sessions/:id/activate', admin, wrap(async (req, res) => {
  const id = Number(req.params.id)
  await writes
  const { rows } = await pool.query('SELECT id FROM deck_sessions WHERE id = $1', [id])
  if (!rows.length) return res.status(404).json({ error: 'Session not found' })
  await pool.query(`UPDATE deck_sessions SET status = 'archived', archived_at = now() WHERE status = 'active' AND id <> $1`, [id])
  await pool.query(`UPDATE deck_sessions SET status = 'active', activated_at = now(), archived_at = NULL WHERE id = $1`, [id])
  await loadActive()
  res.json({ ok: true, activeId: live.sessionId })
}))

app.delete('/api/admin/sessions/:id', admin, wrap(async (req, res) => {
  const id = Number(req.params.id)
  if (id === live.sessionId) return res.status(409).json({ error: 'Activate another session before deleting this one' })
  await pool.query('DELETE FROM deck_sessions WHERE id = $1', [id])
  res.json({ ok: true })
}))

app.get('/api/admin/sessions/:id/export', admin, wrap(async (req, res) => {
  await writes
  const id = Number(req.params.id)
  const s = await pool.query('SELECT * FROM deck_sessions WHERE id = $1', [id])
  if (!s.rows.length) return res.status(404).json({ error: 'Session not found' })
  const players = await pool.query('SELECT id, name, joined_at FROM deck_players WHERE session_id = $1 ORDER BY joined_at', [id])
  const answers = await pool.query('SELECT question_id, player_id, value, points, answered_at FROM deck_answers WHERE session_id = $1 ORDER BY answered_at', [id])
  res.json({ session: toSession(s.rows[0]), config: s.rows[0].config, players: players.rows, answers: answers.rows })
}))

app.use((err, _req, res, _next) => {
  console.error('[api]', err)
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong: ' + err.message })
})

// ---- static pages ----
// Default speaker photo, kept as base64 text so it survives any text-only file sync.
const SPEAKER_JPG = (() => { try { return Buffer.from(fs.readFileSync(path.join(ROOT, 'assets', 'speaker.jpg.b64'), 'utf8').trim(), 'base64') } catch (_) { return null } })()
app.get('/speaker.jpg', (_req, res) => {
  if (!SPEAKER_JPG) return res.status(404).end()
  res.set('Cache-Control', 'public, max-age=3600').type('image/jpeg').send(SPEAKER_JPG)
})
// Images kept as base64 text in assets/ (text survives the preview's file sync): /img/<name> → assets/<name>.b64
const IMG_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml' }
const imgCache = {}
app.get('/img/:name', (req, res) => {
  const name = req.params.name
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (!/^[a-z0-9._-]+$/i.test(name) || !IMG_TYPES[ext]) return res.status(404).end()
  if (!imgCache[name]) {
    try { imgCache[name] = Buffer.from(fs.readFileSync(path.join(ROOT, 'assets', name + '.b64'), 'utf8').trim(), 'base64') } catch (_) { return res.status(404).end() }
  }
  res.set('Cache-Control', 'public, max-age=3600').type(IMG_TYPES[ext]).send(imgCache[name])
})
app.use(express.static(path.join(ROOT, 'public'), { extensions: ['html'] }))
app.get('/join', (_req, res) => res.sendFile(path.join(ROOT, 'public', 'join.html')))


// On a stop or restart, write pending answers to the database before exiting.
let stopping = false
async function shutdown () {
  if (stopping) return
  stopping = true
  try { await Promise.race([writes, new Promise(resolve => setTimeout(resolve, 8000))]) } finally { process.exit(0) }
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
const port = Number(process.env.PORT) || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`Agile live deck listening on port ${port}`)
  ready().catch(e => console.error('[deck] database setup failed, retrying on next request:', e.message))
})
