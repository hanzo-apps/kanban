import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { Field, Initials, PriorityBars, PrimaryButton, Segmented, StatusDot, TextField } from './ui'
import {
  ACCENT,
  FAINT,
  LINE,
  LINE_HI,
  MUTED,
  PANEL,
  TEXT,
  PRIORITIES,
  PRIORITY_LABEL,
  PRIORITY_LEVEL,
  STATUS_LABEL,
  isAccentLane,
  normPriority,
  normStatus,
  triage,
  type Priority,
  type Task,
} from '../lib/board'

/**
 * The backlog — the writer surface. Compose a task (it lands in To Do), then see
 * everything in one dense, priority-ordered list. Any row opens the detail.
 */
export function Backlog({
  tasks,
  refetch,
  onOpen,
}: {
  tasks: Task[]
  refetch: () => void
  onOpen: (id: string) => void
}) {
  const create = useMutation('tasks', 'create')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('med')
  const [assignee, setAssignee] = useState('')

  async function add() {
    const t = title.trim()
    if (!t || create.isLoading) return
    await create.mutate({ title: t, status: 'todo', priority, assignee: assignee.trim() })
    setTitle('')
    setAssignee('')
    setPriority('med')
    refetch()
  }

  const rows = triage(tasks)
  const open = tasks.filter((t) => normStatus(t.status) !== 'done').length
  const done = tasks.length - open

  return (
    <YStack gap={18} maxWidth={860} width="100%">
      {/* Composer */}
      <YStack backgroundColor={PANEL} borderWidth={1} borderColor={LINE_HI} borderRadius={16} padding={18} gap={16}>
        <Text fontSize={13} fontWeight="700" letterSpacing={0.3} color={TEXT}>
          New task
        </Text>
        <TextField value={title} onChangeText={setTitle} placeholder="What needs doing?" onSubmitEditing={add} />
        <XStack gap={24} flexWrap="wrap" alignItems="flex-end" justifyContent="space-between">
          <XStack gap={24} flexWrap="wrap">
            <Field label="Priority">
              <Segmented
                options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
                value={priority}
                onChange={setPriority}
              />
            </Field>
            <Field label="Assignee">
              <TextField width={190} value={assignee} onChangeText={setAssignee} placeholder="Unassigned" />
            </Field>
          </XStack>
          <PrimaryButton
            label={create.isLoading ? 'Adding…' : 'Add task'}
            onPress={add}
            disabled={!title.trim() || create.isLoading}
          />
        </XStack>
        {create.error ? (
          <Text fontSize={13} color="#f87171">
            {create.error.message}
          </Text>
        ) : null}
      </YStack>

      {/* List */}
      <YStack gap={12}>
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={13} fontWeight="700" color={TEXT}>
            Backlog
          </Text>
          <Text fontSize={12} color={FAINT}>
            {open} open · {done} done
          </Text>
        </XStack>

        {rows.length === 0 ? (
          <YStack
            borderWidth={1}
            borderColor={LINE}
            borderStyle="dashed"
            borderRadius={12}
            paddingVertical={30}
            alignItems="center"
          >
            <Text fontSize={13} color={FAINT}>
              No tasks yet — add one above.
            </Text>
          </YStack>
        ) : (
          <YStack backgroundColor={PANEL} borderWidth={1} borderColor={LINE} borderRadius={14} overflow="hidden">
            {rows.map((t, i) => (
              <Row key={t.id} task={t} first={i === 0} onOpen={() => onOpen(t.id)} />
            ))}
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

function Row({ task, first, onOpen }: { task: Task; first: boolean; onOpen: () => void }) {
  const status = normStatus(task.status)
  const accent = isAccentLane(status)
  return (
    <XStack
      onPress={onOpen}
      cursor="pointer"
      alignItems="center"
      gap={14}
      paddingHorizontal={16}
      paddingVertical={13}
      borderTopWidth={first ? 0 : 1}
      borderColor={LINE}
      hoverStyle={{ backgroundColor: '#ffffff06' }}
      pressStyle={{ backgroundColor: '#ffffff0d' }}
    >
      <PriorityBars level={PRIORITY_LEVEL[normPriority(task.priority)]} />
      <Text flex={1} fontSize={14} fontWeight="600" color={TEXT} numberOfLines={1}>
        {task.title || 'Untitled task'}
      </Text>
      <XStack width={96} alignItems="center" gap={7}>
        <StatusDot status={status} />
        <Text fontSize={12} fontWeight="600" color={accent ? ACCENT : MUTED}>
          {STATUS_LABEL[status]}
        </Text>
      </XStack>
      <Initials name={task.assignee ?? ''} size={24} />
    </XStack>
  )
}
