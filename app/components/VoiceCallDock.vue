<script setup lang="ts">
const voice = useVoiceCall()
const { status, members, muted, speakerMuted, remoteStreams, remoteScreenStreams, incoming, errorMsg, activeRoom, callState, waitingForPeer, me, cameraEnabled, screenSharing, localVideoStream, screenStream, localStream, reactions, whiteboardStrokes, currentFacing } = voice

const elapsed = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

watch(status, (s) => {
  if (s === 'active') {
    elapsed.value = 0
    timer = setInterval(() => { elapsed.value++ }, 1000)
  } else if (timer) {
    clearInterval(timer)
    timer = null
  }
}, { immediate: true })

onUnmounted(() => { if (timer) clearInterval(timer) })

/* ---- mini floating icon (draggable) ---- */
const minimized = ref(false)
const miniEl = ref<HTMLElement | null>(null)
const miniPos = reactive({ x: 0, y: 0 })
const miniDrag = reactive({ active: false, moved: false, startX: 0, startY: 0, origX: 0, origY: 0 })

function initMiniPos() {
  if (!import.meta.client) return
  miniPos.x = window.innerWidth - 88
  miniPos.y = 88
}
if (import.meta.client) {
  if (document.readyState === 'complete') initMiniPos()
  else window.addEventListener('load', initMiniPos)
}
function onMiniResize() {
  if (!import.meta.client) return
  miniPos.x = Math.min(miniPos.x, window.innerWidth - 80)
  miniPos.y = Math.min(miniPos.y, window.innerHeight - 88)
}

const miniPeer = computed(() => {
  const other = members.value.find(m => m.userId !== me.value?.userId)
  return other || me.value || null
})

// トップバーに出す通話の顔。1:1なら相手、まだ誰もいなければ自分。
const roomAvatar = computed(() => miniPeer.value?.avatarUrl || null)

function onMiniDown(e: PointerEvent) {
  if (e.button !== 0) return
  e.preventDefault()
  miniDrag.active = true
  miniDrag.moved = false
  miniDrag.startX = e.clientX
  miniDrag.startY = e.clientY
  miniDrag.origX = miniPos.x
  miniDrag.origY = miniPos.y
  window.addEventListener('pointermove', onMiniMove)
  window.addEventListener('pointerup', onMiniUp)
}
function onMiniMove(e: PointerEvent) {
  if (!miniDrag.active) return
  const dx = e.clientX - miniDrag.startX
  const dy = e.clientY - miniDrag.startY
  if (Math.abs(dx) + Math.abs(dy) > 3) miniDrag.moved = true
  miniPos.x = Math.max(0, Math.min(window.innerWidth - 80, miniDrag.origX + dx))
  miniPos.y = Math.max(72, Math.min(window.innerHeight - 88, miniDrag.origY + dy))
}
function onMiniUp() {
  if (!miniDrag.active) return
  miniDrag.active = false
  window.removeEventListener('pointermove', onMiniMove)
  window.removeEventListener('pointerup', onMiniUp)
  const snapLeft = miniPos.x < window.innerWidth / 2
  miniPos.x = snapLeft ? 8 : window.innerWidth - 88
}
function expandCall() {
  if (miniDrag.moved) { miniDrag.moved = false; return }
  minimized.value = false
}

const callTime = computed(() => {
  const m = Math.floor(elapsed.value / 60)
  const s = elapsed.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

const callOpen = computed(() => !!activeRoom.value && (status.value === 'active' || status.value === 'connecting'))
const roomTitle = computed(() => activeRoom.value?.label || '通話')
const showError = computed(() => !!errorMsg.value && status.value === 'idle')

function dismissError() { errorMsg.value = null }

const stateMeta = computed(() => {
  if (callState.value === 'connected') return { label: '通話中', cls: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', dot: 'bg-emerald-400' }
  if (callState.value === 'reconnecting') return { label: '再接続中...', cls: 'text-amber-400 border-amber-500/40 bg-amber-500/10', dot: 'bg-amber-400 animate-pulse' }
  if (callState.value === 'failed') return { label: '接続失敗', cls: 'text-red-400 border-red-500/40 bg-red-500/10', dot: 'bg-red-400' }
  
  if (members.value.filter(m => m.userId !== me.value?.userId).length === 0) {
    return { label: '待機中...', cls: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', dot: 'bg-emerald-400' }
  }
  return { label: '接続中...', cls: 'text-sky-400 border-sky-500/40 bg-sky-500/10', dot: 'bg-sky-400 animate-pulse' }
})

/* ---- 効果音 ---- */
// 音源パス・ループ・音量は useAppSounds に集約。ここは「いつ鳴らすか」だけを持つ。
const sounds = useAppSounds()

// 着信音: 着信がある間ループ。
watch(incoming, (v) => { if (v) sounds.startIncomingRing(); else sounds.stopIncomingRing() }, { immediate: true })

// 受信音: 自分が発信して相手の応答待ちの間ループ。
watch(waitingForPeer, (v) => { if (v) sounds.startOutgoingRing(); else sounds.stopOutgoingRing() }, { immediate: true })

onUnmounted(() => sounds.stopAll())

async function accept() {
  sounds.stopAll()
  minimized.value = false
  await voice.acceptCall()
  const room = voice.activeRoom.value
  if (room?.kind === 'dm' && room.roomKey.startsWith('dm:')) {
    navigateTo(`/social/${room.roomKey.slice(3)}`)
  }
}
function decline() {
  sounds.stopAll()
  voice.declineCall()
}

/* ---- remote video / screen presence poll ---- */
const hasVideo = ref<Record<string, boolean>>({})
const screenTiles = ref<{ userId: string; name: string; avatarUrl: string | null }[]>([])
let videoPoll: ReturnType<typeof setInterval> | null = null
watch(callOpen, (open) => {
  if (videoPoll) { clearInterval(videoPoll); videoPoll = null }
  if (open) {
    videoPoll = setInterval(() => {
      const next: Record<string, boolean> = {}
      for (const [uid, stream] of Object.entries(remoteStreams.value)) {
        next[uid] = stream.getVideoTracks().length > 0
      }
      hasVideo.value = next
      const screens: typeof screenTiles.value = []
      for (const [uid, stream] of Object.entries(remoteScreenStreams.value)) {
        if (stream.getVideoTracks().length > 0) {
          const m = members.value.find(mm => mm.userId === uid)
          screens.push({ userId: uid, name: m?.displayName || m?.username || '共有', avatarUrl: m?.avatarUrl || null })
        }
      }
      screenTiles.value = screens
    }, 1200)
  }
})

/* ---- tiles ---- */
// Discord と同じく自分もグリッドに出す（自分は最後に並べる）。
type CallTile = { userId: string; name: string; avatarUrl: string | null; isSelf: boolean }
const tiles = computed<CallTile[]>(() => {
  const list: CallTile[] = []
  for (const m of members.value) {
    list.push({ userId: m.userId, name: m.displayName || m.username, avatarUrl: m.avatarUrl, isSelf: m.userId === me.value?.userId })
  }
  list.sort((a, b) => Number(a.isSelf) - Number(b.isSelf))
  return list
})
// 自分以外がまだ誰もいない（待機中）かどうか。
const onlyMe = computed(() => members.value.filter(m => m.userId !== me.value?.userId).length === 0)
const tileReactions = (uid: string) => reactions.value.filter(r => r.from === uid)

/* ---- speaking activity (voice-level detection) ---- */
let audioCtx: AudioContext | null = null
const analysers = new Map<string, AnalyserNode>()
const speaking = ref<Record<string, number>>({})
let speakLoop: ReturnType<typeof setInterval> | null = null

function ensureAudioCtx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    try { audioCtx = new AudioContext() } catch { return null }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
  return audioCtx
}

function attachAnalyser(uid: string, stream: MediaStream) {
  if (!stream || !stream.getAudioTracks().length) return
  const ctx = ensureAudioCtx()
  if (!ctx) return
  try {
    const src = ctx.createMediaStreamSource(stream)
    const an = ctx.createAnalyser()
    an.fftSize = 512
    an.smoothingTimeConstant = 0.55
    src.connect(an)
    analysers.set(uid, an)
  } catch { /* ignore */ }
}

function sampleSpeaking() {
  if (!analysers.size) { speaking.value = {}; return }
  const next: Record<string, number> = {}
  const data = new Uint8Array(256)
  for (const [uid, an] of analysers) {
    an.getByteFrequencyData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) sum += data[i]
    const rms = sum / data.length / 255
    const prev = speaking.value[uid] || 0
    next[uid] = rms > 0.045 ? Math.min(1, Math.max(rms, prev * 0.82)) : Math.max(0, prev * 0.8)
  }
  speaking.value = next
}

function refreshAnalysers() {
  analysers.clear()
  for (const [uid, stream] of Object.entries(remoteStreams.value)) attachAnalyser(uid, stream)
  if (localStream.value) attachAnalyser('me', localStream.value)
  if (!speakLoop) speakLoop = setInterval(sampleSpeaking, 160)
}
watch(remoteStreams, refreshAnalysers, { deep: true })
watch(callOpen, (open) => {
  if (!open && speakLoop) { clearInterval(speakLoop); speakLoop = null; speaking.value = {}; audioCtx?.close().catch(() => {}); audioCtx = null }
  if (open) { refreshAnalysers(); ensureAudioCtx() }
})
watch(speakerMuted, () => { /* keep analyser running; output is muted in HTML */ })

const avatarPop = (uid: string, isSelf: boolean) => {
  const level = isSelf ? speaking.value['me'] || 0 : speaking.value[uid] || 0
  if (level <= 0) return {}
  return { transform: `scale(${1 + Math.min(level * 1.6, 0.34)})`, transition: 'transform 140ms ease' }
}
const speakingGlow = (uid: string, isSelf: boolean) => {
  const level = isSelf ? speaking.value['me'] || 0 : speaking.value[uid] || 0
  return level > 0 ? 'ring-2 ring-emerald-400/80 shadow-[0_0_18px_rgba(52,211,153,0.45)]' : ''
}

/* ---- resumed audio for mobile (playsinline / gesture) ---- */
function tryResumeAudio() {
  nextTick(() => {
    if (!callOpen.value) return
    const root = document.querySelector('[data-vc-aud-root]')
    if (!root) return
    root.querySelectorAll('audio.vc-aud').forEach((a) => { const p = (a as HTMLAudioElement).play(); if (p) p.catch(() => {}) })
  })
}
watch(() => [callOpen.value, remoteStreams, remoteScreenStreams], () => { tryResumeAudio() }, { deep: true })
if (import.meta.client) {
  window.addEventListener('pointerdown', () => { ensureAudioCtx() }, { passive: true })
}

/* ---- reactions picker ---- */
const showReactions = ref(false)
const EMOJIS = ['👍', '❤️', '😆', '😮', '😢', '😡', '🔥', '🎉']
function pickReaction(e: string) {
  voice.sendReaction(e)
  showReactions.value = false
}

/* ---- invite ---- */
const inviteOpen = ref(false)
const copied = ref(false)
const inviteLink = computed(() => {
  const room = activeRoom.value
  if (!room) return ''
  if (room.kind === 'dm' && room.roomKey.startsWith('dm:')) {
    return `${location.origin}/social/${room.roomKey.slice(3)}`
  }
  return location.origin + (room.roomKey.includes(':') ? '/' + room.roomKey.slice(room.roomKey.lastIndexOf(':') + 1) : '')
})
async function copyInvite() {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* ignore */ }
}

/* ---- expanded screen overlay ---- */
const expandedScreen = ref<string | null>(null)

/* ---- whiteboard: infinite canvas ---- */
const whiteboardOpen = ref(false)
const wbCanvas = ref<HTMLCanvasElement | null>(null)
const wbColor = ref('#ffffff')
const wbWidth = ref(3)
const wbDrawing = ref(false)
const wbCurrent = ref<any[]>([])
const wbView = reactive({ x: 0, y: 0, scale: 1 })
const WB_COLORS = ['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7']
const WB_WIDTHS = [2, 4, 10]
const GRID = 100

let wbPanning = false
let pointers = new Map<number, { x: number; y: number }>()
let pinchStart: { d: number; mid: { x: number; y: number }; scale: number; x: number; y: number } | null = null

function wbWorld(e: PointerEvent) {
  const r = wbCanvas.value!.getBoundingClientRect()
  const sx = e.clientX - r.left
  const sy = e.clientY - r.top
  return { x: (sx - wbView.x) / wbView.scale, y: (sy - wbView.y) / wbView.scale }
}

function wbResize() {
  const el = wbCanvas.value
  if (!el) return
  const r = el.getBoundingClientRect()
  el.width = Math.max(1, r.width)
  el.height = Math.max(1, r.height)
  if (wbView.x === 0 && wbView.y === 0 && wbView.scale === 1) {
    wbView.x = r.width / 2 - 400
    wbView.y = r.height / 2 - 300
  }
  redrawWb()
}

function redrawWb() {
  const el = wbCanvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  const W = el.width, H = el.height
  const { x, y, scale } = wbView
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  // 板は必ず不透明で塗る（透けると何が描けるのか分かりにくい）。既定は濃色ボード。
  ctx.fillStyle = '#1b1c20'
  ctx.fillRect(0, 0, W, H)

  // infinite grid
  const x0 = -x / scale, y0 = -y / scale
  const x1 = (W - x) / scale, y1 = (H - y) / scale
  const minor = Math.max(20, GRID * (scale < 0.5 ? 4 : scale <= 1 ? 2 : 1)) / scale
  ctx.lineWidth = 1 / scale
  ctx.strokeStyle = 'rgba(148,163,184,0.10)'
  ctx.beginPath()
  for (let gx = Math.floor(x0 / minor) * minor; gx < x1; gx += minor) {
    ctx.moveTo(gx * scale + x, 0); ctx.lineTo(gx * scale + x, H)
  }
  for (let gy = Math.floor(y0 / minor) * minor; gy < y1; gy += minor) {
    ctx.moveTo(0, gy * scale + y); ctx.lineTo(W, gy * scale + y)
  }
  ctx.stroke()

  // major grid
  ctx.strokeStyle = 'rgba(148,163,184,0.18)'
  ctx.beginPath()
  for (let gx = Math.floor(x0 / GRID) * GRID; gx < x1; gx += GRID) {
    ctx.moveTo(gx * scale + x, 0); ctx.lineTo(gx * scale + x, H)
  }
  for (let gy = Math.floor(y0 / GRID) * GRID; gy < y1; gy += GRID) {
    ctx.moveTo(0, gy * scale + y); ctx.lineTo(W, gy * scale + y)
  }
  ctx.stroke()

  // strokes (world coords)
  ctx.setTransform(scale, 0, 0, scale, x, y)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const drawStroke = (segments: any[], color: string, width: number) => {
    if (!segments || segments.length < 2) return
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1, width * (scale * 0.12 + 0.9))
    ctx.beginPath()
    segments.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    ctx.stroke()
  }
  for (const s of whiteboardStrokes.value) drawStroke(s.segments, s.color, s.width)
  drawStroke(wbCurrent.value, wbColor.value, wbWidth.value)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

watch(whiteboardStrokes, () => redrawWb(), { deep: true })
watch(whiteboardOpen, (o) => { if (o) setTimeout(() => wbResize(), 60) })

function wbZoomAt(cx: number, cy: number, factor: number) {
  const ns = Math.min(8, Math.max(0.15, wbView.scale * factor))
  const k = ns / wbView.scale
  wbView.x = cx - (cx - wbView.x) * k
  wbView.y = cy - (cy - wbView.y) * k
  wbView.scale = ns
  redrawWb()
}

function closeWhiteboard() { whiteboardOpen.value = false }
function toggleWhiteboard() { whiteboardOpen.value = !whiteboardOpen.value }

function onWbWheel(e: WheelEvent) {
  e.preventDefault()
  const r = wbCanvas.value!.getBoundingClientRect()
  wbZoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0012))
}

function onWbPointerDown(e: PointerEvent) {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    const d = Math.hypot(a.x - b.x, a.y - b.y)
    pinchStart = { d, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, scale: wbView.scale, x: wbView.x, y: wbView.y }
    return
  }
  if (e.button === 1) { wbPanning = true; wbCanvas.value?.setPointerCapture(e.pointerId); return }
  if (e.pointerType === 'mouse' && e.button !== 0) return
  wbCanvas.value?.setPointerCapture(e.pointerId)
  wbDrawing.value = true
  wbCurrent.value = [wbWorld(e)]
}

function onWbPointerMove(e: PointerEvent) {
  if (!pointers.has(e.pointerId)) return
  const prev = pointers.get(e.pointerId)
  const now = { x: e.clientX, y: e.clientY }
  pointers.set(e.pointerId, now)

  if (pointers.size >= 2 && pinchStart) {
    const [a, b] = [...pointers.values()]
    const d = Math.hypot(a.x - b.x, a.y - b.y)
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    wbView.scale = Math.min(8, Math.max(0.15, pinchStart.scale * (d / pinchStart.d)))
    // 開始時に指の間の真下にあった世界座標を、常に現在の中心の真下に固定する。
    // これで拡大縮小と同時に2本指の移動がそのままパンになる。
    const k = wbView.scale / pinchStart.scale
    wbView.x = mid.x - (pinchStart.mid.x - pinchStart.x) * k
    wbView.y = mid.y - (pinchStart.mid.y - pinchStart.y) * k
    redrawWb()
    return
  }

  if (wbPanning) {
    const dx = now.x - (prev?.x ?? now.x)
    const dy = now.y - (prev?.y ?? now.y)
    wbView.x += dx
    wbView.y += dy
    redrawWb()
    return
  }

  if (wbDrawing.value) {
    wbCurrent.value = [...wbCurrent.value, wbWorld(e)]
    redrawWb()
  }
}

function onWbPointerUp(e: PointerEvent) {
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinchStart = null
  wbPanning = false
  if (!wbDrawing.value) return
  wbDrawing.value = false
  if (wbCurrent.value.length >= 2) {
    voice.sendWhiteboard({ segments: wbCurrent.value, color: wbColor.value, width: wbWidth.value })
  }
  wbCurrent.value = []
  redrawWb()
}

function wbClear() { voice.sendWhiteboard({ clear: true }) }
function wbUndo() { voice.sendWhiteboard({ sync: [...whiteboardStrokes.value.slice(0, -1)] }) }

onMounted(() => { window.addEventListener('resize', wbResize); window.addEventListener('resize', onMiniResize) })
onUnmounted(() => { window.removeEventListener('resize', wbResize); window.removeEventListener('resize', onMiniResize) })
</script>

<template>
  <div>
    <!-- Both panels sit on --app-bottom-inset instead of a fixed offset, so they
         clear the mini player and the pill whichever one is showing. The dock
         deliberately does NOT register itself in useBottomInset: it consumes
         that value to place itself, and registering would feed its own height
         back into the measurement and push it further away on every update. -->
    <!-- error toast -->
    <Transition name="slide-up">
      <div v-if="showError" class="fixed bottom-[calc(var(--app-bottom-inset)+1rem)] right-4 z-[95] bg-red-950/90 border border-red-800/60 rounded-xl pl-4 pr-2 py-3 text-sm text-red-200 flex items-center gap-3 max-w-xs shadow-2xl">
        <Icon name="lucide:phone-missed" class="w-4 h-4 shrink-0" />
        <span class="flex-1">{{ errorMsg }}</span>
        <button @click="dismissError" class="w-9 h-9 -mr-1 shrink-0 flex items-center justify-center rounded-full text-red-400 hover:text-white hover:bg-red-900/40 transition" title="閉じる" aria-label="閉じる">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <!-- incoming call -->
    <Transition name="slide-up">
      <div v-if="incoming" class="fixed bottom-[calc(var(--app-bottom-inset)+1rem)] right-4 z-[95] w-[min(18rem,calc(100vw-2rem))] bg-surface-container/95 border border-outline rounded-2xl p-4 shadow-2xl backdrop-blur">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img v-if="avatarSrc(incoming.from.avatarUrl)" :src="avatarSrc(incoming.from.avatarUrl)" class="w-11 h-11 rounded-full object-cover" />
            <div v-else class="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {{ incoming.from.displayName?.charAt(0) || '?' }}
            </div>
            <span class="absolute -bottom-0.5 -right-0.5 flex w-3 h-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span class="relative inline-flex rounded-full w-3 h-3 bg-emerald-500" />
            </span>
          </div>
          <div class="min-w-0">
            <p class="text-white font-bold text-sm truncate">{{ incoming.from.displayName }}</p>
            <p class="text-on-surface-variant text-xs">着信中...</p>
          </div>
        </div>
        <div class="flex justify-center gap-4 mt-4">
          <button @click="decline" class="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center justify-center" title="拒否">
            <Icon name="lucide:phone-off" class="w-5 h-5 text-white" />
          </button>
          <button @click="accept" class="w-11 h-11 rounded-full bg-green-600 hover:bg-green-700 transition flex items-center justify-center" title="応答">
            <Icon name="lucide:phone" class="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- fullscreen call view -->
    <Transition name="fade">
      <div v-if="callOpen && !minimized" data-vc-aud-root class="fixed inset-0 z-[85] bg-[#1e1f22] text-white flex flex-col">
        <!-- top bar -->
        <div class="flex items-center justify-between gap-3 px-4 py-3 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative w-9 h-9 rounded-full overflow-hidden bg-[#5865f2] shrink-0 flex items-center justify-center">
              <img v-if="avatarSrc(roomAvatar)" :src="avatarSrc(roomAvatar)" class="w-full h-full object-cover" />
              <Icon v-else name="lucide:phone" class="w-4 h-4 text-white" />
            </div>
            <div class="min-w-0">
              <h2 class="font-bold truncate leading-tight">{{ roomTitle }}</h2>
              <p class="text-xs text-[#b5bac1] flex items-center gap-1.5 truncate">
                <span :class="['w-2 h-2 rounded-full shrink-0', stateMeta.dot]" />
                <span class="truncate">{{ callState === 'connected' ? '接続済み' : stateMeta.label }}</span>
                <span v-if="status === 'active'" class="tabular-nums">· {{ callTime }}</span>
                <span>· {{ members.length }}名</span>
              </p>
            </div>
          </div>
          <button @click="minimized = true" class="w-10 h-10 shrink-0 rounded-full bg-white/5 hover:bg-white/10 transition flex items-center justify-center" title="最小化（ドラッグできる通話アイコンに）">
            <Icon name="lucide:minus" class="w-5 h-5" />
          </button>
        </div>

        <!-- stage -->
        <div class="relative flex-1 overflow-y-auto px-3 pb-2 min-h-0">
          <div v-if="tiles.length" class="h-full grid gap-3 content-center" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
            <!-- self screen share -->
            <div v-if="screenSharing && screenStream"
              class="relative rounded-lg overflow-hidden bg-black md:col-span-2 md:row-span-2 min-h-[200px] max-h-[70vh] flex flex-col items-center justify-center cursor-pointer group"
              @click="expandedScreen = 'self'">
              <video :srcObject.prop="screenStream" muted autoplay playsinline webkit-playsinline
                class="absolute inset-0 w-full h-full object-contain" />
              <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-1">
                <Icon name="lucide:monitor-up" class="w-3 h-3" /> あなたの画面
              </div>
              <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                <Icon name="lucide:maximize" class="w-8 h-8 text-white" />
              </div>
            </div>

            <!-- remote screen shares -->
            <div v-for="s in screenTiles" :key="'sc-' + s.userId"
              class="relative rounded-lg overflow-hidden bg-black md:col-span-2 md:row-span-2 min-h-[200px] max-h-[70vh] flex flex-col items-center justify-center cursor-pointer group"
              @click="expandedScreen = s.userId">
              <video :srcObject.prop="remoteScreenStreams[s.userId]" muted autoplay playsinline webkit-playsinline
                class="absolute inset-0 w-full h-full object-contain" />
              <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-1">
                <Icon name="lucide:monitor-up" class="w-3 h-3" /> {{ s.name }}の画面
              </div>
              <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                <Icon name="lucide:maximize" class="w-8 h-8 text-white" />
              </div>
            </div>

            <!-- camera / avatar tiles (自分も含む) -->
            <div v-for="t in tiles" :key="t.userId" class="relative rounded-lg overflow-hidden bg-[#2b2d31] min-h-[180px] flex flex-col items-center justify-center">
              <video v-if="t.isSelf ? (cameraEnabled && localVideoStream) : hasVideo[t.userId]"
                :srcObject.prop="t.isSelf ? localVideoStream : remoteStreams[t.userId]"
                :class="t.isSelf ? 'scale-x-[-1]' : ''"
                muted autoplay playsinline webkit-playsinline
                class="absolute inset-0 w-full h-full object-cover" />
              <div v-else class="absolute inset-0 flex flex-col items-center justify-center">
                <div :style="avatarPop(t.userId, t.isSelf)" :class="['relative w-24 h-24 min-[681px]:w-28 min-[681px]:h-28 rounded-full', speakingGlow(t.userId, t.isSelf)]">
                  <img v-if="avatarSrc(t.avatarUrl)" :src="avatarSrc(t.avatarUrl)" class="w-full h-full rounded-full object-cover" />
                  <div v-else class="w-full h-full rounded-full bg-[#5865f2] flex items-center justify-center text-white text-4xl font-bold">
                    {{ t.name.charAt(0) }}
                  </div>
                </div>
              </div>
              <!-- camera switch (自分のタイルのみ) -->
              <button v-if="t.isSelf && cameraEnabled" @click="voice.switchCamera().catch(() => {})"
                class="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 transition flex items-center justify-center z-[2]" title="カメラ切替（正面/背面）">
                <Icon name="lucide:refresh-ccw" class="w-4 h-4 text-white" />
              </button>
              <!-- reactions burst -->
              <div class="absolute inset-x-0 bottom-14 flex justify-center gap-2 pointer-events-none z-[2]">
                <span v-for="r in tileReactions(t.userId)" :key="r.id" class="wb-fly text-3xl drop-shadow-lg">{{ r.emoji }}</span>
              </div>
              <!-- name + audio status -->
              <div class="absolute bottom-0 inset-x-0 flex items-center justify-between gap-2 px-3 py-2 bg-black/40">
                <span class="text-white text-sm font-medium truncate">
                  {{ t.isSelf ? (me?.displayName || 'あなた') : t.name }}<span v-if="t.isSelf" class="text-[#b5bac1]">（あなた）</span>
                </span>
                <span class="flex items-center gap-1.5 shrink-0">
                  <Icon v-if="t.isSelf && muted" name="lucide:mic-off" class="w-4 h-4 text-[#f23f43]" />
                  <Icon v-if="speakerMuted" name="lucide:volume-x" class="w-4 h-4 text-[#f23f43]" />
                </span>
              </div>
            </div>
          </div>

          <!-- waiting hint (only yourself in the call) -->
          <div v-if="onlyMe" class="pointer-events-none absolute inset-x-0 top-4 flex justify-center z-[2]">
            <span class="px-3 py-1.5 rounded-full bg-black/50 text-xs text-[#b5bac1]">
              {{ activeRoom?.kind === 'dm' ? '相手の応答を待っています…' : '誰かが参加するのを待っています…' }}
            </span>
          </div>
        </div>

        <!-- whiteboard overlay -->
        <div v-if="whiteboardOpen" class="absolute inset-0 z-[1] flex flex-col bg-[#15161a]">
          <div class="flex items-center gap-2 px-3 py-2.5 shrink-0 flex-wrap">
            <Icon name="lucide:presentation" class="w-5 h-5 text-[#5865f2] shrink-0" />
            <span class="text-sm font-bold text-white mr-1">ホワイトボード</span>

            <!-- 色 -->
            <div class="flex items-center gap-1.5 bg-white/5 rounded-full px-2 py-1">
              <button v-for="c in WB_COLORS" :key="c" @click="wbColor = c"
                class="w-6 h-6 rounded-full transition"
                :style="{ backgroundColor: c }"
                :class="wbColor === c ? 'ring-2 ring-white scale-110' : 'ring-1 ring-white/20'" :title="c" />
            </div>

            <!-- 太さ -->
            <div class="flex items-center gap-0.5 bg-white/5 rounded-full px-1.5 py-1">
              <button v-for="w in WB_WIDTHS" :key="w" @click="wbWidth = w"
                class="w-9 h-7 rounded-full flex items-center justify-center transition"
                :class="wbWidth === w ? 'bg-white/20' : 'hover:bg-white/10'" :title="w <= 2 ? '細い' : w <= 4 ? '中' : '太い'">
                <span class="rounded-full bg-white" :style="{ width: (w + 2) + 'px', height: (w + 2) + 'px' }" />
              </button>
            </div>

            <button @click="wbUndo" class="wb-tool" title="戻す"><Icon name="lucide:undo-2" class="w-4 h-4" /></button>
            <button @click="wbClear" class="wb-tool wb-tool-danger" title="全部消す"><Icon name="lucide:trash-2" class="w-4 h-4" /></button>

            <span class="text-[11px] text-[#b5bac1] ml-auto hidden min-[700px]:block">1本指で描く／2本指で移動・拡大</span>
            <button @click="closeWhiteboard" class="wb-tool" title="閉じる"><Icon name="lucide:x" class="w-4 h-4" /></button>
          </div>
          <canvas
            ref="wbCanvas"
            class="flex-1 w-full touch-none cursor-crosshair"
            @wheel="onWbWheel"
            @pointerdown="onWbPointerDown"
            @pointermove="onWbPointerMove"
            @pointerup="onWbPointerUp"
            @pointercancel="onWbPointerUp"
            @pointerleave="onWbPointerUp"
          />
        </div>

        <!-- expanded screen overlay -->
        <div v-if="expandedScreen" class="absolute inset-0 z-[3] bg-black flex flex-col p-4">
          <div class="flex items-center justify-between mb-2 shrink-0">
            <span class="text-sm text-on-surface flex items-center gap-2">
              <Icon name="lucide:monitor-up" class="w-4 h-4" />
              {{ expandedScreen === 'self' ? 'あなたの画面' : ((screenTiles.find(s => s.userId === expandedScreen)?.name || '') + 'の画面') }}
            </span>
            <button @click="expandedScreen = null" class="w-11 h-11 min-[681px]:w-9 min-[681px]:h-9 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest transition flex items-center justify-center" title="閉じる">
              <Icon name="lucide:x" class="w-5 h-5 text-white" />
            </button>
          </div>
          <div class="flex-1 min-h-0 flex items-center justify-center">
            <video v-if="expandedScreen === 'self'" :srcObject="screenStream" muted autoplay playsinline webkit-playsinline class="max-w-full max-h-full object-contain rounded-lg bg-surface-dim" />
            <video v-else :srcObject="remoteScreenStreams[expandedScreen]" muted autoplay playsinline webkit-playsinline class="max-w-full max-h-full object-contain rounded-lg bg-surface-dim" />
          </div>
        </div>

        <!-- control panel (floating Discord-style pill) -->
        <div class="shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2 px-3 flex justify-center z-[2]">
          <div class="relative flex flex-wrap items-center justify-center gap-1.5 rounded-[22px] bg-[#2b2d31] border border-black/40 px-2.5 py-2 shadow-[0_4px_18px_rgba(0,0,0,0.45)] max-w-[calc(100vw-1.5rem)]">
            <!-- reaction picker -->
            <Transition name="slide-up">
              <div v-if="showReactions" class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#2b2d31] border border-black/40 rounded-full px-3 py-2 shadow-2xl">
                <button v-for="e in EMOJIS" :key="e" @click="pickReaction(e)" class="text-2xl hover:scale-125 transition">{{ e }}</button>
              </div>
            </Transition>

            <button @click="voice.setCamera(!cameraEnabled).catch(() => {})" class="ctrl-btn" :class="cameraEnabled ? 'ctrl-active' : 'ctrl-ghost'" :title="cameraEnabled ? 'カメラを切る' : 'カメラを付ける'">
              <Icon :name="cameraEnabled ? 'lucide:video' : 'lucide:video-off'" class="w-5 h-5" />
            </button>
            <button @click="voice.toggleScreenShare()" class="ctrl-btn" :class="screenSharing ? 'ctrl-active' : 'ctrl-ghost'" :title="screenSharing ? '共有を停止' : '画面を共有'">
              <Icon :name="screenSharing ? 'lucide:monitor-off' : 'lucide:monitor-up'" class="w-5 h-5" />
            </button>
            <button @click="toggleWhiteboard" class="ctrl-btn" :class="whiteboardOpen ? 'ctrl-active' : 'ctrl-ghost'" title="ホワイトボード">
              <Icon name="lucide:presentation" class="w-5 h-5" />
            </button>
            <button @click="showReactions = !showReactions" class="ctrl-btn ctrl-ghost" title="リアクション">
              <Icon name="lucide:smile" class="w-5 h-5" />
            </button>
            <button @click="inviteOpen = true" class="ctrl-btn ctrl-ghost" title="通話に招待">
              <Icon name="lucide:user-plus" class="w-5 h-5" />
            </button>

            <span class="w-px h-7 bg-white/10 mx-0.5 hidden min-[520px]:block" />

            <button @click="voice.toggleMute()" class="ctrl-btn" :class="muted ? 'ctrl-active-red' : 'ctrl-ghost'" :title="muted ? 'ミュート解除' : 'ミュート'">
              <Icon :name="muted ? 'lucide:mic-off' : 'lucide:mic'" class="w-5 h-5" />
            </button>
            <button @click="voice.toggleSpeakerMute()" class="ctrl-btn" :class="speakerMuted ? 'ctrl-active-red' : 'ctrl-ghost'" :title="speakerMuted ? 'スピーカーミュート解除' : 'スピーカーミュート'">
              <Icon :name="speakerMuted ? 'lucide:volume-x' : 'lucide:volume-2'" class="w-5 h-5" />
            </button>
            <button @click="voice.leave()" class="ctrl-leave" title="退出">
              <Icon name="lucide:phone-off" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- invite modal -->
        <div v-if="inviteOpen" class="absolute inset-0 z-[4] bg-black/60 flex items-center justify-center" @click.self="inviteOpen = false">
          <div class="bg-surface-container border border-outline rounded-2xl w-full max-w-sm mx-4 p-5 shadow-2xl">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-white flex items-center gap-2"><Icon name="lucide:user-plus" class="w-4 h-4 text-indigo-400" /> 通話に招待</h3>
              <button @click="inviteOpen = false" class="text-on-surface-variant hover:text-white transition"><Icon name="lucide:x" class="w-5 h-5" /></button>
            </div>
            <p class="text-sm text-on-surface-variant mb-3">このリンクを送って、通話に参加してもらいましょう。</p>
            <div class="flex items-center gap-2 bg-surface-container border border-outline rounded-lg px-3 py-2">
              <span class="text-xs text-on-surface truncate flex-1">{{ inviteLink }}</span>
              <button @click="copyInvite" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0">
                {{ copied ? 'コピー済み' : 'コピー' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- mini floating call icon (draggable, ~80px, on top of everything) -->
    <Transition name="mini-pop">
      <div
        v-if="callOpen && minimized"
        ref="miniEl"
        class="fixed z-[98] w-20 h-20 rounded-2xl bg-surface-container/95 border border-outline shadow-2xl backdrop-blur flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing select-none touch-none"
        :style="{ left: miniPos.x + 'px', top: miniPos.y + 'px' }"
        @pointerdown="onMiniDown"
        @click="expandCall"
      >
        <div class="relative">
          <div v-if="miniPeer" :class="['relative w-11 h-11 rounded-full overflow-hidden', speakingGlow(miniPeer.userId, miniPeer.userId === me?.userId)]">
            <img v-if="avatarSrc(miniPeer.avatarUrl)" :src="avatarSrc(miniPeer.avatarUrl)" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
              {{ (miniPeer.displayName || miniPeer.username || '?').charAt(0) }}
            </div>
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 flex w-3 h-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span class="relative inline-flex rounded-full w-3 h-3 bg-emerald-500" />
          </span>
        </div>
        <span v-if="status === 'active'" class="text-[10px] text-on-surface tabular-nums">{{ callTime }}</span>
        <Icon name="lucide:phone" class="w-3 h-3 text-emerald-400" />
      </div>
    </Transition>

    <!-- hidden audio outputs (playsinline + not display:none for mobile) -->
    <template v-if="callOpen">
      <audio v-for="(stream, uid) in remoteStreams" :key="'aud-' + uid" :srcObject="stream" :muted="speakerMuted"
        autoplay playsinline webkit-playsinline class="vc-aud vc-aud-absolute" />
    </template>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.mini-pop-enter-active, .mini-pop-leave-active { transition: all 0.2s ease; }
.mini-pop-enter-from, .mini-pop-leave-to { opacity: 0; transform: scale(0.6); }

.vc-aud-absolute {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0.01;
  pointer-events: none;
}

.ctrl-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 46px; height: 46px; border-radius: 9999px;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}
.ctrl-btn:active { transform: scale(0.94); }
.ctrl-ghost { background: #4e5058; color: #fff; }
.ctrl-ghost:hover { background: #5d6069; }
.ctrl-active { background: #fff; color: #1e1f22; }
.ctrl-active:hover { background: #e3e5e8; }
.ctrl-active-red { background: #da373c; color: #fff; }
.ctrl-active-red:hover { background: #c93134; }
.ctrl-leave { background: #da373c; color: #fff; border-radius: 9999px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; transition: background-color 0.15s ease, transform 0.1s ease; }
.ctrl-leave:hover { background: #c93134; }
.ctrl-leave:active { transform: scale(0.94); }
@media (max-width: 480px) {
  .ctrl-btn, .ctrl-leave { width: 42px; height: 42px; }
}

.wb-tool {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 9999px;
  background: #4e5058; color: #fff;
  transition: background-color 0.15s ease, transform 0.1s ease;
}
.wb-tool:hover { background: #5d6069; }
.wb-tool:active { transform: scale(0.94); }
.wb-tool-danger { background: #da373c; }
.wb-tool-danger:hover { background: #c93134; }

@keyframes wbfly {
  0% { opacity: 0; transform: translateY(10px) scale(0.4); }
  15% { opacity: 1; transform: translateY(0) scale(1.15); }
  70% { opacity: 1; transform: translateY(-18px) scale(1); }
  100% { opacity: 0; transform: translateY(-34px) scale(0.9); }
}
.wb-fly { animation: wbfly 3.2s ease forwards; }
</style>