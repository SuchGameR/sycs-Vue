interface VoiceMember {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
}

interface SignalPayload {
  type: 'offer' | 'answer' | 'ice' | 'decline'
  data?: any
}

interface RoomConfig {
  roomKey: string
  joinPath: string
  leavePath: string
  signalPath: string
}

const PC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

export function useVoiceCall(opts: { ring?: boolean } = {}) {
  const { on } = useRealtime()

  const me = ref<VoiceMember | null>(null)
  const members = ref<VoiceMember[]>([])
  const status = ref<'idle' | 'connecting' | 'active'>('idle')
  const errorMsg = ref<string | null>(null)
  const muted = ref(false)
  const remoteStreams = ref<Record<string, MediaStream>>({})
  const localStream = ref<MediaStream | null>(null)
  const incomingCaller = ref<VoiceMember | null>(null)
  const presence = ref<Record<string, number>>({})

  const activeConfig = ref<RoomConfig | null>(null)
  const watchRoomKey = ref<string | null>(null)

  const peers = new Map<string, RTCPeerConnection>()
  let offs: (() => void)[] = []

  async function ensureMe() {
    if (me.value) return
    const res = await $fetch('/api/auth/me')
    const u = res.user
    me.value = {
      userId: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
    }
  }

  function signalTo(to: string, signal: SignalPayload) {
    if (!activeConfig.value) return
    $fetch(activeConfig.value.signalPath, {
      method: 'POST',
      body: { to, signal },
    }).catch(() => {})
  }

  function getPeer(member: VoiceMember): RTCPeerConnection {
    const existing = peers.get(member.userId)
    if (existing) return existing
    const pc = new RTCPeerConnection(PC_CONFIG)
    peers.set(member.userId, pc)
    localStream.value?.getTracks().forEach(t => pc.addTrack(t, localStream.value!))
    pc.onicecandidate = (e) => {
      if (e.candidate) signalTo(member.userId, { type: 'ice', data: e.candidate })
    }
    pc.ontrack = (e) => {
      const ms = e.streams[0] || new MediaStream([e.track])
      remoteStreams.value = { ...remoteStreams.value, [member.userId]: ms }
    }
    pc.onconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
        closePeer(member.userId)
      }
    }
    return pc
  }

  function closePeer(userId: string) {
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

  function ensurePeer(member: VoiceMember) {
    const pc = getPeer(member)
    if (me.value && me.value.userId < member.userId) {
      if (pc.signalingState === 'stable' && !pc.localDescription) {
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .then(() => signalTo(member.userId, { type: 'offer', data: pc.localDescription }))
          .catch(() => {})
      }
    }
    return pc
  }

  async function handleSignal(msg: any) {
    if (msg.roomKey !== watchRoomKey.value) return
    if (msg.to && me.value && msg.to !== me.value.userId) return
    const from = msg.from as VoiceMember
    if (!from?.userId) return
    const signal = msg.signal as SignalPayload

    if (signal.type === 'offer') {
      const pc = getPeer(from)
      try {
        await pc.setRemoteDescription(signal.data)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        signalTo(from.userId, { type: 'answer', data: pc.localDescription })
      } catch { /* ignore */ }
    } else if (signal.type === 'answer') {
      const pc = peers.get(from.userId)
      if (pc && pc.signalingState !== 'stable') {
        try { await pc.setRemoteDescription(signal.data) } catch { /* ignore */ }
      }
    } else if (signal.type === 'ice') {
      const pc = peers.get(from.userId)
      if (pc) {
        try { await pc.addIceCandidate(signal.data) } catch { /* ignore */ }
      }
    } else if (signal.type === 'decline') {
      errorMsg.value = '相手が通話を拒否しました'
      await leave()
    }
  }

  function handleUpdate(msg: any) {
    if (!msg.roomKey) return
    presence.value = { ...presence.value, [msg.roomKey]: (msg.members || []).length }

    const isOurRoom = activeConfig.value && msg.roomKey === activeConfig.value.roomKey

    if (isOurRoom && (status.value === 'connecting' || status.value === 'active')) {
      const list = (msg.members || []) as VoiceMember[]
      members.value = list
      for (const m of list) {
        if (m.userId !== me.value?.userId) ensurePeer(m)
      }
      const currentIds = new Set(list.map(m => m.userId))
      for (const id of [...peers.keys()]) {
        if (!currentIds.has(id)) closePeer(id)
      }
    } else if (isOurRoom && status.value === 'idle' && opts.ring) {
      const caller = (msg.members || []).find((m: any) => m.userId !== me.value?.userId)
      incomingCaller.value = caller || null
    }
  }

  function setChannel(cfg: RoomConfig) {
    activeConfig.value = cfg
    watchRoomKey.value = cfg.roomKey
    ensureMe()
  }

  async function ensureLocalStream() {
    if (localStream.value) return localStream.value
    localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
    return localStream.value
  }

  async function join() {
    if (!activeConfig.value) return
    const cfg = activeConfig.value
    status.value = 'connecting'
    errorMsg.value = null
    try {
      await ensureMe()
      await ensureLocalStream()
      const res = await $fetch(cfg.joinPath, { method: 'POST' })
      members.value = res.members || []
      status.value = 'active'
      for (const m of res.members) ensurePeer(m)
    } catch (e: any) {
      errorMsg.value = e?.data?.message || '通話に参加できませんでした'
      status.value = 'idle'
      await leave()
    }
  }

  async function leave() {
    const cfg = activeConfig.value
    activeConfig.value = null
    watchRoomKey.value = null
    status.value = 'idle'
    members.value = []
    incomingCaller.value = null
    for (const id of [...peers.keys()]) closePeer(id)
    localStream.value?.getTracks().forEach(t => t.stop())
    localStream.value = null
    remoteStreams.value = {}
    if (cfg) {
      $fetch(cfg.leavePath, { method: 'POST' }).catch(() => {})
    }
  }

  async function acceptCall() {
    incomingCaller.value = null
    await join()
  }

  async function declineCall() {
    if (!incomingCaller.value || !activeConfig.value) return
    signalTo(incomingCaller.value.userId, { type: 'decline' })
    incomingCaller.value = null
  }

  function toggleMute() {
    muted.value = !muted.value
    localStream.value?.getAudioTracks().forEach(t => { t.enabled = !muted.value })
  }

  offs = [
    on('voice.update', handleUpdate),
    on('voice.signal', handleSignal),
  ]

  function cleanup() {
    offs.forEach(off => off())
    offs = []
  }

  return {
    me,
    members,
    status,
    errorMsg,
    muted,
    remoteStreams,
    incomingCaller,
    presence,
    setChannel,
    join,
    leave,
    acceptCall,
    declineCall,
    toggleMute,
    cleanup,
  }
}
