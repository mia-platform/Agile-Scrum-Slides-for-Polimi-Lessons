// "The Scrum framework" slide: an uploaded illustration (admin console → Slide images →
// scrum-framework) with a spotlight that walks through the sprint in 9 steps.
// While no image is uploaded the slide is skipped and the drawn "How a sprint flows" diagram is shown;
// once it is uploaded, this slide replaces that diagram.
// Spot coordinates are in the pixels of the 1934 × 1420 reference illustration: [cx, cy, rx, ry].
(function () {
  const S = window.SLIDES
  window.MEDIA_SLOTS = (window.MEDIA_SLOTS || []).concat([{
    name: 'scrum-framework',
    title: 'Scrum framework illustration',
    desc: 'Used by the animated “The Scrum framework” slide in the Scrum chapter. Best with the 1934 × 1420 isometric illustration, or any image with the same layout.',
    width: 1934,
    height: 1420
  }])

  const W = 1934
  const H = 1420
  const SPOTS = [
    { t: 'Product Backlog', d: 'One ordered list of everything the product needs. The Product Owner owns it and ranks it by value.', e: [[150, 370, 175, 205]] },
    { t: 'Backlog refinement', d: 'Stakeholders bring ideas; big items are split and clarified until they are small enough for a sprint.', e: [[395, 370, 170, 310]] },
    { t: 'Sprint Planning', d: 'The team picks what fits the sprint goal and turns it into the Sprint Backlog.', e: [[360, 645, 215, 115]] },
    { t: 'The Sprint', d: 'Less than a month, fixed length, fixed goal: the team designs, builds and tests together.', e: [[800, 620, 315, 275]] },
    { t: 'Daily Scrum', d: 'Every 24 hours, in front of the board: done, to do, impediments.', e: [[890, 205, 395, 205]] },
    { t: 'Increment', d: 'A potentially shippable piece of product at the end of every sprint.', e: [[1200, 960, 165, 170]] },
    { t: 'Sprint Review', d: 'The team demos the increment to the stakeholders and collects their feedback.', e: [[1450, 860, 245, 195]] },
    { t: 'Sprint Retrospective', d: 'The team inspects how it worked and commits to improvements for the next sprint.', e: [[1705, 1240, 205, 200]] },
    { t: 'Release', d: 'Increments ship to the users, one after the other, sprint after sprint.', e: [[1090, 1240, 245, 175], [260, 1150, 275, 245]] }
  ]

  const css = `
  .sf { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 420px; gap: 34px; }
  .sf-art { min-height: 0; display: flex; align-items: center; }
  .sf-art svg { width: 100%; max-height: 100%; display: block; border-radius: 18px; background: #F8E17A; }
  .sf-dim { fill: rgba(11, 37, 64, .66); transition: opacity .6s ease; }
  .sf-hole, .sf-ring { transition: cx .9s cubic-bezier(.4, .1, .2, 1), cy .9s cubic-bezier(.4, .1, .2, 1), rx .9s cubic-bezier(.4, .1, .2, 1), ry .9s cubic-bezier(.4, .1, .2, 1), opacity .4s ease; }
  .sf-ring { fill: none; stroke: #F2C14E; stroke-width: 9; stroke-dasharray: 26 16; animation: sf-dash 6s linear infinite; }
  @keyframes sf-dash { to { stroke-dashoffset: -420; } }
  .sf-pin circle { fill: #FF5A36; stroke: #FFFFFF; stroke-width: 6; }
  .sf-pin text { font-family: var(--display); font-weight: 800; font-size: 44px; fill: #FFFFFF; }
  .sf-pin { transition: opacity .4s ease; }
  .sf-side { display: flex; flex-direction: column; min-height: 0; }
  .sf-count { font-size: 20px; font-weight: 600; color: var(--sea); }
  .sf-side h3 { font-size: 46px; line-height: 1.05; margin: 8px 0 12px; }
  .sf-side p { font-size: 25px; line-height: 1.4; margin: 0 0 18px; color: var(--deep); min-height: 106px; }
  .sf-steps { list-style: none; padding: 0; margin: auto 0 0; display: grid; gap: 6px; }
  .sf-steps li { display: grid; grid-template-columns: 34px 1fr; align-items: center; gap: 10px; font-size: 20px; margin: 0; color: var(--mist); transition: color .3s ease; }
  .sf-steps li::marker { content: none; }
  .sf-steps li b { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-size: 15px; background: var(--line); color: var(--deep); transition: background .3s ease; }
  .sf-steps li.done { color: var(--deep); }
  .sf-steps li.done b { background: var(--foam); }
  .sf-steps li.cur { color: var(--deep); font-weight: 700; }
  .sf-steps li.cur b { background: var(--buoy); color: var(--white); }
  `
  const st = document.createElement('style')
  st.textContent = css
  document.head.appendChild(st)

  const pin = (s, i) => {
    const [cx, cy, , ry] = s.e[0]
    return `<g class="sf-pin" data-pin="${i + 1}" opacity="0"><circle cx="${cx}" cy="${Math.max(40, cy - ry + 10)}" r="34"/><text x="${cx}" y="${Math.max(40, cy - ry + 10) + 15}" text-anchor="middle">${i + 1}</text></g>`
  }

  const slide = {
    key: 'scrum-framework-art',
    needsMedia: 'scrum-framework',
    replaces: ['t:how-a-sprint-flows'],
    steps: SPOTS.length,
    html: `
      <h2 style="margin-bottom:14px">The Scrum framework</h2>
      <div class="sf">
        <div class="sf-art">
          <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scrum framework illustration">
            <defs>
              <mask id="sf-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
                <rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>
                <ellipse class="sf-hole" cx="${W / 2}" cy="${H / 2}" rx="0" ry="0" fill="#000"/>
                <ellipse class="sf-hole" cx="${W / 2}" cy="${H / 2}" rx="0" ry="0" fill="#000"/>
              </mask>
            </defs>
            <image data-media-src="scrum-framework" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>
            <rect class="sf-dim" x="0" y="0" width="${W}" height="${H}" mask="url(#sf-mask)" opacity="0"/>
            <ellipse class="sf-ring" cx="${W / 2}" cy="${H / 2}" rx="0" ry="0" opacity="0"/>
            <ellipse class="sf-ring" cx="${W / 2}" cy="${H / 2}" rx="0" ry="0" opacity="0"/>
            ${SPOTS.map(pin).join('')}
          </svg>
        </div>
        <div class="sf-side">
          <div class="sf-count" data-sf-count></div>
          <h3 data-sf-title></h3>
          <p data-sf-text></p>
          <ol class="sf-steps">${SPOTS.map((s, i) => `<li data-li="${i + 1}"><b>${i + 1}</b>${s.t}</li>`).join('')}</ol>
        </div>
      </div>
      <div class="credit" data-media-credit="scrum-framework"></div>`,
    onStep (el, step) {
      const spot = step ? SPOTS[step - 1] : null
      const holes = el.querySelectorAll('.sf-hole')
      const rings = el.querySelectorAll('.sf-ring')
      const place = (node, e, show) => {
        const [cx, cy, rx, ry] = e || [W / 2, H / 2, 0, 0]
        const vals = { cx, cy, rx: show ? rx : 0, ry: show ? ry : 0 }
        for (const [k, v] of Object.entries(vals)) { node.setAttribute(k, v); node.style[k] = v + 'px' }
      }
      ;[0, 1].forEach(i => {
        const e = spot && spot.e[i]
        place(holes[i], e || (spot && spot.e[0]), !!e)
        place(rings[i], e || (spot && spot.e[0]), !!e)
        rings[i].setAttribute('opacity', e ? 1 : 0)
      })
      el.querySelector('.sf-dim').setAttribute('opacity', spot ? 1 : 0)
      el.querySelectorAll('.sf-pin').forEach(p => p.setAttribute('opacity', Number(p.dataset.pin) <= step ? 1 : 0))
      el.querySelectorAll('.sf-steps li').forEach(li => {
        const n = Number(li.dataset.li)
        li.classList.toggle('cur', n === step)
        li.classList.toggle('done', n < step)
      })
      el.querySelector('[data-sf-count]').textContent = step ? `Step ${step} of ${SPOTS.length}` : 'Nine moves, one loop'
      el.querySelector('[data-sf-title]').textContent = spot ? spot.t : 'Follow one sprint'
      el.querySelector('[data-sf-text]').textContent = spot ? spot.d : 'From the Product Backlog to a released increment. Press → to walk through it.'
    }
  }

  const at = S.findIndex(d => window.Live.slideKey(d) === 't:how-a-sprint-flows')
  if (at >= 0) S.splice(at, 0, slide); else S.push(slide)
})()
