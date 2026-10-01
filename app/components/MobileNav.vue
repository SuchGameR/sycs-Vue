<script setup lang="ts">
const route = useRoute()
const { activityUnread, dmUnread, dmLatest } = useUnread()
const { data: me } = useFetch('/api/auth/me', { key: 'mobilenav-me' })

type Item = { key: string; to: string; icon: string; match: (p: string) => boolean }

const items = computed<Item[]>(() => {
  const u = me.value?.user
  const uid = u?.id
  const uname = u?.username
  return [
    { key: 'home', to: '/home', icon: 'lucide:house', match: p => p === '/home' || p === '/' },
    { key: 'search', to: '/search', icon: 'lucide:search', match: p => p.startsWith('/search') || p.startsWith('/hashtag') },
    { key: 'social', to: '/social', icon: 'lucide:users-round', match: p => p.startsWith('/social') },
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
   Liquid Glass plate — measured, not calculated
   --------------------------------------------------------------------------
   The plate used to be positioned with `translateX(index * 100%)` and a
   `calc((100% - 1rem) / 5)` width. Two problems with that:

     1. `100%-1rem` is not valid CSS. calc() requires whitespace around the
        binary operator, so the whole declaration was dropped and the plate
        rendered at zero width — the active highlight was invisible.
     2. Even written correctly it ignored the `gap-1` between items, so the
        plate drifted out of alignment as the index grew.

   Instead the real geometry is read from the DOM with getBoundingClientRect.
   That stays correct for any item count, any gap, any safe-area padding, and
   any dynamic item set (the profile tab swaps to a sign-in tab when logged
   out), which is also exactly what the swipe gesture needs to resolve a
   finger position back to an item index.
   ========================================================================== */
const railRef = ref<HTMLElement | null>(null)

/** { centerX relative to the rail's left edge, width } per item. */
const metrics = ref<{ cx: number; w: number }[]>([])
const count = computed(() => items.value.length)

/**
 * Read the real slot geometry from the rendered <a> children.
 *
 * Deliberately queries the DOM instead of collecting `:ref` values: a `:ref`
 * on a NuxtLink hands back the *component* instance, and unwrapping `$el` for
 * it is fragile. If that ever silently yields nothing then `metrics` stays
 * empty, which disables BOTH the plate and the swipe at once with no error --
 * exactly the failure this gesture must not have. A DOM query cannot fail
 * that way.
 */
function measure() {
  const rail = railRef.value
  if (!rail) return
  const links = rail.querySelectorAll<HTMLElement>(':scope > a')
  if (!links.length) return
  const base = rail.getBoundingClientRect().left
  const next: { cx: number; w: number }[] = []
  for (const el of links) {
    const r = el.getBoundingClientRect()
    next.push({ cx: r.left - base + r.width / 2, w: r.width })
  }
  metrics.value = next
}

function nearestIndex(cx: number): number {
  const m = metrics.value
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
const dragDx = ref(0)        // live pixel offset from the finger
const dragging = ref(false)
const armed = ref(false)     // exceeded the slop threshold, so it is a drag
let pointerId: number | null = null
let startX = 0
let startY = 0
let axisLocked: 'none' | 'x' | 'y' = 'none'

const plateStyle = computed(() => {
  const m = metrics.value
  if (!m.length) return { opacity: '0' }
  const idx = Math.min(Math.max(activeIndex.value, 0), m.length - 1)
  const w = m[idx]?.w ?? m[0].w

  let cx = m[idx].cx
  let stretch = 0

  if (armed.value) {
    // Follow the finger 1:1, with rubber-banding past either end so the rail
    // resists instead of stopping dead.
    cx = m[dragFrom.value].cx + dragDx.value
    const first = m[0].cx
    const last = m[m.length - 1].cx
    const limit = m[0].w * 0.55
    if (cx < first) cx = first - Math.min(limit, (first - cx) * 0.55)
    if (cx > last) cx = last + Math.min(limit, (cx - last) * 0.55)

    // The item under the finger lifts; that is the "previews the target" cue.
    const over = nearestIndex(cx)
    const hover = over === dragFrom.value ? 0 : Math.min(1, Math.abs(cx - m[over].cx) / (w * 0.8))
    stretch = 1 + hover * 0.18
  }

  return {
    width: `${w}px`,
    // Width/height read during a gesture must not animate or the plate lags
    // the finger; the position still uses the spring so a release glides home.
    transform: `translate3d(${cx - w / 2}px, 0, 0) scale(${stretch.toFixed(3)})`,
    transition: armed.value
      ? 'transform 140ms cubic-bezier(0.22, 0.61, 0.36, 1), width 140ms ease'
      : 'transform 420ms cubic-bezier(0.32, 0.72, 0, 1), width 260ms ease',
  }
})

function onPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  if (count.value < 2) return
  const m = metrics.value
  const base = railRef.value?.getBoundingClientRect().left ?? 0
  const i = nearestIndex(e.clientX - base)
  if (i < 0) return

  pointerId = e.pointerId
  startX = e.clientX
  startY = e.clientY
  axisLocked = 'none'
  armed.value = false
  dragging.value = true
  dragFrom.value = i
  dragDx.value = 0
  // Capture on the rail so the gesture keeps tracking even when the finger
  // slides off the buttons (it usually does, since they are only 44px apart).
  ;(e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || e.pointerId !== pointerId) return

  const dx = e.clientX - startX
  const dy = e.clientY - startY

  if (axisLocked === 'none') {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
    axisLocked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (axisLocked === 'x') armed.value = true
  }
  if (axisLocked !== 'x') return

  if (e.cancelable) e.preventDefault()
  dragDx.value = dx
}

function endDrag(e: PointerEvent) {
  if (!dragging.value || (pointerId !== null && e.pointerId !== pointerId)) return
  ;(e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId)

  const wasDrag = armed.value
  const m = metrics.value
  const cur = m[dragFrom.value]
  const targetIndex = wasDrag && cur
    ? nearestIndex(cur.cx + dragDx.value)
    : dragFrom.value

  dragging.value = false
  armed.value = false
  dragDx.value = 0
  pointerId = null
  axisLocked = 'none'

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
  if (!dragging.value) return
  ;(e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId)
  dragging.value = false
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
const ro = ref<ResizeObserver | null>(null)
onMounted(() => {
  measure()
  // Fonts and avatar images land after mount and change item widths.
  nextTick(() => measure())
  if (import.meta.client && typeof ResizeObserver !== 'undefined') {
    ro.value = new ResizeObserver(() => measure())
    if (railRef.value) ro.value.observe(railRef.value)
  }
  window.addEventListener('resize', measure)
})
onBeforeUnmount(() => {
  ro.value?.disconnect()
  ro.value = null
  window.removeEventListener('resize', measure)
})
watch([count, () => me.value?.user?.username], () => nextTick(() => measure()))
</script>

<template>
  <div class="min-[681px]:hidden">
    <nav
      class="sycs-floatnav fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
      aria-label="メインナビゲーション"
    >
      <div
        ref="railRef"
        class="sycs-floatnav-rail relative flex items-center gap-1 rounded-[9999px] px-2 py-1.5 touch-pan-y select-none"
        :class="armed ? 'cursor-grabbing' : ''"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="endDrag"
        @pointercancel="onPointerCancel"
        @click.capture="onRailClickCapture"
      >
        <span
          class="sycs-floatnav-plate pointer-events-none absolute left-0 top-1.5 h-[calc(100%-0.75rem)] rounded-[9999px]"
          :style="plateStyle"
          aria-hidden="true"
        />

        <NuxtLink
          v-for="(it, i) in items"
          :key="it.key"
          :to="it.to"
          class="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] transition-transform duration-200 active:scale-90"
          :class="activeIndex === i ? 'text-on-surface' : 'text-on-surface-variant'"
          :aria-current="activeIndex === i ? 'page' : undefined"
          :aria-label="it.key"
        >
          <img
            v-if="it.key === 'social' && dmLatest?.avatarUrl"
            :src="avatarSrc(dmLatest.avatarUrl)"
            alt=""
            class="h-6 w-6 rounded-full object-cover"
          />
          <img
            v-else-if="it.key === 'me' && me?.user?.avatarUrl"
            :src="avatarSrc(me.user.avatarUrl)"
            alt=""
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