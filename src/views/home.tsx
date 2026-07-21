import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Spinner } from '@hanzo/gui'
import { Wordmark } from './brand'
import { GhostButton } from './ui'
import { ACCENT, ACCENT_DIM, ACCENT_LINE, FAINT, INK, LINE, MUTED, type Task } from '../lib/board'
import { Board } from './board'
import { Backlog } from './backlog'
import { Detail } from './detail'

type View = 'board' | 'backlog'

/** Signed-in shell: brand + Board / Backlog nav, with a task-detail leg. One
 *  `tasks` query feeds every surface; writes refetch it. */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'

  const { data, isLoading, error, refetch } = useQuery<Task>('tasks', { sort: '-created', realtime: false })

  const [view, setView] = useState<View>('board')
  const [openId, setOpenId] = useState<string | null>(null)
  const open = openId ? (data.find((t) => t.id === openId) ?? null) : null

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={INK}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        gap={16}
        paddingHorizontal={22}
        paddingVertical={14}
        borderBottomWidth={1}
        borderColor={LINE}
        flexWrap="wrap"
      >
        <Wordmark />
        <XStack alignItems="center" gap={8}>
          <NavTab label="Board" active={view === 'board' && !open} onPress={() => { setOpenId(null); setView('board') }} />
          <NavTab label="Backlog" active={view === 'backlog' && !open} onPress={() => { setOpenId(null); setView('backlog') }} />
          <YStack width={1} height={20} backgroundColor={LINE} marginHorizontal={4} />
          <GhostButton label="Sign out" onPress={() => logout()} />
        </XStack>
      </XStack>

      <YStack padding={22} gap={16} maxWidth={1160} width="100%" alignSelf="center">
        <Text fontSize={12} color={FAINT}>
          Signed in as {who}
        </Text>

        {isLoading ? (
          <XStack alignItems="center" gap={10} paddingVertical={40} justifyContent="center">
            <Spinner /> <Text color={MUTED}>Loading board…</Text>
          </XStack>
        ) : error ? (
          <Text fontSize={14} color="#f87171">
            Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
          </Text>
        ) : open ? (
          <Detail task={open} refetch={refetch} onBack={() => setOpenId(null)} />
        ) : view === 'board' ? (
          <Board tasks={data} refetch={refetch} onOpen={setOpenId} />
        ) : (
          <Backlog tasks={data} refetch={refetch} onOpen={setOpenId} />
        )}
      </YStack>
    </YStack>
  )
}

function NavTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <YStack
      onPress={onPress}
      cursor="pointer"
      paddingHorizontal={13}
      paddingVertical={7}
      borderRadius={9}
      backgroundColor={active ? ACCENT_DIM : 'transparent'}
      borderWidth={1}
      borderColor={active ? ACCENT_LINE : 'transparent'}
      hoverStyle={active ? undefined : { backgroundColor: '#ffffff08' }}
    >
      <Text fontSize={13} fontWeight="700" color={active ? ACCENT : MUTED}>
        {label}
      </Text>
    </YStack>
  )
}
