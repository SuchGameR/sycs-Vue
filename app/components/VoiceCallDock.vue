<script setup lang="ts">
const voice = useVoiceCall()
const { status, members, muted, remoteStreams, incoming, errorMsg, activeRoom, connectionState } = voice

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

const visible = computed(() => !!incoming.value || status.value === 'active' || status.value === 'connecting')
const roomTitle = computed(() => activeRoom.value?.label || '通話')
const showError = computed(() => !!errorMsg.value && status.value === 'idle')

function dismissError() { errorMsg.value = null }

/* Ringtone */
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
}
function decline() {
  stopRing()
  voice.declineCall()
}
</script>

<template>
  <div>
    <!-- error toast -->
    <Transition name="slide-up">
      <div v-if="showError" class="fixed bottom-20 min-[681px]:bottom-6 right-4 z-[90] bg-red-950/90 border border-red-800/60 rounded-xl px-4 py-3 text-sm text-red-200 flex items-center gap-3 max-w-xs shadow-2xl">
        <Icon name="lucide:phone-missed" class="w-4 h-4 shrink-0" />
        <span class="flex-1">{{ errorMsg }}</span>
        <button @click="dismissError" class="text-red-400 hover:text-white transition shrink-0">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <!-- incoming call -->
    <Transition name="slide-up">
      <div v-if="incoming" class="fixed bottom-20 min-[681px]:bottom-6 right-4 z-[95] w-72 bg-[#151a24] border border-slate-700 rounded-2xl p-4 shadow-2xl">
        <div class="flex items-center gap-3">
          <img v-if="incoming.from.avatarUrl" :src="incoming.from.avatarUrl" class="w-11 h-11 rounded-full object-cover" />
          <div v-else class="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {{ incoming.from.displayName?.charAt(0) || '?' }}
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

    <!-- active call dock -->
    <Transition name="slide-up">
      <div v-if="!incoming && (status === 'active' || status === 'connecting')" class="fixed bottom-20 min-[681px]:bottom-6 right-4 z-[90] w-72 bg-[#151a24] border border-emerald-800/40 rounded-2xl p-3 shadow-2xl">
        <div class="flex items-center gap-2">
          <span class="relative flex w-2.5 h-2.5 shrink-0">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span class="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500" />
          </span>
          <span class="text-sm font-bold text-white truncate flex-1">{{ roomTitle }}</span>
          <span class="text-[11px] text-slate-500 shrink-0">
            {{ status === 'connecting' ? '接続中...' : callTime }}
          </span>
        </div>

        <div v-if="members.length" class="mt-2 flex flex-wrap gap-1.5">
          <div v-for="m in members" :key="m.userId" class="flex items-center gap-1 bg-slate-800/60 rounded-full pl-0.5 pr-2 py-0.5">
            <img v-if="m.avatarUrl" :src="m.avatarUrl" class="w-5 h-5 rounded-full object-cover" />
            <div v-else class="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
              {{ (m.displayName || '?').charAt(0) }}
            </div>
            <span class="text-[11px] text-slate-300 max-w-[90px] truncate">{{ m.displayName }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-3">
          <button @click="voice.toggleMute()" class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition text-sm"
            :class="muted ? 'bg-red-600/20 text-red-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'">
            <Icon :name="muted ? 'lucide:mic-off' : 'lucide:mic'" class="w-4 h-4" />
            {{ muted ? 'ミュート中' : 'ミュート' }}
          </button>
          <button @click="voice.leave()" class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition" title="通話を終了">
            <Icon name="lucide:phone-off" class="w-4 h-4" />
          </button>
        </div>
        <p v-if="connectionState === 'connecting' && status === 'active'" class="text-[10px] text-slate-500 mt-2">音声を接続しています...</p>

        <audio
          v-for="(stream, uid) in remoteStreams"
          :key="uid"
          :srcObject="stream"
          autoplay
          playsinline
          class="hidden"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
</style>
