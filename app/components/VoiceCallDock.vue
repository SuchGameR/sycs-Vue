<script setup lang="ts">
const voice = useVoiceCall()
const { status, members, muted, speakerMuted, remoteStreams, incoming, errorMsg, activeRoom, callState, me, cameraEnabled, screenSharing, localVideoStream, screenStream, reactions, whiteboardEvents } = voice

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

/* ---- remote video presence poll ---- */
const hasVideo = ref<Record<string, boolean>>({})
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
    }, 1200)
  }
})

/* ---- participant tiles ---- */
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

/* ---- whiteboard ---- */
const whiteboardOpen = ref(false)
const wbCanvas = ref<HTMLCanvasElement | null>(null)
const wbColor = ref('#ffffff')
const wbWidth = ref(3)
const wbStrokes = ref<any[]>([])
const wbCurrent = ref<any[]>([])
const wbDrawing = ref(false)
const WB_COLORS = ['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7']

function wbPoint(e: PointerEvent) {
  const el = wbCanvas.value
  if (!el) return { x: 0, y: 0 }
  const r = el.getBoundingClientRect()
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
}

function wbResize() {
  const el = wbCanvas.value
  if (!el) return
  el.width = el.clientWidth
  el.height = el.clientHeight
  redrawWb()
}

function redrawWb() {
  const el = wbCanvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  const W = el.width, H = el.height
  ctx.clearRect(0, 0, W, H)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const drawStroke = (segments: { x: number; y: number }[], color: string, width: number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width * (Math.min(W, H) / 700 + 0.4)
    ctx.beginPath()
    segments.forEach((p, i) => {
      const sx = p.x * W, sy = p.y * H
      if (i === 0) ctx.moveTo(sx, sy)
      else ctx.lineTo(sx, sy)
    })
    ctx.stroke()
  }
  for (const s of wbStrokes.value) drawStroke(s.segments, s.color, s.width)
  if (wbCurrent.value.length) drawStroke(wbCurrent.value, wbColor.value, wbWidth.value)
}

function onWbDown(e: PointerEvent) {
  if (!(e.buttons & 1)) return
  wbDrawing.value = true
  wbCanvas.value?.setPointerCapture(e.pointerId)
  wbCurrent.value = [wbPoint(e)]
}
function onWbMove(e: PointerEvent) {
  if (!wbDrawing.value) return
  wbCurrent.value = [...wbCurrent.value, wbPoint(e)]
  redrawWb()
}
function onWbUp() {
  if (!wbDrawing.value) return
  const stroke = { segments: wbCurrent.value, color: wbColor.value, width: wbWidth.value }
  wbCurrent.value = []
  wbDrawing.value = false
  wbStrokes.value = [...wbStrokes.value, stroke]
  redrawWb()
  voice.sendWhiteboard(stroke)
}

watch(whiteboardEvents, (events) => {
  for (const ev of events.slice(-1)) {
    if (ev.data?.segments?.length) {
      wbStrokes.value = [...wbStrokes.value, { segments: ev.data.segments, color: ev.data.color, width: ev.data.width }]
      redrawWb()
    } else if (ev.data?.clear) {
      wbStrokes.value = []
      redrawWb()
    }
  }
})

function wbClear() {
  wbStrokes.value = []
  redrawWb()
  voice.sendWhiteboard({ clear: true })
}
function wbUndo() {
  wbStrokes.value = wbStrokes.value.slice(0, -1)
  redrawWb()
  voice.sendWhiteboard({ clear: true })
  voice.sendWhiteboard({ segments: wbStrokes.value.flatMap(s => s.segments), color: '#ffffff', width: 0 })
}
function toggleWhiteboard() {
  whiteboardOpen.value = !whiteboardOpen.value
  if (whiteboardOpen.value) setTimeout(() => { wbResize() }, 50)
}
onMounted(() => { window.addEventListener('resize', wbResize) })
onUnmounted(() => { window.removeEventListener('resize', wbResize) })

/* camera binding unwrap */
const voiceCamera = camera
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
      <div v-if="callOpen" class="fixed inset-0 z-[85] bg-[#0b0f19] flex flex-col">
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
            <span class="text-xs text-slate-500">{{ tiles.length }}名</span>
          </div>
        </div>

        <!-- tiles -->
        <div class="flex-1 overflow-y-auto p-4 min-h-0">
          <div class="h-full grid gap-3 min-h-[280px]" :class="tiles.length <= 1 ? 'grid-cols-1' : tiles.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'">
            <div v-for="t in tiles" :key="t.userId" class="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 min-h-[220px] flex flex-col items-center justify-center">
              <!-- remote video -->
              <video
                v-if="!t.isSelf && hasVideo[t.userId]"
                :srcObject="remoteStreams[t.userId]"
                :muted="speakerMuted"
                autoplay playsinline
                class="absolute inset-0 w-full h-full object-cover"
              />
              <!-- avatar fallback -->
              <template v-else>
                <img v-if="t.avatarUrl" :src="t.avatarUrl" class="w-28 h-28 rounded-full object-cover border-4 border-slate-700/40" />
                <div v-else class="w-28 h-28 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                  {{ t.name.charAt(0) }}
                </div>
              </template>
              <!-- speaking/status glow -->
              <div class="absolute inset-0 pointer-events-none ring-2 ring-inset ring-transparent" />
              <!-- reactions burst -->
              <div class="absolute inset-x-0 bottom-16 flex justify-center gap-2 pointer-events-none">
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
              <!-- shared screen badge -->
              <span v-if="!t.isSelf && hasVideo[t.userId]" class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-1">
                <Icon name="lucide:monitor-up" class="w-3 h-3" /> 画面
              </span>
            </div>
          </div>
        </div>

        <!-- self preview -->
        <div class="absolute bottom-24 right-4 w-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
          <video v-if="cameraEnabled && localVideoStream" :srcObject="localVideoStream" muted autoplay playsinline class="w-full aspect-video object-cover" />
          <div v-else class="aspect-video flex items-center justify-center text-slate-500">
            <Icon :name="screenSharing ? 'lucide:monitor-up' : 'lucide:user'" class="w-6 h-6" />
          </div>
          <div class="px-2 py-1 text-[11px] text-slate-300 flex items-center gap-1.5 bg-slate-900">
            <span class="w-1.5 h-1.5 rounded-full" :class="muted ? 'bg-red-400' : 'bg-emerald-400'" />
            {{ me?.displayName }} <span v-if="muted">(ミュート)</span>
          </div>
        </div>

        <!-- whiteboard overlay -->
        <div v-if="whiteboardOpen" class="absolute inset-0 z-[1] flex flex-col bg-[#0b0f19]/98">
          <div class="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/80">
            <Icon name="lucide:presentation" class="w-4 h-4 text-indigo-400" />
            <span class="text-sm font-bold text-white">ホワイトボード</span>
            <div class="ml-auto flex items-center gap-2">
              <button v-for="c in WB_COLORS" :key="c" @click="wbColor = c"
                class="w-5 h-5 rounded-full border-2 transition"
                :style="{ backgroundColor: c }"
                :class="wbColor === c ? 'border-white scale-110' : 'border-transparent'"
                :title="c" />
              <select v-model="wbWidth" class="bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 px-1 py-0.5">
                <option :value="2">細</option>
                <option :value="4">中</option>
                <option :value="8">太</option>
              </select>
              <button @click="wbUndo" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition" title="戻す"><Icon name="lucide:undo-2" class="w-3.5 h-3.5" /></button>
              <button @click="wbClear" class="px-2.5 py-1 rounded bg-red-900/40 hover:bg-red-900/70 text-xs text-red-300 transition">クリア</button>
              <button @click="toggleWhiteboard" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition">閉じる</button>
            </div>
          </div>
          <canvas
            ref="wbCanvas"
            class="flex-1 w-full touch-none cursor-crosshair"
            @pointerdown="onWbDown"
            @pointermove="onWbMove"
            @pointerup="onWbUp"
            @pointercancel="onWbUp"
          />
        </div>

        <!-- control panel -->
        <div class="shrink-0 px-4 py-4 flex items-center justify-center gap-3 border-t border-slate-800/60 relative">
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
          <button @click="toggleWhiteboard" class="ctrl-btn" :class="whiteboardOpen ? 'ctrl-active' : 'ctrl-ghost'" title="ホワイトボード">
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
        <div v-if="inviteOpen" class="absolute inset-0 z-[3] bg-black/60 flex items-center justify-center" @click.self="inviteOpen = false">
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

    <!-- hidden audio outputs -->
    <template v-if="callOpen">
      <audio v-for="(stream, uid) in remoteStreams" :key="uid" :srcObject="stream" :muted="speakerMuted" autoplay playsinline class="hidden" />
    </template>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

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