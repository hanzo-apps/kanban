-- Hanzo Base schema for Kanban Lane — the `databaseSchema` DDL.
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- id/created/updated/owner/org itself, so they are never re-declared here.
-- Every row is stamped with the verified IAM owner+org and is org-scoped: Base
-- applies the list/view/create/update/delete rule `@request.auth.org_id = org`,
-- so a member of your org reads/writes the row and other orgs cannot see it.
--
-- Keep this in lockstep with what the app reads/writes
-- (src/lib/board.ts + src/views/board.tsx · backlog.tsx · detail.tsx).

-- Tasks — one card on the board. `status` places the card in a lane
-- (todo | doing | done); `priority` is low | med | high.
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title    TEXT NOT NULL,
  status   TEXT NOT NULL DEFAULT 'todo',
  assignee TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'med'
);
