<script setup lang="ts">
const CLOCK_MODE_KEY = 'sycs:clock-mode'
type ClockMode = 'digital' | 'analog'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const mode = ref<ClockMode>('digital')
onMounted(() => {
  const saved = localStorage.getItem(CLOCK_MODE_KEY)
  if (saved === 'digital' || saved === 'analog') mode.value = saved
  timer = setInterval(() => { now.value = new Date() }, 200)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

function toggleMode() {
  mode.value = mode.value === 'digital' ? 'analog' : 'digital'
  localStorage.setItem(CLOCK_MODE_KEY, mode.value)
}

const time = computed(() =>
  now.value.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
)
const date = computed(() =>
  now.value.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
)

const weekdayEN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const seconds = computed(() => now.value.getSeconds() + now.value.getMilliseconds() / 1000)
const minutes = computed(() => now.value.getMinutes() + seconds.value / 60)
const hours = computed(() => (now.value.getHours() % 12) + minutes.value / 60)

const hourAngle = computed(() => hours.value * 30)
const minuteAngle = computed(() => minutes.value * 6)
const secondAngle = computed(() => seconds.value * 6)

const night = computed(() => now.value.getHours() >= 19 || now.value.getHours() < 6)

const dayNumber = computed(() => String(now.value.getDate()).padStart(2, '0'))
const weekdayText = computed(() => weekdayEN[now.value.getDay()])

interface TickMark { x1: number; y1: number; x2: number; y2: number; major: boolean }
const ticks: TickMark[] = Array.from({ length: 60 }, (_, i) => {
  const angle = (i / 60) * 2 * Math.PI
  const major = i % 5 === 0
  const rIn = major ? 175 : 184
  const rOut = 195
  return {
    x1: Math.sin(angle) * rIn,
    y1: -Math.cos(angle) * rIn,
    x2: Math.sin(angle) * rOut,
    y2: -Math.cos(angle) * rOut,
    major,
  }
})

interface HourLabel { x: number; y: number; n: number }
const hourLabels: HourLabel[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  const angle = (n / 12) * 2 * Math.PI
  return {
    x: Math.sin(angle) * 150,
    y: -Math.cos(angle) * 150,
    n,
  }
})
</script>

<template>
  <div class="relative h-full w-full">
    <button
      type="button"
      @click.stop="toggleMode"
      class="w-8 aspect-square absolute top-2 right-2 z-10 p-1.5 rounded-md bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-700 transition"
      :title="mode === 'digital' ? 'アナログ時計に切り替え' : 'デジタル時計に切り替え'"
    >
      <Icon :name="mode === 'digital' ? 'lucide:timer' : 'lucide:clock'" class="w-3.5 h-3.5" />
    </button>

    <div v-if="mode === 'digital'" class="h-full flex flex-col items-center justify-center gap-1 px-4 text-center">
      <p class="text-3xl font-extrabold tracking-tight text-white tabular-nums">{{ time }}</p>
      <p class="text-xs text-slate-400">{{ date }}</p>
    </div>

    <div
      v-else
      class="h-full w-full flex items-center justify-center p-2 rounded-xl clock-bg transition-all duration-1000"
      :class="night ? 'night-clock' : 'day-clock'"
    >
      <svg viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" class="w-full h-full max-w-full max-h-full">
        <g :transform="`translate(260 260)`">
          <circle r="200" class="main-dial" />

          <g class="ticks">
            <line
              v-for="(t, i) in ticks"
              :key="i"
              :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
              :class="t.major ? 'major' : 'minor'"
            />
          </g>

          <g>
            <text
              v-for="(l, i) in hourLabels"
              :key="i"
              :x="l.x" :y="l.y"
              class="label"
            >{{ l.n }}</text>
          </g>

          <g :transform="`translate(125 0)`">
            <rect x="-17.5" y="-15" width="35" height="30" class="date-window"></rect>
            <text id="dateWindowText" x="0" y="2" class="date-text">{{ dayNumber }}</text>
          </g>

          <g :transform="`translate(70 0)`">
            <rect x="-30" y="-15" width="60" height="30" class="date-window"></rect>
            <text id="weekdayWindowText" x="0" y="2" class="date-text date-text-sm">{{ weekdayText }}</text>
          </g>

          <g id="hands">
            <g :transform="`rotate(${hourAngle})`">
              <line x1="0" y1="14" x2="0" y2="-100" :class="['hand', 'hour', night ? 'night-glow' : '']" />
            </g>
            <g :transform="`rotate(${minuteAngle})`">
              <line x1="0" y1="20" x2="0" y2="-160" :class="['hand', 'minute', night ? 'night-glow' : '']" />
            </g>
            <g :transform="`rotate(${secondAngle})`">
              <line x1="0" y1="24" x2="0" y2="-160" :class="['hand', 'second', night ? 'night-glow' : '']" />
            </g>
          </g>

          <circle r="6" class="hub"></circle>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.clock-bg {
  background-blend-mode: overlay;
}

.day-clock {
  background-image:
    radial-gradient(circle, #24323a, #1e81ce 70%),
    repeating-linear-gradient(45deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px,
      transparent 5px),
    repeating-linear-gradient(-45deg,
      rgba(0, 0, 0, 0.02),
      rgba(0, 0, 0, 0.02) 1px,
      transparent 1px,
      transparent 5px);
}

.night-clock {
  background-image:
    radial-gradient(circle, #0b1820, #162f5d 70%),
    repeating-linear-gradient(45deg,
      rgba(255, 255, 255, 0.02),
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px,
      transparent 5px),
    repeating-linear-gradient(-45deg,
      rgba(0, 0, 0, 0.02),
      rgba(0, 0, 0, 0.02) 1px,
      transparent 1px,
      transparent 5px);
}

.main-dial {
  fill: none;
  stroke: rgba(255, 255, 255, 0.07);
  stroke-width: 40;
}

.ticks line {
  stroke: #cfe7ef;
  stroke-opacity: 0.95;
}

.ticks .minor {
  stroke-opacity: 0.45;
  stroke-width: 2;
}

.ticks .major {
  stroke-width: 3;
}

.label {
  font-size: 25px;
  fill: #dff4f8;
  text-anchor: middle;
  dominant-baseline: middle;
}

.hand {
  stroke-linecap: round;
}

.hour {
  stroke: #e9e9ea;
  stroke-width: 7;
}

.minute {
  stroke: #e9e9ea;
  stroke-width: 5;
}

.second {
  stroke: #8ade4f;
  stroke-width: 4;
}

.hub {
  fill: #fff;
}

.date-window {
  fill: #293f8875;
  stroke-width: 1.5;
  rx: 6;
  ry: 6;
}

.date-text {
  font-size: 22px;
  fill: #fff;
  text-anchor: middle;
  dominant-baseline: middle;
  font-weight: bold;
}

.date-text-sm {
  font-size: 18px;
}

.night-glow {
  stroke: #8ade4f;
  fill: #8ade4f;
  filter: drop-shadow(0 0 6px #8ade4f) drop-shadow(0 0 12px #8ade4f);
}
</style>