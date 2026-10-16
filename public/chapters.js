// Chapters of the deck. Each slide belongs to the chapter whose start slide precedes it.
// A session presents the chapters selected in the admin console (all of them when none is set).
// To add a chapter: add an entry with the key of its first slide (see Live.slideKey in common.js:
// "t:" + the slugified first heading, "q:" + a question id, or a slide's own `key`).
(function () {
  const { slideKey } = window.Live
  const S = window.SLIDES

  const CHAPTERS = [
    { id: 'intro', title: 'Welcome & warm-up', desc: 'Title, speaker, today’s route, join with the QR code, warm-up questions', start: 't:introduction-to-agile-and-scrum' },
    { id: 'agile', title: 'Agile intro', desc: 'Reach the island, waterfall vs incremental, faster validation, the Agile Manifesto and its principles', start: 't:reach-the-island' },
    { id: 'scrum', title: 'Scrum', desc: 'Team and roles, artifacts, events and sprints, product backlog, user stories, 3C and INVEST', start: 't:scrum' },
    { id: 'ai', title: 'AI in the SDLC', desc: 'The nine phases of an AI-assisted lifecycle, faster validation for business and tech', start: 't:ai-agents-the-future-of-the-sdlc' },
    { id: 'agentic', title: 'Agentic SDLC', desc: 'Agents writing code, adoption pitfalls, token trap, code as a commodity, context engineering, measuring ROI', start: 't:when-agents-write-the-code' },
    { id: 'resources', title: 'Resources & hiring', desc: 'What to read, we are hiring', start: 't:what-to-read' },
    { id: 'platform', title: 'DevOps & Platform Engineering', desc: 'Agile, DevOps and cloud native, scaling teams, internal developer platforms', start: 't:devops-and-platform-engineering' },
    { id: 'future', title: 'The future of software engineering', desc: '2027 outlook, Agile values, harness engineering, ride the wave', start: 't:where-this-is-heading' },
    { id: 'wrapup', title: 'Wrap-up', desc: 'Final word cloud, podium, thank you', start: 'q:q-final' }
  ]

  // "Today's route": an agenda of the selected chapters, right after the speaker slide.
  const sp = S.findIndex(d => d.key === 'speaker')
  if (!S.some(d => d.key === 'agenda')) {
    S.splice(sp >= 0 ? sp + 1 : 1, 0, {
      key: 'agenda',
      chapter: 'intro',
      html: '<h2>Today’s route</h2><div class="agenda" data-agenda></div>'
    })
  }

  let current = CHAPTERS[0].id
  for (const d of S) {
    const c = CHAPTERS.find(ch => ch.start === slideKey(d))
    if (c) current = c.id
    if (!d.chapter) d.chapter = current
  }
  window.CHAPTERS = CHAPTERS
})()
