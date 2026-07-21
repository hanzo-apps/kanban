import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Paragraph, Text } from '@hanzo/gui'
import { Wordmark } from './brand'
import { CountBadge, PrimaryButton, StatusDot, TaskCard } from './ui'
import {
  ACCENT,
  FAINT,
  INK,
  LINE,
  LINE_HI,
  MUTED,
  PANEL,
  TEXT,
  STATUS_LABEL,
  isAccentLane,
  type Priority,
  type Status,
} from '../lib/board'

/** A faithful, static snapshot of the board — the same card + lane styling the
 *  real app renders, so the landing shows the product honestly (not live data). */
const PREVIEW: { status: Status; cards: { title: string; priority: Priority; assignee: string }[] }[] = [
  {
    status: 'todo',
    cards: [
      { title: 'Design the empty states', priority: 'med', assignee: 'Kai Ito' },
      { title: 'Write the API reference', priority: 'low', assignee: '' },
    ],
  },
  {
    status: 'doing',
    cards: [
      { title: 'Ship the PKCE auth flow', priority: 'high', assignee: 'Ada Lovelace' },
      { title: 'Drag-free lane moves', priority: 'med', assignee: 'Mercury' },
    ],
  },
  {
    status: 'done',
    cards: [
      { title: 'Set up the CI pipeline', priority: 'med', assignee: 'Kai Ito' },
      { title: 'Base schema migration', priority: 'low', assignee: 'Ada Lovelace' },
    ],
  },
]

function PreviewBoard() {
  return (
    <YStack backgroundColor={PANEL} borderWidth={1} borderColor={LINE_HI} borderRadius={18} padding={16} gap={14}>
      <XStack gap={12}>
        {PREVIEW.map((lane) => {
          const accent = isAccentLane(lane.status)
          return (
            <YStack key={lane.status} flex={1} gap={11}>
              <YStack gap={9}>
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap={8}>
                    <StatusDot status={lane.status} />
                    <Text fontSize={12} fontWeight="700" color={accent ? TEXT : MUTED}>
                      {STATUS_LABEL[lane.status]}
                    </Text>
                  </XStack>
                  <CountBadge n={lane.cards.length} accent={accent} />
                </XStack>
                <YStack height={2} borderRadius={2} backgroundColor={accent ? ACCENT : LINE} />
              </YStack>
              <YStack gap={9}>
                {lane.cards.map((c) => (
                  <TaskCard key={c.title} title={c.title} priority={c.priority} assignee={c.assignee} status={lane.status} />
                ))}
              </YStack>
            </YStack>
          )
        })}
      </XStack>
    </YStack>
  )
}

function FeatureChip({ children }: { children: string }) {
  return (
    <XStack
      alignItems="center"
      gap={7}
      paddingHorizontal={12}
      paddingVertical={7}
      borderRadius={999}
      borderWidth={1}
      borderColor={LINE_HI}
      backgroundColor="#ffffff06"
    >
      <YStack width={5} height={5} borderRadius={999} backgroundColor={ACCENT} />
      <Text fontSize={13} color={TEXT}>
        {children}
      </Text>
    </XStack>
  )
}

/**
 * Signed-out landing — the honest public view (the board itself needs sign-in).
 * One action: PKCE sign-in with Hanzo (hanzo.id). No local credential form.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" padding={26} backgroundColor={INK}>
      <XStack maxWidth={1140} width="100%" gap={56} flexWrap="wrap" alignItems="center" justifyContent="center">
        {/* Copy + CTA */}
        <YStack flex={1} minWidth={330} gap={22} paddingVertical={16}>
          <Wordmark size={38} title={22} sub={12} />

          <H1 fontSize={46} lineHeight={50} fontWeight="900" color={TEXT} letterSpacing={-1}>
            Work moves, one lane at a time.
          </H1>

          <Paragraph fontSize={17} lineHeight={26} color={MUTED} maxWidth={500}>
            A focused board for small teams. Track every task across To Do, Doing, and Done — advance
            work with a click, not a drag. Priority and owner stay in view, and everything is stored
            per-org in Hanzo Base.
          </Paragraph>

          <XStack gap={9} flexWrap="wrap">
            <FeatureChip>To Do · Doing · Done</FeatureChip>
            <FeatureChip>Drag-free moves</FeatureChip>
            <FeatureChip>Priority &amp; assignee</FeatureChip>
          </XStack>

          <XStack gap={14} alignItems="center" flexWrap="wrap">
            <PrimaryButton large label={isLoading ? 'Loading…' : 'Sign in with Hanzo'} onPress={() => login()} disabled={isLoading} />
            <Text fontSize={13} color={FAINT}>
              Tasks stored per-org in Hanzo Base.
            </Text>
          </XStack>
        </YStack>

        {/* Illustrative preview */}
        <YStack flex={1} minWidth={380} gap={9} paddingVertical={16}>
          <Text fontSize={11} fontWeight="700" letterSpacing={1} color={FAINT}>
            PREVIEW
          </Text>
          <PreviewBoard />
        </YStack>
      </XStack>
    </YStack>
  )
}
