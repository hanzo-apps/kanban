import { YStack, XStack, Text } from '@hanzo/gui'
import { ACCENT, INK, LINE_HI, MUTED, TEXT } from '../lib/board'

/**
 * The Kanban Lane mark: three vertical lanes in an ink tile, the middle lane
 * (Doing) lit with the accent — the board, in miniature.
 */
export function Logo({ size = 30 }: { size?: number }) {
  const bar = Math.max(3, Math.round(size * 0.12))
  const heights = [size * 0.44, size * 0.72, size * 0.56]
  const colors = [MUTED, ACCENT, MUTED]
  return (
    <XStack
      width={size}
      height={size}
      borderRadius={Math.round(size / 3.6)}
      backgroundColor={INK}
      borderWidth={1}
      borderColor={LINE_HI}
      alignItems="flex-end"
      justifyContent="center"
      gap={Math.max(2, Math.round(size * 0.09))}
      paddingBottom={Math.round(size * 0.22)}
    >
      {heights.map((h, i) => (
        <YStack key={i} width={bar} height={h} borderRadius={bar / 2} backgroundColor={colors[i]} />
      ))}
    </XStack>
  )
}

/** Wordmark: the mark + "Kanban Lane" and its category line. */
export function Wordmark({ size = 30, title = 18, sub = 11 }: { size?: number; title?: number; sub?: number }) {
  return (
    <XStack alignItems="center" gap={11}>
      <Logo size={size} />
      <YStack>
        <Text fontSize={title} fontWeight="800" color={TEXT} letterSpacing={-0.2}>
          Kanban Lane
        </Text>
        <Text fontSize={sub} color={MUTED} opacity={0.75}>
          Project board
        </Text>
      </YStack>
    </XStack>
  )
}
