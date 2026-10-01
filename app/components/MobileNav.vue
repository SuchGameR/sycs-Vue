<script setup lang="ts">
const route = useRoute()
const { activityUnread, dmUnread, dmLatest } = useUnread()
const { data: me } = useFetch('/api/auth/me', { key: 'mobilenav-me' })

/** Mobile always uses the pill; on desktop it only wins when the user picked it. */
const { desktopNav, hydrate: hydrateNav } = useNavLayout()
onMounted(hydrateNav)

/**
 * Shrinks out of the way while the page is scrolled (see useScrollCompact).
 * A `scale` on this wrapper -- not on the rail -- keeps the plate and the links
 * inside one transformed space, so the swipe maths above stays exact.
 */
const { compact: scrollCompact } = useScrollCompact()

type Item = { key: string; to: string; icon: string; match: (p: string) => boolean }

const items = computed<Item[]>(() => {
  const u = me.value?.user
  const uid = u?.id
  const uname = u?.username
  return [
    { key: 'home', to: '/home', icon: 'lucide:house', match: p => p === '/home' || p === '/' },
    { key: 'social', to: '/social', icon: 'lucide:users-round', match: p => p.startsWith('/social') },
    { key: 'search', to: '/search', icon: 'lucide:search', match: p => p.startsWith('/search') || p.startsWith('/hashtag') },
    { key: 'actions', to: '/actions', icon: 'lucide:heart', match: p => p.startsWith('/actions') || p.startsWith('/notifications') },
    uid
      ? {
          key: 'me',
          to: uname ? `/profile/@${uname}` : `/profile/${uid}`,
          icon: 'lucide:user-round',
          // Match on the slug the link actually points at. The old check compared
          // the tail of the path against the user ID while `to` is built from the
          // username, so the profile tab never lit up.
          match: p => p.startsWith('/profile/') && !!uname && p.endsWith(uname),
        }
      : { key: 'signin', to: '/signin', icon: 'lucide:log-in', match: p => p.startsWith('/signin') },
  ]
})

const activeIndex = computed(() => {
  const p = route.path
  const i = items.value.findIndex(it => it.match(p))
  return i === -1 ? -1 : i
})

function badgeFor(key: string) {
  if (key === 'social') return dmUnread.value
  if (key === 'actions') return activityUnread.value
  return 0
}

/* ==========================================================================
   Geometry
   --------------------------------------------------------------------------
   The highlight plate is positioned from the DOM, because the rail also has to
   resolve a pointer position back to an item index for the swipe gesture.

   `measure()` is the accurate path, but it can only run once the rail has laid
   out. Until then (first paint, SSR, a font swap) the highlight would have
   nothing to draw and the user would have no idea where they are, so there is
   also an ANALYTIC fallback that mirrors the rail's box model exactly. Item
   slots are fixed, so the arithmetic is exact rather than approximate; the DOM
   measurement then only corrects for anything that would invalidate it.

   Keep these in sync with the rail/link classes below.
   ========================================================================== */
const ITEM = 44      // w-11 h-11
const GAP = 4        // gap-1
const RAIL_PAD = 8   // px-2
const V_PAD = 6      // py-1.5
const RAIL_H = ITEM + V_PAD * 2

const railRef = ref<HTMLElement | null>(null)

/** { centerX relative to the rail's left edge, width } per item. */
const metrics = ref<{ cx: number; w: number }[]>([])

const count = computed(() => items.value.length)

/** Always-length geometry, used before/without measurement. */
function analyticMetrics(n: number): { cx: number; w: number }[] {
  const out: { cx: number; w: number }[] = []
  for (let i = 0; i < n; i++) {
    const left = RAIL_PAD + i * (ITEM + GAP)
    out.push({ cx: left + ITEM / 2, w: ITEM })
  }
  return out
}

/**
 * Read the real slot geometry from the rendered <a> children.
 *
 * Deliberately queries the DOM instead of collecting `:ref` values: a `:ref`
 * on a NuxtLink hands back the *component* instance, and unwrapping `$el` for
 * it is fragile. If that ever silently yields nothing then `metrics` stays
 * empty, which disables BOTH the plate and the swipe at once with no error --
 * exactly the failure this gesture must not have. The analytic fallback above
 * covers that case.
 *
 * Uses `offsetLeft`/`offsetWidth` rather than `getBoundingClientRect`: the nav
 * is scaled down while the page is scrolled, and rects report post-transform
 * pixels while the plate's `translate3d` lives in the unscaled local space.
 * Mixing the two puts the highlight in the wrong slot mid-animation. Offsets
 * ignore transforms entirely, so plate and links stay locked at any scale.
 */
function measure() {
  const rail = railRef.value
  if (!rail) return
  const links = rail.querySelectorAll<HTMLElement>(':scope > a')
  if (!links.length) return
  const next: { cx: number; w: number }[] = []
  for (const el of links) {
    const w = el.offsetWidth
    if (!w) return
    // The rail is `relative`, so the links' offsetParent is the rail itself and
    // offsetLeft is already rail-relative.
    next.push({ cx: el.offsetLeft + w / 2, w })
  }
  metrics.value = next
}

/**
 * Convert a viewport x into the rail's own (unscaled) coordinate space.
 * Needed because the nav may be scaled by the compact-on-scroll transition.
 */
function localXFromClientX(clientX: number): number {
  const rail = railRef.value
  if (!rail) return clientX
  const r = rail.getBoundingClientRect()
  // offsetWidth is the untransformed layout width; the ratio is the live scale.
  const scale = r.width / (rail.offsetWidth || r.width)
  return (clientX - r.left) / (scale || 1)
}

function nearestIndex(cx: number): number {
  const m = metrics.value.length ? metrics.value : analyticMetrics(count.value)
  if (!m.length) return 0
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < m.length; i++) {
    const d = Math.abs(m[i].cx - cx)
    if (d < bestD) { bestD = d; best = i }
  }
  return best
}

/* --- drag state ---------------------------------------------------------- */
const dragFrom = ref(0)      // index the gesture started on
const dragDx = ref(0)        // live pixel offset from the pointer
const armed = ref(false)     // exceeded the slop threshold, so it is a drag
let pointerId: number | null = null
let startX = 0
let startY = 0
let axisLocked: 'none' | 'x' | 'y' = 'none'

/** Index the highlight is currently drawn at (follows the pointer while armed). */
const previewIndex = computed(() => {
  const m = metrics.value.length ? metrics.value : analyticMetrics(count.value)
  if (!m.length) return 0
  if (!armed.value) return Math.min(Math.max(activeIndex.value, 0), m.length - 1)
  const cx = m[dragFrom.value].cx + dragDx.value
  return nearestIndex(cx)
})

/** True when a highlight is meaningful: a matched route, or a live gesture. */
const highlightVisible = computed(() => activeIndex.value !== -1 || armed.value)

const plateStyle = computed(() => {
  const n = count.value
  const m = metrics.value.length ? metrics.value : analyticMetrics(n)
  if (!m.length) return { opacity: '0' }

  const idx = Math.min(Math.max(previewIndex.value, 0), m.length - 1)
  const w = m[idx]?.w ?? ITEM

  let cx = m[idx].cx
  let scale = 1

  if (armed.value) {
    // Follow the pointer 1:1 so the plate feels attached to the cursor rather
    // than chasing it, with rubber-banding past either end so the rail resists
    // instead of stopping dead.
    const from = m[dragFrom.value]
    cx = from.cx + dragDx.value
    const first = m[0].cx
    const last = m[m.length - 1].cx
    const limit = from.w * 0.6
    if (cx < first) cx = first - Math.min(limit, (first - cx) * 0.55)
    if (cx > last) cx = last + Math.min(limit, (cx - last) * 0.55)

    // Grow slightly as it approaches a different slot: the "this is where you'd
    // land" cue.
    scale = 1 + Math.min(1, Math.abs(cx - m[idx].cx) / (w * 0.8)) * 0.12
  }

  return {
    opacity: highlightVisible.value ? '1' : '0',
    width: `${w}px`,
    height: `${w}px`,
    transform: `translate3d(${(cx - w / 2).toFixed(2)}px, 0, 0) scale(${scale.toFixed(3)})`,
    // While dragging the plate must track the pointer with no lag at all; on
    // release it springs to the committed slot.
    transition: armed.value
      ? 'transform 60ms linear, width 120ms ease, height 120ms ease'
      : 'transform 460ms cubic-bezier(0.34, 1.4, 0.5, 1), width 240ms ease, height 240ms ease',
  }
})

/**
 * Release capture defensively.
 *
 * `releasePointerCapture` throws `Invalid pointer id` whenever the capture has
 * already gone away — and it always has by the time `pointerup` runs, because
 * the browser implicitly releases capture when the pointer is lifted or the
 * element is removed. Calling it unconditionally surfaced that DOMException as
 * an uncaught rejection. `hasPointerCapture` is the correct precondition.
 */
function releaseCapture(el: EventTarget | null) {
  if (pointerId === null || !(el instanceof Element)) return
  try {
    if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId)
  } catch { /* capture already gone; nothing to do */ }
}

function onPointerDown(e: PointerEvent) {
  // Only the primary button; a right-click must still open the context menu.
  if (e.pointerType === 'mouse' && e.button !== 0) return
  if (count.value < 2) return
  const m = metrics.value.length ? metrics.value : analyticMetrics(count.value)
  if (!m.length) return
  const base = localXFromClientX(e.clientX)
  const i = nearestIndex(base)
  if (i < 0) return

  pointerId = e.pointerId
  startX = e.clientX
  startY = e.clientY
  axisLocked = 'none'
  armed.value = false
  dragFrom.value = i
  dragDx.value = 0
  // Capture on the rail so the gesture keeps tracking even when the pointer
  // slides off the buttons (it usually does, since they are only 44px apart).
  // Works identically for touch, pen and mouse, which is what makes the swipe
  // usable on a desktop trackpad as well as on a phone.
  try {
    ;(e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
  } catch { /* capture unsupported; the gesture still tracks on the rail */ }
}

function onPointerMove(e: PointerEvent) {
  if (armed.value && pointerId !== null && e.pointerId !== pointerId) return
  if (pointerId === null || e.pointerId !== pointerId) return

  const dx = e.clientX - startX
  const dy = e.clientY - startY

  if (axisLocked === 'none') {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
    axisLocked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (axisLocked === 'x') armed.value = true
  }
  if (axisLocked !== 'x') return

  if (e.cancelable) e.preventDefault()
  dragDx.value = dx
}

function endDrag(e: PointerEvent) {
  if (pointerId === null || e.pointerId !== pointerId) return
  releaseCapture(e.currentTarget)

  const wasDrag = armed.value
  const m = metrics.value.length ? metrics.value : analyticMetrics(count.value)
  const cur = m[dragFrom.value]
  const targetIndex = wasDrag && cur ? nearestIndex(cur.cx + dragDx.value) : dragFrom.value

  armed.value = false
  dragDx.value = 0
  pointerId = null
  axisLocked = 'none'

  // A tap that never passed the slop threshold is an ordinary click: leave it to
  // the link. Anything else was a drag and commits to the nearest slot.
  if (!wasDrag) return

  // Swallow the click the browser synthesises after a drag, otherwise the
  // release ALSO activates the link the gesture started on. Without this the
  // swipe commits to the nearest item and the synthetic click immediately
  // navigates back to the one you pressed, so the item "doesn't change".
  suppressClick.value = true
  setTimeout(() => { suppressClick.value = false }, 350)

  const it = items.value[targetIndex]
  if (it && targetIndex !== activeIndex.value) {
    navigateTo(it.to)
  }
}

function onPointerCancel(e: PointerEvent) {
  if (pointerId === null || e.pointerId !== pointerId) return
  releaseCapture(e.currentTarget)
  armed.value = false
  dragDx.value = 0
  pointerId = null
  axisLocked = 'none'
}

/** Set for one tick after a drag so the trailing click is eaten. */
const suppressClick = ref(false)

function onRailClickCapture(e: MouseEvent) {
  if (suppressClick.value) {
    e.preventDefault()
    e.stopPropagation()
  }
}

// Re-measure whenever the rail's geometry can have changed.
let ro: ResizeObserver | null = null
onMounted(() => {
  measure()
  // Fonts and avatar images land after mount and change item widths.
  nextTick(() => measure())
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => measure())
    if (railRef.value) ro.observe(railRef.value)
  }
  window.addEventListener('resize', measure)
  // Images and links can resolve after mount and nudge the rail.
  railRef.value?.addEventListener('load', measure, true)
})
onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  window.removeEventListener('resize', measure)
})
watch([count, () => me.value?.user?.username], () => nextTick(() => measure()))
</script>

<template>
  <div>
    <!--
      The shrink is a transform on the nav ITSELF, never on this wrapper: a
      transformed ancestor would become the containing block for the nav's
      `position: fixed`, yanking it out of the viewport-relative placement and
      dropping it to wherever this div happens to sit in the flow.
    -->
    <nav
      class="sycs-floatnav fixed inset-x-0 bottom-[calc(var(--app-footer-h)+0.75rem)] min-[681px]:bottom-[calc(var(--app-footer-h)+1.25rem)] z-[70] flex justify-center px-4 origin-bottom transition-transform duration-300 ease-out"
      :class="[
        desktopNav === 'pill' ? '' : 'min-[681px]:hidden',
        scrollCompact && desktopNav === 'pill' ? 'scale-[0.86] -translate-y-1' : 'scale-100',
      ]"
      aria-label="メインナビゲーション"
    >
      <div
        ref="railRef"
        class="sycs-floatnav-rail relative flex items-center gap-1 rounded-[9999px] px-2 py-1.5"
        :class="armed ? 'cursor-grabbing' : 'cursor-pointer'"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="endDrag"
        @pointercancel="onPointerCancel"
        @lostpointercapture="onPointerCancel"
        @click.capture="onRailClickCapture"
      >
        <span
          class="sycs-floatnav-plate pointer-events-none absolute left-0 top-1.5 rounded-[9999px]"
          :style="plateStyle"
          aria-hidden="true"
        />

        <NuxtLink
          v-for="(it, i) in items"
          :key="it.key"
          :to="it.to"
          draggable="false"
          class="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] transition-transform duration-200"
          :class="[
            armed && previewIndex === i ? 'scale-110' : '',
            activeIndex === i ? '' : 'active:scale-90',
          ]"
          :style="{ transitionDuration: armed && previewIndex === i ? '120ms' : undefined }"
          :aria-current="activeIndex === i ? 'page' : undefined"
          :aria-label="it.key"
        >
          <img
            v-if="it.key === 'social' && dmLatest?.avatarUrl"
            :src="avatarSrc(dmLatest.avatarUrl)"
            alt=""
            draggable="false"
            class="h-6 w-6 rounded-full object-cover"
          />
          <img
            v-else-if="it.key === 'me' && me?.user?.avatarUrl"
            :src="avatarSrc(me.user.avatarUrl)"
            alt=""
            draggable="false"
            class="h-6 w-6 rounded-full object-cover ring-1 ring-current/30"
          />
          <Icon v-else :name="it.icon" class="h-[22px] w-[22px]" />

          <span
            v-if="badgeFor(it.key) > 0"
            class="absolute right-1 top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[var(--sycs-floatnav-ring)]"
          >{{ badgeFor(it.key) > 99 ? '99+' : badgeFor(it.key) }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>