import { broadcast } from './realtime'

export interface VoiceMember {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
}

const rooms = new Map<string, Map<string, VoiceMember>>()

export function getRoomMembers(roomKey: string): VoiceMember[] {
  return [...(rooms.get(roomKey)?.values() || [])]
}

export function isInRoom(roomKey: string, userId: string): boolean {
  return !!rooms.get(roomKey)?.has(userId)
}

export function joinRoom(roomKey: string, member: VoiceMember): VoiceMember[] {
  const room = rooms.get(roomKey) || new Map<string, VoiceMember>()
  const existing = [...room.values()]
  room.set(member.userId, member)
  rooms.set(roomKey, room)
  broadcast({ type: 'voice.update', roomKey, members: getRoomMembers(roomKey) })
  return existing
}

export function leaveRoom(roomKey: string, userId: string) {
  const room = rooms.get(roomKey)
  if (!room?.has(userId)) return
  room.delete(userId)
  if (room.size === 0) {
    rooms.delete(roomKey)
  } else {
    broadcast({ type: 'voice.update', roomKey, members: getRoomMembers(roomKey) })
  }
}

export function relaySignal(roomKey: string, from: VoiceMember, to: string, signal: any) {
  broadcast({ type: 'voice.signal', roomKey, from, to, signal })
}
