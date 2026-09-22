<script setup lang="ts">
const voice = useVoiceCall()
const { status, members, muted, speakerMuted, remoteStreams, remoteScreenStreams, incoming, errorMsg, activeRoom, callState, me, cameraEnabled, screenSharing, localVideoStream, screenStream, localStream, reactions, whiteboardStrokes, currentFacing } = voice

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
  switch (callState.value) {
    case 'connected': return { label: '接続済み', cls: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', dot: 'bg-emerald-400' }
    case 'reconnecting': return { label: '再接続中...', cls: 'text-amber-400 border-amber-500/40 bg-amber-500/10', dot: 'bg-amber-400 animate-pulse' }
    case 'failed': return { label: '接続失敗', cls: 'text-red-400 border-red-500/40 bg-red-500/10', dot: 'bg-red-400' }
    default: return { label: '接続中...', cls: 'text-sky-400 border-sky-500/40 bg-sky-500/10', dot: 'bg-sky-400 animate-pulse' }
  }
})

/* ---- ringtone ---- */
let ringCtx: AudioContext | null = null
let ringOsc: OscillatorNode | null = null
let ringGain: GainNode | null = null

function startRing() {
  if (ringCtx || !import.meta.client) return
  try {
    ringCtx = new AudioContext()
    ringOsc = ringCtx.createOscillator()
    ringGain = ringCtx.createGain()
    ringOsc.type = 'sine'
    ringOsc.frequency.value = 660
    ringGain.gain.value = 0
    ringOsc.connect(ringGain)
    ringGain.connect(ringCtx.destination)
    ringOsc.start()
    const pulse = () => {
      if (!ringCtx || !ringGain) return
      const t = ringCtx.currentTime
      ringGain.gain.cancelScheduledValues(t)
      ringGain.gain.setValueAtTime(0, t)
      ringGain.gain.linearRampToValueAtTime(0.08, t + 0.05)
      ringGain.gain.linearRampToValueAtTime(0, t + 0.5)
    }
    pulse()
    ;(ringCtx as any)._pulseTimer = setInterval(pulse, 1600)
  } catch { /* ignore */ }
}

function stopRing() {
  try {
    if (ringCtx) {
      if ((ringCtx as any)._pulseTimer) clearInterval((ringCtx as any)._pulseTimer)
      ringOsc?.stop()
      ringCtx.close()
    }
  } catch { /* ignore */ }
  ringCtx = null
  ringOsc = null
  ringGain = null
}

watch(incoming, (v) => { if (v) startRing(); else stopRing() }, { immediate: true })
onUnmounted(stopRing)

async function accept() {
  stopRing()
  await voice.acceptCall()
  const room = voice.activeRoom.value
  if (room?.kind === 'dm' && room.roomKey.startsWith('dm:')) {
    navigateTo(`/dm/${room.roomKey.slice(3)}`)
  }
}
function decline() {
  stopRing()
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
type CallTile = { userId: string; name: string; avatarUrl: string | null; isSelf: boolean }
const tiles = computed<CallTile[]>(() => {
  const list: CallTile[] = []
  for (const m of members.value) {
    if (m.userId !== me.value?.userId) {
      list.push({ userId: m.userId, name: m.displayName || m.username, avatarUrl: m.avatarUrl, isSelf: false })
    }
  }
  if (me.value) list.push({ userId: me.value.userId, name: me.value.displayName, avatarUrl: me.value.avatarUrl, isSelf: true })
  return list
})
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
    return `${location.origin}/dm/${room.roomKey.slice(3)}`
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
const wbPanMode = ref(false)
const wbView = reactive({ x: 0, y: 0, scale: 1 })
const WB_COLORS = ['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7']
const GRID = 100

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
  ctx.clearRect(0, 0, W, H)

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

function wbZoom(factor: number) {
  const el = wbCanvas.value
  const cx = el?.clientWidth ? el.clientWidth / 2 : window.innerWidth / 2
  const cy = el?.clientHeight ? el.clientHeight / 2 : window.innerHeight / 2
  wbZoomAt(cx, cy, factor)
}

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
  if (wbPanMode.value || e.button === 1) return
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
    wbView.x = mid.x - (mid.x - pinchStart.x) * (wbView.scale / pinchStart.scale)
    wbView.y = mid.y - (mid.y - pinchStart.y) * (wbView.scale / pinchStart.scale)
    redrawWb()
    return
  }

  if (wbPanMode.value || e.button === 1) {
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
  if (!wbDrawing.value) return
  wbDrawing.value = false
  if (wbCurrent.value.length >= 2) {
    voice.sendWhiteboard({ segments: wbCurrent.value, color: wbColor.value, width: wbWidth.value })
  }
  wbCurrent.value = []
  redrawWb()
}

function wbToggleTool() { wbPanMode.value = !wbPanMode.value }

function wbClear() { voice.sendWhiteboard({ clear: true }) }
function wbUndo() { voice.sendWhiteboard({ sync: [...whiteboardStrokes.value.slice(0, -1)] }) }

onMounted(() => { window.addEventListener('resize', wbResize) })
onUnmounted(() => { window.removeEventListener('resize', wbResize) })
</script>

<template>
  <div>
    <!-- error toast -->
    <Transition name="slide-up">
      <div v-if="showError" class="fixed bottom-20 min-[681px]:bottom-[38px] right-4 z-[95] bg-red-950/90 border border-red-800/60 rounded-xl px-4 py-3 text-sm text-red-200 flex items-center gap-3 max-w-xs shadow-2xl">
        <Icon name="lucide:phone-missed" class="w-4 h-4 shrink-0" />
        <span class="flex-1">{{ errorMsg }}</span>
        <button @click="dismissError" class="text-red-400 hover:text-white transition shrink-0">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <!-- incoming call -->
    <Transition name="slide-up">
      <div v-if="incoming" class="fixed bottom-20 min-[681px]:bottom-[38px] right-4 z-[95] w-72 bg-[#151a24]/95 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img v-if="incoming.from.avatarUrl" :src="incoming.from.avatarUrl" class="w-11 h-11 rounded-full object-cover" />
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
            <p class="text-slate-400 text-xs">着信中...</p>
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
      <div v-if="callOpen" data-vc-aud-root class="fixed inset-0 z-[85] bg-[#0b0f19] flex flex-col">
        <!-- top bar -->
        <div class="flex items-center justify-between px-5 py-3 shrink-0 border-b border-slate-800/60">
          <div class="flex items-center gap-2.5 min-w-0">
            <Icon name="lucide:phone" class="w-4 h-4 text-slate-400 shrink-0" />
            <h2 class="font-bold text-white truncate">{{ roomTitle }}</h2>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span :class="['px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5', stateMeta.cls]">
              <span :class="['w-2 h-2 rounded-full', stateMeta.dot]" />
              {{ callState === 'active' ? '通話中' : stateMeta.label }}
            </span>
            <span v-if="status === 'active'" class="text-xs text-slate-400 tabular-nums">{{ callTime }}</span>
            <span class="text-xs text-slate-500">{{ tiles.length + screenTiles.length }}名</span>
          </div>
        </div>

        <!-- tiles -->
        <div class="flex-1 overflow-y-auto p-4 min-h-0">
          <div class="h-full grid gap-3 content-center" style="grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));">
            <!-- screen share tiles (separate from camera tiles) -->
            <div v-for="s in screenTiles" :key="'sc-' + s.userId"
              class="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 md:col-span-2 md:row-span-2 min-h-[200px] max-h-[70vh] flex flex-col items-center justify-center cursor-pointer group"
              @click="expandedScreen = s.userId">
              <video :srcObject="remoteScreenStreams[s.userId]" :muted="speakerMuted" autoplay playsinline webkit-playsinline
                class="absolute inset-0 w-full h-full object-contain bg-black" />
              <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-1">
                <Icon name="lucide:monitor-up" class="w-3 h-3" /> {{ s.name }}の画面
              </div>
              <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                <Icon name="lucide:maximize" class="w-8 h-8 text-white" />
              </div>
            </div>

            <!-- member camera/avatar tiles -->
            <div v-for="t in tiles" :key="t.userId" class="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 min-h-[180px] flex flex-col items-center justify-center">
              <div v-if="!t.isSelf && hasVideo[t.userId]" class="absolute inset-0 w-full h-full">
                <video :srcObject="remoteStreams[t.userId]" :muted="speakerMuted" autoplay playsinline webkit-playsinline
                  class="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div v-else class="absolute inset-0 flex flex-col items-center justify-center">
                <div :style="avatarPop(t.userId, t.isSelf)" :class="['relative w-28 h-28 rounded-full', speakingGlow(t.userId, t.isSelf)]">
                  <img v-if="t.avatarUrl" :src="t.avatarUrl" class="w-full h-full rounded-full object-cover" />
                  <div v-else class="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                    {{ t.name.charAt(0) }}
                  </div>
                </div>
              </div>
              <!-- reactions burst -->
              <div class="absolute inset-x-0 bottom-14 flex justify-center gap-2 pointer-events-none z-[2]">
                <span v-for="r in tileReactions(t.userId)" :key="r.id" class="wb-fly text-3xl drop-shadow-lg">{{ r.emoji }}</span>
              </div>
              <!-- name + mic status -->
              <div class="absolute bottom-0 inset-x-0 flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
                <span class="text-white text-sm font-medium truncate">{{ t.name }}</span>
                <span class="flex items-center gap-1.5 shrink-0">
                  <Icon v-if="!t.isSelf && speakerMuted" name="lucide:volume-x" class="w-4 h-4 text-red-300" />
                  <Icon v-if="muted && t.isSelf" name="lucide:mic-off" class="w-4 h-4 text-red-400" />
                  <Icon v-else-if="!t.isSelf" name="lucide:mic" class="w-4 h-4 text-slate-300" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- self preview (mirrored) -->
        <div class="absolute bottom-24 right-4 w-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl z-[2] cursor-pointer group" @click="screenSharing ? expandedScreen = 'self' : null">
          <video v-if="screenSharing && screenStream" :srcObject="screenStream" muted autoplay playsinline webkit-playsinline class="w-full aspect-video object-cover" />
          <video v-else-if="cameraEnabled && localVideoStream" :srcObject="localVideoStream" muted autoplay playsinline webkit-playsinline class="w-full aspect-video object-cover scale-x-[-1]" />
          <div v-else class="aspect-video flex items-center justify-center text-slate-500">
            <Icon name="lucide:user" class="w-6 h-6" />
          </div>
          <button v-if="cameraEnabled" @click.stop="voice.switchCamera().catch(() => {})"
            class="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 transition flex items-center justify-center" title="カメラ切替（正面/背面）">
            <Icon name="lucide:refresh-ccw" class="w-4 h-4 text-white" />
          </button>
          <div class="px-2 py-1 text-[11px] text-slate-300 flex items-center gap-1.5 bg-slate-900" :style="avatarPop('me', true)">
            <span class="w-1.5 h-1.5 rounded-full" :class="muted ? 'bg-red-400' : 'bg-emerald-400'" />
            {{ me?.displayName }} <span v-if="muted">(ミュート)</span>
          </div>
        </div>

        <!-- whiteboard overlay -->
        <div v-if="whiteboardOpen" class="absolute inset-0 z-[1] flex flex-col bg-[#0b0f19]/98">
          <div class="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800 bg-slate-900/80 flex-wrap">
            <Icon name="lucide:presentation" class="w-4 h-4 text-indigo-400 shrink-0" />
            <span class="text-sm font-bold text-white mr-2">ホワイトボード</span>
            <button v-for="c in WB_COLORS" :key="c" @click="wbColor = c"
              class="w-5 h-5 rounded-full border-2 transition shrink-0"
              :style="{ backgroundColor: c, opacity: wbColor === c ? 1 : 0.6 }"
              :class="wbColor === c ? 'border-white scale-110' : 'border-transparent'" :title="c" />
            <button @click="wbToggleTool" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0" :title="wbPanMode ? '描画モード' : '移動モード'">
              <Icon :name="wbPanMode ? 'lucide:pencil' : 'lucide:hand'" class="w-3.5 h-3.5" />
            </button>
            <button @click="wbZoom(1.3)" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0" title="拡大">
              <Icon name="lucide:zoom-in" class="w-3.5 h-3.5" />
            </button>
            <button @click="wbZoom(1 / 1.3)" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0" title="縮小">
              <Icon name="lucide:zoom-out" class="w-3.5 h-3.5" />
            </button>
            <select v-model="wbWidth" class="bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 px-1 py-1 shrink-0">
              <option :value="2">細</option>
              <option :value="4">中</option>
              <option :value="10">太</option>
            </select>
            <span class="text-[10px] text-slate-500 ml-auto">スクロールで拡大/縮小・2本指で移動</span>
            <button @click="wbUndo" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0" title="戻す"><Icon name="lucide:undo-2" class="w-3.5 h-3.5" /></button>
            <button @click="wbClear" class="px-2.5 py-1 rounded bg-red-900/40 hover:bg-red-900/70 text-xs text-red-300 transition shrink-0">クリア</button>
            <button @click="whiteboardOpen = false; wbPanMode = false" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0">閉じる</button>
          </div>
          <canvas
            ref="wbCanvas"
            class="flex-1 w-full touch-none"
            :class="wbPanMode ? 'cursor-grab' : 'cursor-crosshair'"
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
            <span class="text-sm text-slate-300 flex items-center gap-2">
              <Icon name="lucide:monitor-up" class="w-4 h-4" />
              {{ expandedScreen === 'self' ? 'あなたの画面' : ((screenTiles.find(s => s.userId === expandedScreen)?.name || '') + 'の画面') }}
            </span>
            <button @click="expandedScreen = null" class="w-9 h-9 rounded-full bg-slate-700/60 hover:bg-slate-600 transition flex items-center justify-center" title="閉じる">
              <Icon name="lucide:x" class="w-5 h-5 text-white" />
            </button>
          </div>
          <div class="flex-1 min-h-0 flex items-center justify-center">
            <video v-if="expandedScreen === 'self'" :srcObject="screenStream" muted autoplay playsinline webkit-playsinline class="max-w-full max-h-full object-contain rounded-lg bg-slate-950" />
            <video v-else :srcObject="remoteScreenStreams[expandedScreen]" :muted="speakerMuted" autoplay playsinline webkit-playsinline class="max-w-full max-h-full object-contain rounded-lg bg-slate-950" />
          </div>
        </div>

        <!-- control panel -->
        <div class="shrink-0 px-4 py-4 flex items-center justify-center gap-3 border-t border-slate-800/60 relative flex-wrap z-[2]">
          <!-- reaction picker -->
          <Transition name="slide-up">
            <div v-if="showReactions" class="absolute bottom-full mb-3 flex items-center gap-1 bg-[#151a24] border border-slate-700 rounded-full px-3 py-2 shadow-2xl">
              <button v-for="e in EMOJIS" :key="e" @click="pickReaction(e)" class="text-2xl hover:scale-125 transition">{{ e }}</button>
            </div>
          </Transition>

          <button @click="voice.toggleMute()" class="ctrl-btn" :class="muted ? 'ctrl-active-red' : 'ctrl-ghost'" :title="muted ? 'ミュート解除' : 'ミュート'">
            <Icon :name="muted ? 'lucide:mic-off' : 'lucide:mic'" class="w-5 h-5" />
          </button>
          <button @click="voice.toggleSpeakerMute()" class="ctrl-btn" :class="speakerMuted ? 'ctrl-active-red' : 'ctrl-ghost'" :title="speakerMuted ? 'スピーカーミュート解除' : 'スピーカーミュート'">
            <Icon :name="speakerMuted ? 'lucide:volume-x' : 'lucide:volume-2'" class="w-5 h-5" />
          </button>
          <button @click="voice.setCamera(!cameraEnabled).catch(() => {})" class="ctrl-btn" :class="cameraEnabled ? 'ctrl-active' : 'ctrl-ghost'" :title="cameraEnabled ? 'カメラを切る' : 'カメラを付ける'">
            <Icon :name="cameraEnabled ? 'lucide:video' : 'lucide:video-off'" class="w-5 h-5" />
          </button>
          <button @click="voice.toggleScreenShare()" class="ctrl-btn" :class="screenSharing ? 'ctrl-active' : 'ctrl-ghost'" :title="screenSharing ? '共有を停止' : '画面を共有'">
            <Icon :name="screenSharing ? 'lucide:monitor-off' : 'lucide:monitor-up'" class="w-5 h-5" />
          </button>
          <button @click="whiteboardOpen = !whiteboardOpen; if(!whiteboardOpen) wbPanMode = false" class="ctrl-btn" :class="whiteboardOpen ? 'ctrl-active' : 'ctrl-ghost'" title="ホワイトボード">
            <Icon name="lucide:presentation" class="w-5 h-5" />
          </button>
          <button @click="showReactions = !showReactions" class="ctrl-btn ctrl-ghost" title="リアクション">
            <Icon name="lucide:smile" class="w-5 h-5" />
          </button>
          <button @click="inviteOpen = true" class="ctrl-btn ctrl-ghost" title="通話に招待">
            <Icon name="lucide:user-plus" class="w-5 h-5" />
          </button>
          <button @click="voice.leave()" class="ctrl-btn ctrl-leave" title="退出">
            <Icon name="lucide:phone-off" class="w-5 h-5" />
            <span class="text-xs font-bold">退出</span>
          </button>
        </div>

        <!-- invite modal -->
        <div v-if="inviteOpen" class="absolute inset-0 z-[4] bg-black/60 flex items-center justify-center" @click.self="inviteOpen = false">
          <div class="bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-sm mx-4 p-5 shadow-2xl">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-white flex items-center gap-2"><Icon name="lucide:user-plus" class="w-4 h-4 text-indigo-400" /> 通話に招待</h3>
              <button @click="inviteOpen = false" class="text-slate-500 hover:text-white transition"><Icon name="lucide:x" class="w-5 h-5" /></button>
            </div>
            <p class="text-sm text-slate-400 mb-3">このリンクを送って、通話に参加してもらいましょう。</p>
            <div class="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
              <span class="text-xs text-slate-300 truncate flex-1">{{ inviteLink }}</span>
              <button @click="copyInvite" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0">
                {{ copied ? 'コピー済み' : 'コピー' }}
              </button>
            </div>
          </div>
        </div>
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
  transition: all 0.15s ease;
}
.ctrl-ghost { background: #1e2637; color: #cbd5e1; border: 1px solid #334155; }
.ctrl-ghost:hover { background: #2b3650; color: #fff; }
.ctrl-active { background: #313601; color: #facc15; border: 1px solid #57534e; }
.ctrl-active-red { background: rgba(220,38,38,.25); color: #fca5a5; border: 1px solid rgba(239,68,68,.5); }
.ctrl-leave { background: #dc2626; color: #fff; border: 1px solid #ef4444; border-radius: 9999px; padding: 0 18px; width: auto; flex: none; }
.ctrl-leave:hover { background: #ef4444; }

@keyframes wbfly {
  0% { opacity: 0; transform: translateY(10px) scale(0.4); }
  15% { opacity: 1; transform: translateY(0) scale(1.15); }
  70% { opacity: 1; transform: translateY(-18px) scale(1); }
  100% { opacity: 0; transform: translateY(-34px) scale(0.9); }
}
.wb-fly { animation: wbfly 3.2s ease forwards; }
</style>