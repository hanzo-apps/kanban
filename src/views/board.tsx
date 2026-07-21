import { useMutation } from '@hanzo/base/react'
import { ScrollView, YStack, XStack, Text } from '@hanzo/gui'
import { CountBadge, StatusDot, TaskCard } from './ui'
import {
  ACCENT,
  FAINT,
  LINE,
  MUTED,
  TEXT,
  STATUSES,
  STATUS_LABEL,
  inLane,
  isAccentLane,
  nextStatus,
  normPriority,
  normStatus,
  prevStatus,
  type Status,
  type Task,
} from '../lib/board'

/**
 * The board — three crisp lanes. Work is drag-free: each card carries ‹ ›
 * controls that advance it one lane via a `tasks` update, then refetch. The
 * Doing lane is the only colored surface (accent keyline + marker).
 */
export function Board({
  tasks,
  refetch,
  onOpen,
}: {
  tasks: Task[]
  refetch: () => void
  onOpen: (id: string) => void
}) {
  const update = useMutation('tasks', 'update')

  async function move(task: Task, dir: -1 | 1) {
    if (update.isLoading) return
    const to = dir === 1 ? nextStatus(normStatus(task.status)) : prevStatus(normStatus(task.status))
    if (!to) return
    await update.mutate({ id: task.id, status: to })
    refetch()
  }

  return (
    <YStack gap={12}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap={16} paddingBottom={6}>
          {STATUSES.map((status) => (
            <Lane key={status} status={status} tasks={inLane(tasks, status)} onOpen={onOpen} onMove={move} />
          ))}
        </XStack>
      </ScrollView>
      {update.error ? (
        <Text fontSize={13} color="#f87171">
          {update.error.message}
        </Text>
      ) : null}
    </YStack>
  )
}

function Lane({
  status,
  tasks,
  onOpen,
  onMove,
}: {
  status: Status
  tasks: Task[]
  onOpen: (id: string) => void
  onMove: (task: Task, dir: -1 | 1) => void
}) {
  const accent = isAccentLane(status)
  return (
    <YStack width={330} flexShrink={0} gap={12}>
      <YStack gap={10}>
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap={9}>
            <StatusDot status={status} />
            <Text fontSize={13} fontWeight="700" letterSpacing={0.3} color={accent ? TEXT : MUTED}>
              {STATUS_LABEL[status]}
            </Text>
          </XStack>
          <CountBadge n={tasks.length} accent={accent} />
        </XStack>
        <YStack height={2} borderRadius={2} backgroundColor={accent ? ACCENT : LINE} />
      </YStack>

      <YStack gap={10}>
        {tasks.length === 0 ? (
          <YStack
            borderWidth={1}
            borderColor={LINE}
            borderStyle="dashed"
            borderRadius={12}
            paddingVertical={26}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={12} color={FAINT}>
              No tasks
            </Text>
          </YStack>
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              title={t.title}
              priority={normPriority(t.priority)}
              assignee={t.assignee ?? ''}
              status={status}
              onOpen={() => onOpen(t.id)}
              onMove={(dir) => onMove(t, dir)}
            />
          ))
        )}
      </YStack>
    </YStack>
  )
}
