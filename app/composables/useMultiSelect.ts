import type { Ref } from 'vue'

/**
 * 複数選択モード。
 *
 * 選択モードの ON/OFF と選択 ID の集合だけを持つ。
 * 画面側は active のときチェックボックスを出し、SelectionToolbar を表示する。
 */
export function useMultiSelect<T extends string | number>(pool: Ref<T[]>) {
  const active = ref(false)
  const selected = ref<T[]>([])

  const count = computed(() => selected.value.length)
  const isActive = computed(() => active.value)
  const allSelected = computed(
    () => pool.value.length > 0 && pool.value.every((id) => selected.value.includes(id)),
  )

  function enter(initial: T[] = []) {
    active.value = true
    selected.value = [...initial]
  }

  function exit() {
    active.value = false
    selected.value = []
  }

  function toggle(id: T) {
    if (selected.value.includes(id)) {
      selected.value = selected.value.filter((x) => x !== id)
    } else {
      selected.value = [...selected.value, id]
    }
  }

  function selectAll() {
    selected.value = [...pool.value]
  }

  function clear() {
    selected.value = []
  }

  function isSelected(id: T) {
    return selected.value.includes(id)
  }

  // プールから消えた ID を選択からも落とす。
  watch(pool, (next) => {
    const valid = new Set(next)
    selected.value = selected.value.filter((id) => valid.has(id))
    if (!next.length) active.value = false
  })

  return {
    active,
    isActive,
    selected,
    count,
    allSelected,
    enter,
    exit,
    toggle,
    selectAll,
    clear,
    isSelected,
  }
}
