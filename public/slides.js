// Slide definitions for the deck.
// Each slide: { cls, html, steps, onStep(el, step), onEnter(el), q }
//  - steps: how many fragment steps the slide has (→ advances them before moving on)
//  - elements with data-step="n" appear from step n (data-until="m" hides them after step m)
//  - q: id of a live question (see questions.json) rendered by <div class="live">
// Edit text freely: everything visible lives in this file.
(function () {
  const S = []
  const add = d => S.push(d)
  const live = id => `<div class="live" data-q="${id}"></div>`
  const credit = t => `<div class="credit">${t}</div>`
  const AR = credit('Agile Reloaded — Attribution-ShareAlike 4.0 International License')

  // ---------- shared drawing helpers ----------
  function wavePath (y, amp, len, total) {
    let d = `M0,${y}`
    for (let x = 0; x < total; x += len) d += ` q${len / 4},${-amp} ${len / 2},0 t${len / 2},0`
    return d
  }
  function person (x, y, id) {
    return `<g transform="translate(${x},${y})" ${id ? `id="${id}"` : ''}>
      <line x1="0" y1="-46" x2="0" y2="-14" stroke="#0B2540" stroke-width="8" stroke-linecap="round"/>
      <line x1="0" y1="-14" x2="-12" y2="0" stroke="#0B2540" stroke-width="8" stroke-linecap="round"/>
      <line x1="0" y1="-14" x2="12" y2="0" stroke="#0B2540" stroke-width="8" stroke-linecap="round"/>
      <line x1="0" y1="-38" x2="-16" y2="-22" stroke="#0B2540" stroke-width="7" stroke-linecap="round"/>
      <line x1="0" y1="-38" x2="16" y2="-24" stroke="#0B2540" stroke-width="7" stroke-linecap="round"/>
      <circle cx="0" cy="-64" r="17" fill="#F5C49B" stroke="#0B2540" stroke-width="3"/>
      <circle cx="-6" cy="-67" r="2.2" fill="#0B2540"/><circle cx="6" cy="-67" r="2.2" fill="#0B2540"/>
      <path class="mouth" d="M-7,-58 L7,-58" stroke="#0B2540" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    </g>`
  }
  function seated (x) {
    return `<g transform="translate(${x},0)">
      <line x1="0" y1="-40" x2="0" y2="-62" stroke="#0B2540" stroke-width="8" stroke-linecap="round"/>
      <line x1="0" y1="-56" x2="16" y2="-44" stroke="#0B2540" stroke-width="7" stroke-linecap="round"/>
      <circle cx="0" cy="-80" r="16" fill="#F5C49B" stroke="#0B2540" stroke-width="3"/>
      <circle cx="-5" cy="-83" r="2" fill="#0B2540"/><circle cx="6" cy="-83" r="2" fill="#0B2540"/>
      <path d="M-6,-75 Q0,-69 7,-75" stroke="#0B2540" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </g>`
  }
  const MOUTH = {
    sad: 'M-7,-56 Q0,-61 7,-56',
    flat: 'M-7,-58 L7,-58',
    happy: 'M-8,-59 Q0,-50 8,-59'
  }
  function seaScene (inner, opts = {}) {
    return `<svg viewBox="0 0 1400 470" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <rect x="0" y="330" width="1400" height="140" fill="#BFE3EE"/>
      <rect x="0" y="392" width="1400" height="78" fill="#A3D5E4"/>
      <g class="wave"><path d="${wavePath(332, 7, 100, 1700)}" stroke="#2FA3C4" stroke-width="4" fill="none"/></g>
      <g class="wave slow"><path d="${wavePath(392, 6, 140, 1700)}" stroke="#8CC8DA" stroke-width="3" fill="none" transform="translate(-60,0)"/></g>
      <path d="M0,300 L170,300 Q214,305 236,336 L236,470 L0,470 Z" fill="#F2D48C"/>
      <ellipse cx="1250" cy="338" rx="170" ry="30" fill="#F2D48C"/>
      <path d="M1262,320 C1258,260 1240,214 1222,178" stroke="#8A5A2B" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M1222,178 q-60,-12 -96,26 q48,-36 96,-26 Z M1222,178 q50,-40 104,-16 q-56,-14 -104,16Z M1222,178 q-22,-52 -70,-60 q46,24 70,60Z M1222,178 q26,-50 76,-52 q-50,16 -76,52Z M1222,178 q-56,10 -74,66 q30,-50 74,-66Z" fill="#2E9E6B" stroke="#2E9E6B" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="1212" cy="190" r="9" fill="#8A5A2B"/><circle cx="1230" cy="192" r="9" fill="#8A5A2B"/>
      <g transform="translate(1340,316)"><line x1="0" y1="0" x2="0" y2="-80" stroke="#0B2540" stroke-width="4"/><path d="M0,-80 L44,-68 L0,-56Z" fill="#FF5A36"/></g>
      ${opts.shorePerson !== false ? person(110, 300, opts.personId) : ''}
      ${inner}
    </svg>`
  }
  // speedboat, drawn around waterline y = 0, bow pointing right
  function speedboat (cls = '') {
    return `<g class="${cls}">
      <g class="boat-part p-hull on">
        <path d="M0,-46 L196,-46 Q232,-44 240,-34 L206,6 L18,6 Z" fill="#E6ECEF" stroke="#6B7C88" stroke-width="3"/>
        <path d="M30,-28 L210,-28 M24,-12 L200,-12" stroke="#B4C2CB" stroke-width="2" stroke-dasharray="10 8"/>
      </g>
      <g class="boat-part p-paint">
        <path d="M0,-46 L196,-46 Q232,-44 240,-34 L206,6 L18,6 Z" fill="#FF5A36" stroke="#0B2540" stroke-width="3"/>
        <path d="M14,-24 L222,-24" stroke="#FFFFFF" stroke-width="7"/>
      </g>
      <g class="boat-part p-engine">
        <rect x="-32" y="-76" width="36" height="46" rx="7" fill="#0B2540"/>
        <rect x="-19" y="-32" width="9" height="40" fill="#34495E"/>
        <ellipse cx="-14" cy="10" rx="13" ry="5" fill="#34495E"/>
      </g>
      <g class="boat-part p-wheel">
        <path d="M120,-46 L152,-88 L168,-88 L148,-46 Z" fill="#9ED3E3" stroke="#0B2540" stroke-width="3"/>
        <line x1="100" y1="-46" x2="104" y2="-70" stroke="#0B2540" stroke-width="4"/>
        <circle cx="104" cy="-76" r="14" stroke="#0B2540" stroke-width="4" fill="none"/>
        <path d="M104,-90 L104,-62 M90,-76 L118,-76" stroke="#0B2540" stroke-width="2.5"/>
      </g>
    </g>`
  }
  const raft = () => `<g>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${i * 34}" y="-24" width="33" height="26" rx="13" fill="#A0642D" stroke="#6E4019" stroke-width="3"/>`).join('')}
      <path d="M8,-12 L162,-12" stroke="#E9C88A" stroke-width="3"/>
      <line x1="150" y1="-24" x2="150" y2="-118" stroke="#6E4019" stroke-width="6"/>
      <path d="M150,-116 L196,-104 L150,-92 Z" fill="#F2C14E"/>
      ${seated(66)}
    </g>`
  const rowboat = () => `<g>
      <path d="M0,-36 Q95,-30 190,-36 Q178,4 156,6 L34,6 Q8,4 0,-36 Z" fill="#1C7C9C" stroke="#0B2540" stroke-width="3"/>
      <path d="M6,-26 Q95,-20 184,-26" stroke="#D6EEF5" stroke-width="4" fill="none"/>
      ${seated(92)}
      <line x1="110" y1="-50" x2="40" y2="24" stroke="#8A5A2B" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="34" cy="30" rx="18" ry="7" fill="#8A5A2B" transform="rotate(-45 34 30)"/>
    </g>`
  const sailboat = () => `<g>
      <path d="M0,-38 L196,-38 Q212,-36 216,-30 L190,6 L20,6 Z" fill="#0B2540"/>
      <path d="M8,-26 L206,-26" stroke="#F2C14E" stroke-width="4"/>
      <line x1="104" y1="-38" x2="104" y2="-232" stroke="#0B2540" stroke-width="6"/>
      <path d="M110,-226 L110,-48 L198,-48 Z" fill="#FFFFFF" stroke="#C5D7E0" stroke-width="2"/>
      <path d="M98,-212 L98,-48 L28,-48 Z" fill="#FFE2D9" stroke="#F3A98F" stroke-width="2"/>
      ${seated(60)}
    </g>`
  const fullSpeedboat = () => speedboat('').replace(/boat-part p-(paint|engine|wheel)"/g, 'boat-part p-$1 on"') + seated(60)

  // ---------- 1. Title ----------
  add({
    cls: 'dark title-slide',
    html: `
      <svg class="sea-bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        <g class="wave slow" opacity=".35"><path d="${wavePath(620, 14, 200, 2000)}" stroke="#2FA3C4" stroke-width="3" fill="none"/></g>
        <g class="wave" opacity=".5"><path d="${wavePath(680, 12, 160, 2000)}" stroke="#2FA3C4" stroke-width="3" fill="none"/></g>
        <g class="wave slow" opacity=".7"><path d="${wavePath(740, 10, 120, 2000)}" stroke="#2FA3C4" stroke-width="3" fill="none"/></g>
        <g transform="translate(1180,600)" class="bob"><g transform="scale(1.4)">${sailboat().replace(seated(60), '')}</g></g>
      </svg>
      <span class="tag" data-deck="tag">DSD lesson · Politecnico di Milano</span>
      <h1 style="margin-top:28px" data-deck="title">Introduction to Agile and Scrum</h1>
      <p class="meta" data-deck="subtitle">Polimi, October 20, 2026 — Giulio Roggero</p>`
  })

  // ---------- 2. Speaker ----------
  add({
    key: 'speaker',
    html: `
      <div class="speaker">
        <img class="sp-photo" data-deck-img="speaker.photo" src="speaker.jpg" alt="Photo of the speaker">
        <div class="sp-text">
          <h2>Hello! I’m <span data-deck="speaker.name">Giulio Roggero</span></h2>
          <p class="sp-role" data-deck="speaker.role">CTO &amp; Co-Founder, Mia-Platform</p>
          <p class="lead sp-bio" data-deck="speaker.bio"></p>
          <div class="sp-focus" data-deck-list="speaker.focus"></div>
          <p class="sp-links"><span class="tag" data-deck="speaker.linkedin">linkedin.com/in/giulioroggero</span></p>
        </div>
      </div>`
  })

  // ---------- 3. Join ----------
  add({
    cls: 'dark',
    html: `
      <h2>Grab your phone</h2>
      <div class="joinbox" data-join>
        <div><div class="qr" data-qr></div><div class="url" data-url></div></div>
        <div>
          <p class="lead">Scan the QR code, pick a nickname and play along. Fast and correct answers earn more points.</p>
          <div class="players"><span data-players>0</span><small>students on board</small></div>
          <div class="names" data-names></div>
        </div>
      </div>`
  })

  // ---------- 4-5. Warm-up ----------
  add({ q: 'q-exp', html: live('q-exp') })
  add({ q: 'q-word', html: live('q-word') })

  // ---------- 6. Reach the island ----------
  add({
    html: `
      <h2>Reach the island</h2>
      <p class="lead">Our user is on the shore and wants to reach the island. How do we build what they need?</p>
      <div class="scene">${seaScene('', { personId: 'intro-person' })}</div>`
  })

  // ---------- 7. Waterfall boat ----------
  add({
    steps: 5,
    html: `
      <h2>From a waterfall product…</h2>
      <div class="chips" data-chips>
        <span class="chip">1 · hull</span><span class="chip">2 · color</span><span class="chip">3 · engine</span><span class="chip">4 · steering wheel → speedboat</span>
      </div>
      <div class="scene">
        ${seaScene(`
          <g class="bubble" id="wf-bubble" opacity="0">
            <rect x="40" y="150" width="220" height="64" rx="18" fill="#FFFFFF" stroke="#C5D7E0" stroke-width="2"/>
            <path d="M100,213 L110,232 L124,213 Z" fill="#FFFFFF"/>
            <text id="wf-bubble-text" x="150" y="192" text-anchor="middle" font-size="26" font-weight="600" fill="#0B2540" font-family="IBM Plex Sans, sans-serif">Still waiting…</text>
          </g>
          <g class="waterfall-boat" id="wf-boat" style="transform:translate(270px,0)">
            <g transform="translate(0,330)">${speedboat()}<g class="boat-part p-rider">${seated(60)}</g></g>
          </g>`, { personId: 'wf-person' })}
        <div class="caption" data-step="5" style="top:20px;left:0;max-width:900px;color:#0B2540">Only after 4 iterations we gather feedback: does the user even need to go to the island?</div>
      </div>${AR}`,
    onStep (el, step) {
      const parts = { 'p-paint': 2, 'p-engine': 3, 'p-wheel': 4, 'p-rider': 5 }
      for (const [c, s] of Object.entries(parts)) el.querySelector('.' + c).classList.toggle('on', step >= s)
      el.querySelector('.p-hull').style.opacity = step >= 1 ? 1 : 0
      el.querySelectorAll('[data-chips] .chip').forEach((c, i) => {
        c.classList.toggle('done', step > i + 1 || step === 5)
        c.classList.toggle('now', step === i + 1)
      })
      el.querySelector('#wf-boat').style.transform = step >= 5 ? 'translate(880px,0)' : 'translate(270px,0)'
      const p = el.querySelector('#wf-person')
      p.style.opacity = step >= 5 ? 0 : 1
      p.querySelector('.mouth').setAttribute('d', step >= 1 && step < 5 ? MOUTH.sad : MOUTH.flat)
      const b = el.querySelector('#wf-bubble')
      b.setAttribute('opacity', step >= 1 && step < 5 ? 1 : 0)
      el.querySelector('#wf-bubble-text').textContent = ['', 'A hull?', 'Still waiting…', 'Can I go now?', 'Almost…'][step] || ''
    }
  })

  add({ q: 'q-waterfall', html: live('q-waterfall') })

  // ---------- 9. Incremental boat ----------
  const VEH = [
    { name: 'raft', draw: raft, dur: 7, cap: 'Just with the first iteration we know if it is valuable for the user to go to the island' },
    { name: 'rowing boat', draw: rowboat, dur: 5, cap: 'A rowing boat: same goal, a better ride' },
    { name: 'sail boat', draw: sailboat, dur: 3.4, cap: 'More happy end users in just three iterations' },
    { name: 'speedboat', draw: fullSpeedboat, dur: 1.8, cap: 'The speedboat arrives, and the user has been travelling since day one' }
  ]
  add({
    steps: 4,
    html: `
      <h2>… to an incremental product</h2>
      <div class="chips" data-chips>${VEH.map((v, i) => `<span class="chip">${i + 1} · ${v.name}</span>`).join('')}</div>
      <div class="scene">
        <div class="mood-meter"><span class="small">User happiness</span>
          <div class="faces"><span class="face">🙂</span><span class="face">😊</span><span class="face">😀</span><span class="face">🤩</span></div>
        </div>
        ${seaScene(VEH.map((v, i) => `
          <g class="vehicle" data-v="${i}"><g class="mover" style="--x0:270px;--x1:${i === 3 ? 870 : 900}px;--dur:${v.dur}s;transform:translate(270px,0)">
            <g class="bob"><g transform="translate(0,330)">${v.draw()}</g></g></g></g>`).join(''), { personId: 'inc-person' })}
        <div class="caption" id="inc-cap" style="top:60px;max-width:700px"></div>
      </div>${AR}`,
    onStep (el, step) {
      el.querySelectorAll('.vehicle').forEach((g, i) => {
        const on = i === step - 1
        g.classList.toggle('on', on)
        const m = g.querySelector('.mover')
        m.classList.remove('sailing')
        if (on) { void m.getBoundingClientRect(); m.classList.add('sailing') }
      })
      el.querySelectorAll('[data-chips] .chip').forEach((c, i) => {
        c.classList.toggle('done', step > i + 1)
        c.classList.toggle('now', step === i + 1)
      })
      el.querySelectorAll('.face').forEach((f, i) => f.classList.toggle('on', i < step))
      el.querySelector('#inc-person').style.opacity = step >= 1 ? 0 : 1
      el.querySelector('#inc-cap').textContent = step ? VEH[step - 1].cap : ''
    }
  })

  // ---------- 10. AI era timeline ----------
  // Reuse the lesson's original boat and island artwork in this comparison.
  const validationVessel = (art, name, status, outcome = '', discarded = false) =>
    `<div class="iv-attempt ${discarded ? 'iv-discard' : ''}">
      <svg viewBox="-42 -244 310 290" aria-hidden="true"><g class="iv-float">${art}</g></svg>
      <strong>${name}</strong><span class="iv-status">${status}</span>
      ${outcome ? `<span class="iv-outcome">${outcome}</span>` : ''}
    </div>`
  const validationWindsurf = () => `<g>
      <path d="M0,-8 Q95,-20 210,-8 Q190,5 18,5 Z" fill="#F2C14E" stroke="#0B2540" stroke-width="3"/>
      <path d="M115,-12 L96,-220 L198,-44 Z" fill="#FFE2D9" stroke="#FF5A36" stroke-width="4"/>
      <path d="M98,-196 L175,-52 L111,-34 Z" fill="#FFFFFF" opacity=".8"/>
      <path d="M115,-12 L96,-220" stroke="#0B2540" stroke-width="5"/>
      ${person(61, -10)}
      <path d="M75,-35 L111,-80" stroke="#0B2540" stroke-width="6" stroke-linecap="round"/>
    </g>`
  const validationScooterboat = () => `<g>
      ${speedboat().replace('boat-part p-paint"', 'boat-part p-paint on"').replace('boat-part p-engine"', 'boat-part p-engine on"')}
      ${person(90, -46)}
      <path d="M130,-46 L141,-133 M122,-133 L162,-133 M106,-74 L141,-133" stroke="#0B2540" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`
  const validationIsland = () => `<div class="iv-island">${seaScene('', { shorePerson: false }).replace('viewBox="0 0 1400 470"', 'viewBox="1080 100 320 280"')}<strong>Reach the island</strong></div>`
  const validationParts = name => speedboat().replace(/boat-part p-(paint|engine|wheel)"/g,
    (match, part) => `boat-part p-${part}${name.includes(part) ? ' on' : ''}"`)
  add({
    cls: 'island-validation',
    steps: 3,
    html: `
      <style>
        .island-validation h2 { font-size:54px; margin-bottom:16px; max-width:none; }
        .island-validation .iv-goal { font-size:25px; margin:0 0 20px; color:var(--mist); }
        .iv-comparison { display:grid; gap:16px; }
        .iv-row { display:grid; grid-template-columns:200px 1fr 130px; gap:22px; align-items:center; min-height:170px; }
        .iv-label { font-family:var(--display); font-size:34px; font-weight:800; }
        .iv-label small { display:block; font-family:var(--body); font-size:20px; line-height:1.3; font-weight:500; color:var(--mist); margin-top:6px; }
        .iv-route { display:grid; grid-auto-flow:column; grid-auto-columns:1fr; gap:12px; position:relative; }
        .iv-route:before { content:''; position:absolute; left:0; right:0; top:80px; border-bottom:3px solid var(--line); }
        .iv-attempt { position:relative; text-align:center; display:flex; flex-direction:column; align-items:center; }
        .iv-attempt svg { width:140px; height:88px; display:block; }
        .iv-attempt strong { font-size:22px; line-height:1.15; margin-top:3px; }
        .iv-status { font-size:18px; color:var(--mist); line-height:1.3; margin-top:3px; white-space:nowrap; }
        .iv-outcome { color:var(--kelp); font-size:20px; font-weight:700; line-height:1.2; margin-top:3px; }
        .iv-discard svg { opacity:.45; }
        .iv-discard .iv-outcome { color:#BD3A20; }
        .iv-island { text-align:center; align-self:center; }
        .iv-island svg { display:block; width:125px; height:110px; }
        .iv-island strong { display:block; font-size:18px; color:var(--sea); line-height:1.2; }
        .island-validation .iv-takeaway { font-size:25px; margin:auto 0 0; line-height:1.35; color:var(--deep); }
        .iv-row { --iv-duration:4.8s; }
        .iv-row[data-step="2"] { --iv-duration:4.2s; }
        .iv-row[data-step="3"] { --iv-duration:3.3s; }
        .iv-route:before { transform-origin:left center; }
        .island-validation.active .iv-playing .iv-route:before { animation:iv-route-draw var(--iv-duration) cubic-bezier(.22,.61,.36,1) both; }
        .island-validation.active .iv-playing .iv-attempt { animation:iv-arrive .55s cubic-bezier(.22,1,.36,1) var(--iv-delay) both; }
        .island-validation.active .iv-playing .iv-attempt svg { animation:iv-launch 1.35s ease-in-out calc(var(--iv-delay) + .28s) both; }
        .island-validation.active .iv-playing[data-step="1"] .iv-attempt:not(:last-child) svg { animation:iv-assemble .85s ease-out calc(var(--iv-delay) + .18s) both; }
        .island-validation.active .iv-playing[data-step="2"] .iv-float,
        .island-validation.active .iv-playing[data-step="3"] .iv-attempt:not(.iv-discard) .iv-float,
        .island-validation.active .iv-playing[data-step="1"] .iv-attempt:last-child .iv-float { animation:iv-bob 2.8s ease-in-out calc(var(--iv-delay) + 1.6s) infinite; }
        .island-validation.active .iv-playing .iv-outcome { animation:iv-decision .45s ease-out calc(var(--iv-delay) + 1s) both; }
        .island-validation.active .iv-playing .iv-discard svg { animation:iv-reject 1.15s ease-in-out calc(var(--iv-delay) + .25s) both; }
        .island-validation.active .iv-playing .iv-island { animation:iv-arrive .7s ease-out .1s both; }
        @keyframes iv-route-draw {
          from { transform:scaleX(0); opacity:.3; }
          to { transform:scaleX(1); opacity:1; }
        }
        @keyframes iv-arrive {
          from { opacity:0; transform:translate(-18px,10px); }
          to { opacity:1; transform:translate(0,0); }
        }
        @keyframes iv-assemble {
          0% { opacity:0; transform:translateY(-12px) scale(.9); }
          65% { opacity:1; transform:translateY(2px) scale(1.025); }
          100% { opacity:1; transform:none; }
        }
        @keyframes iv-launch {
          0% { transform:translateX(-16px) rotate(-3deg); }
          55% { transform:translateX(18px) translateY(-3px) rotate(2deg); }
          100% { transform:translateX(0) rotate(0); }
        }
        @keyframes iv-bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
        @keyframes iv-decision { from { opacity:0; transform:translateY(6px) scale(.92); } to { opacity:1; transform:none; } }
        @keyframes iv-reject {
          0% { opacity:1; transform:translateX(-12px); }
          40% { opacity:1; transform:translateX(12px) rotate(-4deg); }
          65% { opacity:.8; transform:translateX(7px) rotate(4deg); }
          100% { opacity:.45; transform:translateY(4px); }
        }
        @media (prefers-reduced-motion:reduce) { .island-validation.active .iv-playing *,.island-validation.active .iv-playing .iv-route:before { animation:none !important; } }
        .print-mode .island-validation .iv-playing *,.print-mode .island-validation .iv-playing .iv-route:before { animation:none !important; }
      </style>
      <h2>AI enables faster validation of business ideas</h2>
      <p class="iv-goal">The same user need: get to the island. When can we test a working solution?</p>
      <div class="iv-comparison">
        <div class="iv-row" data-step="1">
          <div class="iv-label">Waterfall<small>’90s<br>Working product at the end</small></div>
          <div class="iv-route">
            ${validationVessel(validationParts(''), 'Hull', 'Not usable yet')}
            ${validationVessel(validationParts('paint'), 'Painted hull', 'Not usable yet')}
            ${validationVessel(validationParts('paint engine'), 'Add engine', 'Not usable yet')}
            ${validationVessel(fullSpeedboat(), 'Speedboat', 'Engineered + tested', '✓ First crossing')}
          </div>${validationIsland()}
        </div>
        <div class="iv-row" data-step="2">
          <div class="iv-label">Agile<small>’10s<br>Working product each iteration</small></div>
          <div class="iv-route">
            ${VEH.map(v => validationVessel(v.draw(), v.name === 'raft' ? 'Raft' : v.name === 'rowing boat' ? 'Rowboat' : v.name === 'sail boat' ? 'Sailboat' : 'Speedboat', 'Engineered + tested', '✓ Can cross')).join('')}
          </div>${validationIsland()}
        </div>
        <div class="iv-row" data-step="3">
          <div class="iv-label">AI<small>2025+<br>Shorter iterations<br>Test and discard fast</small></div>
          <div class="iv-route">
            ${validationVessel(raft(), 'Raft', 'Engineered + tested', '× Discard', true)}
            ${validationVessel(rowboat(), 'Rowboat', 'Engineered + tested', '✓ Keep')}
            ${validationVessel(sailboat(), 'Sailboat', 'Engineered + tested', '× Discard', true)}
            ${validationVessel(fullSpeedboat(), 'Speedboat', 'Engineered + tested', '✓ Keep')}
            ${validationVessel(sailboat(), 'Alternative', 'Engineered + tested', '× Discard', true)}
            ${validationVessel(fullSpeedboat(), 'Better fit', 'Engineered + tested', '✓ Keep')}
          </div>${validationIsland()}
        </div>
      </div>
      <p class="iv-takeaway" data-step="3">Agile engineers every iteration. AI shortens the cycle, so we can test more ideas and discard poor fits sooner.</p>${AR}`,
    onStep (el, step) {
      el.querySelectorAll('.iv-row').forEach((row, rowIndex) => {
        row.querySelectorAll('.iv-attempt').forEach((boat, i) => {
          // AI tries more options with shorter gaps between launches.
          boat.style.setProperty('--iv-delay', (i * [1.05, .85, .38][rowIndex]) + 's')
        })
        row.classList.toggle('iv-playing', step >= Number(row.dataset.step))
      })
    }
  })

  // ---------- 11. SDLC is shorter ----------
  add({
    steps: 3,
    html: `
      <h2>In the AI era, the SDLC is shorter</h2>
      <div class="flow" style="margin-bottom:44px">
        <div class="stage-box agility" data-step="1"><div class="kicker">Agility · BIZ + TECH</div><h3>Design &amp; Experiment</h3>
          <ul><li>Business validation, fast</li><li>Discard what doesn’t work</li></ul></div>
        <div class="arrow" data-step="2">→</div>
        <div class="stage-box reliability" data-step="2"><div class="kicker">Reliability · SW ENG</div><h3>Engineer &amp; Scale</h3>
          <ul><li>Engineer what was validated</li><li>Run it with quality</li></ul></div>
      </div>
      <div class="stats" data-step="3">
        <div class="stat"><div class="big-number" data-count="37">37%</div><p>Cost saving</p></div>
        <div class="stat"><div class="big-number" data-count="52">52%</div><p>Improved time to market</p></div>
        <div class="stat"><div class="big-number" data-count="22">22%</div><p>Reduced TCO</p></div>
      </div>`,
    onStep (el, step) { if (step === 3) countUp(el) }
  })

  // ---------- 12. Not an easy task ----------
  const HOPS = [
    ['🏝️', 'Customer', '“I need to reach the island”'],
    ['📄', 'Business analyst', '“A boat, 80 pages of specs”'],
    ['📐', 'Architect', '“A modular vessel platform”'],
    ['⚙️', 'Developer', '“A really fast engine”'],
    ['🧪', 'Tester', '“Does it float?”']
  ]
  add({
    steps: 6,
    html: `
      <h2>Software development is not an easy task…</h2>
      <p class="lead">Every hand-off translates the need a little. Watch what reaches the end of the line.</p>
      <div class="relay">${HOPS.map((h, i) => `
        <div class="hop" data-step="${i + 1}"><div class="shape" style="font-size:${110 - i * 6}px">${h[0]}</div><div class="who">${h[1]}</div><div class="said">${h[2]}</div></div>`).join('')}
      </div>
      <div class="card" data-step="6" style="margin-top:auto;border-color:var(--buoy)"><h3 style="margin:0">The user still can’t reach the island. Short feedback loops keep the real need in the room.</h3></div>`
  })

  // ---------- 13. Being vs doing ----------
  add({
    steps: 2,
    html: `
      <h2>What is Agile?</h2>
      <div class="dual">
        <div class="side"><div class="word">Being</div><p data-step="1">a mindset: values and principles</p></div>
        <div class="arrows">⇄</div>
        <div class="side"><div class="word" style="color:var(--sea)">Doing</div><p data-step="1">practices: Scrum, Kanban, XP…</p></div>
      </div>
      <p class="lead" data-step="2" style="text-align:center;margin:0 auto">Doing agile without being agile gives you rituals without results.</p>`
  })

  // ---------- 14. Manifesto ----------
  add({
    steps: 5,
    html: `
      <h2>The Agile Manifesto</h2>
      <p class="lead" style="margin-bottom:26px">We are uncovering better ways of developing software by doing it and helping others do it. Through this work we have come to value:</p>
      <div class="values">
        <div class="value" data-step="1"><span class="left">Individuals and interactions</span><span class="over">over</span><span class="right">processes and tools</span></div>
        <div class="value" data-step="2"><span class="left">Working software</span><span class="over">over</span><span class="right">comprehensive documentation</span></div>
        <div class="value" data-step="3"><span class="left">Customer collaboration</span><span class="over">over</span><span class="right">contract negotiation</span></div>
        <div class="value" data-step="4"><span class="left">Responding to change</span><span class="over">over</span><span class="right">following a plan</span></div>
      </div>
      <p class="small" data-step="5" style="margin-top:auto">That is, while there is value in the items on the right, we value the items on the left more. — agilemanifesto.org</p>`
  })
  add({ q: 'q-manifesto', html: live('q-manifesto') })

  // ---------- 16. Principles ----------
  const PR = ['Satisfy the customer with early, continuous delivery', 'Welcome changing requirements, even late', 'Deliver working software frequently', 'Business and developers work together daily',
    'Build around motivated individuals and trust them', 'Face-to-face conversation is the best channel', 'Working software is the measure of progress', 'Keep a sustainable pace',
    'Continuous attention to technical excellence', 'Simplicity: maximize the work not done', 'Self-organizing teams make the best designs', 'Reflect regularly and adjust']
  add({
    steps: 1,
    html: `
      <h2>12 principles behind the manifesto</h2>
      <div class="principles">${PR.map((p, i) => `<div class="card" data-step="1" style="transition-delay:${i * 70}ms"><b>${i + 1}</b><span>${p}</span></div>`).join('')}</div>`
  })

  // ---------- 17-18. Methodologies ----------
  add({ q: 'q-popular', html: live('q-popular') })
  add({
    steps: 1,
    html: `
      <h2>Agile methodologies used</h2>
      <div class="hbars" data-bars>
        <div class="hbar top"><span>Scrum</span><div class="bar"><i data-w="66"></i></div><span class="pct">66%</span></div>
        <div class="hbar"><span>ScrumBan</span><div class="bar"><i data-w="9"></i></div><span class="pct">9%</span></div>
        <div class="hbar"><span>Scrum / XP</span><div class="bar"><i data-w="6"></i></div><span class="pct">6%</span></div>
        <div class="hbar"><span>Everything else</span><div class="bar"><i data-w="19"></i></div><span class="pct">19%</span></div>
      </div>
      <p class="lead" style="margin-top:40px">Scrum is the most popular agile approach, plus another 15% follow a derivation of it.</p>
      ${credit('Source: 15th State of Agile Report')}`,
    onStep (el, step) { el.querySelectorAll('[data-bars] i').forEach(i => { i.style.width = step >= 1 ? i.dataset.w + '%' : '0' }) }
  })

  // ---------- 19. Scrum ----------
  add({
    cls: 'sea',
    html: `
      <h1 style="margin-top:auto">Scrum</h1>
      <p class="lead" style="margin-top:30px;max-width:1200px;font-size:42px;color:#fff">A framework that helps teams develop a product incrementally, reducing the risk of building the wrong product. It is based on the values and principles of the Agile Manifesto.</p>
      <p class="small" style="color:var(--foam);margin-bottom:auto">www.agilemanifesto.org</p>`
  })

  // ---------- 20. Legacy process ----------
  const LEG = ['Project Manager', 'BA', 'SME', 'Architect', 'DEV', 'DEV', 'Tester', 'SME / UAT']
  add({
    steps: 1,
    html: `
      <h2>Legacy process (waterfall)</h2>
      <div class="waterfall-steps">${LEG.map((r, i) => `<div class="wf" data-step="1" style="left:${i * 168}px;top:${i * 58}px;transition-delay:${i * 160}ms">${r}</div>`).join('')}</div>
      <p class="small">BA: business analysis · SME: subject matter expert · UAT: user acceptance test. Each role hands work to the next one.</p>`
  })

  // ---------- 21. Scrum team ----------
  add({
    steps: 1,
    html: `
      <h2>Scrum Team: 3 to 9 people</h2>
      <div class="roles">
        <div class="role po"><div class="icon">🧭</div><h3>Product Owner</h3><p>What and why</p></div>
        <div class="role dt"><div class="icon">🛠️</div><h3>Development Team</h3><p>How, and builds it</p></div>
        <div class="role sm"><div class="icon">🤝</div><h3>Scrum Master</h3><p>Facilitates and serves</p></div>
      </div>
      <p class="lead" data-step="1" style="margin-top:50px;color:var(--deep);font-family:var(--display);font-weight:800;font-size:54px">We are all committed and accountable.</p>${AR}`
  })

  // ---------- 22. Backlog as channel ----------
  add({
    steps: 2,
    html: `
      <h2>The Product Backlog as communication channel</h2>
      <div style="display:grid;grid-template-columns:1fr 90px 1fr 90px 1fr;align-items:center;flex:1">
        <div class="card"><div class="icon" style="font-size:60px">👥</div><h3>Interested stakeholders</h3><p>Customers, users, sponsors bring needs and ideas</p></div>
        <div class="arrow" style="font-size:56px;text-align:center;color:var(--sea)" data-step="1">→</div>
        <div class="card" data-step="1" style="border-color:var(--buoy)"><div class="icon" style="font-size:60px">🗂️</div><h3>Product Backlog</h3><p>One ranked, visible list of everything the product needs</p></div>
        <div class="arrow" style="font-size:56px;text-align:center;color:var(--sea)" data-step="2">→</div>
        <div class="card" data-step="2"><div class="icon" style="font-size:60px">🚣</div><h3>Committed Scrum Team</h3><p>PO, Development Team and SM turn it into product</p></div>
      </div>${AR}`
  })

  // ---------- 23. Artifacts ----------
  add({
    steps: 3,
    html: `
      <h2>Scrum artifacts</h2>
      <div class="cols three">
        <div class="card" data-step="1"><div style="font-size:70px">🗂️</div><h3>Product Backlog</h3><p>What to do</p></div>
        <div class="card" data-step="2"><div style="font-size:70px">📋</div><h3>Sprint Backlog</h3><p>The activities of the current sprint</p></div>
        <div class="card" data-step="3"><div style="font-size:70px">📦</div><h3>PSPI</h3><p>Potentially shippable product increment</p></div>
      </div>`
  })

  // ---------- 24. Scrum framework animated ----------
  add({
    steps: 9,
    cls: 'fw',
    html: `
      <h2 style="margin-bottom:10px">How a sprint flows</h2>
      <div class="grow">
      <svg viewBox="0 0 1400 640" aria-hidden="true">
        <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#1C7C9C"/></marker></defs>
        <g data-step="1">
          ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="40" y="${200 + i * 44}" width="${190 - i * 14}" height="36" rx="7" fill="${i < 2 ? '#1C7C9C' : i < 4 ? '#2FA3C4' : '#0B2540'}"/>`).join('')}
          <text x="40" y="180" class="lbl">Product Backlog</text>
        </g>
        <g data-step="2">
          <line x1="250" y1="320" x2="380" y2="320" stroke="#1C7C9C" stroke-width="5" marker-end="url(#ah)"/>
          <text x="250" y="300" class="sub">Sprint Planning</text>
          ${[0, 1, 2].map(i => `<rect x="395" y="${276 + i * 34}" width="120" height="28" rx="6" fill="#FF5A36"/>`).join('')}
          <text x="395" y="256" class="lbl">Sprint Backlog</text>
        </g>
        <g data-step="3">
          <line x1="530" y1="320" x2="600" y2="320" stroke="#1C7C9C" stroke-width="5" marker-end="url(#ah)"/>
          <circle class="draw" style="--len:943" cx="760" cy="340" r="150" fill="none" stroke="#1C7C9C" stroke-width="10"/>
          <g class="orbit" style="transform-origin:760px 340px"><circle cx="760" cy="190" r="13" fill="#FF5A36"/></g>
          <text x="760" y="330" text-anchor="middle" class="lbl" style="font-size:34px">Sprint</text>
          <text x="760" y="364" text-anchor="middle" class="sub">&lt; 1 month · fixed length</text>
          <text x="760" y="390" text-anchor="middle" class="sub">fixed goals</text>
        </g>
        <g data-step="4">
          <circle class="draw" style="--len:352" cx="760" cy="112" r="56" fill="#FFFFFF" stroke="#F2C14E" stroke-width="8"/>
          <g class="orbit fast" style="transform-origin:760px 112px"><circle cx="760" cy="56" r="8" fill="#0B2540"/></g>
          <text x="760" y="108" text-anchor="middle" class="lbl" style="font-size:20px">Daily</text>
          <text x="760" y="132" text-anchor="middle" class="sub">24 h</text>
          <text x="840" y="70" class="sub">done · to do · impediments</text>
        </g>
        <g data-step="5">
          <line x1="915" y1="340" x2="1010" y2="340" stroke="#1C7C9C" stroke-width="5" marker-end="url(#ah)"/>
          <rect x="1020" y="292" width="190" height="96" rx="14" fill="#0B2540"/>
          <text x="1115" y="334" text-anchor="middle" class="lbl" style="fill:#fff">Increment</text>
          <text x="1115" y="362" text-anchor="middle" class="sub" style="fill:#D6EEF5">potentially shippable</text>
        </g>
        <g data-step="6">
          <rect x="1020" y="190" width="190" height="70" rx="35" fill="#D6EEF5"/>
          <text x="1115" y="233" text-anchor="middle" class="lbl">🎬 Sprint Review</text>
        </g>
        <g data-step="7">
          <rect x="1020" y="420" width="190" height="70" rx="35" fill="#FFF0CC"/>
          <text x="1115" y="463" text-anchor="middle" class="lbl">🔁 Retrospective</text>
          <path class="draw" style="--len:400" d="M1020,455 C 960,470 930,450 905,410" fill="none" stroke="#F2C14E" stroke-width="5" marker-end="url(#ah)"/>
        </g>
        <g data-step="8">
          <line x1="1220" y1="340" x2="1270" y2="340" stroke="#1C7C9C" stroke-width="5" marker-end="url(#ah)"/>
          <text x="1330" y="352" text-anchor="middle" style="font-size:64px">🚀</text>
          <text x="1330" y="410" text-anchor="middle" class="lbl" style="font-size:20px">Version</text>
          <text x="1330" y="436" text-anchor="middle" class="lbl" style="font-size:20px">released</text>
        </g>
        <g data-step="9">
          <path class="draw" style="--len:1100" d="M760,500 C 640,630 240,640 135,480" fill="none" stroke="#FF5A36" stroke-width="5" stroke-dasharray="1100" marker-end="url(#ah)"/>
          <text x="420" y="610" class="lbl" style="fill:#FF5A36">Product Backlog refinement</text>
        </g>
      </svg></div>${AR}`
  })

  // ---------- 25. Events ----------
  add({
    steps: 4,
    html: `
      <h2>Scrum events</h2>
      <div class="cols" style="grid-template-columns:repeat(4,1fr);gap:24px;flex:none">
        <div class="card" data-step="1"><div style="font-size:64px">🗺️</div><h3>Sprint Planning</h3><p>What will we do next sprint?</p></div>
        <div class="card" data-step="2"><div style="font-size:64px">☀️</div><h3>Daily Scrum</h3><p>Done, to do, impediments</p></div>
        <div class="card" data-step="3"><div style="font-size:64px">🎬</div><h3>Sprint Review</h3><p>Demo of completed stories</p></div>
        <div class="card" data-step="4"><div style="font-size:64px">🔁</div><h3>Retrospective</h3><p>Improvements for next sprints</p></div>
      </div>
      <p class="lead" style="margin-top:50px">Sprint: less than 1 month, fixed length, fixed goals.</p>${AR}`
  })
  add({ q: 'q-sprint', html: live('q-sprint') })
  add({ q: 'q-review', html: live('q-review') })

  // ---------- 28. Sprint calendar ----------
  const DAYS = []
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  for (let i = 1; i < 26; i++) DAYS.push(names[i % 5])
  const bar = (col, len, label, sub, cls = '') =>
    `<div class="sprint-bar ${cls}" style="left:${col / 25 * 100}%;width:calc(${len / 25 * 100}% - 4px)">${label}<small>${sub}</small><span class="ev">${'<i></i>'.repeat(Math.min(len, 10))}</span></div>`
  add({
    steps: 4,
    html: `
      <h2>Sprint 0, Sprint 1 … Sprint N</h2>
      <div class="cal">
        <div class="days" style="grid-template-columns:repeat(25,1fr)">${DAYS.map(d => `<div class="d ${d === 'Mon' ? 'mon' : ''}">${d}</div>`).join('')}</div>
        <div class="lane" data-step="1">${bar(0, 5, 'Sprint 0', 'Tuesday → Monday: team, tools, first backlog', 'zero')}</div>
        <div class="lane" data-step="2">${bar(5, 10, 'Sprint 1', 'Planning on Tuesday · review &amp; retro on Monday')}</div>
        <div class="lane" data-step="3">${bar(15, 10, 'Sprint 2', 'Same length, same rhythm')}</div>
        <div class="lane" data-step="4"><div class="sprint-bar" style="left:0;width:100%;background:repeating-linear-gradient(90deg,#1C7C9C 0 calc(40% - 4px),transparent calc(40% - 4px) 40%)">Sprint 3 … Sprint N<small>A steady cadence makes the team predictable</small></div></div>
      </div>
      <p class="small">Yellow dots: one Daily Scrum per working day.</p>`
  })

  // ---------- 29-32. Roles ----------
  add({
    steps: 3,
    html: `
      <h2>Roles</h2>
      <div class="roles">
        <div class="role po" data-step="1"><div class="icon">🧭</div><h3>Product Owner</h3><p>Defines the product backlog</p></div>
        <div class="role dt" data-step="2"><div class="icon">🛠️</div><h3>Development Team</h3><p>Builds the product increment</p></div>
        <div class="role sm" data-step="3"><div class="icon">🤝</div><h3>Scrum Master</h3><p>Facilitates and serves the team</p></div>
      </div>`
  })
  add({
    html: `
      <h2>🧭 Product Owner (PO)</h2>
      <div class="role-detail">
        <ul>
          <li>Helps to describe the product</li>
          <li>Identifies the customer value</li>
          <li>Plans the product roadmap</li>
          <li>Ranks the product features by value with the Development Team and Stakeholders</li>
          <li>Works with the Development Team</li>
          <li>Facilitates the product conversation between Stakeholders and Development Team</li>
        </ul>
        <div class="card" style="border-color:var(--buoy)"><h3>Accountable for maximizing the business value the team delivers</h3>
          <ul><li>Owns the backlog</li><li>Accepts or rejects the work done</li><li>States the acceptance criteria</li><li>Knows, has power, is involved</li><li>Works close to the team when possible</li><li>Manages stakeholders and sponsor expectations</li><li>Motivates the team and celebrates success</li></ul></div>
      </div>${AR}`
  })
  add({
    html: `
      <h2>🤝 Scrum Master (SM)</h2>
      <div class="role-detail">
        <ul>
          <li>Helps the Development Team and the PO during all project phases</li>
          <li>Facilitates Scrum events</li>
          <li>Supports the Development Team to remove impediments</li>
          <li>Mentors and coaches on Scrum and agile practices</li>
          <li>Protects the Scrum Team from external interruptions</li>
        </ul>
        <div class="card" style="border-color:var(--sea)"><h3>Accountable for the Scrum process and for keeping the team focused on value</h3>
          <ul><li>Facilitates the process</li><li>Helps build self-organizing teams</li><li>Removes impediments, escalating if needed</li><li>Helps the team inspect and adapt the process</li><li>Empowers the team through servant leadership</li><li>Makes the team visible outside</li><li>Shields the team from external noise</li></ul></div>
      </div>${AR}`
  })
  add({
    html: `
      <h2>🛠️ Development Team</h2>
      <div class="role-detail">
        <ul>
          <li>Self-organized team</li>
          <li>Analyzes, designs, develops, tests, creates content and more: cross-functional and “T” shaped</li>
          <li>Members support each other</li>
          <li>Collective code and knowledge ownership</li>
        </ul>
        <div class="card" style="border-color:var(--kelp)"><h3>Accountable for turning backlog items into value increments, every sprint</h3>
          <ul><li>Self-organized</li><li>Cross-functional</li><li>Made of generalizing specialists</li><li>7 ± 2 people, dedicated</li><li>Delivers value a little at a time</li><li>Customer-centred</li><li>Builds with quality</li></ul></div>
      </div>${AR}`
  })
  add({ q: 'q-owner', html: live('q-owner') })
  add({ q: 'q-impediments', html: live('q-impediments') })

  // ---------- 35. Mid leaderboard ----------
  add({ cls: 'dark', html: `<h2>Leaderboard</h2><div class="board" data-board="10"></div>` })

  // ---------- 36. Product backlog ----------
  add({
    steps: 4,
    html: `
      <h2>Product Backlog</h2>
      <div class="cols" style="grid-template-columns:1fr 1fr">
        <ul>
          <li data-step="1">A ranked list of product features</li>
          <li data-step="2">Features can be added or changed any time before Sprint Planning</li>
          <li data-step="3">The Product Owner is accountable for the product backlog</li>
          <li data-step="4">The Dev Team estimates the items of the Product Backlog</li>
        </ul>
        <div class="card">
          <h3>Product backlog organization</h3>
          <p><b style="color:var(--sea)">Stories</b> — the smallest item to develop, done in 1 sprint</p>
          <p><b style="color:var(--sea-2)">Features</b> — a tangible characteristic of the product, bigger than a story, not doable in 1 sprint</p>
          <p><b>Epics</b> — bigger than features, still to be detailed</p>
          <p class="small">Source: Mokabyte.it — Giovanni Puliti</p>
        </div>
      </div>`
  })

  // ---------- 37. Living backlog ----------
  const ITEMS = {
    s1: ['story', 'Log in with email'], s2: ['story', 'View my pending issues'], s3: ['story', 'Filter issues by status'],
    f1: ['feature', 'Notifications'], f2: ['feature', 'Full-text search'], f3: ['feature', 'Export to CSV'],
    e1: ['epic', 'Reporting'], e2: ['epic', 'Mobile app'],
    s4: ['story', 'Weekly report email'], s5: ['story', 'Report charts']
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
    ['A living product backlog', 'Small, detailed items at the top; big, fuzzy ones at the bottom.'],
    ['Insert', 'A new feature arrives from the stakeholders.'],
    ['Reorder', 'Value changes, so the ranking changes.'],
    ['Remove', 'Not needed any more: out it goes.'],
    ['Refine', 'The Reporting epic is split into stories ready for a sprint.'],
    ['Next sprint', 'The top items become the sprint backlog.']
  ]
  const HOT = [[], ['f3'], ['s3', 'f3'], [], ['s4', 's5'], ['s1', 's3', 's2']]
  add({
    steps: 5,
    html: `
      <h2>A living product backlog</h2>
      <div class="backlog" data-backlog>
        ${Object.entries(ITEMS).map(([id, [k, t]]) => `<div class="bitem ${k} hidden" data-id="${id}" style="width:800px;top:0"><span class="kind">${k}</span>${t}</div>`).join('')}
        <div class="blegend"><div class="op" data-op></div><p class="lead" data-op-text style="font-size:30px"></p></div>
      </div>${credit('Source: Mokabyte.it — Giovanni Puliti')}`,
    onStep (el, step) {
      const H = { story: 46, feature: 60, epic: 84 }
      const order = ORDER[step]
      let y = 0
      el.querySelectorAll('.bitem').forEach(b => {
        const id = b.dataset.id
        const idx = order.indexOf(id)
        b.classList.toggle('hot', HOT[step].includes(id))
        if (idx < 0) {
          const wasVisible = !b.classList.contains('hidden')
          b.classList.toggle('gone', wasVisible || b.classList.contains('gone'))
          if (!wasVisible) b.classList.add('hidden')
        } else {
          b.classList.remove('hidden', 'gone')
        }
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

  // ---------- 38-41. User stories ----------
  add({
    steps: 1,
    html: `
      <h2>User stories</h2>
      <p class="lead">A user story describes a feature from the point of view of the end user. Its simple, shared language improves the conversation between stakeholders and team.</p>
      <div class="story-card" data-step="1" style="margin-top:40px">As a <b>&lt;type of user&gt;</b>,<br>I want to <b>&lt;do something&gt;</b>,<br>so that <b>&lt;I get some value&gt;</b>.</div>`
  })
  add({
    steps: 3,
    html: `
      <h2>The 3C</h2>
      <div class="three-c">
        <div class="card" data-step="1"><div class="c">C</div><h3>Card</h3><p>The sentence “As… I want to… so that…”</p></div>
        <div class="card" data-step="2"><div class="c">C</div><h3>Conversation</h3><p>The feature described in plain English, with visual elements when they help</p></div>
        <div class="card" data-step="3"><div class="c">C</div><h3>Confirmation</h3><p>The acceptance criteria</p></div>
      </div>`
  })
  add({ q: 'q-3c', html: live('q-3c') })
  add({
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
          </div>
        </div>
      </div>`
  })
  const INV = [['I', 'Independent', 'can be built in any order'], ['N', 'Negotiable', 'not a contract: open to discussion'], ['V', 'Valuable', 'brings value to the user'], ['E', 'Estimable', 'the team can size it'], ['S', 'Small', 'fits in one sprint'], ['T', 'Testable', 'has clear acceptance criteria']]
  add({
    steps: 6,
    html: `
      <h2>INVEST: what makes a good story</h2>
      <div class="invest">${INV.map((l, i) => `<div class="L"><b>${l[0]}</b><span data-step="${i + 1}">${l[1]}</span><small data-step="${i + 1}">${l[2]}</small></div>`).join('')}</div>`
  })
  add({ q: 'q-negotiable', html: live('q-negotiable') })

  // ---------- 44. AI agents wheel ----------
  const PH = [
    ['Plan', 'Defining backlogs, estimating tasks, identifying relevant projects and teams, recommending catalog components.'],
    ['Analyze', 'Analyzing existing platform components and recommending new features based on existing data.'],
    ['Design', 'Automating configuration, designing custom functions, generating applications, giving security recommendations.'],
    ['Code', 'Code generation in the IDE, frontend interfaces on demand, synthetic data for testing.'],
    ['Test', 'Creating test cases, analyzing code coverage, insights for end-to-end testing.'],
    ['Deploy', 'Clear summaries of changes and impact, automated and schedule-based deployments.'],
    ['Operate', 'Proactive monitoring of runtime environments, alerts on potential issues, resource consumption insights.'],
    ['Document', 'Detailed documentation with insights and a step-by-step guide for the solution.'],
    ['Improve', 'Helping the team find application improvements and propose updates.']
  ]
  add({
    steps: 9,
    html: `
      <h2 style="margin-bottom:10px">AI agents: the future of the SDLC?</h2>
      <div class="wheel">
        ${PH.map((p, i) => {
          const a = -Math.PI / 2 + i * 2 * Math.PI / PH.length
          return `<div class="node" data-i="${i}" style="left:${50 + 41 * Math.cos(a)}%;top:${50 + 42 * Math.sin(a)}%"><b>${i + 1}</b><span>${p[0]}</span></div>`
        }).join('')}
        <div class="center"><h3 data-ph-title>Nine phases, one loop</h3><p data-ph-text>Where can an AI agent help along the software development life cycle?</p></div>
      </div>`,
    onStep (el, step) {
      el.querySelectorAll('.wheel .node').forEach((n, i) => n.classList.toggle('cur', i === step - 1))
      el.querySelector('[data-ph-title]').textContent = step ? `${step}. ${PH[step - 1][0]}` : 'Nine phases, one loop'
      el.querySelector('[data-ph-text]').textContent = step ? PH[step - 1][1] : 'Where can an AI agent help along the software development life cycle?'
    }
  })
  add({ q: 'q-ai', html: live('q-ai') })

  // ---------- 46. Faster validation ----------
  add({
    steps: 3,
    html: `
      <h2>Faster validation for business, better execution for tech</h2>
      <div class="flow" style="flex:1;align-items:center">
        <div class="stage-box agility" data-step="1" style="align-self:stretch"><div class="kicker">Agility · BIZ + TECH</div><h3>Design &amp; Experiment</h3>
          <ul><li>Create service composition from requirements</li><li>Build blueprints and reference architecture</li><li>Prototype with real data and interaction</li></ul></div>
        <div class="arrow" data-step="2" style="width:200px;flex-direction:column;display:flex;gap:10px;font-size:22px;font-weight:600;font-family:var(--body);text-align:center"><span style="font-size:56px">→</span>MCP server<br>creates the blueprint</div>
        <div class="stage-box reliability" data-step="3" style="align-self:stretch"><div class="kicker">Reliability · SW ENG</div><h3>Engineer &amp; Scale</h3>
          <ul><li>Create projects and configuration</li><li>Apply business logic</li><li>Reuse it with new requirements</li></ul></div>
      </div>
      <p class="small" data-step="3">An IT factory where the business prototypes, validates the first part of the solution on the market, and software engineers scale it.</p>`
  })

  // ---------- 47-48. Resources & hiring ----------
  add({
    html: `
      <h2>What to read</h2>
      <div class="cols" style="grid-template-columns:repeat(2,1fr);gap:24px;flex:none">
        <div class="card"><h3>The Scrum Guide</h3><p>Ken Schwaber, Jeff Sutherland — scrumguides.org</p></div>
        <div class="card"><h3>Manifesto for Agile Software Development</h3><p>agilemanifesto.org</p></div>
        <div class="card"><h3>User Stories Applied</h3><p>Mike Cohn</p></div>
        <div class="card"><h3>Team Topologies</h3><p>Matthew Skelton, Manuel Pais</p></div>
      </div>
      <p class="small" style="margin-top:auto">Replace this list with the books from your original slide.</p>`
  })
  add({
    cls: 'sea',
    html: `<h1 style="margin-top:auto">We are hiring</h1><p class="lead" style="color:#fff;font-size:40px;margin-top:24px;margin-bottom:auto">Join Mia-Platform and build the platform behind agentic software delivery. mia-platform.eu</p>`
  })

  // ---------- Bonus track ----------
  add({ cls: 'dark', html: `<span class="tag" style="margin-top:auto;align-self:flex-start">Bonus track</span><h1 style="margin-top:24px;margin-bottom:auto">DevOps and Platform Engineering</h1>` })
  add({
    steps: 3,
    html: `
      <h2>Evolution in the last two decades</h2>
      <div style="position:relative;flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:30px;align-items:center">
        <div style="position:absolute;left:0;right:0;top:50%;height:6px;background:var(--line);border-radius:3px"></div>
        ${[['2001', 'Agile', 'Teams deliver in short iterations'], ['2009', 'DevOps', 'Dev and Ops share the lifecycle'], ['2020s', 'Platform Engineering', 'Self-service platforms for many teams']].map((m, i) =>
          `<div class="card" data-step="${i + 1}" style="position:relative;text-align:center"><div class="big-number" style="font-size:80px;color:var(--buoy)">${m[0]}</div><h3>${m[1]}</h3><p>${m[2]}</p></div>`).join('')}
      </div>`
  })
  add({
    steps: 4,
    html: `
      <h2>How are organizations facing this challenge?</h2>
      <div class="cols" style="grid-template-columns:1fr 760px;align-items:end">
        <ul style="align-self:start"><li>Adopting agile methods and practices</li><li>Implementing good DevOps habits</li><li>Introducing cloud native principles and technologies</li></ul>
        <div class="stack">
          <div class="layer" data-step="1" style="background:var(--sea)">Agile</div>
          <div class="layer" data-step="2" style="background:var(--sea-2)">DevOps</div>
          <div class="layer" data-step="3" style="background:var(--deep)">Cloud Native</div>
          <div class="layer" data-step="4" style="background:var(--buoy);text-align:center;font-size:56px">Value</div>
        </div>
      </div>`
  })
  add({
    steps: 2,
    html: `
      <h2>Cloud native is… not so easy :-)</h2>
      <div class="cols" style="grid-template-columns:1.2fr 1fr">
        <svg viewBox="0 0 700 520" style="width:100%;height:100%" aria-hidden="true">
          <line x1="60" y1="470" x2="680" y2="470" stroke="#0B2540" stroke-width="4"/>
          <line x1="60" y1="470" x2="60" y2="20" stroke="#0B2540" stroke-width="4"/>
          <text x="370" y="510" text-anchor="middle" font-size="22" fill="#5E7387">time</text>
          <text x="30" y="250" text-anchor="middle" font-size="22" fill="#5E7387" transform="rotate(-90 30 250)">knowledge</text>
          <path class="draw" data-step="1" style="--len:1100" d="M60,465 C 160,462 230,455 270,420 C 300,390 300,90 330,50 C 350,30 380,60 400,120 C 430,210 470,120 500,80 C 560,40 620,36 670,34" fill="none" stroke="#FF5A36" stroke-width="7" stroke-linecap="round"/>
          <g data-step="1"><circle cx="270" cy="420" r="11" fill="#0B2540"/><text x="160" y="400" font-size="22" font-weight="600" fill="#0B2540">you are here</text></g>
        </svg>
        <div data-step="2" style="align-self:center">
          <div class="big-number" style="color:var(--sea)" data-count="119">119</div><p style="margin-top:0">projects incubated by the CNCF today</p>
          <div class="big-number" style="color:var(--buoy);margin-top:30px" data-count="1000" data-suffix="+">1,000+</div><p style="margin-top:0">cards in the CNCF Landscape</p>
          <p class="small">A lot of new technologies emerge every year. It’s not always an easy choice!</p>
        </div>
      </div>${credit('Adapted from the CNCF Annual Report 2021 · landscape.cncf.io')}`,
    onStep (el, step) { if (step === 2) countUp(el) }
  })
  add({
    html: `
      <h2>One small, cross-functional team</h2>
      <div class="cols">
        <div>
          <p class="lead">End-to-end responsibility for the application lifecycle: code, test, deploy, operate, troubleshoot, fix, maintain, improve. The most effective way to build, deploy and operate software.</p>
          <p style="margin-top:30px"><span class="tag">😀 High morale</span> <span class="tag">🎯 Good effectiveness</span> <span class="tag">🙌 A satisfied team</span></p>
        </div>
        <ul>
          <li>Common rules of work are well known by all</li>
          <li>People are interchangeable and help each other</li>
          <li>Ownerships are well known</li>
          <li>Automation by design: few people, no time for manual work</li>
          <li>Coding is ethical, the team runs 24/7: I create bugs, I fix them</li>
          <li>SMART actions from retrospectives actually get done</li>
        </ul>
      </div>`
  })

  // ---------- Scaling teams ----------
  const TEAMS_X = [140, 585, 1030]
  const CAPS = [
    'One team: autonomy and team satisfaction.',
    'More than one team: share common rules, share infrastructure and components, manage dependencies.',
    'A ticket-based central team for governance, architecture, infra and ops: waiting time, bottlenecks, stress, low morale, friction.',
    'Devs and Ops are end users too, and they deserve a good UX. DevX is the keyword.',
    'A self-service Internal Developer Platform: simple for dev teams, simple to operate for ops teams.'
  ]
  add({
    steps: 4,
    html: `
      <h2>Scaling teams and governance</h2>
      <div class="org" data-org>
        ${TEAMS_X.map((x, i) => `<div class="team" data-t="${i}" style="left:${x}px;top:30px"><div class="f">😀</div><b>Team ${String.fromCharCode(65 + i)}</b></div>`).join('')}
        ${Array.from({ length: 9 }, (_, i) => `<div class="ticket" data-k="${i}" style="left:${TEAMS_X[i % 3] + 90}px;top:150px;opacity:0"></div>`).join('')}
        <div class="central" data-central style="opacity:0">Central team: governance, architecture, infra and ops</div>
        <p class="lead" data-cap style="position:absolute;left:0;bottom:0;max-width:1300px;color:var(--deep);font-family:var(--display);font-weight:700;font-size:38px"></p>
      </div>`,
    onStep (el, step) {
      const teams = el.querySelectorAll('.team')
      teams.forEach((t, i) => {
        t.style.opacity = step === 0 && i !== 1 ? 0 : 1
        t.querySelector('.f').textContent = step === 2 || step === 3 ? '😟' : step === 1 ? '🙂' : '😀'
        t.style.borderColor = step === 2 || step === 3 ? 'var(--buoy)' : 'var(--kelp)'
      })
      const c = el.querySelector('[data-central]')
      c.style.opacity = step >= 2 ? 1 : 0
      c.classList.toggle('idp', step >= 4)
      c.innerHTML = step >= 4
        ? '<span style="font-family:var(--display);font-size:38px">Internal Developer Platform</span>self-service, automated, configurable · built and enriched by the platform team'
        : 'Central team: governance, architecture, infra and ops'
      el.querySelectorAll('.ticket').forEach((k, i) => {
        if (step === 2 || step === 3) {
          k.style.opacity = 1
          k.style.left = (380 + i * 62) + 'px'
          k.style.top = '400px'
          k.style.transitionDelay = (i * 90) + 'ms'
        } else {
          k.style.opacity = 0
          k.style.left = (TEAMS_X[i % 3] + 90) + 'px'
          k.style.top = '150px'
          k.style.transitionDelay = '0ms'
        }
      })
      el.querySelector('[data-cap]').textContent = CAPS[step]
    }
  })
  add({ q: 'q-bottleneck', html: live('q-bottleneck') })

  // ---------- IDP ----------
  const LIFE = [
    ['code', ['Develop, test, build loop', 'Reuse services and libraries', 'Focus on business logic'], ['source code', 'pipelines']],
    ['ship', ['Runtime testing', 'Versioning', 'Sizing and scalability', 'Delivery to environments', 'Policies'], ['continuous deployment', 'manifests', 'artifact repository']],
    ['run', ['Apply policies', 'Run services', 'Expose and secure them', 'Zero trust', 'Key management'], ['API / proxy', 'service mesh', 'runtime security', 'authz']],
    ['operate', ['Business continuity', 'Manage issues', 'Monitor costs', 'Experiments in production'], ['monitoring', 'logs / traces', 'chaos engineering', 'FinOps']],
    ['team', ['Collaborate'], ['docs', 'project management']]
  ]
  add({
    steps: 3,
    html: `
      <h2>What the hell is an IDP?!</h2>
      <div class="life">${LIFE.map(l => `<div class="col"><h3>${l[0]}</h3><ul>${l[1].map(x => `<li>${x}</li>`).join('')}</ul><div class="tools" data-step="1">${l[2].map(t => `<span>${t}</span>`).join('')}</div></div>`).join('')}</div>
      <div class="plane cp" data-step="2">Control plane: orchestrate all tools with workflows built from APIs, webhooks, CRDs and scripts</div>
      <div class="plane idp" data-step="3">The Internal Developer Platform simplifies the Developer and Operations experience</div>
      ${credit('Open source technologies from landscape.cncf.io, mainly graduated and incubated')}`
  })
  add({
    steps: 1,
    html: `
      <h2>An IDP gives every team</h2>
      <div class="cols three" style="flex:none">
        ${[['🖥️', 'A unique user interface'], ['⌨️', 'A command line for IaC automation'], ['📄', 'YAML files for configuration'], ['🔌', 'APIs and webhooks for tool integrations'], ['🧩', 'An SDK to extend it with plugins'], ['📚', 'A common catalog for reuse and collaboration']]
          .map((f, i) => `<div class="card" data-step="1" style="transition-delay:${i * 110}ms"><div style="font-size:56px">${f[0]}</div><h3 style="margin:8px 0 0">${f[1]}</h3></div>`).join('')}
      </div>
      <p class="lead" style="margin-top:auto">A common place for all teams to build and operate cloud native applications, enriched by all of them.</p>`
  })

  // ---------- Final ----------
  add({ q: 'q-final', html: live('q-final') })
  add({ cls: 'dark', html: `<h2>Final podium</h2><div class="podium" data-podium></div>` })
  add({
    cls: 'dark title-slide',
    html: `
      <svg class="sea-bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        <g class="wave slow" opacity=".5"><path d="${wavePath(700, 12, 160, 2000)}" stroke="#2FA3C4" stroke-width="3" fill="none"/></g>
        <g class="wave" opacity=".7"><path d="${wavePath(760, 10, 120, 2000)}" stroke="#2FA3C4" stroke-width="3" fill="none"/></g>
      </svg>
      <h1>Thank you!</h1>
      <p class="meta"><span data-deck="speaker.name">Giulio Roggero</span> — <span data-deck="speaker.role">CTO &amp; Co-Founder, Mia-Platform</span><br><span data-deck="speaker.email">giulio.roggero@mia-platform.eu</span></p>`
  })

  // count-up helper used by onStep handlers
  function countUp (el) {
    el.querySelectorAll('[data-count]').forEach(n => {
      const target = Number(n.dataset.count)
      const suffix = n.dataset.suffix || (n.textContent.includes('%') ? '%' : '')
      const t0 = performance.now()
      const dur = 1200
      const frame = now => {
        const k = Math.min(1, (now - t0) / dur)
        const v = Math.round(target * (1 - Math.pow(1 - k, 3)))
        n.textContent = v.toLocaleString('en-US') + suffix
        if (k < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    })
  }

  window.SLIDES = S
  window.SlideKit = { live, credit, countUp, wavePath, seaScene, speedboat, sailboat, raft, rowboat, fullSpeedboat, person, seated }
})()
