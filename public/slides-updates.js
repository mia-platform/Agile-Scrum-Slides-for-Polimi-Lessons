// Updates to the lesson (Oct 16, 2026), applied on top of slides.js and slides-agentic.js:
//  - Scrum artifacts: details and an animation for each artifact, plus a quiz right after
//  - Sprint 0 … N: "Sprint 3 … Sprint N" as text on the right
//  - Roles: an animation for each role
//  - Email client example after "Product Backlog"; the living backlog now moves the same email client items
//  - Issue tracker example: acceptance criteria for both epics
//  - The AI-powered DevOps loop replaces the "API is slow" example; the human-in-the-loop poll follows it
//  - Removed: "AI agents: the future of the SDLC?" wheel and "Faster validation for business…"
//  - Poll on lines of code per hour before "Code is becoming a commodity"
//  - Harness engineering: new layout
// Keys (see Live.slideKey) stay the same for replaced slides, so hidden-slide and order settings keep working.
(function () {
  const K = window.SlideKit
  const { slideKey } = window.Live
  const S = window.SLIDES
  const live = K.live
  const credit = K.credit
  const AR = credit('Agile Reloaded — Attribution-ShareAlike 4.0 International License')

  const idx = key => S.findIndex(d => slideKey(d) === key)
  const replace = (key, def) => { const i = idx(key); if (i >= 0) S[i] = Object.assign({ key }, def); return i }
  const insertAfter = (key, ...defs) => { const i = idx(key); S.splice(i >= 0 ? i + 1 : S.length, 0, ...defs) }
  const insertBefore = (key, ...defs) => { const i = idx(key); S.splice(i >= 0 ? i : S.length, 0, ...defs) }
  const remove = key => { const i = idx(key); return i >= 0 ? S.splice(i, 1)[0] : null }

  const css = `
  .up-anim { animation-play-state: paused !important; }
  .on .up-anim, .up-anim.on, .slide.active.up-loop .up-anim, .print-mode .up-anim { animation-play-state: running !important; }
  .up-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; flex: 1; min-height: 0; }
  .up-cards .card { display: flex; flex-direction: column; padding: 22px 26px; }
  .up-cards svg { width: 100%; height: 150px; display: block; margin-bottom: 10px; overflow: visible; }
  .up-cards h3 { font-size: 34px; margin: 0 0 4px; }
  .up-cards .what { font-size: 22px; font-weight: 600; color: var(--sea); margin: 0 0 10px; }
  .up-cards ul { padding-left: 1em; }
  .up-cards li { font-size: 20px; line-height: 1.35; margin-bottom: 6px; }
  .up-cards .owner { margin-top: auto; font-size: 18px; color: var(--mist); }
  @keyframes up-slidein { 0%, 8% { transform: translateX(260px); opacity: 0; } 30%, 80% { transform: translateX(0); opacity: 1; } 95%, 100% { transform: translateX(0); opacity: 0; } }
  @keyframes up-shift { 0%, 8% { transform: translateY(0); } 30%, 80% { transform: translateY(26px); } 95%, 100% { transform: translateY(0); } }
  @keyframes up-move3 { 0%, 10% { transform: translateX(0); } 35%, 50% { transform: translateX(94px); } 75%, 92% { transform: translateX(188px); } 100% { transform: translateX(188px); opacity: 0; } }
  @keyframes up-drop { 0% { transform: translateY(-140px); opacity: 0; } 20% { transform: translateY(0); opacity: 1; } 85% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(0); opacity: 0; } }
  @keyframes up-pop { 0%, 70% { transform: scale(0); } 80%, 92% { transform: scale(1); } 100% { transform: scale(0); } }
  @keyframes up-rankup { 0%, 15% { transform: translateY(0); } 45%, 85% { transform: translateY(-78px); } 100% { transform: translateY(0); } }
  @keyframes up-rankdown { 0%, 15% { transform: translateY(0); } 45%, 85% { transform: translateY(26px); } 100% { transform: translateY(0); } }
  @keyframes up-fly { 0%, 10% { transform: translate(0, 0); opacity: 1; } 55% { transform: translate(var(--fx), var(--fy)); opacity: 1; } 65%, 100% { transform: translate(var(--fx), var(--fy)); opacity: 0; } }
  @keyframes up-bounce { 0% { transform: translateX(0); opacity: 0; } 10% { opacity: 1; } 45% { transform: translateX(-150px); } 70% { transform: translateX(-90px) translateY(-30px); opacity: 1; } 85%, 100% { transform: translateX(-60px) translateY(-60px); opacity: 0; } }
  @keyframes up-dashmove { to { stroke-dashoffset: -64; } }
  @keyframes up-rock { 0%, 30% { transform: translateX(0); } 60%, 100% { transform: translateX(110px); opacity: 0; } }
  .sa-cal { flex: 1; display: grid; grid-template-columns: 1fr 260px; gap: 26px; }
  .sa-more { align-self: center; font-family: var(--display); font-weight: 800; font-size: 44px; line-height: 1.05; color: var(--sea); }
  .sa-more small { display: block; font-family: var(--body); font-weight: 500; font-size: 20px; color: var(--mist); margin-top: 10px; line-height: 1.35; }
  .up-mail { display: grid; gap: 8px; max-width: 1180px; position: relative; }
  .up-mail .r { display: grid; grid-template-columns: 56px 1fr 130px 120px; align-items: center; gap: 16px; height: 54px; padding: 0 20px; border-radius: 12px; background: var(--white); border: 2px solid var(--line); font-size: 24px; font-weight: 600; }
  .up-mail .r .rk { font-family: var(--display); font-weight: 800; font-size: 28px; color: var(--mist); }
  .up-mail .r .ty { font-size: 16px; font-weight: 600; padding: 4px 10px; border-radius: 999px; color: var(--white); justify-self: start; }
  .up-mail .r .ty.story { background: var(--sea); } .up-mail .r .ty.feature { background: var(--sea-2); } .up-mail .r .ty.epic { background: var(--deep); }
  .up-mail .r .pt { font-family: var(--display); font-weight: 800; font-size: 26px; text-align: right; opacity: 0; transition: opacity .5s ease; }
  .up-mail.pts .r .pt { opacity: 1; }
  .up-mail.cut .r.in { border-color: var(--buoy); background: #FFF4F1; }
  .up-mail .line { height: 0; border-top: 4px dashed var(--buoy); position: relative; margin: 2px 0; opacity: 0; transition: opacity .5s ease; }
  .up-mail .line span { position: absolute; right: 0; top: -15px; background: var(--lagoon); padding: 0 12px; font-size: 20px; font-weight: 700; color: var(--buoy); }
  .up-mail.cut .line { opacity: 1; }
  .up-loop svg { width: 100%; height: 100%; display: block; }
  .up-loop .nd circle { fill: #FFFFFF; stroke: #1C7C9C; stroke-width: 5; transition: fill .4s ease, stroke .4s ease; }
  .up-loop .nd text { font-family: var(--body); }
  .up-loop .nd .num { font-family: var(--display); font-weight: 800; font-size: 30px; fill: #1C7C9C; }
  .up-loop .nd .lb { font-weight: 700; font-size: 26px; fill: #0B2540; }
  .up-loop .nd.cur circle { fill: #FF5A36; stroke: #FF5A36; }
  .up-loop .nd.cur .num { fill: #FFFFFF; }
  .up-loop .nd.cur .lb { fill: #FF5A36; }
  .up-loop .cap { min-height: 120px; display: grid; grid-template-columns: 300px 1fr; gap: 28px; align-items: start; border-top: 2px solid var(--line); padding-top: 16px; }
  .up-loop .cap h3 { font-size: 40px; margin: 0; }
  .up-loop .cap p { font-size: 26px; line-height: 1.35; margin: 0; color: var(--deep); }
  .up-harness { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 520px 1fr; gap: 30px; align-items: center; }
  .up-harness .col { display: grid; gap: 26px; }
  .up-harness .card { display: grid; grid-template-columns: 76px 1fr; gap: 18px; align-items: center; padding: 20px 22px; }
  .up-harness .card .who { width: 76px; height: 76px; border-radius: 50%; background: var(--deep); display: grid; place-items: center; font-size: 40px; }
  .up-harness .card h3 { font-size: 30px; margin: 0 0 4px; }
  .up-harness .card p { font-size: 20px; line-height: 1.3; color: var(--mist); margin: 0; }
  .up-harness svg { width: 100%; max-height: 520px; display: block; }
  @media (prefers-reduced-motion: reduce) { .up-anim { animation: none !important; } }
  `
  const st = document.createElement('style')
  st.textContent = css
  document.head.appendChild(st)

  // ================= Scrum artifacts =================
  const bar = (y, w, fill, extra = '') => `<rect x="20" y="${y}" width="${w}" height="20" rx="6" fill="${fill}" ${extra}/>`
  const pbArt = `<svg viewBox="0 0 300 150" aria-hidden="true">
      ${bar(8, 220, '#1C7C9C')}
      ${bar(34, 200, '#1C7C9C')}
      <g class="up-anim" style="animation:up-shift 6s ease-in-out infinite">${bar(60, 180, '#2FA3C4')}${bar(86, 160, '#2FA3C4')}${bar(112, 140, '#0B2540')}</g>
      <g class="up-anim" style="animation:up-slidein 6s ease-in-out infinite">${bar(60, 190, '#FF5A36')}<text x="215" y="75" font-size="16" font-weight="700" fill="#FF5A36">new</text></g>
    </svg>`
  const sbArt = `<svg viewBox="0 0 300 150" aria-hidden="true">
      ${['To do', 'Doing', 'Done'].map((t, i) => `<rect x="${12 + i * 94}" y="4" width="86" height="140" rx="10" fill="#D6EEF5"/><text x="${55 + i * 94}" y="26" text-anchor="middle" font-size="16" font-weight="700" fill="#0B2540">${t}</text>`).join('')}
      <rect x="22" y="70" width="66" height="26" rx="5" fill="#F2C14E"/><rect x="22" y="102" width="66" height="26" rx="5" fill="#F2C14E"/>
      <rect x="210" y="70" width="66" height="26" rx="5" fill="#2E9E6B"/>
      <g class="up-anim" style="animation:up-move3 6s ease-in-out infinite"><rect x="22" y="38" width="66" height="26" rx="5" fill="#FF5A36"/></g>
    </svg>`
  const incArt = `<svg viewBox="0 0 300 150" aria-hidden="true">
      <rect x="40" y="132" width="220" height="10" rx="5" fill="#C5D7E0"/>
      ${[0, 1, 2].map(i => `<g class="up-anim" style="animation:up-drop 6s ease-out ${i * 0.6}s infinite"><rect x="${50 + i * 62}" y="82" width="56" height="48" rx="8" fill="${['#1C7C9C', '#2FA3C4', '#0B2540'][i]}"/><text x="${78 + i * 62}" y="113" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">S${i + 1}</text></g>`).join('')}
      <g class="up-anim" style="animation:up-pop 6s ease-out infinite;transform-box:fill-box;transform-origin:center"><circle cx="262" cy="52" r="24" fill="#2E9E6B"/><path d="M250,52 l9,9 l16,-18" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    </svg>`
  replace('t:scrum-artifacts', {
    steps: 3,
    html: `
      <h2>Scrum artifacts</h2>
      <div class="up-cards">
        <div class="card" data-step="1">${pbArt}<h3>Product Backlog</h3><p class="what">What to do</p>
          <ul><li>One ordered list of everything the product needs</li><li>Ranked by value, always evolving</li><li>Top items small, clear and ready</li></ul>
          <p class="owner">Owned by the Product Owner</p></div>
        <div class="card" data-step="2">${sbArt}<h3>Sprint Backlog</h3><p class="what">What we do in this sprint, and how</p>
          <ul><li>The items picked in Sprint Planning, plus their tasks</li><li>Serves the sprint goal</li><li>Updated every day, visible to all</li></ul>
          <p class="owner">Owned by the Development Team</p></div>
        <div class="card" data-step="3">${incArt}<h3>Increment (PSPI)</h3><p class="what">Potentially shippable product increment</p>
          <ul><li>Done: built, tested, integrated</li><li>Meets the Definition of Done</li><li>Each sprint adds to the previous ones</li></ul>
          <p class="owner">Shown in the Sprint Review</p></div>
      </div>${AR}`
  })
  insertAfter('t:scrum-artifacts', { q: 'q-artifacts', html: live('q-artifacts') })

  // ================= Sprint 0 … N =================
  const DAYS = []
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  for (let i = 1; i < 26; i++) DAYS.push(names[i % 5])
  const sbar = (col, len, label, sub, cls = '') =>
    `<div class="sprint-bar ${cls}" style="left:${col / 25 * 100}%;width:calc(${len / 25 * 100}% - 4px)">${label}<small>${sub}</small><span class="ev">${'<i></i>'.repeat(Math.min(len, 10))}</span></div>`
  replace('t:sprint-0-sprint-1-sprint-n', {
    steps: 4,
    html: `
      <h2>Sprint 0, Sprint 1 … Sprint N</h2>
      <div class="sa-cal">
        <div class="cal">
          <div class="days" style="grid-template-columns:repeat(25,1fr)">${DAYS.map(d => `<div class="d ${d === 'Mon' ? 'mon' : ''}">${d}</div>`).join('')}</div>
          <div class="lane" data-step="1">${sbar(0, 5, 'Sprint 0', 'Tuesday → Monday: team, tools, first backlog', 'zero')}</div>
          <div class="lane" data-step="2">${sbar(5, 10, 'Sprint 1', 'Planning on Tuesday · review &amp; retro on Monday')}</div>
          <div class="lane" data-step="3">${sbar(15, 10, 'Sprint 2', 'Same length, same rhythm')}</div>
          <p class="small">Yellow dots: one Daily Scrum per working day.</p>
        </div>
        <div class="sa-more" data-step="4">Sprint 3 … Sprint N →<small>A steady cadence makes the team predictable.</small></div>
      </div>`
  })

  // ================= Roles =================
  const poArt = `<svg viewBox="0 0 300 150" aria-hidden="true">
      ${bar(16, 200, '#1C7C9C')}
      <g class="up-anim" style="animation:up-rankdown 5s ease-in-out infinite">${bar(42, 180, '#2FA3C4')}${bar(68, 160, '#2FA3C4')}${bar(94, 140, '#2FA3C4')}</g>
      <g class="up-anim" style="animation:up-rankup 5s ease-in-out infinite">${bar(120, 170, '#FF5A36')}</g>
      <text x="236" y="62" font-size="38">🧭</text><text x="236" y="98" font-size="15" font-weight="700" fill="#0B2540">value ↑</text>
    </svg>`
  const dtArt = `<svg viewBox="0 0 300 150" aria-hidden="true">
      <path d="M180,70 L280,70 L270,140 L190,140 Z" fill="#E9C88A" stroke="#0B2540" stroke-width="3"/>
      <text x="230" y="112" text-anchor="middle" font-size="16" font-weight="700" fill="#0B2540">increment</text>
      ${[[30, 20], [30, 70], [80, 45]].map(([x, y], i) => `<g class="up-anim" style="--fx:${200 - x}px;--fy:${60 - y}px;animation:up-fly 5s ease-in ${i * 0.5}s infinite"><rect x="${x}" y="${y}" width="36" height="36" rx="6" fill="${['#1C7C9C', '#2E9E6B', '#F2C14E'][i]}"/></g>`).join('')}
      <g class="up-anim" style="animation:up-pop 5s ease-out infinite;transform-box:fill-box;transform-origin:center"><circle cx="268" cy="40" r="22" fill="#2E9E6B"/><path d="M257,40 l8,8 l15,-16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    </svg>`
  const smArt = `<svg viewBox="0 0 300 150" aria-hidden="true">
      ${[[40, 50], [70, 85], [40, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="#2E9E6B"/>`).join('')}
      <path d="M150,30 L190,42 L190,90 Q190,125 150,140 Q110,125 110,90 L110,42 Z" fill="#1C7C9C" opacity=".9"/>
      <text x="150" y="98" text-anchor="middle" font-size="30">🤝</text>
      ${[0, 1].map(i => `<g class="up-anim" style="animation:up-bounce 4s ease-in ${i * 2}s infinite"><text x="270" y="${60 + i * 50}" font-size="28">⚡</text></g>`).join('')}
      <g class="up-anim" style="animation:up-rock 5s ease-in-out infinite"><path d="M196,142 q8,-24 30,-20 q20,-6 26,16 z" fill="#8A5A2B"/></g>
    </svg>`
  replace('t:roles', {
    steps: 3,
    html: `
      <h2>Roles</h2>
      <div class="up-cards">
        <div class="card role po" data-step="1">${poArt}<h3>Product Owner</h3><p class="what">Defines the product backlog</p>
          <ul><li>Maximizes the value the team delivers</li><li>Ranks the backlog with stakeholders</li><li>Accepts or rejects the work done</li></ul></div>
        <div class="card role dt" data-step="2">${dtArt}<h3>Development Team</h3><p class="what">Builds the product increment</p>
          <ul><li>Self-organized and cross-functional</li><li>Turns backlog items into a done increment</li><li>Builds with quality, every sprint</li></ul></div>
        <div class="card role sm" data-step="3">${smArt}<h3>Scrum Master</h3><p class="what">Facilitates and serves the team</p>
          <ul><li>Removes impediments</li><li>Protects the team from interruptions</li><li>Coaches Scrum and agile practices</li></ul></div>
      </div>`
  })

  // ================= Email client backlog =================
  const MAIL = [
    ['Read the inbox', 'story', 3, true], ['Send an email', 'story', 5, true], ['Reply to an email', 'story', 3, true],
    ['Attachments', 'feature', 8], ['Full-text search', 'feature', 13], ['Calendar integration', 'epic', '?'], ['Mobile app', 'epic', '?']
  ]
  insertAfter('t:product-backlog', {
    key: 't:example-the-backlog-of-an-email-client',
    steps: 4,
    html: `
      <h2>Example: the backlog of an email client</h2>
      <div class="up-mail" data-mail>
        ${MAIL.map((m, i) => `${i === 3 ? '<div class="line"><span>Team capacity: 11 points → Sprint 1</span></div>' : ''}<div class="r ${m[3] ? 'in' : ''}" data-step="1" style="transition-delay:${i * 90}ms"><span class="rk">${i + 1}</span><span>${m[0]}</span><span class="ty ${m[1]}">${m[1]}</span><span class="pt">${m[2]}${m[2] === '?' ? '' : ' pts'}</span></div>`).join('')}
      </div>
      <p class="lead" data-step="4" style="margin-top:auto;font-size:28px">Ranked by value, estimated by the team. Epics at the bottom stay big and fuzzy until we need them.</p>`,
    onStep (el, step) {
      const m = el.querySelector('[data-mail]')
      m.classList.toggle('pts', step >= 2)
      m.classList.toggle('cut', step >= 3)
    }
  })

  // ================= Living backlog (email client) =================
  const ITEMS = {
    s1: ['story', 'Read the inbox'], s2: ['story', 'Send an email'], s3: ['story', 'Reply to an email'],
    f1: ['feature', 'Attachments'], f2: ['feature', 'Full-text search'], f3: ['feature', 'Undo send'],
    e1: ['epic', 'Calendar integration'], e2: ['epic', 'Mobile app'],
    s4: ['story', 'Accept a meeting invite'], s5: ['story', 'Show invites in the inbox']
  }
  const ORDER = [
    ['s1', 's2', 's3', 'f1', 'f2', 'e1', 'e2'],
    ['s1', 's2', 's3', 'f1', 'f3', 'f2', 'e1', 'e2'],
    ['s1', 's3', 's2', 'f3', 'f1', 'f2', 'e1', 'e2'],
    ['s1', 's3', 's2', 'f3', 'f1', 'e1', 'e2'],
    ['s1', 's3', 's2', 's4', 's5', 'f3', 'f1', 'e2'],
    ['s1', 's3', 's2', 's4', 's5', 'f3', 'f1', 'e2']
  ]
  const OPS = [
    ['A living product backlog', 'The email client backlog: small, detailed items at the top; big, fuzzy ones at the bottom.'],
    ['Insert', 'Users keep sending emails by mistake: a new feature, Undo send, arrives.'],
    ['Reorder', 'Replying matters more than sending new mail in the first release, and Undo send beats Attachments.'],
    ['Remove', 'Full-text search is dropped: the mail provider’s search is enough for now.'],
    ['Refine', 'The Calendar integration epic is split into stories ready for a sprint.'],
    ['Next sprint', 'The top items become the sprint backlog of the next sprint.']
  ]
  const HOT = [[], ['f3'], ['s3', 'f3'], [], ['s4', 's5'], ['s1', 's3', 's2']]
  replace('t:a-living-product-backlog', {
    steps: 5,
    html: `
      <h2>A living product backlog</h2>
      <div class="backlog" data-backlog>
        ${Object.entries(ITEMS).map(([id, [k, t]]) => `<div class="bitem ${k} hidden" data-id="${id}" style="width:800px;top:0"><span class="kind">${k}</span>${t}</div>`).join('')}
        <div class="blegend"><div class="op" data-op></div><p class="lead" data-op-text style="font-size:30px"></p></div>
      </div>${credit('Source: Mokabyte.it — Giovanni Puliti (adapted to the email client example)')}`,
    onStep (el, step) {
      const H = { story: 46, feature: 60, epic: 84 }
      const order = ORDER[step]
      let y = 0
      el.querySelectorAll('.bitem').forEach(b => {
        const id = b.dataset.id
        b.classList.toggle('hot', HOT[step].includes(id))
        if (order.indexOf(id) < 0) {
          const wasVisible = !b.classList.contains('hidden')
          b.classList.toggle('gone', wasVisible || b.classList.contains('gone'))
          if (!wasVisible) b.classList.add('hidden')
        } else b.classList.remove('hidden', 'gone')
      })
      for (const id of order) {
        const b = el.querySelector(`.bitem[data-id="${id}"]`)
        b.style.top = y + 'px'
        y += H[ITEMS[id][0]] + 8
      }
      el.querySelector('[data-op]').textContent = OPS[step][0]
      el.querySelector('[data-op-text]').textContent = OPS[step][1]
    }
  })

  // ================= Issue tracker: AC for both epics =================
  replace('t:example-stories-for-an-issue-tracker', {
    steps: 3,
    html: `
      <h2>Example: stories for an issue tracker</h2>
      <p class="small" style="margin-top:-20px;margin-bottom:22px">Imagine you are the R&amp;D team developing Jira.</p>
      <div class="tree">
        <div class="node theme">Theme: Issue</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div style="display:grid;gap:12px;align-content:start">
            <div class="node epic" data-step="1">Epic: View issues</div>
            <div class="node st" data-step="2">As a user, I want to view all my pending issues, so that I can know when they will be solved</div>
            <div class="node st" data-step="2">As a developer, I want to view all my pending issues, so that I can analyze them</div>
            <div class="node ac" data-step="3">AC1 — Verify that only pending issues are listed<br>AC2 — Verify that only issues of the logged user are listed</div>
          </div>
          <div style="display:grid;gap:12px;align-content:start">
            <div class="node epic" data-step="1">Epic: Solve issue</div>
            <div class="node st" data-step="2">As a developer, I want to change the issue state to “fixed”, so that the issue queue can be updated</div>
            <div class="node st" data-step="2">As a user, I want to be notified when an issue is solved, so that I can download the new version</div>
            <div class="node ac" data-step="3">AC1 — Verify that only the assignee can set an issue to “fixed”<br>AC2 — Verify that the reporter is notified with the version that contains the fix</div>
          </div>
        </div>
      </div>`
  })

  // ================= The AI-powered DevOps loop =================
  const PH = [
    ['Plan', 'Defining backlogs, estimating tasks, identifying relevant projects and teams, recommending catalog components.'],
    ['Analyze', 'Analyzing existing platform components and recommending new features based on existing data.'],
    ['Design', 'Automating configuration, designing custom functions, generating applications, giving security recommendations.'],
    ['Code', 'Code generation in the IDE, frontend interfaces on demand, synthetic data for testing.'],
    ['Test', 'Creating test cases, analyzing code coverage, insights for end-to-end testing.'],
    ['Deploy', 'Clear summaries of changes and impact, automated and schedule-based deployments.'],
    ['Operate', 'Proactive monitoring of runtime environments, alerts on potential issues, resource consumption insights.'],
    ['Document', 'Detailed documentation with insights and a step-by-step guide for the solution.'],
    ['Improve', 'Helping the team find application improvements and propose updates. Then the loop starts again.']
  ]
  const CX = 700
  const CY = 235
  const A = 600
  const lem = t => { const d = 1 + Math.sin(t) ** 2; return [CX + A * Math.cos(t) / d, CY + A * Math.sin(t) * Math.cos(t) / d] }
  const sample = (t0, t1, n = 240) => Array.from({ length: n + 1 }, (_, i) => lem(t0 + (t1 - t0) * i / n))
  const devPts = sample(Math.PI / 2, 3 * Math.PI / 2)
  const opsPts = sample(3 * Math.PI / 2, 5 * Math.PI / 2)
  const atFractions = (pts, n) => {
    const acc = [0]
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
    const L = acc[acc.length - 1]
    return Array.from({ length: n }, (_, k) => { const target = L * (k + 1) / (n + 1); const j = acc.findIndex(v => v >= target); return pts[Math.max(0, j)] })
  }
  const NODES = [...atFractions(devPts, 5), ...atFractions(opsPts, 4)]
  const loopD = 'M' + [...devPts, ...opsPts.slice(1)].map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' Z'
  const OVER = ['Every phase, with AI agents', 'From planning to improving, AI agents can help in every phase of the DevOps loop. People keep it pointed at value.']
  const devops = {
    key: 't:the-ai-powered-devops-loop',
    steps: PH.length,
    cls: 'up-loop',
    html: `
      <h2 style="margin-bottom:6px">The AI-powered DevOps loop</h2>
      <div class="grow"><svg viewBox="0 -70 1400 610" aria-hidden="true">
        <text x="${CX - 360}" y="${CY + 26}" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="76" fill="#D6EEF5">DEV</text>
        <text x="${CX + 360}" y="${CY + 26}" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="76" fill="#FFE2D9">OPS</text>
        <path class="draw" data-loop pathLength="1000" style="--len:1000" d="${loopD}" fill="none" stroke="#C5D7E0" stroke-width="30" stroke-linejoin="round"/>
        <path d="${loopD}" fill="none" stroke="#1C7C9C" stroke-width="4" stroke-dasharray="14 18" class="up-anim" style="animation:up-dashmove 1.6s linear infinite"/>
        ${[0, 1, 2].map(i => `<circle r="11" fill="#FF5A36"><animateMotion dur="12s" begin="${-i * 4}s" repeatCount="indefinite" path="${loopD}"/></circle>`).join('')}
        ${NODES.map((p, i) => {
          const up = p[1] <= CY
          return `<g class="nd" data-i="${i}"><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="40"/><text class="num" x="${p[0].toFixed(1)}" y="${(p[1] + 11).toFixed(1)}" text-anchor="middle">${i + 1}</text><text class="lb" x="${p[0].toFixed(1)}" y="${(p[1] + (up ? -54 : 76)).toFixed(1)}" text-anchor="middle">${PH[i][0]}</text></g>`
        }).join('')}
      </svg></div>
      <div class="cap"><h3 data-t>${OVER[0]}</h3><p data-p>${OVER[1]}</p></div>`,
    onEnter (el) {
      const p = el.querySelector('[data-loop]')
      p.classList.remove('on')
      void p.getBoundingClientRect()
      p.classList.add('on')
    },
    onStep (el, step) {
      el.querySelectorAll('.nd').forEach((n, i) => n.classList.toggle('cur', i === step - 1))
      el.querySelector('[data-t]').textContent = step ? `${step}. ${PH[step - 1][0]}` : OVER[0]
      el.querySelector('[data-p]').textContent = step ? PH[step - 1][1] : OVER[1]
    }
  }
  remove('t:ai-agents-the-future-of-the-sdlc')
  remove('t:faster-validation-for-business-better-execution-for-tech')
  const qai = remove('q:q-ai') || { q: 'q-ai', html: live('q-ai') }
  if (replace('t:example-an-api-is-slow-in-production', devops) < 0) insertAfter('t:the-desired-experience', devops)
  insertAfter('t:the-ai-powered-devops-loop', qai)

  // ================= Lines of code per hour poll =================
  insertBefore('t:code-is-becoming-a-commodity', { q: 'q-loc-hour', html: live('q-loc-hour') })

  // ================= Harness engineering: layout =================
  const hcard = (step, t, p) => `<div class="card" data-step="${step}"><div class="who">🧑‍💻</div><div><h3>${t}</h3><p>${p}</p></div></div>`
  replace('t:harness-engineering-people-behind-the-agentic-loop', {
    steps: 4,
    html: `
      <h2 style="margin-bottom:16px">Harness engineering: people behind the agentic loop</h2>
      <div class="up-harness">
        <div class="col">${hcard(1, 'Intent &amp; constraints', 'What is worth building, and what must never happen')}${hcard(4, 'Measure value', 'Feedback loops, DORA metrics, cost vs value')}</div>
        <svg viewBox="0 0 600 600" aria-hidden="true">
          <circle cx="300" cy="300" r="268" fill="none" stroke="#C5D7E0" stroke-width="34"/>
          ${[[-1, -1, 1], [1, -1, 2], [1, 1, 3], [-1, 1, 4]].map(([sx, sy, s]) => `<circle data-step="${s}" cx="${300 + sx * 189.5}" cy="${300 + sy * 189.5}" r="22" fill="#0B2540" stroke="#FFFFFF" stroke-width="6"/>`).join('')}
          <circle cx="300" cy="300" r="190" fill="#FFFFFF" stroke="#1C7C9C" stroke-width="10"/>
          <g class="orbit" style="transform-origin:300px 300px"><circle cx="300" cy="110" r="14" fill="#FF5A36"/></g>
          <text x="300" y="268" text-anchor="middle" font-size="72">🤖</text>
          <text x="300" y="330" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="44" fill="#0B2540">Agentic loop</text>
          <text x="300" y="370" text-anchor="middle" font-size="22" fill="#5E7387">plan · code · test</text>
          <text x="300" y="400" text-anchor="middle" font-size="22" fill="#5E7387">deploy · operate</text>
        </svg>
        <div class="col">${hcard(2, 'Context &amp; playbooks', 'The right knowledge, skills and tools')}${hcard(3, 'Guardrails &amp; review', 'Approve the intent, say “no” when needed')}</div>
      </div>`
  })
})()
