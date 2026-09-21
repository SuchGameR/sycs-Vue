import { ref, computed } from 'vue'

interface DropdownPos {
  left: number
  top: number
  width: number
  maxHeight: number
  up: boolean
}

/**
 * Viewport-aware dropdown positioning. Anchors to the trigger element and
 * flips/clamps so the panel never leaves the screen.
 *
 * The returned `style` must be applied to a `position: fixed` panel, and the
 * panel should be moved up via `translateY(-100%)` when `pos.up` is true.
 */
export function useDropdownPosition(defaultWidth = 288, gap = 8) {
  const trigger = ref<HTMLElement | null>(null)
  const pos = ref<DropdownPos>({ left: gap, top: gap, width: defaultWidth, maxHeight: 400, up: false })

  const style = computed(() => ({
    left: `${pos.value.left}px`,
    top: `${pos.value.top}px`,
    width: `${pos.value.width}px`,
    maxHeight: `${pos.value.maxHeight}px`,
    transform: pos.value.up ? 'translateY(-100%)' : 'none',
  }))

  function update(estimatedHeight = 360) {
    if (!import.meta.client || !trigger.value) return
    const rect = trigger.value.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = Math.min(defaultWidth, vw - gap * 2)
    const left = Math.min(Math.max(gap, rect.left), vw - width - gap)

    const spaceBelow = vh - rect.bottom - gap
    const spaceAbove = rect.top - gap
    const up = spaceAbove >= Math.min(estimatedHeight, spaceBelow) && spaceAbove > spaceBelow
    const maxHeight = Math.max(180, up ? spaceAbove : spaceBelow)

    pos.value = { left, top: up ? rect.top - gap : rect.bottom + gap, width, maxHeight, up }
  }

  return { trigger, pos, style, update }
}
