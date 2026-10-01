import { broadcast, broadcastToUsers } from './realtime'

export interface VoiceMember {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
}

interface VoiceEntry {
  member: VoiceMember
  sessionId: string
}

interface VoiceRoom {
  members: Map<string, VoiceEntry>
  callerId: string | null
}

const rooms = new Map<string, VoiceRoom>()
const expiry = new Map<string, Map<string, ReturnType<typeof setTimeout>>>()

/**
 * Presence TTL.
 *
 * The client's heartbeat runs every 15s, so this needs to stay comfortably
 * above that: a browser throttles `setInterval` to roughly once per minute when
 * the tab is backgrounded (and stops it entirely when suspended), and a mobile
 * tab that is throttled past the TTL used to get silently dropped from the room
 * by `leaveRoomInternal` -- which is what made calls drop while both parties
 * were still there. The heartbeat now also fails loudly (see `touchRoom`) so a
 * dropped client re-joins for real instead of lingering as a ghost.
 */
const PRESENCE_TTL_MS = 90_000

export function getRoomMembers(roomKey: string): VoiceMember[] {
  return [...(rooms.get(roomKey)?.members.values() || [])].map(e => e.member)
}

export function isInRoom(roomKey: string, userId: string): boolean {
  return !!rooms.get(roomKey)?.members.has(userId)
}

function scheduleExpiry(roomKey: string, userId: string) {
  clearExpiry(roomKey, userId)
  const roomExpiry = expiry.get(roomKey) || new Map<string, ReturnType<typeof setTimeout>>()
  roomExpiry.set(userId, setTimeout(() => {
    leaveRoomInternal(roomKey, userId, true)
  }, PRESENCE_TTL_MS))
  expiry.set(roomKey, roomExpiry)
}

function clearExpiry(roomKey: string, userId: string) {
  const roomExpiry = expiry.get(roomKey)
  const t = roomExpiry?.get(userId)
  if (t) clearTimeout(t)
  if (roomExpiry) roomExpiry.delete(userId)
}

function broadcastUpdate(roomKey: string, room?: VoiceRoom) {
  const r = room || rooms.get(roomKey)
  broadcast({ type: 'voice.update', roomKey, members: getRoomMembers(roomKey), callerId: r?.callerId ?? null })
}

// Joins (or confirms) a call. `sessionId` identifies a single tab/session so
// that only ONE tab of an account can hold a call at a time: if the same user
// joins from a different session, the previous session is told to hang up.
export function joinRoom(roomKey: string, member: VoiceMember, sessionId = 'default'): VoiceMember[] {
  let room = rooms.get(roomKey)
  if (!room) {
    room = { members: new Map(), callerId: null }
    rooms.set(roomKey, room)
  }

  const prev = room.members.get(member.userId)
  if (prev && prev.sessionId !== sessionId) {
    broadcastToUsers({ type: 'voice.displaced', roomKey, sessionId: prev.sessionId }, [member.userId])
  }

  room.members.set(member.userId, { member, sessionId })
  if (!room.callerId || !room.members.has(room.callerId)) room.callerId = member.userId

  scheduleExpiry(roomKey, member.userId)
  broadcastUpdate(roomKey, room)

  const others = [...room.members.values() as IterableIterator<VoiceEntry>]
    .filter(e => e.member.userId !== member.userId)
    .map(e => e.member)
  return others
}

export function leaveRoom(roomKey: string, userId: string, sessionId?: string) {
  leaveRoomInternal(roomKey, userId, false, sessionId)
}

function leaveRoomInternal(roomKey: string, userId: string, quiet: boolean, sessionId?: string) {
  const room = rooms.get(roomKey)
  const entry = room?.members.get(userId)
  if (!entry || !room) return
  // A stale tab (whose session was already displaced) must never kill the
  // newer session of the same account.
  if (sessionId && entry.sessionId !== sessionId) return

  clearExpiry(roomKey, userId)
  room.members.delete(userId)
  if (room.callerId === userId) room.callerId = null

  if (room.members.size === 0) {
    rooms.delete(roomKey)
    expiry.delete(roomKey)
  }
  broadcastUpdate(roomKey, room)
}

/**
 * Refresh presence without announcing anything.
 *
 * Re-using `joinRoom` as a keep-alive was the source of the call instability:
 * every 30s each participant re-joined, and `joinRoom` unconditionally
 * broadcasts the member list to EVERY subscriber plus re-runs peer setup on all
 * of them. A heartbeating member also raced `callerId` ownership, so a participant
 * whose refresh landed while the caller had left would be promoted to caller and
 * the other side would see a new ring.
 *
 * Returns false when the member is unknown or the session has been displaced --
 * the caller must then do a real `joinRoom`, since this only extends an existing
 * presence.
 */
export function touchRoom(roomKey: string, userId: string, sessionId?: string): boolean {
  const room = rooms.get(roomKey)
  const entry = room?.members.get(userId)
  if (!room || !entry) return false
  if (sessionId && entry.sessionId !== sessionId) return false
  scheduleExpiry(roomKey, userId)
  return true
}

export function relaySignal(roomKey: string, from: VoiceMember, to: string, signal: any) {
  broadcastToUsers({ type: 'voice.signal', roomKey, from, to, signal }, [to])
}