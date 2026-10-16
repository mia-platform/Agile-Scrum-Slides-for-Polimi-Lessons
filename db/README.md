# Database

PostgreSQL. The preview runner creates a database for this project and applies `db/init/*.sql` (in name order) on every start.
Scripts are idempotent — keep them that way (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).

Connection is injected as environment variables — do not hard-code host/port/credentials:

- `DATABASE_URL` — `postgres://user@host:port/db`
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- Spring Boot: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` override `application.properties` automatically.

To change the schema add a new numbered file (e.g. `003_add_column.sql`) instead of editing applied ones.
