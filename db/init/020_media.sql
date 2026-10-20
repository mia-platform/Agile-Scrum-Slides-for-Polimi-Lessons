-- Images uploaded from the admin console (e.g. the Scrum framework illustration). Idempotent.
CREATE TABLE IF NOT EXISTS deck_media (
  name text PRIMARY KEY,
  type text NOT NULL,
  data bytea NOT NULL,
  credit text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
