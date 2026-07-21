import type { ComponentProps, ReactNode } from 'react'
import { YStack, XStack, Text, Input } from '@hanzo/gui'
import {
  ACCENT,
  ACCENT_DIM,
  ACCENT_INK,
  ACCENT_LINE,
  CARD,
  CARD_HI,
  FAINT,
  LINE,
  LINE_HI,
  MUTED,
  PANEL,
  TEXT,
  type Priority,
  type Status,
  PRIORITY_LEVEL,
  initials,
  isAccentLane,
  nextStatus,
  prevStatus,
} from '../lib/board'

/**
 * The presentational kit — crisp, monochrome, one accent (lime). Zero data
 * hooks live here so every surface (board, backlog, detail, the landing
 * preview) draws tasks the exact same way. `@hanzo/gui` primitives only.
 */

/** Lane marker: filled accent for Doing, faint fill for Done, ring for To Do. */
export function StatusDot({ status }: { status: Status }) {
  if (status === 'doing') return <YStack width={9} height={9} borderRadius={999} backgroundColor={ACCENT} />
  if (status === 'done')
    return <YStack width={9} height={9} borderRadius={999} backgroundColor={MUTED} opacity={0.5} />
  return <YStack width={9} height={9} borderRadius={999} borderWidth={1.5} borderColor={MUTED} />
}

/** A count pill for a lane header. */
export function CountBadge({ n, accent }: { n: number; accent?: boolean }) {
  return (
    <XStack
      minWidth={22}
      height={20}
      paddingHorizontal={6}
      borderRadius={999}
      alignItems="center"
      justifyContent="center"
      backgroundColor={accent ? ACCENT_DIM : '#ffffff0d'}
      borderWidth={1}
      borderColor={accent ? ACCENT_LINE : LINE}
    >
      <Text fontSize={11} fontWeight="700" color={accent ? ACCENT : MUTED}>
        {n}
      </Text>
    </XStack>
  )
}

/** Three signal bars, filled to the task's priority level (monochrome). */
export function PriorityBars({ level }: { level: number }) {
  return (
    <XStack alignItems="flex-end" gap={2} height={12}>
      {[1, 2, 3].map((i) => (
        <YStack key={i} width={3} height={4 + i * 3} borderRadius={1} backgroundColor={i <= level ? MUTED : LINE_HI} />
      ))}
    </XStack>
  )
}

/** A round initials avatar; a dashed empty ring when unassigned. */
export function Initials({ name, size = 22 }: { name: string; size?: number }) {
  const has = (name ?? '').trim().length > 0
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={999}
      alignItems="center"
      justifyContent="center"
      backgroundColor={has ? PANEL : 'transparent'}
      borderWidth={1}
      borderColor={has ? LINE_HI : LINE}
      borderStyle={has ? 'solid' : 'dashed'}
    >
      <Text fontSize={Math.round(size * 0.4)} fontWeight="700" color={has ? TEXT : FAINT}>
        {initials(name)}
      </Text>
    </YStack>
  )
}

/** A small rounded label — the status chip in the backlog and detail views. */
export function Chip({ label, accent, muted }: { label: string; accent?: boolean; muted?: boolean }) {
  return (
    <XStack
      paddingHorizontal={9}
      paddingVertical={3}
      borderRadius={999}
      borderWidth={1}
      borderColor={accent ? ACCENT_LINE : LINE_HI}
      backgroundColor={accent ? ACCENT_DIM : '#ffffff08'}
    >
      <Text fontSize={11} fontWeight="700" letterSpacing={0.2} color={accent ? ACCENT : muted ? FAINT : MUTED}>
        {label}
      </Text>
    </XStack>
  )
}

/** A drag-free lane-shift control (‹ / ›). */
function MoveBtn({ dir, disabled, onPress }: { dir: string; disabled: boolean; onPress: () => void }) {
  return (
    <YStack
      width={26}
      height={26}
      borderRadius={7}
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor={LINE_HI}
      backgroundColor="#ffffff08"
      opacity={disabled ? 0.3 : 1}
      cursor={disabled ? 'default' : 'pointer'}
      pressStyle={disabled ? undefined : { backgroundColor: CARD_HI }}
      hoverStyle={disabled ? undefined : { borderColor: '#ffffff44' }}
      onPress={disabled ? undefined : onPress}
    >
      <Text fontSize={15} fontWeight="700" color={TEXT}>
        {dir}
      </Text>
    </YStack>
  )
}

/**
 * One task card — the single way a task is drawn everywhere. Presentational:
 * `onOpen` makes the title open the detail; `onMove(-1|1)` renders the drag-free
 * lane-shift arrows (disabled at the ends of the board). Omit both for a static
 * card (the landing preview).
 */
export function TaskCard({
  title,
  priority,
  assignee,
  status,
  onOpen,
  onMove,
}: {
  title: string
  priority: Priority
  assignee: string
  status: Status
  onOpen?: () => void
  onMove?: (dir: -1 | 1) => void
}) {
  const accent = isAccentLane(status)
  return (
    <YStack
      backgroundColor={CARD}
      borderWidth={1}
      borderColor={LINE}
      borderRadius={12}
      borderLeftWidth={accent ? 2 : 1}
      borderLeftColor={accent ? ACCENT : LINE}
      padding={12}
      gap={11}
    >
      <YStack
        onPress={onOpen}
        cursor={onOpen ? 'pointer' : 'default'}
        pressStyle={onOpen ? { opacity: 0.6 } : undefined}
        hoverStyle={onOpen ? { opacity: 0.82 } : undefined}
      >
        <Text fontSize={14} lineHeight={19} fontWeight="600" color={TEXT} numberOfLines={2}>
          {title || 'Untitled task'}
        </Text>
      </YStack>
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap={10}>
          <PriorityBars level={PRIORITY_LEVEL[priority]} />
          <Initials name={assignee} size={22} />
        </XStack>
        {onMove ? (
          <XStack alignItems="center" gap={4}>
            <MoveBtn dir="‹" disabled={prevStatus(status) === null} onPress={() => onMove(-1)} />
            <MoveBtn dir="›" disabled={nextStatus(status) === null} onPress={() => onMove(1)} />
          </XStack>
        ) : null}
      </XStack>
    </YStack>
  )
}

/** The one lime action — sign-in, add-task, save. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  large,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  large?: boolean
}) {
  return (
    <YStack
      onPress={disabled ? undefined : onPress}
      cursor={disabled ? 'default' : 'pointer'}
      opacity={disabled ? 0.45 : 1}
      backgroundColor={ACCENT}
      borderRadius={10}
      paddingHorizontal={large ? 22 : 16}
      paddingVertical={large ? 12 : 9}
      alignItems="center"
      justifyContent="center"
      pressStyle={disabled ? undefined : { opacity: 0.85 }}
      hoverStyle={disabled ? undefined : { opacity: 0.92 }}
    >
      <Text fontSize={large ? 16 : 14} fontWeight="700" color={ACCENT_INK}>
        {label}
      </Text>
    </YStack>
  )
}

/** A monochrome secondary action — back, save, sign-out, delete. */
export function GhostButton({
  label,
  onPress,
  disabled,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <YStack
      onPress={disabled ? undefined : onPress}
      cursor={disabled ? 'default' : 'pointer'}
      opacity={disabled ? 0.45 : 1}
      backgroundColor="#ffffff08"
      borderWidth={1}
      borderColor={LINE_HI}
      borderRadius={10}
      paddingHorizontal={14}
      paddingVertical={8}
      alignItems="center"
      justifyContent="center"
      pressStyle={disabled ? undefined : { backgroundColor: CARD_HI }}
      hoverStyle={disabled ? undefined : { borderColor: '#ffffff44' }}
    >
      <Text fontSize={13} fontWeight="600" color={TEXT}>
        {label}
      </Text>
    </YStack>
  )
}

/** A segmented picker (status / priority). `accentValue` gets the lime when picked. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accentValue,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  accentValue?: T
}) {
  return (
    <XStack borderWidth={1} borderColor={LINE_HI} borderRadius={10} overflow="hidden" alignSelf="flex-start">
      {options.map((o, i) => {
        const active = o.value === value
        const useAccent = active && accentValue === o.value
        return (
          <YStack
            key={o.value}
            onPress={() => onChange(o.value)}
            cursor="pointer"
            paddingHorizontal={14}
            paddingVertical={8}
            backgroundColor={active ? (useAccent ? ACCENT_DIM : CARD_HI) : 'transparent'}
            borderLeftWidth={i === 0 ? 0 : 1}
            borderLeftColor={LINE}
            hoverStyle={active ? undefined : { backgroundColor: '#ffffff08' }}
          >
            <Text fontSize={13} fontWeight={active ? '700' : '500'} color={useAccent ? ACCENT : active ? TEXT : MUTED}>
              {o.label}
            </Text>
          </YStack>
        )
      })}
    </XStack>
  )
}

/** A labeled field wrapper for the editor. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <YStack gap={7}>
      <Text fontSize={11} fontWeight="700" letterSpacing={0.6} color={FAINT}>
        {label.toUpperCase()}
      </Text>
      {children}
    </YStack>
  )
}

/** The monochrome text input used across the app. */
export function TextField(props: ComponentProps<typeof Input>) {
  return (
    <Input
      backgroundColor={PANEL}
      borderColor={LINE_HI}
      borderWidth={1}
      borderRadius={10}
      color={TEXT}
      fontSize={14}
      height={40}
      paddingHorizontal={12}
      focusStyle={{ borderColor: ACCENT_LINE }}
      {...props}
    />
  )
}
