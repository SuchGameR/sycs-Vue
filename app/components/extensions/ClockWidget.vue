<script setup lang="ts">
const CLOCK_MODE_KEY = 'sycs:clock-mode'
const CLOCK_ACCENT_KEY = 'sycs:clock-accent'
type ClockMode = 'digital' | 'analog'
type Theme = 'dark' | 'light'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const mode = ref<ClockMode>('digital')
const theme = ref<Theme>('dark')
const accent = ref('#8b5cf6')
const accentOpen = ref(false)

const ACCENTS = [
  '#8b5cf6', '#6366f1', '#0ea5e9', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899',
]

onMounted(async () => {
  if (import.meta.client) {
    const saved = localStorage.getItem(CLOCK_MODE_KEY)
    if (saved === 'digital' || saved === 'analog') mode.value = saved
    const savedAccent = localStorage.getItem(CLOCK_ACCENT_KEY)
    if (savedAccent && /^#[0-9a-fA-F]{6}$/.test(savedAccent)) accent.value = savedAccent
  }
  try {
    const me = await $fetch<{ user: any }>('/api/auth/me')
    const s = JSON.parse(me.user?.settings || '{}')
    if (s.theme === 'light' || s.theme === 'dark') theme.value = s.theme
  } catch { /* 未ログイン時はダークのまま */ }
  timer = setInterval(() => { now.value = new Date() }, 200)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

function toggleMode() {
  mode.value = mode.value === 'digital' ? 'analog' : 'digital'
  if (import.meta.client) localStorage.setItem(CLOCK_MODE_KEY, mode.value)
}

function setAccent(color: string) {
  accent.value = color
  if (import.meta.client) localStorage.setItem(CLOCK_ACCENT_KEY, color)
  accentOpen.value = false
}

const pad = (n: number) => String(n).padStart(2, '0')
const hm = computed(() => `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}`)
const ss = computed(() => pad(now.value.getSeconds()))
const date = computed(() =>
  now.value.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
)
const dayNumber = computed(() => now.value.getDate())

const seconds = computed(() => now.value.getSeconds() + now.value.getMilliseconds() / 1000)
const minutes = computed(() => now.value.getMinutes() + seconds.value / 60)
const hours = computed(() => (now.value.getHours() % 12) + minutes.value / 60)

const hourAngle = computed(() => hours.value * 30)
const minuteAngle = computed(() => minutes.value * 6)
const secondAngle = computed(() => seconds.value * 6)
const sub24Angle = computed(() => now.value.getHours() * 15)

const hours12 = Array.from({ length: 12 }, (_, i) => i)
const minutes60 = Array.from({ length: 60 }, (_, i) => i)
const fifths300 = Array.from({ length: 300 }, (_, i) => i)
const subTicks24 = Array.from({ length: 12 }, (_, i) => ({ i, major: true }))
const subTicks60 = Array.from({ length: 60 }, (_, i) => ({ i, major: i % 5 === 0 }))

// --- ウィンドウサイズに合わせて時計全体を拡大縮小 ---
const rootRef = ref<HTMLElement | null>(null)
const avail = ref({ w: 0, h: 0 })
let ro: ResizeObserver | null = null

const scale = computed(() => {
  const BW = mode.value === 'analog' ? 150 : 170
  const BH = mode.value === 'analog' ? 175 : 115
  if (avail.value.w <= 0 || avail.value.h <= 0) return 1
  return Math.min(avail.value.w / BW, avail.value.h / BH, 1.6)
})

onMounted(() => {
  if (rootRef.value && import.meta.client) {
    ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      avail.value = { w: r.width, h: r.height }
    })
    ro.observe(rootRef.value)
  }
})
onUnmounted(() => { ro?.disconnect() })
</script>

<template>
  <div
    ref="rootRef"
    class="clock-widget h-full w-full flex items-center justify-center overflow-hidden"
    :class="theme"
    :style="{ '--accent-color': accent }"
  >
    <div class="scale-box flex flex-col items-center" :style="{ transform: `scale(${scale})` }">

      <!-- デジタル時計 -->
      <div v-if="mode === 'digital'" class="clock-digital">
        <p class="d-time">
          <span class="t-hm">{{ hm }}</span><span class="t-sec">:{{ ss }}</span>
        </p>
        <p class="d-date">{{ date }}</p>
      </div>

      <!-- アナログ時計 -->
      <div v-else class="analog-clock">
        <div class="clock-face">
          <!-- 目盛り -->
          <span
            v-for="i in hours12" :key="'h' + i"
            class="clock-index hour"
            :style="{ '--i': i }"
          />
          <span
            v-for="i in minutes60" :key="'m' + i"
            class="clock-index minute"
            :style="{ '--i': i }"
          />
          <span
            v-for="i in fifths300" :key="'f' + i"
            class="clock-index fifth"
            :style="{ '--i': i }"
          />

          <!-- サブダイヤル 左（24時間 / AM・PM） -->
          <div class="sub-dial sub-9">
            <span class="sub9-caption cap-top">24</span>
            <span class="sub9-caption cap-bottom">12</span>
            <span class="sub9-caption cap-left">A</span>
            <span class="sub9-caption cap-right">P</span>
            <span
              v-for="t in subTicks24" :key="'t24' + t.i"
              class="sub-index major"
              :style="{ '--i': t.i, '--sa': '30deg' }"
            />
            <span
              class="sub-hand"
              :style="{ '--sub-angle': `${sub24Angle}deg` }"
            />
            <span class="sub-center-dot" />
          </div>

          <!-- サブダイヤル 右（秒） -->
          <div class="sub-dial sub-3">
            <span
              v-for="t in subTicks60" :key="'t60' + t.i"
              class="sub-index"
              :class="{ major: t.major }"
              :style="{ '--i': t.i, '--sa': '6deg' }"
            />
            <span
              class="sub-hand"
              :style="{ '--sub-angle': `${secondAngle}deg` }"
            />
            <span class="sub-center-dot" />
          </div>

          <!-- サブダイヤル 下（分） -->
          <div class="sub-dial sub-6">
            <span
              v-for="t in subTicks60" :key="'t6' + t.i"
              class="sub-index"
              :class="{ major: t.major }"
              :style="{ '--i': t.i, '--sa': '6deg' }"
            />
            <span
              class="sub-hand"
              :style="{ '--sub-angle': `${minuteAngle}deg` }"
            />
            <span class="sub-center-dot" />
          </div>

          <!-- 日付窓 -->
          <div class="date-window"><span>{{ dayNumber }}</span></div>

          <!-- 針 -->
          <span class="hand hour-hand" :style="{ transform: `rotate(${hourAngle}deg)` }" />
          <span class="hand minute-hand" :style="{ transform: `rotate(${minuteAngle}deg)` }" />
          <span class="hand second-hand" :style="{ transform: `rotate(${secondAngle}deg)` }" />
          <span class="center-dot" />
        </div>
      </div>

      <!-- コントロール -->
      <div class="clock-controls">
        <div class="switch-label">
          <span class="mode-text">{{ mode === 'analog' ? 'アナログ' : 'デジタル' }}</span>
          <label class="switch">
            <input type="checkbox" :checked="mode === 'analog'" @change="toggleMode" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="accent-picker">
          <button
            type="button"
            class="accent-dot"
            :style="{ background: accent }"
            :title="accentOpen ? '閉じる' : 'イメージカラーを選択'"
            @click.stop="accentOpen = !accentOpen"
          />
          <div v-if="accentOpen" class="accent-pop">
            <button
              v-for="c in ACCENTS" :key="c"
              type="button"
              class="accent-opt" :class="{ active: accent === c }"
              :style="{ background: c }"
              @click.stop="setAccent(c)"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ===== テーマ変数 ===== */
.clock-widget {
  --clock-bg: #0f1521;
  --clock-border: #26304a;
  --clock-index-color: #64748b;
  --clock-index-small-color: #2b3650;
  --clock-subdial-bg: #151d2b;
  --clock-subdial-border: #2a3550;
  --clock-hand-color: #e2e8f0;
  --clock-sub-index-color: #475569;
  --date-window-bg: #1e293b;
  --date-window-border: #334155;
  --surface-border: #334155;
  --text-secondary: #94a3b8;
  --input-bg: #1e293b;
  --toggle-knob-bg: #e2e8f0;
  font-family: inherit;
}

.clock-widget.light {
  --clock-bg: #f8fafc;
  --clock-border: #dbe2ec;
  --clock-index-color: #475569;
  --clock-index-small-color: #cbd5e1;
  --clock-subdial-bg: #eef2f8;
  --clock-subdial-border: #d3dce8;
  --clock-hand-color: #1e293b;
  --clock-sub-index-color: #64748b;
  --date-window-bg: #e9eef6;
  --date-window-border: #c3cdda;
  --surface-border: #cbd5e1;
  --text-secondary: #64748b;
  --input-bg: #e2e8f0;
  --toggle-knob-bg: #ffffff;
}

/* ===== デジタル ===== */
.clock-digital {
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.d-time {
  font-weight: 800;
  font-size: 32px;
  line-height: 1.1;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--clock-hand-color);
}

.t-sec {
  color: var(--accent-color);
  font-size: 24px;
}

.d-date {
  font-size: 11px;
  color: var(--text-secondary);
}

/* ===== アナログ ===== */
.analog-clock {
  width: 140px;
  height: 140px;
  position: relative;
  background: var(--clock-bg);
  border-radius: 50%;
  border: 6px solid var(--clock-border);
  box-shadow:
    inset 0 0 18px rgba(0, 0, 0, 0.35),
    0 8px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.clock-face {
  width: 100%;
  height: 100%;
  position: relative;
}

.clock-index {
  position: absolute;
  left: 50%;
  top: 0;
  transform-origin: 50% 70px;
  z-index: 2;
  border-radius: 2px;
}

.clock-index.hour {
  width: 3px;
  height: 12px;
  background: var(--accent-color);
  margin-left: -1.5px;
  transform: rotate(calc(var(--i) * 30deg));
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 85%, transparent);
}

.clock-index.minute {
  width: 1px;
  height: 6px;
  background: var(--clock-index-color);
  margin-left: -0.5px;
  transform: rotate(calc(var(--i) * 6deg));
}

.clock-index.fifth {
  width: 0.5px;
  height: 3px;
  background: var(--clock-index-small-color);
  margin-left: -0.25px;
  transform: rotate(calc(var(--i) * 1.2deg));
}

/* ---- サブダイヤル ---- */
.sub-dial {
  position: absolute;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--clock-subdial-bg);
  border: 1px solid var(--clock-subdial-border);
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box !important;
}

.sub-9 { top: 50%; left: 24%; transform: translate(-50%, -50%); }
.sub-3 { top: 50%; right: 24%; transform: translate(50%, -50%); }
.sub-6 { top: 76%; left: 50%; transform: translate(-50%, -50%); }

.sub-index {
  position: absolute;
  left: calc(50% - 0.5px);
  top: 4px;
  width: 1px;
  height: 3px;
  background: var(--clock-sub-index-color);
  transform-origin: 0.5px 13px;
  transform: rotate(calc(var(--i) * var(--sa)));
}

.sub-index.major {
  left: calc(50% - 0.75px);
  top: 2px;
  width: 1.5px;
  height: 5px;
  background: var(--accent-color);
  transform-origin: 0.75px 15px;
}

.sub-hand {
  position: absolute;
  top: 5px;
  left: calc(50% - 0.75px);
  width: 1.5px;
  height: 12px;
  background: var(--clock-hand-color);
  transform-origin: 0.75px 11px;
  transform: rotate(var(--sub-angle, 0deg));
  z-index: 5;
  border-radius: 1px;
  box-shadow: 0 0 5px color-mix(in srgb, var(--accent-color) 45%, transparent);
}

.sub-center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: var(--surface-border);
  border: 1px solid var(--accent-color);
  border-radius: 50%;
  z-index: 10;
}

.sub9-caption {
  position: absolute;
  font-size: 6px;
  font-weight: 700;
  color: color-mix(in srgb, var(--accent-color) 70%, transparent);
  pointer-events: none;
  z-index: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cap-top    { top: 1px; left: 50%; transform: translateX(-50%); }
.cap-bottom { bottom: 1px; left: 50%; transform: translateX(-50%); }
.cap-left   { left: -2px; top: 50%; transform: translateY(-50%); }
.cap-right  { right: -2px; top: 50%; transform: translateY(-50%); }

/* ---- 日付窓 ---- */
.date-window {
  position: absolute;
  top: 73%;
  right: 18%;
  width: 14px;
  height: 14px;
  margin-top: -7px;
  background: var(--date-window-bg);
  border: 1px solid var(--date-window-border);
  font-size: 8px;
  font-weight: 700;
  color: var(--clock-hand-color);
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotate(45deg);
}

.date-window span {
  transform: rotate(-45deg);
}

/* ---- 針 ---- */
.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom center;
  border-radius: 10px;
  z-index: 5;
}

.hour-hand {
  width: 5px;
  height: 34px;
  background: transparent;
  border: 2px solid var(--clock-hand-color);
  margin-left: -2.5px;
  box-sizing: border-box;
}

.minute-hand {
  width: 4px;
  height: 48px;
  background: transparent;
  border: 2px solid var(--clock-hand-color);
  margin-left: -2px;
  box-sizing: border-box;
}

.second-hand {
  width: 1.5px;
  height: 56px;
  background: var(--accent-color);
  margin-left: -0.75px;
  z-index: 6;
  box-shadow: 0 0 6px color-mix(in srgb, var(--accent-color) 80%, transparent);
}

.center-dot {
  width: 6px;
  height: 6px;
  background: var(--clock-bg);
  border: 1.5px solid var(--accent-color);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

/* ===== コントロール ===== */
.clock-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 4px;
  width: 140px;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 30px;
  height: 18px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--input-bg);
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
  background-color: var(--toggle-knob-bg);
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent-color);
}

input:checked + .slider:before {
  transform: translateX(12px);
}

/* ---- イメージカラーピッカー ---- */
.accent-picker {
  position: relative;
  display: flex;
  align-items: center;
}

.accent-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--surface-border);
  cursor: pointer;
  box-shadow: 0 0 6px color-mix(in srgb, var(--accent-color) 60%, transparent);
}

.accent-pop {
  position: absolute;
  bottom: calc(100% + 8px);
  right: -20px;
  z-index: 30;
  display: flex;
  gap: 6px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  background: var(--clock-bg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.accent-opt {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.15s;
}

.accent-opt:hover { transform: scale(1.25); }
.accent-opt.active { border-color: var(--toggle-knob-bg); box-shadow: 0 0 0 2px var(--accent-color); }
</style>