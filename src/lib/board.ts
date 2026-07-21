import type { BaseRecord } from '@hanzo/base/react'

/**
 * The one org-scoped Base collection behind Kanban Lane (see schema.sql). Base
 * adds id/created/updated/owner/org; these are the domain columns the app
 * reads/writes. `status`/`priority` are stored as TEXT and normalized on read
 * (normStatus / normPriority) so a stray value can never break the board.
 */
export interface Task extends BaseRecord {
  title: string
  status: string
  assignee: string
  priority: string
}

/* --- Lanes ------------------------------------------------------------------ */

export type Status = 'todo' | 'doing' | 'done'

/** The three lanes, left to right. Work moves todo → doing → done. */
export const STATUSES: readonly Status[] = ['todo', 'doing', 'done']

export const STATUS_LABEL: Record<Status, string> = {
  todo: 'To Do',
  doing: 'Doing',
  done: 'Done',
}

/** Coerce any stored value to a known lane (defaults to the first lane). */
export function normStatus(v: unknown): Status {
  return v === 'doing' || v === 'done' ? v : 'todo'
}

/** The lane to the right, or null at the end of the board (drag-free advance). */
export function nextStatus(s: Status): Status | null {
  const i = STATUSES.indexOf(s)
  return i < STATUSES.length - 1 ? STATUSES[i + 1] : null
}

/** The lane to the left, or null at the start of the board. */
export function prevStatus(s: Status): Status | null {
  const i = STATUSES.indexOf(s)
  return i > 0 ? STATUSES[i - 1] : null
}

/* --- Priority --------------------------------------------------------------- */

export type Priority = 'low' | 'med' | 'high'

export const PRIORITIES: readonly Priority[] = ['low', 'med', 'high']

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
}

/** 1..3 — how many signal bars a priority fills. */
export const PRIORITY_LEVEL: Record<Priority, number> = { low: 1, med: 2, high: 3 }

export function normPriority(v: unknown): Priority {
  return v === 'high' || v === 'med' ? v : 'low'
}

/* --- The one accent + the monochrome ink scale ------------------------------ */
/**
 * Crisp lanes: everything is graphite/ink and one accent. The accent (lime)
 * is reserved — it marks the Doing lane (work in motion), the brand mark, the
 * active nav, and the primary action. Nothing else is colored.
 */
export const INK = '#0a0b0d' // page
export const PANEL = '#101216' // lane / section surface
export const CARD = '#16181d' // a task card
export const CARD_HI = '#1c1f26' // raised / active
export const LINE = '#ffffff12' // hairline
export const LINE_HI = '#ffffff24' // stronger hairline
export const TEXT = '#f5f6f8'
export const MUTED = '#9aa1ad' // secondary text
export const FAINT = '#666d79' // tertiary text
export const ACCENT = '#a3e635' // the single accent — lime
export const ACCENT_INK = '#0a0b0d' // text on the accent
export const ACCENT_DIM = '#a3e6351f' // translucent accent fill
export const ACCENT_LINE = '#a3e6354d' // accent hairline

/** The accent belongs to the Doing lane; the others stay monochrome. */
export function isAccentLane(s: Status): boolean {
  return s === 'doing'
}

/* --- People ----------------------------------------------------------------- */

/** "Ada Lovelace" → "AL", "mercury" → "ME", "" → "—". */
export function initials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* --- Ordering --------------------------------------------------------------- */

/** Tasks in a lane, highest priority first (query already sorts by -created). */
export function inLane(tasks: Task[], status: Status): Task[] {
  return tasks
    .filter((t) => normStatus(t.status) === status)
    .sort((a, b) => PRIORITY_LEVEL[normPriority(b.priority)] - PRIORITY_LEVEL[normPriority(a.priority)])
}

/** The whole backlog, highest priority first then newest (for the triage list). */
export function triage(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => PRIORITY_LEVEL[normPriority(b.priority)] - PRIORITY_LEVEL[normPriority(a.priority)],
  )
}
