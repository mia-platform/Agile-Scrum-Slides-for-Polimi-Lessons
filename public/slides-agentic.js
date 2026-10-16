// Agentic SDLC section + closing remarks.
// Merged from "Telemetry for the Mind" (Cloud Native London Meetup, Sept 2026),
// Anthropic Engineering "Redesigning source control at Anthropic" (Oct 13, 2026),
// and the 2027 outlook. Inserted before "What to read" and before the final word cloud.
(function () {
  const K = window.SlideKit
  const S = window.SLIDES
  const { live, credit, countUp } = K

  // ---------- styles for this section ----------
  const css = `
  .ag-flow { display: grid; grid-template-columns: 1fr 110px 1fr 110px 1fr; align-items: center; flex: 1; }
  .ag-node { border-radius: 22px; padding: 30px; background: var(--white); border: 2px solid var(--line); text-align: center; }
  .ag-node .ic { font-size: 84px; line-height: 1; }
  .ag-node h3 { font-size: 34px; margin-top: 14px; }
  .ag-node p { font-size: 22px; color: var(--mist); margin: 6px 0 0; }
  .ag-node.hot { border-color: var(--buoy); }
  .ag-pipe { height: 10px; border-radius: 5px; background: repeating-linear-gradient(90deg, var(--sea) 0 18px, transparent 18px 30px); background-size: 30px 10px; animation: ag-flowx 1s linear infinite; }
  @keyframes ag-flowx { to { background-position: 30px 0; } }
  .ag-statement { font-family: var(--display); font-weight: 800; font-size: 76px; line-height: 1; letter-spacing: -0.03em; }
  .ag-burn { height: 70px; border-radius: 14px; background: var(--foam); overflow: hidden; position: relative; margin: 26px 0 12px; }
  .ag-burn i { position: absolute; inset: 0; background: linear-gradient(90deg, #FF5A36, #F2C14E); transform-origin: right center; transition: transform 3.2s cubic-bezier(.6, 0, .9, .6); }
  .ag-burn.go i { transform: scaleX(0); }
  .ag-months { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; font-size: 16px; color: var(--mist); text-align: center; }
  .ag-months span:nth-child(-n+4) { color: var(--buoy); font-weight: 600; }
  .ag-race { display: grid; gap: 34px; margin-top: 10px; }
  .ag-lane { display: grid; grid-template-columns: 250px 1fr 260px; align-items: center; gap: 24px; }
  .ag-lane .who { font-size: 30px; font-weight: 600; }
  .ag-lane .who small { display: block; font-size: 19px; color: var(--mist); font-weight: 500; }
  .ag-lane .bar { height: 76px; border-radius: 14px; background: var(--foam); overflow: hidden; }
  .ag-lane .bar i { display: block; height: 100%; width: 0; transition: width 2.4s cubic-bezier(.3, .7, .3, 1); background: var(--sea); }
  .ag-lane.agent .bar i { background: var(--buoy); }
  .ag-lane .num { font-family: var(--display); font-weight: 800; font-size: 64px; text-align: right; }
  .ag-code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 15px; line-height: 1.35; color: #7FA8C0; white-space: pre; overflow: hidden; height: 100%; }
  .ag-scroll { animation: ag-up 9s linear infinite; }
  @keyframes ag-up { from { transform: translateY(0); } to { transform: translateY(-50%); } }
  .ag-merge { display: grid; grid-template-columns: 420px 1fr; gap: 60px; flex: 1; min-height: 0; }
  .ag-bars { display: flex; align-items: flex-end; gap: 40px; height: 480px; border-bottom: 4px solid var(--deep); padding: 0 20px; }
  .ag-bars .b { flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; }
  .ag-bars .b i { display: block; border-radius: 12px 12px 0 0; background: var(--sea); height: 0; transition: height 1.6s cubic-bezier(.3, .7, .3, 1); }
  .ag-bars .b.sep i { background: var(--buoy); transition-delay: .4s; }
  .ag-bars .b b { font-family: var(--display); font-size: 40px; display: block; margin-bottom: 8px; }
  .ag-bars .lbl { font-size: 22px; font-weight: 600; margin-top: 12px; position: absolute; }
  .ag-points li { font-size: 27px; margin-bottom: 14px; }
  .ag-ctx { display: grid; grid-template-columns: 1fr 1.5fr; gap: 50px; flex: 1; }
  .ag-win { position: relative; border: 4px dashed var(--sea); border-radius: 22px; padding: 22px; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 12px; min-height: 380px; }
  .ag-win .t { position: absolute; top: -18px; left: 22px; background: var(--lagoon); padding: 0 10px; font-weight: 600; font-size: 20px; color: var(--sea); }
  .ag-chip { font-size: 22px; font-weight: 600; padding: 12px 18px; border-radius: 12px; color: var(--white); }
  .ag-chip.i { background: var(--deep); } .ag-chip.d { background: var(--sea); } .ag-chip.s { background: #7A5BD6; } .ag-chip.tl { background: var(--kelp); } .ag-chip.o { background: #B98608; } .ag-chip.h { background: var(--mist); }
  .ag-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
  .ag-pillars .card h3 { font-size: 38px; }
  .ag-pb { font-size: 20px; line-height: 1.5; }
  .ag-pb code { font-size: 17px; background: var(--foam); padding: 2px 8px; border-radius: 6px; margin: 2px; display: inline-block; }
  .ag-loop { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .ag-loop .card { text-align: center; position: relative; }
  .ag-loop .card b { font-family: var(--display); font-size: 60px; color: var(--buoy); display: block; line-height: 1; }
  .ag-score { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 26px; margin-top: 34px; }
  .ag-score .card { text-align: center; }
  .ag-score .big-number { font-size: 96px; }
  .ag-time { position: relative; display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; margin-top: 30px; }
  .ag-time::before { content: ""; position: absolute; left: 0; right: 0; top: 46px; height: 6px; border-radius: 3px; background: var(--deep-2); }
  .ag-ms { position: relative; text-align: center; }
  .ag-ms .dot { width: 30px; height: 30px; border-radius: 50%; background: var(--sea-2); margin: 34px auto 18px; border: 5px solid var(--deep); position: relative; }
  .ag-ms .yr { font-family: var(--display); font-weight: 800; font-size: 40px; position: absolute; top: -12px; left: 0; right: 0; }
  .ag-ms p { font-size: 21px; color: var(--foam); margin: 0; line-height: 1.3; }
  .ag-ms.now .dot { background: var(--buoy); box-shadow: 0 0 0 12px rgba(255, 90, 54, .25); animation: ag-glow 1.6s ease-in-out infinite; }
  .ag-ms.now .yr { color: var(--sand); }
  @keyframes ag-glow { 50% { box-shadow: 0 0 0 22px rgba(255, 90, 54, .08); } }
  .ag-factory { margin-top: 44px; border-radius: 24px; padding: 30px 40px; background: var(--buoy); color: var(--white); display: flex; align-items: center; gap: 30px; }
  .ag-factory .ic { font-size: 90px; }
  .ag-factory h3 { font-size: 52px; margin: 0; }
  .ag-factory p { font-size: 26px; margin: 6px 0 0; color: #FFE7DF; }
  .ag-values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
  .ag-values .card { border-top: 12px solid var(--sea); }
  .ag-values .card h3 { font-size: 40px; line-height: 1.05; }
  .ag-values .card .src { font-size: 19px; color: var(--mist); font-style: italic; margin-top: 14px; }
  .harness svg { width: 100%; height: 100%; }
  .harness text { font-family: var(--body); }
  .ride { padding: 0; }
  .ride svg.ride-sea { position: absolute; inset: 0; width: 100%; height: 100%; }
  .ride .ride-text { position: relative; padding: 70px 96px 0; max-width: 1150px; }
  .ride .ride-text h2 { font-size: 66px; color: var(--white); }
  .ride .it { font-family: var(--display); font-weight: 800; font-size: 54px; color: var(--sand); margin-top: 6px; }
  .rider { animation: ag-ride 4.5s ease-in-out infinite; transform-box: view-box; transform-origin: 1060px 470px; }
  @keyframes ag-ride { 0%, 100% { transform: translate(0, 0) rotate(-8deg); } 50% { transform: translate(-30px, -24px) rotate(-14deg); } }
  .swell { animation: ag-swell 4.5s ease-in-out infinite; }
  @keyframes ag-swell { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
  `
  const st = document.createElement('style')
  st.textContent = css
  document.head.appendChild(st)

  const TEL = credit('From “Telemetry for the Mind”, Mia-Platform, Cloud Native London Meetup, Sept 2026')
  const A = []
  const F = []

  // ================= AGENTIC SDLC =================
  A.push({
    cls: 'dark',
    html: `<span class="tag" style="margin-top:auto;align-self:flex-start">Agentic SDLC</span>
      <h1 style="margin-top:24px">When agents write the code</h1>
      <p class="lead" style="margin-bottom:auto;margin-top:24px">A dream or a reality? And what happens to complexity, cost and value?</p>`
  })

  A.push({
    steps: 4,
    html: `<h2>The desired experience</h2>
      <div class="ag-flow">
        <div class="ag-node" data-step="1"><div class="ic">🧑‍💻</div><h3>Describe the idea</h3><p>in plain language, in 10 minutes</p></div>
        <div class="ag-pipe" data-step="2"></div>
        <div class="ag-node" data-step="2"><div class="ic">🤖</div><h3>AI tools</h3><p>code generation, testing and packaging</p></div>
        <div class="ag-pipe" data-step="3"></div>
        <div class="ag-node hot" data-step="3"><div class="ic">🚀</div><h3>Production</h3><p>running in a few minutes</p></div>
      </div>
      <p class="lead" data-step="4" style="text-align:center;margin:0 auto;color:var(--deep);font-family:var(--display);font-weight:800;font-size:46px">A dream or a reality?</p>${TEL}`
  })

  const LOOP = [
    ['Alarm', 'An alarm fires: the checkout API is slow in production (p99 from 120 ms to 2.1 s).'],
    ['Locate', 'Which API gateway exposes it? Which microservice implements it?'],
    ['Analyze', 'The agent reads logs, metrics and pipeline history and proposes a root cause.'],
    ['Fix', 'It changes the code for the fix.'],
    ['Test & push', 'It writes and runs the tests, then opens a pull request.'],
    ['Deploy', 'After human approval, the fix is deployed.'],
    ['Verify', 'It checks that the alarm is gone and latency is back to normal.'],
    ['Document', 'It writes the incident report. Fixed!']
  ]
  A.push({
    steps: 8,
    html: `<h2 style="margin-bottom:10px">Example: an API is slow in production</h2>
      <div class="wheel">
        ${LOOP.map((p, i) => {
          const a = -Math.PI / 2 + i * 2 * Math.PI / LOOP.length
          return `<div class="node" data-i="${i}" style="left:${50 + 40 * Math.cos(a)}%;top:${50 + 42 * Math.sin(a)}%"><b>${i + 1}</b><span>${p[0]}</span></div>`
        }).join('')}
        <div class="center"><h3 data-t>An agentic loop</h3><p data-p>From the alarm to the incident report, with a human approving the change.</p></div>
      </div>${TEL}`,
    onStep (el, step) {
      el.querySelectorAll('.wheel .node').forEach((n, i) => n.classList.toggle('cur', i === step - 1))
      el.querySelector('[data-t]').textContent = step ? `${step}. ${LOOP[step - 1][0]}` : 'An agentic loop'
      el.querySelector('[data-p]').textContent = step ? LOOP[step - 1][1] : 'From the alarm to the incident report, with a human approving the change.'
    }
  })

  // adoption journey: peaks & pitfalls
  const J = [
    ['Trust', 'convince engineers to trust AI output', 360, 1],
    ['Scale', 'massive jump in AI adoption', 170, 1],
    ['Share', 'start sharing practices and skills', 220, 1],
    ['Gap', 'knowledge sharing fails across teams', 400, 0],
    ['Monitor', 'begin tracking AI usage', 290, 1],
    ['Blindspot', 'valuable KPIs are not captured', 380, 0],
    ['Delay', 'time to market is at risk', 450, 0],
    ['Benefit', 'real technical and product value', 250, 1],
    ['ROI hunt', 'quantifying the financial return', 110, 1]
  ]
  const JX = i => 90 + i * 152
  A.push({
    steps: 9,
    html: `<h2 style="margin-bottom:0">AI adoption journey: peaks and pitfalls</h2>
      <div class="grow"><svg viewBox="0 0 1400 600" style="width:100%;height:100%" aria-hidden="true">
        ${J.map((j, i) => i === 0 ? '' : `<line data-step="${i + 1}" x1="${JX(i - 1)}" y1="${J[i - 1][2]}" x2="${JX(i)}" y2="${j[2]}" stroke="#0B2540" stroke-width="6" stroke-linecap="round"/>`).join('')}
        ${J.map((j, i) => `<g data-step="${i + 1}">
          <circle cx="${JX(i)}" cy="${j[2]}" r="16" fill="${j[3] ? '#2E9E6B' : '#FF5A36'}" stroke="#0B2540" stroke-width="4"/>
          <text x="${JX(i)}" y="${j[2] + (j[3] ? -34 : 52)}" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="28" fill="#0B2540">${i + 1}. ${j[0]}</text>
          <text x="${JX(i)}" y="${j[2] + (j[3] ? -64 : 80)}" text-anchor="middle" font-size="16" fill="#5E7387">${j[1]}</text></g>`).join('')}
        <text data-climber x="${JX(0)}" y="${J[0][2] - 4}" text-anchor="middle" font-size="44" style="transition:all .8s ease">🧗</text>
      </svg></div>${TEL}`,
    onStep (el, step) {
      const c = el.querySelector('[data-climber]')
      const i = Math.max(0, step - 1)
      c.setAttribute('x', JX(i)); c.setAttribute('y', J[i][2] - 4)
      c.style.opacity = step ? 1 : 0
    }
  })

  A.push({
    steps: 2,
    html: `<h2>The token trap</h2>
      <div class="cols" style="grid-template-columns:1.2fr 1fr">
        <div>
          <div class="ag-statement">Burned the annual AI budget in 4 months.</div>
          <div class="ag-burn" data-burn><i></i></div>
          <div class="ag-months">${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => `<span>${m}</span>`).join('')}</div>
        </div>
        <ul style="align-self:center">
          <li>Large AI budgets are easy to allocate</li>
          <li>The success KPI becomes token usage, not efficiency</li>
          <li>Artificial scaling burns the budget fast</li>
        </ul>
      </div>
      <p class="lead" data-step="2" style="margin-top:auto;color:var(--deep);font-family:var(--display);font-weight:800;font-size:54px">Tokens spent is not value delivered.</p>
      ${credit('Example reported by Fortune, May 26, 2026 · “Telemetry for the Mind”, Mia-Platform')}`,
    onStep (el, step) { el.querySelector('[data-burn]').classList.toggle('go', step >= 1) }
  })

  // lines of code: human vs agent
  const codeLines = Array.from({ length: 60 }, (_, i) => [
    'export async function handler(req, res) {', '  const cart = await carts.get(req.params.id)', '  if (!cart) return res.status(404).end()',
    '  const total = cart.items.reduce((s, x) => s + x.price * x.qty, 0)', '  await audit.log({ cart: cart.id, total })', '  res.json({ ...cart, total })', '}',
    'test("computes the total", async () => {', '  expect(await total(fixture)).toBe(42)', '})'][i % 10]).join('\n')
  A.push({
    steps: 2,
    html: `<h2>Code is becoming a commodity</h2>
      <div class="cols" style="grid-template-columns:1.55fr 1fr;gap:40px">
        <div class="ag-race">
          <div class="ag-lane"><div class="who">🧑‍💻 A developer<small>one working day</small></div><div class="bar"><i data-w="1.5"></i></div><div class="num" data-n="50">0</div></div>
          <div class="ag-lane agent"><div class="who">🤖 A coding agent<small>one working day</small></div><div class="bar"><i data-w="100"></i></div><div class="num" data-n="10000" data-plus="1">0</div></div>
          <p class="small">Lines of reviewed production code. Orders of magnitude, not a benchmark: classic estimates for a developer range from 10 to 100 lines a day; an agent writes thousands, tests included.</p>
        </div>
        <div class="card" style="background:var(--deep);border:0;padding:20px;overflow:hidden;height:440px"><div class="ag-code"><div class="ag-scroll">${codeLines}\n${codeLines}</div></div></div>
      </div>
      <p class="lead" data-step="2" style="margin-top:auto;color:var(--deep);font-family:var(--display);font-weight:800;font-size:52px">Writing code is cheap. Value for the end user is not.</p>`,
    onStep (el, step) {
      el.querySelectorAll('.ag-lane .bar i').forEach(i => { i.style.width = step >= 1 ? i.dataset.w + '%' : '0' })
      if (step === 1) {
        el.querySelectorAll('.ag-lane .num').forEach(n => {
          const target = Number(n.dataset.n)
          const t0 = performance.now()
          const f = now => {
            const k = Math.min(1, (now - t0) / 2400)
            n.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US') + (k === 1 && n.dataset.plus ? '+' : '')
            if (k < 1) requestAnimationFrame(f)
          }
          requestAnimationFrame(f)
        })
      }
      if (step === 0) el.querySelectorAll('.ag-lane .num').forEach(n => { n.textContent = '0' })
    }
  })
  A.push({ q: 'q-loc', html: live('q-loc') })
  A.push({ q: 'q-merges', html: live('q-merges') })

  A.push({
    steps: 4,
    html: `<h2>Anthropic is rethinking source control</h2>
      <div class="ag-merge">
        <div>
          <div class="ag-bars" data-bars>
            <div class="b"><b>2,500</b><i data-h="8.3"></i></div>
            <div class="b sep"><b>30,000+</b><i data-h="100"></i></div>
          </div>
          <div style="display:flex;gap:40px;padding:0 20px"><span style="flex:1;text-align:center;font-weight:600;font-size:22px;margin-top:10px">May 2026</span><span style="flex:1;text-align:center;font-weight:600;font-size:22px;margin-top:10px">Sept 2026</span></div>
          <p class="small" style="text-align:center">code changes merged per day</p>
        </div>
        <ul class="ag-points">
          <li data-step="1">Coding is no longer the bottleneck: tools built for human scale are (source control, builds, CI)</li>
          <li data-step="2">They replaced git for their monorepo with an in-house system, built and migrated in five months by a team of seven</li>
          <li data-step="3">Engineers now review the intent of a change rather than every line, and often their job is to tell the agent “no”</li>
          <li data-step="4" style="font-weight:600">The focus shifts from producing code to the value it generates for the end user</li>
        </ul>
      </div>
      ${credit('Source: Anthropic Engineering, “Redesigning source control at Anthropic”, Oct 13, 2026')}`,
    onStep (el) { el.querySelectorAll('[data-bars] i').forEach(i => { i.style.height = i.dataset.h + '%' }) },
    onEnter (el) { el.querySelectorAll('[data-bars] i').forEach(i => { i.style.height = '0' }) }
  })

  A.push({
    steps: 3,
    html: `<h2>The risk: a technical debt machine</h2>
      <div class="cols" style="grid-template-columns:1.3fr 1fr">
        <svg viewBox="0 0 760 500" style="width:100%;height:100%" aria-hidden="true">
          <line x1="60" y1="450" x2="740" y2="450" stroke="#0B2540" stroke-width="4"/><line x1="60" y1="450" x2="60" y2="20" stroke="#0B2540" stroke-width="4"/>
          <text x="400" y="490" text-anchor="middle" font-size="22" fill="#5E7387">time</text>
          <text x="28" y="240" text-anchor="middle" font-size="22" fill="#5E7387" transform="rotate(-90 28 240)">architectural entropy</text>
          <path class="draw" data-step="1" style="--len:800" d="M60,445 C 300,430 520,380 730,300" fill="none" stroke="#1C7C9C" stroke-width="7" stroke-linecap="round"/>
          <text data-step="1" x="560" y="300" font-size="22" font-weight="600" fill="#1C7C9C">human-led debt</text>
          <path class="draw" data-step="2" style="--len:800" d="M60,445 C 160,430 220,300 300,40" fill="none" stroke="#FF5A36" stroke-width="7" stroke-linecap="round"/>
          <text data-step="2" x="320" y="70" font-size="22" font-weight="600" fill="#FF5A36">AI-led debt · 10× the code</text>
        </svg>
        <div style="align-self:center">
          <p class="lead" data-step="2" style="color:var(--deep)">AI generates 10× the lines of code, and technical debt grows with application complexity.</p>
          <p class="lead" data-step="3" style="color:var(--deep);font-family:var(--display);font-weight:800;font-size:42px;margin-top:24px">AI is a time machine: a year of bad decisions can now be generated in a single week.</p>
        </div>
      </div>${TEL}`
  })

  A.push({
    steps: 7,
    html: `<h2>From prompt engineering to context engineering</h2>
      <div class="ag-ctx">
        <div class="card" style="align-self:start"><h3>Prompt engineering</h3>
          <div style="display:flex;flex-direction:column;gap:10px;margin:16px 0"><span class="ag-chip i">System prompt</span><span class="ag-chip h">User message</span></div>
          <p>Viable for a simple assistant.</p></div>
        <div>
          <div class="ag-win"><span class="t">Context window · mandatory for agentic development</span>
            <span class="ag-chip i">System prompt</span><span class="ag-chip h">User message</span>
            <span class="ag-chip d" data-step="1">Docs: code, functional docs, logs</span>
            <span class="ag-chip s" data-step="2">Skills: tailored behaviour</span>
            <span class="ag-chip tl" data-step="3">Tools: data queries, CI/CD, repo access</span>
            <span class="ag-chip o" data-step="4">Output specification</span>
            <span class="ag-chip h" data-step="5">Compressed history</span>
          </div>
          <p class="lead" data-step="6" style="font-size:28px;margin-top:20px">Too narrow: hallucinations. Too broad: tokens, time and unpredictable results.</p>
          <p class="lead" data-step="7" style="font-size:28px;color:var(--deep);font-weight:600">The right context makes the agentic loop reliable.</p>
        </div>
      </div>${TEL}`
  })

  A.push({
    steps: 4,
    html: `<h2>Templatize the context: the AI Playbook</h2>
      <div class="ag-pillars">
        <div class="card" data-step="1"><h3>Instructions</h3><p>System prompt, skills, output specification, memory</p></div>
        <div class="card" data-step="2"><h3>Tools</h3><p>Exactly which capabilities the agent can invoke</p></div>
        <div class="card" data-step="3"><h3>Data</h3><p>Metadata, semantics and relationships of the systems</p></div>
      </div>
      <div class="card" data-step="4" style="margin-top:26px;border-color:var(--buoy)">
        <div class="ag-pb"><b>Example: investigate API latency regressions</b><br>
        Models: <code>claude-sonnet-5</code> <code>claude-haiku-4-5</code><br>
        Instruction: use the catalog relationship graph to find the root cause before proposing a fix; never change production without human approval.<br>
        Tools: <code>get-knowledge-graph</code> <code>get-logs</code> <code>get-pipeline-history</code> <code>open-pr</code> …</div>
      </div>
      <p class="small" style="margin-top:auto">Standardize, share, scale: nobody should recalibrate the context from scratch.</p>${TEL}`
  })

  A.push({
    steps: 3,
    html: `<h2>Measure it: score the session, prove the delta</h2>
      <div class="ag-loop">
        <div class="card" data-step="1"><b>1</b><h3>Run</h3><p>the playbook, by hand or on an event</p></div>
        <div class="card" data-step="1"><b>2</b><h3>Trace</h3><p>tokens, tools called, loops</p></div>
        <div class="card" data-step="1"><b>3</b><h3>Score</h3><p>DORA delta vs a baseline, in money</p></div>
        <div class="card" data-step="1"><b>4</b><h3>Improve</h3><p>new playbook version, re-run</p></div>
      </div>
      <div class="ag-score" data-step="2">
        <div class="card"><div class="big-number" style="color:var(--kelp)">55 min</div><p>faster than the 90-minute median for a tier-1 hotfix</p></div>
        <div class="card"><div class="big-number" style="color:var(--sea)">+$68</div><p>$110 of value minus $42 of tokens and review</p></div>
        <div class="card"><div class="big-number" style="color:var(--buoy)">×2.6</div><p>value / cost, ×3.9 after fixing the 3 costliest steps</p></div>
      </div>
      <p class="lead" data-step="3" style="margin-top:auto;color:var(--deep);font-weight:600">Same idea as a sprint retrospective: inspect, adapt, measure again.</p>${TEL}`
  })

  // ================= CLOSING REMARKS =================
  F.push({
    cls: 'dark',
    steps: 3,
    html: `<h2>Where this is heading</h2>
      <div class="ag-time">
        ${[['’90s', 'Waterfall'], ['2001', 'Agile'], ['2009', 'DevOps'], ['2020s', 'Platform engineering'], ['2026', 'Agentic SDLC'], ['2027', 'General Agentic Intelligence for software development']]
          .map((m, i) => `<div class="ag-ms ${i === 5 ? 'now' : ''}" data-step="${i < 5 ? 1 : 2}" style="transition-delay:${i < 5 ? i * 150 : 0}ms"><div class="yr">${m[0]}</div><div class="dot"></div><p>${m[1]}</p></div>`).join('')}
      </div>
      <div class="ag-factory" data-step="3"><div class="ic">🏭</div><div><h3>The Autonomous AI Software Factory</h3><p>Agents plan, build, test, deploy and operate. People decide what is worth building and keep the loop honest.</p></div></div>`
  })

  F.push({
    steps: 4,
    html: `<h2>So Agile values matter more, not less</h2>
      <div class="ag-values">
        <div class="card" data-step="1"><div style="font-size:60px">🔁</div><h3>Short feedback loops</h3><p>Agents ship in minutes: only fast feedback tells you if it is the right thing.</p><p class="src">Deliver working software frequently</p></div>
        <div class="card" data-step="2" style="border-top-color:var(--buoy)"><div style="font-size:60px">🏝️</div><h3>Value for the customer first</h3><p>When code is a commodity, the user’s island is the only measure.</p><p class="src">Customer collaboration over contract negotiation</p></div>
        <div class="card" data-step="3" style="border-top-color:var(--kelp)"><div style="font-size:60px">🛠️</div><h3>Technical excellence</h3><p>Without it, agents build a technical debt machine at 10× speed.</p><p class="src">Continuous attention to technical excellence</p></div>
      </div>
      <p class="lead" data-step="4" style="margin-top:auto;color:var(--deep);font-family:var(--display);font-weight:800;font-size:48px">People make sure the agents go in that direction.</p>`
  })

  const HARN = [
    ['Intent & constraints', 'what is worth building, and what must never happen', 700, 70],
    ['Context & playbooks', 'the right knowledge, skills and tools', 1230, 300],
    ['Guardrails & review', 'approve intent, say “no” when needed', 700, 560],
    ['Measure value', 'feedback loops, DORA, cost vs value', 170, 300]
  ]
  F.push({
    steps: 4,
    cls: 'harness',
    html: `<h2 style="margin-bottom:0">Harness engineering: people behind the agentic loop</h2>
      <div class="grow"><svg viewBox="0 0 1400 640" aria-hidden="true">
        <circle cx="700" cy="320" r="250" fill="none" stroke="#C5D7E0" stroke-width="40"/>
        <circle cx="700" cy="320" r="150" fill="#FFFFFF" stroke="#1C7C9C" stroke-width="10"/>
        <g class="orbit" style="transform-origin:700px 320px"><circle cx="700" cy="170" r="14" fill="#FF5A36"/></g>
        <text x="700" y="300" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="40" fill="#0B2540">🤖 Agentic loop</text>
        <text x="700" y="340" text-anchor="middle" font-size="20" fill="#5E7387">plan · code · test · deploy · operate</text>
        ${HARN.map((h, i) => `<g data-step="${i + 1}">
          <circle cx="${h[2]}" cy="${h[3]}" r="44" fill="#0B2540"/><text x="${h[2]}" y="${h[3] + 15}" text-anchor="middle" font-size="42">🧑‍💻</text>
          <text x="${h[2]}" y="${h[3] + (i === 0 ? -60 : 78)}" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="28" fill="#0B2540">${h[0]}</text>
          <text x="${h[2]}" y="${h[3] + (i === 0 ? -34 : 104)}" text-anchor="middle" font-size="18" fill="#5E7387">${h[1]}</text></g>`).join('')}
      </svg></div>`
  })

  // the closing moment: ride the wave
  const crest = 'M0,640 C 220,600 420,700 640,640 C 820,590 900,470 1060,470 C 1200,470 1300,560 1600,520 L1600,900 L0,900 Z'
  F.push({
    cls: 'dark ride',
    steps: 2,
    html: `
      <svg class="ride-sea" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        <g class="wave slow" opacity=".35"><path d="${K.wavePath(560, 14, 200, 2200)}" stroke="#2FA3C4" stroke-width="3" fill="none"/></g>
        <g class="swell"><path d="${crest}" fill="#1C7C9C"/><path d="${crest}" fill="none" stroke="#D6EEF5" stroke-width="6" opacity=".7"/></g>
        <path d="M0,760 C 300,720 600,800 900,760 C 1200,720 1400,780 1600,750 L1600,900 L0,900 Z" fill="#12365A"/>
        <g class="rider"><g transform="translate(960,476) scale(1.15)"><g class="bob">${K.sailboat()}</g></g></g>
      </svg>
      <div class="ride-text">
        <p class="lead" style="color:var(--foam);font-size:32px">You are software engineers, and you are lucky: you will live the industrial revolution of the software industry.</p>
        <h2 data-step="1" style="margin-top:26px">Don’t be afraid. Ride the wave with your boat!</h2>
        <div class="it" data-step="2">Cavalca l’onda con la tua barca!</div>
      </div>`
  })
  F.push({ q: 'q-feel', html: live('q-feel') })

  // ---------- insert ----------
  const at = (pred, items) => {
    const i = S.findIndex(pred)
    if (i < 0) S.push(...items); else S.splice(i, 0, ...items)
  }
  at(s => (s.html || '').includes('What to read'), A)
  at(s => s.q === 'q-final', F)
})()
