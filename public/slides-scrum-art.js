// "How a sprint flows": the Scrum framework illustration, explored step by step.
// Each step zooms into one area of the image, spotlights it and explains it on the right.
// Regions are percentages of the image: [left, top, right, bottom].
// The illustration is served from assets/scrum-framework.png.b64 (see /img/ in server.js).
(function () {
  const { baseHref, withShare } = window.Live
  const S = window.SLIDES
  const IMG = withShare(baseHref() + 'img/scrum-framework.png')

  const STEPS = [
    { title: 'Product Backlog', area: [0, 3, 25, 44], text: 'The Product Owner and the stakeholders keep one ranked list of everything the product needs. Big items are refined into smaller ones.' },
    { title: 'Sprint Planning', area: [10, 26, 29, 53], text: 'The team picks the top items it can finish in this sprint and plans how to build them: that is the sprint backlog.' },
    { title: 'The Sprint', area: [26, 20, 64, 64], text: 'Less than a month, fixed length, fixed goal. The Development Team turns the sprint backlog into working software.' },
    { title: 'Daily Scrum', area: [25, 0, 64, 30], text: 'Every 24 hours: what is done, what is next, what is blocking us. The task board and the burndown chart show the progress.' },
    { title: 'Increment', area: [55, 56, 70, 79], text: 'At the end of the sprint the team delivers a potentially shippable product increment.' },
    { title: 'Sprint Review', area: [66, 50, 86, 78], text: 'The team demos the increment to the stakeholders and collects their feedback for the product backlog.' },
    { title: 'Sprint Retrospective', area: [78, 70, 97, 99], text: 'The team inspects how it worked and picks one or two improvements for the next sprint.' },
    { title: 'Release', area: [0, 60, 68, 100], text: 'Shippable increments reach the users, sprint after sprint. Then the loop starts again.' }
  ]
  const OVERVIEW = { title: 'The Scrum framework', text: 'From the product backlog to a released increment, in a loop that repeats every sprint. Let’s walk through it.' }

  const FW = 840
  const FH = 620

  const css = `
  .sa-wrap { flex: 1; display: grid; grid-template-columns: ${FW}px 1fr; gap: 40px; min-height: 0; }
  .sa-frame { position: relative; width: ${FW}px; height: ${FH}px; overflow: hidden; border-radius: 20px; background: #FAE27C; border: 2px solid var(--line); }
  .sa-zoom { position: absolute; inset: 0; transform-origin: 0 0; transition: transform 1.1s cubic-bezier(.45, .05, .25, 1); }
  .sa-zoom img { width: 100%; height: 100%; object-fit: fill; display: block; }
  .sa-spot { position: absolute; border-radius: 16px; border: 4px solid var(--buoy); box-shadow: 0 0 0 4000px rgba(11, 37, 64, .55);
    transition: left 1.1s cubic-bezier(.45, .05, .25, 1), top 1.1s cubic-bezier(.45, .05, .25, 1), width 1.1s cubic-bezier(.45, .05, .25, 1), height 1.1s cubic-bezier(.45, .05, .25, 1), opacity .5s ease; }
  .sa-spot.off { opacity: 0; }
  .sa-side { display: flex; flex-direction: column; min-width: 0; }
  .sa-num { font-family: var(--display); font-weight: 800; font-size: 26px; color: var(--buoy); }
  .sa-side h3 { font-size: 52px; line-height: 1.02; margin: 6px 0 16px; }
  .sa-side .sa-text { font-size: 28px; line-height: 1.38; color: var(--deep); margin: 0; }
  .sa-steps { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; }
  .sa-steps span { font-size: 18px; font-weight: 600; padding: 7px 12px; border-radius: 10px; background: var(--white); border: 2px solid var(--line); color: var(--mist); transition: all .4s ease; }
  .sa-steps span.done { color: var(--deep); border-color: var(--sea); }
  .sa-steps span.now { background: var(--buoy); border-color: var(--buoy); color: var(--white); }
  @media (prefers-reduced-motion: reduce) { .sa-zoom, .sa-spot { transition: none; } }
  `
  const st = document.createElement('style')
  st.textContent = css
  document.head.appendChild(st)

  function frameFor (step) {
    if (!step) return { s: 1, tx: 0, ty: 0 }
    const [l, t, r, b] = STEPS[step - 1].area
    const rx = l / 100 * FW
    const ry = t / 100 * FH
    const rw = (r - l) / 100 * FW
    const rh = (b - t) / 100 * FH
    const s = Math.max(1, Math.min(1.9, Math.min(FW * 0.86 / rw, FH * 0.86 / rh)))
    let tx = FW / 2 - (rx + rw / 2) * s
    let ty = FH / 2 - (ry + rh / 2) * s
    tx = Math.min(0, Math.max(FW - FW * s, tx))
    ty = Math.min(0, Math.max(FH - FH * s, ty))
    return { s, tx, ty }
  }

  const slide = {
    key: 't:how-a-sprint-flows',
    steps: STEPS.length,
    html: `
      <h2 style="margin-bottom:22px">How a sprint flows</h2>
      <div class="sa-wrap">
        <div class="sa-frame">
          <div class="sa-zoom">
            <img src="${IMG}" alt="Illustration of the Scrum framework: product backlog, sprint planning, the sprint loop with the daily scrum, the increment, review, retrospective and release">
            <div class="sa-spot off"></div>
          </div>
        </div>
        <div class="sa-side">
          <div class="sa-num" data-sa-num>Overview</div>
          <h3 data-sa-title>${OVERVIEW.title}</h3>
          <p class="sa-text" data-sa-text>${OVERVIEW.text}</p>
          <div class="sa-steps">${STEPS.map((x, i) => `<span>${i + 1}. ${x.title}</span>`).join('')}</div>
        </div>
      </div>`,
    onStep (el, step) {
      const f = frameFor(step)
      el.querySelector('.sa-zoom').style.transform = `translate(${f.tx}px, ${f.ty}px) scale(${f.s})`
      const spot = el.querySelector('.sa-spot')
      spot.classList.toggle('off', !step)
      if (step) {
        const [l, t, r, b] = STEPS[step - 1].area
        Object.assign(spot.style, { left: l + '%', top: t + '%', width: (r - l) + '%', height: (b - t) + '%' })
      }
      const cur = step ? STEPS[step - 1] : OVERVIEW
      el.querySelector('[data-sa-num]').textContent = step ? `Step ${step} of ${STEPS.length}` : 'Overview'
      el.querySelector('[data-sa-title]').textContent = cur.title
      el.querySelector('[data-sa-text]').textContent = cur.text
      el.querySelectorAll('.sa-steps span').forEach((s, i) => {
        s.classList.toggle('done', i < step - 1)
        s.classList.toggle('now', i === step - 1)
      })
    }
  }

  const i = S.findIndex(d => window.Live.slideKey(d) === 't:how-a-sprint-flows')
  if (i >= 0) S[i] = slide
  else {
    const j = S.findIndex(d => (d.html || '').includes('Scrum events'))
    S.splice(j >= 0 ? j : S.length, 0, slide)
  }
})()
