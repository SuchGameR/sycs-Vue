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
  type: 'offer' | 'answer' | 'ice' | 'decline' | 'reaction' | 'wb' | 'screen'
  data?: any
}

const PC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.services.mozilla.com:3478' },
  ],
  iceCandidatePoolSize: 4,
}

// A TURN server is required for reliable calls across strict NATs.
// If TURN_URLS is configured via env, the client pulls credentials here.
// RTCPeerConnection copies iceServers at construction time, so we await this
// promise BEFORE any peer connection is created (a PC built too early would
// silently run STUN-only and fail to cross strict NATs).
let turnPromise: Promise<void> | null = null
async function tryExtendTurnConfig() {
  try {
    const res = await $fetch<{ urls: string[]; username?: string; credential?: string }>('/api/voice/turn')
    if (res?.urls?.length) {
      const turn: RTCIceServer = { urls: res.urls, username: res.username, credential: res.credential }
      if (!PC_CONFIG.iceServers!.some(s => (s as any).urls?.includes?.(res.urls[0]))) {
        PC_CONFIG.iceServers!.push(turn)
      }
    }
  } catch {
    // Transient network failure: allow a later join to retry the fetch.
    turnPromise = null
  }
}
function ensureTurn() {
  if (!turnPromise) turnPromise = tryExtendTurnConfig()
  return turnPromise
}

let initialized = false

// Identifies this tab/session. One account can only hold one call: joining
// from a second tab displaces (auto-hangs-up) the previous session.
const TAB_SESSION = import.meta.client
  ? (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  : 'server-session'

// Suppress re-ringing a room this tab just left/declined, to avoid a
// "call rings again after hanging up" echo loop.
const RING_RECALL_COOLDOWN_MS = 2500
const RING_CLAIM_FRESH_MS = 3000
const RING_CLAIM_REFRESH_MS = 1500

function readLS(key: string): any {
  if (!import.meta.client) return null
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}
function writeLS(key: string, v: any) {
  if (!import.meta.client) return
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ }
}
function rmLS(key: string) {
  if (!import.meta.client) return
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}
function ringClaimKey(roomKey: string) { return `sgr:voice:ring:${roomKey}` }
function recentRingKey(roomKey: string) { return `sgr:voice:recent:${roomKey}` }

type StatusLabel = 'idle' | 'connecting' | 'active' | 'connected' | 'reconnecting'

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
const speakerMuted = ref(false)
const cameraEnabled = ref(false)
const screenSharing = ref(false)
const localVideoStream = ref<MediaStream | null>(null)
const screenStream = ref<MediaStream | null>(null)
const reactions = ref<{ id: number; from: string; emoji: string }[]>([])
const whiteboardEvents = ref<{ from: string; data: any }[]>([])
const whiteboardStrokes = ref<any[]>([])
const remoteScreenStreams = ref<Record<string, MediaStream>>({})
const currentFacing = ref<'user' | 'environment'>('user')

const callState = computed<StatusLabel>(() => {
  if (status.value !== 'active') return status.value
  if (connectionState.value === 'connected') return 'connected'
  if (connectionState.value === 'failed' || connectionState.value === 'disconnected') return 'reconnecting'
  return 'connecting'
})

const watchedRooms = new Map<string, VoiceRoomConfig>()
const peers = new Map<string, RTCPeerConnection>()
const pendingIce = new Map<string, any[]>()
const lastIceRestart = new Map<string, number>()
const lastOfferAt = new Map<string, number>()
const everConnected = new Set<string>()
const hardResets = new Map<string, number>()
const processingOffer = new Set<string>()
const remoteScreening = new Map<string, boolean>()

let offs: (() => void)[] = []
let watchdog: ReturnType<typeof setInterval> | null = null

function queueOrAddIce(userId: string, candidate: any) {
  const q = pendingIce.get(userId) || []
  const pc = peers.get(userId)
  if (!pc || !pc.remoteDescription) {
    q.push(candidate)
    pendingIce.set(userId, q)
    return
  }
  pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) => console.error('Error adding ICE:', err))
}

function flushIce(userId: string) {
  const pc = peers.get(userId)
  if (!pc || !pc.remoteDescription) return
  const q = pendingIce.get(userId) || []
  pendingIce.delete(userId)
  for (const c of q) pc.addIceCandidate(new RTCIceCandidate(c)).catch((err) => console.error('Error flushing ICE:', err))
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

function signalTo(room: VoiceRoomConfig, to: string, signal: SignalPayload, attempt = 0) {
  $fetch(room.signalPath, { method: 'POST', body: { to, signal } })
    .catch(() => {
      if (attempt < 2 && ['offer', 'answer', 'ice'].includes(signal.type)) {
        setTimeout(() => signalTo(room, to, signal, attempt + 1), 200 * (attempt + 1))
      }
    })
}

/* ---- local media tracks ---- */

function optionalVideoTracks(): MediaStreamTrack[] {
  if (screenSharing.value && screenStream.value) {
    const t = screenStream.value.getVideoTracks()[0]
    return t ? [t] : []
  }
  if (cameraEnabled.value && localVideoStream.value) {
    const t = localVideoStream.value.getVideoTracks()[0]
    return t ? [t] : []
  }
  return []
}

function videoSourceStream(): MediaStream | null {
  if (screenSharing.value && screenStream.value) return screenStream.value
  if (cameraEnabled.value && localVideoStream.value) return localVideoStream.value
  return null
}

// Attach any local tracks that are missing on a peer connection. This both fixes
// silent/absent audio when the peer is created before the local stream is ready and
// lets camera/screen tracks join an already-running call.
function attachLocalTracks(pc: RTCPeerConnection) {
  syncMicSender(pc)
  syncScreenAudioSender(pc)
  syncOptionalVideoSender(pc)
}

// Track senders per-pc so mic and screen audio never collide
const micSenders = new WeakMap<RTCPeerConnection, RTCRtpSender>()
const screenAudioSenders = new WeakMap<RTCPeerConnection, RTCRtpSender>()

// Mic is ALWAYS on its own sender — never replaced with screen audio.
function syncMicSender(pc: RTCPeerConnection) {
  const l = localStream.value
  const mic = l?.getAudioTracks()[0] || null
  let sender = micSenders.get(pc)
  if (mic) {
    if (!sender) {
      try {
        sender = pc.addTrack(mic, l!)
        micSenders.set(pc, sender)
      } catch (err) { console.error('Error adding mic track:', err) }
    } else if (sender.track?.id !== mic.id) {
      sender.replaceTrack(mic).catch((err) => console.error('Error replacing mic track:', err))
    }
  } else if (sender?.track) {
    sender.replaceTrack(null).catch(() => {})
  }
}

// Screen audio goes on a separate sender so both mic + desktop audio are heard.
function syncScreenAudioSender(pc: RTCPeerConnection) {
  const screenAudio = screenSharing.value ? screenStream.value?.getAudioTracks()[0] : null
  let sender = screenAudioSenders.get(pc)
  if (screenAudio) {
    if (!sender) {
      try {
        sender = pc.addTrack(screenAudio, screenStream.value!)
        screenAudioSenders.set(pc, sender)
      } catch (err) { console.error('Error adding screen audio track:', err) }
    } else if (sender.track?.id !== screenAudio.id) {
      sender.replaceTrack(screenAudio).catch(() => {})
    }
  } else if (sender) {
    try { pc.removeTrack(sender) } catch {}
    screenAudioSenders.delete(pc)
  }
}

function syncOptionalVideoSender(pc: RTCPeerConnection) {
  const vt = optionalVideoTracks()
  const src = videoSourceStream()
  const vidSender = pc.getSenders().find(s => s.track?.kind === 'video')
  if (vt.length && src) {
    if (!vidSender) pc.addTrack(vt[0], src)
    else if (vidSender.track?.id !== vt[0].id) vidSender.replaceTrack(vt[0]).catch(() => {})
  } else if (!vt.length && vidSender) {
    vidSender.replaceTrack(null).catch(() => {})
  }
}

function refreshTracksAcrossPeers() {
  for (const pc of peers.values()) attachLocalTracks(pc)
}

function isScreenLike(e: any, uid: string) {
  if (e.track.kind !== 'video') return false
  if (remoteScreening.get(uid)) return true
  if (e.track.contentHint === 'detail') return true
  const existing = remoteStreams.value[uid]
  if (existing && existing.getVideoTracks().length > 0) return true
  return false
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
  refreshTracksAcrossPeers()
  return localStream.value
}

async function setCamera(on: boolean) {
  try {
    if (on) {
      if (!localVideoStream.value) {
        localVideoStream.value = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: currentFacing.value },
          audio: false,
        })
      }
      cameraEnabled.value = true
    } else {
      localVideoStream.value?.getTracks().forEach(t => t.stop())
      localVideoStream.value = null
      cameraEnabled.value = false
    }
  } catch {
    localVideoStream.value?.getTracks().forEach(t => t.stop())
    localVideoStream.value = null
    cameraEnabled.value = false
    throw new Error('カメラを使用できません')
  }
  refreshTracksAcrossPeers()
}

// Switch front/back camera. Tries the instant on-track applyConstraints path first,
// then falls back to acquiring the other camera without stopping the current stream
// first (so the preview never blinks to black).
async function switchCamera() {
  try {
    const next: 'user' | 'environment' = currentFacing.value === 'user' ? 'environment' : 'user'
    const cur = localVideoStream.value
    if (cur) {
      const t = cur.getVideoTracks()[0]
      if (t?.applyConstraints) {
        await t.applyConstraints({ facingMode: next })
        currentFacing.value = next
        return
      }
    }
    const fresh = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: next },
      audio: false,
    })
    localVideoStream.value = fresh
    currentFacing.value = next
    refreshTracksAcrossPeers()
    cur?.getTracks().forEach(t => t.stop())
  } catch {
    throw new Error('カメラを切り替えられません')
  }
}

async function toggleScreenShare() {
  try {
    if (screenSharing.value) {
      screenStream.value?.getTracks().forEach(t => t.stop())
      screenStream.value = null
      screenSharing.value = false
    } else {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('この環境では画面共有を利用できません')
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      screenStream.value = stream
      screenSharing.value = true
      // Desktop captures e.g. tab/system audio alongside video; make sure it is sent.
      const sa = stream.getAudioTracks()[0]
      if (sa) sa.enabled = true
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        screenSharing.value = false
        screenStream.value = null
        refreshTracksAcrossPeers()
      })
    }
  } catch {
    screenStream.value?.getTracks().forEach(t => t.stop())
    screenStream.value = null
    screenSharing.value = false
  }
  // Tell peers whether the next video track to arrive is a screen share, so it
  // lands in the correct tile instead of being treated as a camera.
  const room = activeRoom.value
  if (room && status.value === 'active') {
    for (const uid of [...peers.keys()]) signalTo(room, uid, { type: 'screen', data: screenSharing.value })
  }
  refreshTracksAcrossPeers()
}

/* ---- peer ---- */

function getPeer(room: VoiceRoomConfig, member: VoiceMember): RTCPeerConnection {
  const existing = peers.get(member.userId)
  if (existing) {
    attachLocalTracks(existing)
    return existing
  }
  const pc = new RTCPeerConnection(PC_CONFIG)
  peers.set(member.userId, pc)
  lastOfferAt.set(member.userId, Date.now())
  attachLocalTracks(pc)
  pc.onicecandidate = (e) => {
    if (e.candidate) signalTo(room, member.userId, { type: 'ice', data: e.candidate })
  }
  pc.ontrack = (e) => {
    const uid = member.userId
    const ms = e.streams[0] || new MediaStream([e.track])
    // One stable aggregate stream per peer. It is never replaced wholesale so a
    // later video track (camera) can never clobber the mic audio already inside.
    const agg = remoteStreams.value[uid] || new MediaStream()
    if (e.track.kind === 'audio') {
      if (!agg.getAudioTracks().some(t => t.id === e.track.id)) {
        try { agg.addTrack(e.track) } catch { /* already in stream */ }
      }
      remoteStreams.value = { ...remoteStreams.value, [uid]: agg }
      e.track.addEventListener('ended', () => {
        try { agg.removeTrack(e.track) } catch {}
      })
      return
    }
    if (isScreenLike(e, uid)) {
      // Screen-share video lives on its own tile. Any audio it carries is always
      // also delivered as its own audio track (see syncScreenAudioSender), so it
      // is already merged into the aggregate stream above.
      remoteScreenStreams.value = { ...remoteScreenStreams.value, [uid]: ms }
      e.track.addEventListener('ended', () => {
        const next = { ...remoteScreenStreams.value }
        delete next[uid]
        remoteScreenStreams.value = next
        remoteScreening.delete(uid)
      })
      return
    }
    // Camera video: merge into the aggregate stream (audio + video in one place).
    if (!agg.getVideoTracks().some(t => t.id === e.track.id)) {
      try { agg.addTrack(e.track) } catch { /* ignore */ }
    }
    remoteStreams.value = { ...remoteStreams.value, [uid]: agg }
  }
  // Polite/impolite negotiation: both sides may offer (needed for camera/screen
  // tracks to be added by either side); glare is resolved by polite (lower id) rolling back.
  pc.onnegotiationneeded = () => {
    if (!me.value) return
    if (pc.signalingState !== 'stable') return
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => signalTo(room, member.userId, { type: 'offer', data: pc.localDescription! }))
      .catch((err) => console.error('Error in negotiation:', err))
  }
  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState
    if (state === 'failed' || state === 'disconnected') {
      const now = Date.now()
      if (now - (lastIceRestart.get(member.userId) || 0) > 6000) {
        lastIceRestart.set(member.userId, now)
        if (typeof pc.restartIce === 'function') { try { pc.restartIce() } catch {} }
      }
    }
    if (state === 'connected') connectionState.value = 'connected'
    markConnection()
  }
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'connected') {
      connectionState.value = 'connected'
      everConnected.add(member.userId)
      hardResets.delete(member.userId)
      if (whiteboardStrokes.value.length) wbSyncTo(member.userId)
    } else if (pc.connectionState === 'closed') {
      closePeer(member.userId)
    }
    markConnection()
  }
  return pc
}

function markConnection() {
  if (!peers.size) {
    // No peers means waiting alone for someone to join, not "connected".
    connectionState.value = 'new'
    return
  }
  const states = [...peers.values()].map(p => p.connectionState)
  if (states.some(s => s === 'connected')) {
    connectionState.value = 'connected'
  } else if (states.every(s => s === 'failed' || s === 'closed')) {
    connectionState.value = 'failed'
  } else {
    // 'new' means negotiation/ICE is still in progress, not a failure
    connectionState.value = 'connecting'
  }
}

function closePeer(userId: string) {
  pendingIce.delete(userId)
  lastIceRestart.delete(userId)
  lastOfferAt.delete(userId)
  everConnected.delete(userId)
  processingOffer.delete(userId)
  remoteScreening.delete(userId)
  const pc = peers.get(userId)
  if (pc) {
    pc.onicecandidate = null
    pc.ontrack = null
    pc.onnegotiationneeded = null
    pc.oniceconnectionstatechange = null
    pc.onconnectionstatechange = null
    pc.close()
    peers.delete(userId)
  }
  if (remoteStreams.value[userId]) {
    const next = { ...remoteStreams.value }
    delete next[userId]
    remoteStreams.value = next
  }
  if (remoteScreenStreams.value[userId]) {
    const next = { ...remoteScreenStreams.value }
    delete next[userId]
    remoteScreenStreams.value = next
  }
}

// Recovers a peer whose offer/answer/ICE was lost in transit (SSE gap, failed
// HTTP POST beyond the retries, etc.). Without this, a single lost message
// leaves the peer stuck at "connecting..." forever.
function recoverPeers(room: VoiceRoomConfig) {
  if (!me.value) return
  const now = Date.now()
  for (const [uid, pc] of peers) {
    if (processingOffer.has(uid)) continue
    if (everConnected.has(uid) && pc.connectionState === 'connected') continue
    const last = lastOfferAt.get(uid) || 0

    // Failed connection: rebuild the connection from scratch (bounded).
    if (pc.connectionState === 'failed' || pc.iceConnectionState === 'failed') {
      if (now - last < 8000) continue
      const resets = hardResets.get(uid) || 0
      if (resets >= 5) continue
      hardResets.set(uid, resets + 1)
      lastOfferAt.set(uid, now)
      const member = members.value.find(m => m.userId === uid)
      closePeer(uid)
      if (member) ensurePeer(room, member)
      continue
    }

    // Stuck mid-negotiation: re-send whatever we already produced. Re-sending
    // the current offer/answer is idempotent on the peer side where possible and
    // lets either side recover a dropped SDP without a full rebuild.
    switch (pc.signalingState) {
      case 'have-local-offer':
        if (now - last < 4000) break
        lastOfferAt.set(uid, now)
        if (pc.localDescription) signalTo(room, uid, { type: 'offer', data: pc.localDescription })
        break
      case 'have-local-answer':
        if (now - last < 4000) break
        lastOfferAt.set(uid, now)
        if (pc.localDescription) signalTo(room, uid, { type: 'answer', data: pc.localDescription })
        break
      case 'have-remote-offer':
        if (now - last < 4000) break
        lastOfferAt.set(uid, now)
        ;(async () => {
          try {
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            signalTo(room, uid, { type: 'answer', data: pc.localDescription })
          } catch { /* ignore */ }
        })()
        break
      case 'stable':
        // Signaling settled but no session ever formed and ICE never started:
        // the polite side kicks a fresh offer (should rarely trigger).
        if (everConnected.has(uid)) break
        if (pc.remoteDescription != null && pc.iceConnectionState !== 'new') break
        if (now - last < 10000) break
        if (me.value.userId >= uid) break
        lastOfferAt.set(uid, now)
        pc.createOffer()
          .then(o => pc.setLocalDescription(o))
          .then(() => signalTo(room, uid, { type: 'offer', data: pc.localDescription! }))
          .catch(() => {})
        break
    }
  }
}

function startWatchdog() {
  if (watchdog) return
  let tick = 0
  watchdog = setInterval(() => {
    const room = activeRoom.value
    if (!room || (status.value !== 'active' && status.value !== 'connecting')) {
      stopWatchdog()
      return
    }
    tick++
    recoverPeers(room)
    // Periodically re-join to refresh the member list and detect new participants
    if (tick % 10 === 0) {
      $fetch(room.joinPath, { method: 'POST' })
        .then((res: any) => {
          if (res?.members) {
            members.value = res.members || []
            for (const m of members.value) {
              if (m.userId !== me.value?.userId) ensurePeer(room, m)
            }
          }
        })
        .catch(() => {})
    }
  }, 3000)
}

function stopWatchdog() {
  if (watchdog) {
    clearInterval(watchdog)
    watchdog = null
  }
}

function ensurePeer(room: VoiceRoomConfig, member: VoiceMember) {
  if (me.value && member.userId === me.value.userId) return
  const pc = getPeer(room, member)
  flushIce(member.userId)
  if (whiteboardStrokes.value.length) wbSyncTo(member.userId)
  return pc
}

/* ---- signals ---- */

async function handleSignal(msg: any) {
  const room = activeRoom.value
  if (!room || msg.roomKey !== room.roomKey) return
  if (msg.to && me.value && msg.to !== me.value.userId) return
  const from = msg.from as VoiceMember
  if (!from?.userId || from.userId === me.value?.userId) return
  const signal = msg.signal as SignalPayload
  const isPolite = me.value ? me.value.userId < from.userId : true

  if (signal.type === 'screen') {
    remoteScreening.set(from.userId, !!signal.data)
    if (!signal.data && remoteScreenStreams.value[from.userId]) {
      const next = { ...remoteScreenStreams.value }
      delete next[from.userId]
      remoteScreenStreams.value = next
    }
    return
  }

  if (signal.type === 'offer') {
    if (processingOffer.has(from.userId)) return
    const b = from.userId
    async function applyOffer() {
      if (!localStream.value) { try { await ensureLocalStream() } catch { /* audio optional until join */ } }
      await ensureTurn()
      const pc = getPeer(room, from)
      // Already handling an offer, or an offer for a state we cannot accept.
      if (pc.signalingState === 'have-remote-offer' || pc.signalingState === 'have-local-answer') return
      if (pc.signalingState !== 'stable') {
        if (!isPolite) return // impolite keeps its own offer
        await pc.setLocalDescription({ type: 'rollback' as any })
      }
      await pc.setRemoteDescription(new RTCSessionDescription(signal.data))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      signalTo(room, b, { type: 'answer', data: pc.localDescription })
      flushIce(b)
    }
    processingOffer.add(b)
    applyOffer()
      .catch((err) => console.error('Error handling offer:', err))
      .finally(() => processingOffer.delete(b))
    return
  } else if (signal.type === 'answer') {
    const pc = peers.get(from.userId)
    if (pc && pc.signalingState === 'have-local-offer') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.data))
        flushIce(from.userId)
      } catch (err) { console.error('Error handling answer:', err) }
    }
  } else if (signal.type === 'ice') {
    queueOrAddIce(from.userId, signal.data)
  } else if (signal.type === 'decline') {
    errorMsg.value = '相手が通話を拒否しました'
    await leave()
  } else if (signal.type === 'reaction') {
    const id = Date.now() + Math.random()
    reactions.value.push({ id, from: from.userId, emoji: signal.data })
    setTimeout(() => { reactions.value = reactions.value.filter(r => r.id !== id) }, 3200)
  } else if (signal.type === 'wb') {
    whiteboardEvents.value.push({ from: from.userId, data: signal.data })
    if (applyWbData(signal.data)) scheduleWbSave()
  }
}

function handleUpdate(msg: any) {
  if (!msg.roomKey) return
  const count = (msg.members || []).length
  presence.value = { ...presence.value, [msg.roomKey]: count }

  if (!me.value?.userId) return

  const room = activeRoom.value
  if (room && msg.roomKey === room.roomKey && (status.value === 'connecting' || status.value === 'active')) {
    const list = (msg.members || []) as VoiceMember[]
    members.value = list
    for (const m of list) {
      if (m.userId !== me.value.userId) ensurePeer(room, m)
    }
    const currentIds = new Set(list.map(m => m.userId))
    for (const id of [...peers.keys()]) {
      if (!currentIds.has(id)) closePeer(id)
    }
    return
  }

  // If the incoming caller cancels (or their presence expires), stop ringing.
  if (incoming.value && msg.roomKey === incoming.value.roomKey) {
    const stillCalling = (msg.members || []).some((m: any) => m.userId === incoming.value?.from.userId)
    if (!stillCalling) incoming.value = null
  }

  // Incoming ring for watched rooms
  if (!watchedRooms.has(msg.roomKey) && typeof msg.roomKey === 'string' && msg.roomKey.startsWith('dm:')) {
    pendingVoiceUpdates.set(msg.roomKey, msg)
    scheduleDmWatchRefresh()
  }
  tryIncoming(msg)
}

const pendingVoiceUpdates = new Map<string, any>()

function tryIncoming(msg: any) {
  if (status.value !== 'idle' || incoming.value) return
  const watched = watchedRooms.get(msg.roomKey)
  if (!watched || watched.kind !== 'dm') return
  const caller = (msg.members || []).find((m: any) => m.userId !== me.value?.userId)
  if (caller) incoming.value = { room: watched, from: caller }
}

let dmRefreshTimer: ReturnType<typeof setTimeout> | null = null
function scheduleDmWatchRefresh() {
  if (dmRefreshTimer) return
  dmRefreshTimer = setTimeout(() => {
    dmRefreshTimer = null
    refreshDmRooms().catch(() => {})
  }, 500)
}

function init() {
  if (initialized) return
  initialized = true

  const { on } = useRealtime()
  offs = [
    on('voice.update', handleUpdate),
    on('voice.signal', handleSignal),
    on('realtime.reconnect', handleRealtimeReconnect),
  ]
  ensureTurn()
  ensureMe().then(watchAllDmRooms).catch(() => {})
  if (import.meta.client) {
    window.addEventListener('pagehide', () => { if (status.value === 'active') saveWbNow() })
  }
}

// The SSE stream was dropped and has come back. Everything broadcast while it
// was down is lost, so re-sync membership and re-send any signaling that the
// peer never received.
async function handleRealtimeReconnect() {
  const room = activeRoom.value
  if (!room || (status.value !== 'active' && status.value !== 'connecting')) return
  $fetch(room.joinPath, { method: 'POST' })
    .then((res: any) => {
      if (res?.members) {
        members.value = res.members || []
        for (const m of members.value) {
          if (m.userId !== me.value?.userId) ensurePeer(room, m)
        }
      }
    })
    .catch(() => {})
  for (const [uid, pc] of peers) {
    if (pc.connectionState === 'connected') continue
    lastOfferAt.set(uid, 0)
    // Restart ICE so candidates are gathered and relayed over the fresh stream.
    if (pc.signalingState === 'stable' || pc.iceConnectionState === 'failed') {
      try { if (typeof pc.restartIce === 'function') pc.restartIce() } catch {}
    }
  }
  recoverPeers(room)
}

async function watchAllDmRooms() {
  try {
    const data = await $fetch<{ channels: any[] }>('/api/dm/channels')
    for (const ch of data.channels || []) {
      const roomKey = `dm:${ch.id}`
      const others = (ch.members || []).filter((m: any) => m.id !== me.value?.userId)
      const label = others.map((m: any) => m.displayName || m.username).join(', ') || 'DM通話'
      watchedRooms.set(roomKey, {
        roomKey,
        joinPath: `/api/dm/channels/${ch.id}/voice/join`,
        leavePath: `/api/dm/channels/${ch.id}/voice/leave`,
        signalPath: `/api/dm/channels/${ch.id}/voice/signal`,
        label,
        kind: 'dm',
      })
    }
  } catch { /* not authenticated or offline */ }
}

async function refreshDmRooms() {
  for (const key of [...watchedRooms.keys()]) {
    if (key.startsWith('dm:')) watchedRooms.delete(key)
  }
  await ensureMe().catch(() => {})
  await watchAllDmRooms()
  // Re-evaluate updates that arrived while the room list was not loaded yet,
  // otherwise an incoming call could be missed until the caller's next broadcast.
  for (const msg of [...pendingVoiceUpdates.values()]) tryIncoming(msg)
  pendingVoiceUpdates.clear()
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

let joinSeq = 0

async function join(cfg?: VoiceRoomConfig) {
  init()
  const seq = ++joinSeq

  // Switching rooms (e.g. another voice channel) must fully tear down the old
  // room: peers are keyed by userId and capture the room they were created in,
  // so keeping them around would relay signaling down the old room's path and
  // the new room would never connect.
  if (cfg && activeRoom.value && activeRoom.value.roomKey !== cfg.roomKey) {
    saveWbNow()
    const prev = activeRoom.value
    activeRoom.value = null
    status.value = 'idle'
    connectionState.value = 'new'
    members.value = []
    incoming.value = null
    stopWatchdog()
    for (const id of [...peers.keys()]) closePeer(id)
    remoteStreams.value = {}
    remoteScreenStreams.value = {}
    hardResets.clear()
    everConnected.clear()
    $fetch(prev.leavePath, { method: 'POST' }).catch(() => {})
  }

  if (cfg) activeRoom.value = cfg
  const room = activeRoom.value
  if (!room) return
  status.value = 'connecting'
  connectionState.value = 'connecting'
  errorMsg.value = null
  try {
    await ensureTurn()
    await ensureMe()
    if (seq !== joinSeq) return
    await ensureLocalStream()
    if (seq !== joinSeq) return
    const res = await $fetch<{ members: VoiceMember[] }>(room.joinPath, { method: 'POST' })
    if (seq !== joinSeq) return
    members.value = res.members || []
    status.value = 'active'
    startWatchdog()
    for (const m of res.members || []) {
      if (m.userId !== me.value?.userId) ensurePeer(room, m)
    }
    loadWbForRoom(room.roomKey)
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || '通話に参加できませんでした'
    if (seq === joinSeq) {
      activeRoom.value = null
      status.value = 'idle'
      connectionState.value = 'new'
    }
  }
}

async function leave() {
  joinSeq++
  const room = activeRoom.value
  saveWbNow()
  activeRoom.value = null
  status.value = 'idle'
  connectionState.value = 'new'
  members.value = []
  incoming.value = null
  stopWatchdog()
  for (const id of [...peers.keys()]) closePeer(id)
  localStream.value?.getTracks().forEach(t => t.stop())
  localStream.value = null
  localVideoStream.value?.getTracks().forEach(t => t.stop())
  localVideoStream.value = null
  screenStream.value?.getTracks().forEach(t => t.stop())
  screenStream.value = null
  cameraEnabled.value = false
  screenSharing.value = false
  remoteStreams.value = {}
  remoteScreenStreams.value = {}
  hardResets.clear()
  everConnected.clear()
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
  $fetch(inc.room.signalPath, {
    method: 'POST',
    body: { to: inc.from.userId, signal: { type: 'decline' } },
  }).catch(() => {})
}

function toggleMute() {
  muted.value = !muted.value
  localStream.value?.getAudioTracks().forEach(t => { t.enabled = !muted.value })
}

function toggleSpeakerMute() {
  speakerMuted.value = !speakerMuted.value
}

function sendReaction(emoji: string) {
  const room = activeRoom.value
  if (!room || status.value !== 'active') return
  const id = Date.now() + Math.random()
  reactions.value.push({ id, from: me.value?.userId || 'me', emoji })
  setTimeout(() => { reactions.value = reactions.value.filter(r => r.id !== id) }, 3200)
  for (const uid of [...peers.keys()]) signalTo(room, uid, { type: 'reaction', data: emoji })
}

let wbSaveTimer: ReturnType<typeof setTimeout> | null = null

function applyWbData(data: any) {
  if (data?.segments?.length) {
    whiteboardStrokes.value = [...whiteboardStrokes.value, { segments: data.segments, color: data.color, width: data.width }]
  } else if (data?.clear) {
    whiteboardStrokes.value = []
  } else if (Array.isArray(data?.sync)) {
    whiteboardStrokes.value = data.sync
  } else {
    return false
  }
  return true
}

function wbSyncTo(uid: string) {
  const room = activeRoom.value
  if (!room || !whiteboardStrokes.value.length) return
  signalTo(room, uid, { type: 'wb', data: { sync: whiteboardStrokes.value } })
}

function scheduleWbSave() {
  const room = activeRoom.value
  if (!room || status.value !== 'active') return
  if (wbSaveTimer) clearTimeout(wbSaveTimer)
  wbSaveTimer = setTimeout(() => { wbSaveTimer = null; saveWbNow() }, 2000)
}

function saveWbNow() {
  const room = activeRoom.value
  if (!room) return
  if (wbSaveTimer) { clearTimeout(wbSaveTimer); wbSaveTimer = null }
  $fetch('/api/whiteboard', { method: 'POST', body: { roomKey: room.roomKey, strokes: whiteboardStrokes.value } })
    .catch(() => {})
}

async function loadWbForRoom(roomKey: string) {
  try {
    const res = await $fetch<{ strokes: any[] }>(`/api/whiteboard/${encodeURIComponent(roomKey)}`)
    if (Array.isArray(res?.strokes)) whiteboardStrokes.value = res.strokes
  } catch { /* no saved board */ }
  for (const uid of [...peers.keys()]) wbSyncTo(uid)
}

function sendWhiteboard(data: any) {
  const room = activeRoom.value
  if (!room) return
  const changed = applyWbData(data)
  if (changed) scheduleWbSave()
  for (const uid of [...peers.keys()]) signalTo(room, uid, { type: 'wb', data })
}

export function useVoiceCall() {
  init()
  return {
    me,
    activeRoom,
    status,
    connectionState,
    callState,
    errorMsg,
    muted,
    speakerMuted,
    members,
    remoteStreams,
    localStream,
    cameraEnabled,
    screenSharing,
    localVideoStream,
    screenStream,
    incoming,
    presence,
    reactions,
    whiteboardEvents,
    whiteboardStrokes,
    remoteScreenStreams,
    currentFacing,
    watchRoom,
    unwatchRoom,
    refreshDmRooms,
    join,
    leave,
    acceptCall,
    declineCall,
    toggleMute,
    toggleSpeakerMute,
    setCamera,
    switchCamera,
    toggleScreenShare,
    sendReaction,
    sendWhiteboard,
  }
}

