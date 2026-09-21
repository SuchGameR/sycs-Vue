export interface VoiceMember {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
}

export interface VoiceRoomConfig {
  roomKey: string
  joinPath: string
  leavePath: string
  signalPath: string
  label?: string
  kind?: 'dm' | 'server'
}

interface SignalPayload {
  type: 'offer' | 'answer' | 'ice' | 'decline'
  data?: any
}

const PC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

let initialized = false

const me = ref<VoiceMember | null>(null)
const activeRoom = ref<VoiceRoomConfig | null>(null)
const status = ref<'idle' | 'connecting' | 'active'>('idle')
const errorMsg = ref<string | null>(null)
const muted = ref(false)
const members = ref<VoiceMember[]>([])
const remoteStreams = ref<Record<string, MediaStream>>({})
const localStream = ref<MediaStream | null>(null)
const incoming = ref<{ room: VoiceRoomConfig; from: VoiceMember } | null>(null)
const presence = ref<Record<string, number>>({})
const connectionState = ref<'new' | 'connecting' | 'connected' | 'disconnected' | 'failed'>('new')

const watchedRooms = new Map<string, VoiceRoomConfig>()
const peers = new Map<string, RTCPeerConnection>()
const pendingIce = new Map<string, any[]>()

let offs: (() => void)[] = []

function queueOrAddIce(userId: string, candidate: any) {
  const pc = peers.get(userId)
  if (!pc) return
  if (pc.remoteDescription) {
    pc.addIceCandidate(candidate).catch(() => {})
  } else {
    const q = pendingIce.get(userId) || []
    q.push(candidate)
    pendingIce.set(userId, q)
  }
}

function flushIce(userId: string) {
  const pc = peers.get(userId)
  if (!pc || !pc.remoteDescription) return
  const q = pendingIce.get(userId) || []
  pendingIce.delete(userId)
  for (const c of q) pc.addIceCandidate(c).catch(() => {})
}

async function ensureMe() {
  if (me.value) return
  const res = await $fetch<{ user: any }>('/api/auth/me')
  const u = res.user
  me.value = {
    userId: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
  }
}

function signalTo(room: VoiceRoomConfig, to: string, signal: SignalPayload) {
  $fetch(room.signalPath, { method: 'POST', body: { to, signal } }).catch(() => {})
}

function getPeer(room: VoiceRoomConfig, member: VoiceMember): RTCPeerConnection {
  const existing = peers.get(member.userId)
  if (existing) return existing
  const pc = new RTCPeerConnection(PC_CONFIG)
  peers.set(member.userId, pc)
  localStream.value?.getTracks().forEach(t => pc.addTrack(t, localStream.value!))
  pc.onicecandidate = (e) => {
    if (e.candidate) signalTo(room, member.userId, { type: 'ice', data: e.candidate })
  }
  pc.ontrack = (e) => {
    const ms = e.streams[0] || new MediaStream([e.track])
    remoteStreams.value = { ...remoteStreams.value, [member.userId]: ms }
  }
  pc.onconnectionstatechange = () => {
    if (['failed', 'closed'].includes(pc.connectionState)) {
      closePeer(member.userId)
    } else if (pc.connectionState === 'connected') {
      connectionState.value = 'connected'
    }
  }
  return pc
}

function closePeer(userId: string) {
  pendingIce.delete(userId)
  const pc = peers.get(userId)
  if (pc) {
    pc.onicecandidate = null
    pc.ontrack = null
    pc.onconnectionstatechange = null
    pc.close()
    peers.delete(userId)
  }
  if (remoteStreams.value[userId]) {
    const next = { ...remoteStreams.value }
    delete next[userId]
    remoteStreams.value = next
  }
}

function ensurePeer(room: VoiceRoomConfig, member: VoiceMember) {
  const pc = getPeer(room, member)
  if (me.value && me.value.userId < member.userId) {
    if (pc.signalingState === 'stable' && !pc.localDescription) {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => signalTo(room, member.userId, { type: 'offer', data: pc.localDescription }))
        .catch(() => {})
    }
  }
  return pc
}

async function handleSignal(msg: any) {
  const room = activeRoom.value
  if (!room || msg.roomKey !== room.roomKey) return
  if (msg.to && me.value && msg.to !== me.value.userId) return
  const from = msg.from as VoiceMember
  if (!from?.userId) return
  const signal = msg.signal as SignalPayload

  if (signal.type === 'offer') {
    const pc = getPeer(room, from)
    try {
      await pc.setRemoteDescription(signal.data)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      signalTo(room, from.userId, { type: 'answer', data: pc.localDescription })
      flushIce(from.userId)
    } catch { /* ignore */ }
  } else if (signal.type === 'answer') {
    const pc = peers.get(from.userId)
    if (pc && pc.signalingState !== 'stable') {
      try {
        await pc.setRemoteDescription(signal.data)
        flushIce(from.userId)
      } catch { /* ignore */ }
    }
  } else if (signal.type === 'ice') {
    queueOrAddIce(from.userId, signal.data)
  } else if (signal.type === 'decline') {
    errorMsg.value = '相手が通話を拒否しました'
    await leave()
  }
}

function handleUpdate(msg: any) {
  if (!msg.roomKey) return
  const count = (msg.members || []).length
  presence.value = { ...presence.value, [msg.roomKey]: count }

  const room = activeRoom.value
  if (room && msg.roomKey === room.roomKey && (status.value === 'connecting' || status.value === 'active')) {
    const list = (msg.members || []) as VoiceMember[]
    members.value = list
    for (const m of list) {
      if (m.userId !== me.value?.userId) ensurePeer(room, m)
    }
    const currentIds = new Set(list.map(m => m.userId))
    for (const id of [...peers.keys()]) {
      if (!currentIds.has(id)) closePeer(id)
    }
    return
  }

  // Incoming ring for watched rooms
  if (status.value === 'idle' && !incoming.value) {
    const watched = watchedRooms.get(msg.roomKey)
    if (watched && watched.kind === 'dm') {
      const caller = (msg.members || []).find((m: any) => m.userId !== me.value?.userId)
      if (caller) incoming.value = { room: watched, from: caller }
    }
  }
}

function init() {
  if (initialized) return
  initialized = true
  const { on } = useRealtime()
  offs = [
    on('voice.update', handleUpdate),
    on('voice.signal', handleSignal),
  ]
  ensureMe().catch(() => {})
}

function watchRoom(cfg: VoiceRoomConfig) {
  init()
  watchedRooms.set(cfg.roomKey, cfg)
}

function unwatchRoom(roomKey: string) {
  watchedRooms.delete(roomKey)
  if (activeRoom.value?.roomKey === roomKey) {
    leave()
  }
}

async function ensureLocalStream() {
  if (localStream.value) return localStream.value
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('この環境ではマイクを利用できません')
  }
  localStream.value = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video: false,
  })
  localStream.value.getAudioTracks().forEach(t => { t.enabled = !muted.value })
  return localStream.value
}

async function join(cfg?: VoiceRoomConfig) {
  init()
  if (cfg) activeRoom.value = cfg
  const room = activeRoom.value
  if (!room) return
  status.value = 'connecting'
  connectionState.value = 'connecting'
  errorMsg.value = null
  try {
    await ensureMe()
    await ensureLocalStream()
    const res = await $fetch<{ members: VoiceMember[] }>(room.joinPath, { method: 'POST' })
    members.value = res.members || []
    status.value = 'active'
    for (const m of res.members || []) {
      if (m.userId !== me.value?.userId) ensurePeer(room, m)
    }
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || '通話に参加できませんでした'
    status.value = 'idle'
    connectionState.value = 'new'
    await leave()
  }
}

async function leave() {
  const room = activeRoom.value
  activeRoom.value = null
  status.value = 'idle'
  connectionState.value = 'new'
  members.value = []
  incoming.value = null
  for (const id of [...peers.keys()]) closePeer(id)
  localStream.value?.getTracks().forEach(t => t.stop())
  localStream.value = null
  remoteStreams.value = {}
  if (room) {
    $fetch(room.leavePath, { method: 'POST' }).catch(() => {})
  }
}

async function acceptCall() {
  const inc = incoming.value
  incoming.value = null
  if (!inc) return
  await join(inc.room)
}

async function declineCall() {
  const inc = incoming.value
  incoming.value = null
  if (!inc) return
  // Decline may be sent even though we never joined the room.
  $fetch(inc.room.signalPath, {
    method: 'POST',
    body: { to: inc.from.userId, signal: { type: 'decline' } },
  }).catch(() => {})
}

function toggleMute() {
  muted.value = !muted.value
  localStream.value?.getAudioTracks().forEach(t => { t.enabled = !muted.value })
}

export function useVoiceCall() {
  init()
  return {
    me,
    activeRoom,
    status,
    connectionState,
    errorMsg,
    muted,
    members,
    remoteStreams,
    localStream,
    incoming,
    presence,
    watchRoom,
    unwatchRoom,
    join,
    leave,
    acceptCall,
    declineCall,
    toggleMute,
  }
}
