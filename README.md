# Agile Scrum Polimi Live

Interactive slide deck for the **"Introduction to Agile, Scrum and Practices"** lesson of the DSD course at **Politecnico di Milano** (October 20, 2026) — by Giulio Roggero, CTO & Co-Founder of Mia-Platform.

Not just slides: an animated presenter deck with **live polls, quizzes, word clouds and a leaderboard**, a **QR join page** so students can interact from their phones, and an **admin console** to run one or more lesson sessions.

## What it does

- **Presenter deck** (`/`): animated slides, chapter navigation, live results overlaid on poll/quiz/word-cloud slides, leaderboard.
- **Student join page** (`/join`): mobile-first. Students pick a name and answer the running poll/quiz/word cloud; the QR code shown on slides links here.
- **Admin console** (`/admin`): session management (create, configure, activate, archive, reset, export results), question start/stop/reveal, media library, user administration.
- **Multi-session**: every lesson is a *session* row with its own configuration (titles, speaker, hidden slides, chapter selection, questions) and its own players and results — reuse the deck for other editions.

## The deck

| Chapter | Content |
|---|---|
| Welcome & warm-up | Title, speaker, route of the day, QR join, warm-up questions |
| Agile intro | Reach the island, waterfall vs incremental, faster validation, Agile Manifesto and principles |
| Scrum | Team and roles, artifacts, events and sprints, product backlog, user stories, 3C and INVEST |
| Agentic SDLC | Agents writing code, AI-powered DevOps loop, human in the loop, adoption pitfalls, token trap, source control at agent scale |
| Agentic ROI | Technical-debt risk, context engineering, AI playbooks, scoring sessions, proving the delta |
| Resources & hiring | Reading list and more |

Slides are defined in `public/slides*.js` and grouped into chapters in `public/chapters.js`; interactive questions live in `questions.json` (19 of them: `poll`, `quiz` with timer and correct answer, `wordcloud`).

## Architecture

Single Node.js service (`server.js`, Express + `pg`):

```
services/app/
├── server.js        # API + static pages + auth mounting
├── config.json      # setupCode + publicUrl defaults
├── questions.json   # all poll/quiz/word-cloud questions
├── auth/            # vfs_scaffold_auth: signup/login/sessions/roles (see auth/README.md)
├── db/init/         # idempotent PostgreSQL schema (see db/README.md)
└── public/          # presenter deck, join page, admin console (vanilla JS)
```

**Storage:** PostgreSQL. The preview runner creates the database and applies `db/init/*.sql` (in name order) on every start; scripts are idempotent.

**Data model:**

| Table | Purpose |
|---|---|
| `deck_sessions` | One row per lesson: name, date, place, status (`draft`/`active`/`archived`) and JSONB `config` |
| `deck_players` | Students who joined a session (id = player token, name) |
| `deck_runs` | Per-question run state: `idle`/`open`/…, started/ends at, revealed |
| `deck_answers` | One answer per player per question (JSONB value, points) |
| `deck_settings` | App-level settings (e.g. `publicUrl`) |

## API overview

- **Public (students):** `GET /api/deck`, `GET /api/config`, `POST /api/public/join`, `GET /api/public/state`, `GET /api/public/question/:id`, `POST /api/public/answer`, `GET /api/leaderboard`
- **Admin (role `admin`):** `GET /api/admin/ping`, question control `POST /api/admin/question/:id/:action` (start/stop/reveal), `POST /api/admin/reset-all`, sessions CRUD (`/api/admin/sessions`, activate, reset, export), media upload/list/delete
- **Auth:** `/auth/signup`, `/auth/login`, `/auth/logout`, `/auth/me`, user & invite management (see `auth/README.md`)
- **Health:** `GET /api/health`

## Setup & run

```bash
npm install
npm start        # node server.js
```

Requires a PostgreSQL database; connection is injected via `DATABASE_URL` or `PG*` environment variables (never hard-coded). On first run, sign-up with the setup code (`config.json` → `setupCode`, overridable with `SETUP_CODE`); the first account becomes `admin`.

Deployed as a Flow sandbox preview; `config.json` also carries the `publicUrl` used to build the join QR code.

## License

For educational use — Politecnico di Milano DSD lesson material by Giulio Roggero.
