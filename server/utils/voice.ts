import { broadcast, broadcastToUsers } from './realtime'

export interface VoiceMember {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
}

const rooms = new Map<string, Map<string, VoiceMember>>()
const expiry = new Map<string, Map<string, ReturnType<typeof setTimeout>>>()
const PRESENCE_TTL_MS = 90_000

export function getRoomMembers(roomKey: string): VoiceMember[] {
  return [...(rooms.get(roomKey)?.values() || [])]
}

export function isInRoom(roomKey: string, userId: string): boolean {
  return !!rooms.get(roomKey)?.has(userId)
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
}

export function joinRoom(roomKey: string, member: VoiceMember): VoiceMember[] {
  const room = rooms.get(roomKey) || new Map<string, VoiceMember>()
  const existing = [...room.values()]
  room.set(member.userId, member)
  rooms.set(roomKey, room)
  scheduleExpiry(roomKey, member.userId)
  broadcast({ type: 'voice.update', roomKey, members: getRoomMembers(roomKey) })
  return existing
}

export function leaveRoom(roomKey: string, userId: string) {
  leaveRoomInternal(roomKey, userId, false)
}

function leaveRoomInternal(roomKey: string, userId: string, quiet: boolean) {
  clearExpiry(roomKey, userId)
  const room = rooms.get(roomKey)
  if (!room?.has(userId)) return
  room.delete(userId)
  if (room.size === 0) {
    rooms.delete(roomKey)
    expiry.delete(roomKey)
  } else {
    rooms.set(roomKey, room)
  }
  broadcast({ type: 'voice.update', roomKey, members: getRoomMembers(roomKey) })
}

export function relaySignal(roomKey: string, from: VoiceMember, to: string, signal: any) {
  broadcastToUsers({ type: 'voice.signal', roomKey, from, to, signal }, [to])
}