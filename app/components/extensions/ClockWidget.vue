<script setup lang="ts">
const clock_type_key = 'sycs_clock_type'
const CLOCK_ACCENT_KEY = 'sycs:clock-accent'
type ClockMode = 'digital' | 'analog'
type Theme = 'dark' | 'light'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const mode = ref<ClockMode>('analog')
const theme = ref<Theme>('dark')
const accent = ref('#8b5cf6')
const accentOpen = ref(false)

const ACCENTS = [
  '#8b5cf6', '#6366f1', '#0ea5e9', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899',
]

onMounted(async () => {
  if (import.meta.client) {
    const savedType = localStorage.getItem(clock_type_key)
    if (savedType === 'digital' || savedType === 'analog') mode.value = savedType
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
onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (ro) ro.disconnect()
})

const widgetRef = ref<HTMLElement | null>(null)
const scaleFactor = ref(1.0)
let ro: ResizeObserver | null = null

onMounted(() => {
  ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width === 0 || height === 0) continue
      const targetH = accentOpen.value ? 215 : (mode.value === 'analog' ? 195 : 100)
      const s = Math.min(width / 155, height / targetH)
      scaleFactor.value = Math.min(Math.max(s, 0.5), 3.0)
    }
  })
  if (widgetRef.value) ro.observe(widgetRef.value)
})

function toggleMode() {
  mode.value = mode.value === 'digital' ? 'analog' : 'digital'
  if (!import.meta.client) return
  localStorage.setItem(clock_type_key, mode.value === 'digital' ? 'digital' : 'analog')
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

const rawSeconds = computed(() => now.value.getSeconds() + now.value.getMilliseconds() / 1000)
const rawMinutes = computed(() => now.value.getMinutes() + rawSeconds.value / 60)
const rawHours = computed(() => now.value.getHours() + rawMinutes.value / 60)

// 針
const secDeg = computed(() => (Math.floor(rawSeconds.value * 5) / 5) * 6)
const minDeg = computed(() => rawMinutes.value * 6)
const hourDeg = computed(() => (rawHours.value % 12) * 30)
// サブダイヤル 左（24時間）
const sub9Deg = computed(() => (Math.floor(rawHours.value) / 24) * 360)
// サブダイヤル 右（曜日）
const sub3Deg = computed(() => (now.value.getDay() / 7) * 360)
// サブダイヤル 下（秒）
const sub6Deg = computed(() => Math.floor(rawSeconds.value) * 6)

// 目盛り（参考実装どおり i は 1 始まり・5 の倍数はスキップ）
const hourIndices = Array.from({ length: 12 }, (_, k) => k + 1)
const minuteIndices = Array.from({ length: 60 }, (_, k) => k + 1).filter(k => k % 5 !== 0)
const fifthIndices = Array.from({ length: 300 }, (_, k) => k + 1).filter(k => k % 5 !== 0)
const sub9Indices = Array.from({ length: 12 }, (_, i) => ({ i, major: i % 6 === 0 }))
const sub3Indices = Array.from({ length: 7 }, (_, i) => ({ i, major: true }))
const sub6Indices = Array.from({ length: 12 }, (_, i) => ({ i, major: i % 3 === 0 }))
</script>

<template>
  <div
    ref="widgetRef"
    class="clock-widget h-full w-full flex items-center justify-center overflow-hidden"
    :class="theme"
    :style="{ '--accent-color': accent, '--scale-factor': scaleFactor }"
  >
    <div class="scale-box flex flex-col items-center" :style="{ '--s-h': accentOpen ? '215' : (mode === 'analog' ? '195' : '100') }">

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
            v-for="v in hourIndices" :key="'h' + v"
            class="clock-index hour"
            :style="{ '--i': v }"
          />
          <span
            v-for="v in minuteIndices" :key="'m' + v"
            class="clock-index minute"
            :style="{ '--i': v }"
          />
          <span
            v-for="v in fifthIndices" :key="'f' + v"
            class="clock-index fifth"
            :style="{ '--i': v }"
          />

          <!-- ロゴプレート -->
          <!-- <span class="clock-logo">{{ 'SYCS' }}</span> -->
          <span class="clock-logo"></span>

          <!-- サブダイヤル 左（24時間） -->
          <div class="sub-dial sub-9">
            <span
              v-for="t in sub9Indices" :key="'t24' + t.i"
              class="sub-index" :class="{ major: t.major }"
              :style="{ '--si': t.i, '--sa': '30deg' }"
            />
            <span class="sub-hand" :style="{ '--sub-angle': `${sub9Deg}deg` }" />
            <span class="sub-center-dot" />
            <span class="sub-label">24h</span>
          </div>

          <!-- サブダイヤル 右（曜日） -->
          <div class="sub-dial sub-3">
            <span
              v-for="t in sub3Indices" :key="'t7' + t.i"
              class="sub-index major"
              :style="{ '--si': t.i, '--sa': (360 / 7) + 'deg' }"
            />
            <span class="sub-hand" :style="{ '--sub-angle': `${sub3Deg}deg` }" />
            <span class="sub-center-dot" />
            <span class="sub-label">日</span>
          </div>

          <!-- サブダイヤル 下（秒） -->
          <div class="sub-dial sub-6">
            <span
              v-for="t in sub6Indices" :key="'t60' + t.i"
              class="sub-index" :class="{ major: t.major }"
              :style="{ '--si': t.i, '--sa': '30deg' }"
            />
            <span class="sub-hand" :style="{ '--sub-angle': `${sub6Deg}deg` }" />
            <span class="sub-center-dot" />
            <span class="sub-label">秒</span>
          </div>

          <!-- AM / PM -->
          <span class="sub-indi1">A</span>
          <span class="sub-indi2">P</span>

          <!-- 日付窓 -->
          <div class="date-window"><span>{{ dayNumber }}</span></div>

          <!-- 針 -->
          <span class="hand hour-hand" :style="{ transform: `rotate(${hourDeg}deg)` }" />
          <span class="hand minute-hand" :style="{ transform: `rotate(${minDeg}deg)` }" />
          <span class="hand second-hand" :style="{ transform: `rotate(${secDeg}deg)` }" />
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
  container-type: size;
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
  --clock-logo-bg: #1e293b;
  --clock-logo-text: #8ba3c7;
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
  --clock-logo-bg: #e2e9f2;
  --clock-logo-text: #5b6b82;
}

/* ===== スケーリング（ウィンドウに常にフィット） ===== */
.scale-box {
  --s: var(--scale-factor, 1);
  zoom: var(--s);
}
@supports not (zoom: 1) {
  .scale-box {
    transform: scale(var(--s));
    transform-origin: center;
  }
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
  transform-origin: 50% 64px;
  z-index: 2;
  border-radius: 2px;
}

.clock-index.hour {
  width: 3px;
  height: 12px;
  background: var(--accent-color);
  margin-left: -1.5px;
  transform: rotate(calc(var(--i) * 30deg));
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 80%, transparent);
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

.sub-9 { top: 50%; left: 25%; transform: translate(-50%, -50%); }
.sub-3 { top: 50%; right: 25%; transform: translate(50%, -50%); }
.sub-6 { top: 75%; left: 50%; transform: translate(-50%, -50%); }

.sub-index {
  position: absolute;
  left: calc(50% - 0.5px);
  top: 2px;
  width: 1px;
  height: 3px;
  background: var(--clock-sub-index-color);
  transform-origin: 0.5px 14px;
  transform: rotate(calc(var(--si) * var(--sa)));
}

.sub-index.major {
  width: 1px;
  left: calc(50% - 0.75px);
  height: 5px;
  background: var(--accent-color);
  transform-origin: 0.75px 14px;
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
  box-shadow: 0 0 5px color-mix(in srgb, var(--accent-color) 40%, transparent);
}

.sub-label {
  position: absolute;
  top: 58%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 5px;
  font-weight: 700;
  color: color-mix(in srgb, var(--accent-color) 60%, transparent);
  pointer-events: none;
  z-index: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sub-indi1,
.sub-indi2 {
  position: absolute;
  top: 52%;
  transform: translate(-50%, -50%);
  font-size: 6px;
  font-weight: 700;
  color: color-mix(in srgb, var(--accent-color) 55%, transparent);
  pointer-events: none;
  z-index: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sub-indi1 { left: 17%; transform: translateY(-6.5px); }
.sub-indi2 { right: 66%; transform: translateY(-6.5px);}

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

/* ---- ロゴプレート ---- */
.clock-logo {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 18px;
  opacity: 0.8;
  background-color: var(--clock-logo-bg);
  background-image: url(../../../public/svgLogoOutline.svg);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 35%;
  
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--clock-logo-text);
}

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
  background: var(--clock-hand-color);
  margin-left: -0.75px;
  z-index: 6;
}

.center-dot {
  width: 6px;
  height: 6px;
  background: var(--clock-bg);
  border: 1.5px solid var(--clock-hand-color);
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
  gap: 10px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
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
  height: 14px;
  width: 14px;
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
  transform: translateX(14px);
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
  bottom: calc(100% + 6px);
  right: -12px;
  z-index: 30;
  display: flex;
  gap: 4px;
  padding: 6px;
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
.accent-opt.active { border-color: var(--toggle-knob-bg); }
</style>