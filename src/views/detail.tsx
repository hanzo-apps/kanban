import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { Field, GhostButton, Initials, PrimaryButton, Segmented, TextField } from './ui'
import {
  ACCENT,
  FAINT,
  LINE_HI,
  PANEL,
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  isAccentLane,
  normPriority,
  normStatus,
  type Priority,
  type Status,
  type Task,
} from '../lib/board'

/**
 * Task detail — the single-task editor. Change the lane (drag-free), priority,
 * assignee, and title, then Save (one `tasks` update) or Delete. Save is gated
 * on a real change so it never writes a no-op.
 */
export function Detail({ task, refetch, onBack }: { task: Task; refetch: () => void; onBack: () => void }) {
  const update = useMutation('tasks', 'update')
  const remove = useMutation('tasks', 'delete')

  const [title, setTitle] = useState(task.title ?? '')
  const [status, setStatus] = useState<Status>(normStatus(task.status))
  const [priority, setPriority] = useState<Priority>(normPriority(task.priority))
  const [assignee, setAssignee] = useState(task.assignee ?? '')

  const dirty =
    title !== (task.title ?? '') ||
    status !== normStatus(task.status) ||
    priority !== normPriority(task.priority) ||
    assignee !== (task.assignee ?? '')
  const busy = update.isLoading || remove.isLoading
  const accent = isAccentLane(status)

  async function save() {
    if (!dirty || busy || !title.trim()) return
    await update.mutate({ id: task.id, title: title.trim(), status, priority, assignee: assignee.trim() })
    refetch()
    onBack()
  }

  async function del() {
    if (busy) return
    await remove.mutate({ id: task.id })
    refetch()
    onBack()
  }

  return (
    <YStack gap={16} maxWidth={640} width="100%">
      <XStack alignItems="center" justifyContent="space-between">
        <GhostButton label="‹  Board" onPress={onBack} />
        <Text fontSize={12} color={FAINT}>
          {metaLine(task)}
        </Text>
      </XStack>

      <YStack
        backgroundColor={PANEL}
        borderWidth={1}
        borderColor={LINE_HI}
        borderRadius={16}
        borderLeftWidth={accent ? 3 : 1}
        borderLeftColor={accent ? ACCENT : LINE_HI}
        padding={22}
        gap={20}
      >
        <Field label="Title">
          <TextField value={title} onChangeText={setTitle} placeholder="What needs doing?" fontSize={16} height={46} />
        </Field>

        <XStack gap={28} flexWrap="wrap">
          <Field label="Lane">
            <Segmented
              options={STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
              value={status}
              onChange={setStatus}
              accentValue="doing"
            />
          </Field>
          <Field label="Priority">
            <Segmented
              options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
              value={priority}
              onChange={setPriority}
            />
          </Field>
        </XStack>

        <Field label="Assignee">
          <XStack alignItems="center" gap={12}>
            <Initials name={assignee} size={34} />
            <TextField flex={1} value={assignee} onChangeText={setAssignee} placeholder="Unassigned" />
          </XStack>
        </Field>
      </YStack>

      <XStack alignItems="center" justifyContent="space-between">
        <GhostButton label="Delete" onPress={del} disabled={busy} />
        <XStack alignItems="center" gap={12}>
          {!title.trim() ? (
            <Text fontSize={12} color={FAINT}>
              Title required
            </Text>
          ) : null}
          <PrimaryButton
            label={update.isLoading ? 'Saving…' : 'Save'}
            onPress={save}
            disabled={!dirty || busy || !title.trim()}
          />
        </XStack>
      </XStack>

      {update.error || remove.error ? (
        <Text fontSize={13} color="#f87171">
          {(update.error || remove.error)?.message}
        </Text>
      ) : null}
    </YStack>
  )
}

function metaLine(task: Task): string {
  const created = fmtDate(task.created)
  return created ? `Created ${created}` : `#${task.id.slice(0, 8)}`
}

function fmtDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
