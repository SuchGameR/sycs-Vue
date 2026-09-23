import { useRealtime } from './useRealtime'

// Client-side notification / DM unread tracking.
// Persists per-user "last read" timestamps in localStorage and combines them with
// a server seed (notifications + DM channels) plus live realtime events.

const ACTIVITY_KEY = 'sgr:unread:activity-last-read-v1'
const DM_KEY = 'sgr:unread:dm-last-read-v1'

const activityUnread = ref(0)
const dmUnread = ref(0)
const dmUnreadChannels = ref<Set<string>>(new Set())
const dmLatest = ref<{ displayName: string; username: string; avatarUrl: string | null } | null>(null)

let myId: string | null = null
let initialized = false
let audioCtx: AudioContext | null = null

function readDmLast(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(DM_KEY) || '{}')
  } catch {
    return {}
  }
}
function writeDmLast(map: Record<string, string>) {
  try {
    localStorage.setItem(DM_KEY, JSON.stringify(map))
  } catch { /* ignore */ }
}

function isReadingActivity() {
  const p = window.location.pathname
  return p.startsWith('/actions') || p.startsWith('/notifications')
}
function isReadingDm(channelId?: string | null) {
  const p = window.location.pathname
  if (p === '/dm') return true
  if (channelId && p === `/dm/${channelId}`) return true
  return false
}

function playChime() {
  if (!import.meta.client) return
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
    const t = audioCtx.currentTime + 0.01
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, t)
    osc.frequency.setValueAtTime(1174.66, t + 0.14)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(t)
    osc.stop(t + 0.62)
  } catch { /* autoplay restrictions */ }
}

function addDmUnread(channelId: string) {
  dmUnreadChannels.value.add(channelId)
  dmUnread.value = dmUnreadChannels.value.size
}

function setLatest(sender: any) {
  if (!sender?.id) return
  dmLatest.value = {
    displayName: sender.displayName || sender.username || '',
    username: sender.username || '',
    avatarUrl: sender.avatarUrl || null,
  }
}

function seed() {
  const actLast = Number(localStorage.getItem(ACTIVITY_KEY) || 0)
  const dmLast = readDmLast()

  $fetch('/api/notifications?limit=50')
    .then((res: any) => {
      activityUnread.value = (res.items || []).filter((i: any) => new Date(i.createdAt).getTime() > actLast).length
    })
    .catch(() => { activityUnread.value = 0 })

  $fetch('/api/dm/channels')
    .then((res: any) => {
      const unread = new Set<string>()
      let best: { ts: number; sender: any } | null = null
      for (const ch of res?.channels || []) {
        const lm = ch?.lastMessage
        if (!lm) continue
        const ts = new Date(lm.createdAt).getTime()
        const lastRead = Number(dmLast[ch.id] || 0)
        if (lm.sender?.id && lm.sender.id !== myId && ts > lastRead) unread.add(ch.id)
        if (!best || ts > best.ts) best = { ts, sender: lm.sender }
      }
      dmUnreadChannels.value = unread
      dmUnread.value = unread.size
      if (best?.sender) setLatest(best.sender)
    })
    .catch(() => { })
}

async function init() {
  if (!import.meta.client || initialized) return
  initialized = true
  try {
    const me = await $fetch<{ user: any }>('/api/auth/me').catch(() => null)
    myId = me?.user?.id ?? null
  } catch { return }
  if (!myId) return

  seed()

  const { on } = useRealtime()
  on('realtime.reconnect', () => seed())

  on('activity.new', (p: any) => {
    if (!myId || p.actorId === myId) return
    const mine = p.targetUserId ? p.targetUserId === myId : true
    const forMe = p.postOwnerId ? p.postOwnerId === myId : true
    if (!mine || !forMe || isReadingActivity()) return
    activityUnread.value++
    playChime()
  })

  on('comment.new', (p: any) => {
    if (!myId || p.postOwnerId !== myId || p.comment?.user?.id === myId || isReadingActivity()) return
    activityUnread.value++
    playChime()
  })

  on('reaction.update', (p: any) => {
    if (!myId || p.postOwnerId !== myId || !p.active || p.userId === myId || isReadingActivity()) return
    activityUnread.value++
    playChime()
  })

  on('dm.message', (p: any) => {
    if (!myId || p.message?.sender?.id === myId) return
    setLatest(p.message.sender)
    if (isReadingDm(p.channelId)) return
    addDmUnread(p.channelId)
    playChime()
  })
}

function markActivityRead() {
  if (!import.meta.client) return
  activityUnread.value = 0
  try {
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()))
  } catch { /* ignore */ }
}

function markDmRead(ids: string | string[]) {
  if (!import.meta.client) return
  const list = Array.isArray(ids) ? ids : [ids]
  const dmLast = readDmLast()
  const now = Date.now()
  for (const id of list) {
    dmLast[id] = String(now)
    dmUnreadChannels.value.delete(id)
  }
  writeDmLast(dmLast)
  dmUnread.value = dmUnreadChannels.value.size
}

export function useUnread() {
  return { init, activityUnread, dmUnread, dmLatest, markActivityRead, markDmRead }
}