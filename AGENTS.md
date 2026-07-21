# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Kanban Lane — a focused, drag-free kanban board. Vite + React 19 +
`@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Keep it minimal and real.
`@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this). The domain
(task types, lane/priority vocab, ink + one-accent palette) lives in
`src/lib/board.ts`; the presentational kit in `src/views/ui.tsx`. `schema.sql` is
the Base data contract (`tasks`). Prove changes with `npm run build` (tsc + vite).
Never build a container image locally — Hanzo Cloud owns deploys.
