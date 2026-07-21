# Kanban Lane — agent notes

A focused, drag-free kanban board, forked from the canonical Hanzo starter.
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Keep it REAL — every surface must build and run, no fabricated UI.

## The app

- **Board** (`src/views/board.tsx`) — three lanes (To Do / Doing / Done). Cards
  are drag-free: `‹ ›` controls advance a task one lane via a `tasks` update,
  then refetch. Only the Doing lane is colored (the accent = work in motion).
- **Task detail** (`src/views/detail.tsx`) — the single-task editor: lane,
  priority, assignee, title → Save (one update, gated on a real change) or Delete.
- **Backlog** (`src/views/backlog.tsx`) — the writer surface: compose a task
  (lands in To Do) + a dense, priority-ordered list; any row opens the detail.
- **Landing** (`src/views/signed-out.tsx`) — the honest public view: a faithful
  static board preview (same card + lane styling as the real app, not live data)
  plus the PKCE sign-in. This is the catalog thumbnail.
- `src/lib/board.ts` — one place for the domain: `Task` type, the `todo|doing|done`
  and `low|med|high` vocab + label maps, `next/prevStatus`, `inLane`, `triage`,
  `initials`, and the ink + single-accent palette.
- `src/views/ui.tsx` — the presentational kit (TaskCard, StatusDot, PriorityBars,
  Initials, Chip, Segmented, PrimaryButton, GhostButton, TextField, Field). Zero
  data hooks, so every surface draws a task identically.

## Design — crisp lanes, monochrome, one accent

Everything is graphite/ink; the accent (lime `#a3e635`) is reserved — the Doing
lane marker + keyline, the brand mark, the active nav tab, and the primary
action. Nothing else is colored. Priority is three monochrome signal bars.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam scopes every
  `useQuery`/`useMutation` to the signed-in user's org.
- **One `tasks` query** in `home.tsx` feeds Board, Backlog, and Detail; writes
  refetch it. No second store.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. The
  IAM client id is `VITE_HANZO_CLIENT_ID` (fallback `hanzo-app`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no Tailwind).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`paddingHorizontal`/
  `alignSelf`/`borderRadius`/`borderLeftWidth`/`textAlign` — NOT the
  `items`/`justify`/`bg`/`p`/`px`/`self`/`rounded`/`text` shorthands. Shorthands
  pass at runtime but FAIL `tsc`. `Button`/pressable stacks use `onPress`;
  `Input`/`TextField` use `value`/`onChangeText`. Palette values are raw hex
  strings (`#a3e635`, hex8 tints like `#a3e6351f`) — Tamagui accepts them on
  `color`/`backgroundColor`/`borderColor`, but NOT on `placeholderTextColor`
  (that prop is typed to `ColorTokens`, so leave it to the theme default).
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`). Keep it in
  lockstep with `src/lib/board.ts` + the views.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage. No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the `tasks`
  collection (org-scoped, IAM-native, rule `@request.auth.org_id = org`). Runtime
  read/write is browser → `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. Production needs a `https://*.hanzo.app/auth/callback`
  wildcard on the shared client (or a per-app `hanzo-kanban-lane` client).

## Proven

`npm run typecheck` (tsc --noEmit) clean · `npm run build` (tsc + vite) →
`dist/` · the landing renders headless at 1280×800 with zero console errors,
showing the branded hero + the monochrome board preview. `login()` performs a
real PKCE S256 redirect to hanzo.id.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
