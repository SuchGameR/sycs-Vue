<script setup lang="ts">
/**
 * オートコンプリート付き入力。
 *
 * items (固定候補) か source (非同期取得) のどちらかを渡す。
 * ↑↓ / Enter / Esc でキーボードだけでも選べる。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string
    items?: string[]
    source?: (query: string) => string[] | Promise<string[]>
    label?: string
    placeholder?: string
    icon?: string
    minChars?: number
    max?: number
    debounce?: number
    loadingText?: string
    emptyText?: string
    disabled?: boolean
  }>(),
  {
    items: () => [],
    label: '',
    placeholder: '',
    icon: 'lucide:search',
    minChars: 1,
    max: 8,
    debounce: 140,
    loadingText: '検索中…',
    emptyText: '候補が見つかりません',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [value: string]
  search: [query: string]
}>()

const open = ref(false)
const loading = ref(false)
const results = ref<string[]>([])
const active = ref(-1)
const inputEl = ref<HTMLInputElement | null>(null)

let timer: ReturnType<typeof setTimeout> | null = null
let requestToken = 0
let skipNextSearch = false

const showEmpty = computed(
  () =>
    open.value &&
    !loading.value &&
    props.modelValue.trim().length >= props.minChars &&
    results.value.length === 0,
)

function filterLocal(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return props.items.slice(0, props.max)
  return props.items
    .filter((item) => item.toLowerCase().includes(q))
    .slice(0, props.max)
}

async function runSearch(query: string) {
  const token = ++requestToken
  const q = query.trim()
  if (q.length < props.minChars) {
    results.value = []
    loading.value = false
    open.value = false
    return
  }

  loading.value = true
  open.value = true
  try {
    const list = props.source
      ? await props.source(q)
      : filterLocal(q)
    if (token !== requestToken) return
    results.value = (list ?? []).slice(0, props.max)
    active.value = results.value.length ? 0 : -1
  } catch {
    if (token === requestToken) results.value = []
  } finally {
    if (token === requestToken) loading.value = false
  }
}

function schedule(query: string) {
  if (skipNextSearch) {
    skipNextSearch = false
    return
  }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    void runSearch(query)
    emit('search', query)
  }, props.debounce)
}

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
  schedule(value)
}

function onFocus() {
  if (props.disabled) return
  open.value = true
  if (props.modelValue.trim().length >= props.minChars) schedule(props.modelValue)
}

function select(value: string) {
  skipNextSearch = true
  emit('update:modelValue', value)
  emit('select', value)
  open.value = false
  active.value = -1
  inputEl.value?.blur()
}

function clear() {
  emit('update:modelValue', '')
  results.value = []
  open.value = false
  inputEl.value?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!open.value) open.value = true
    if (results.value.length) {
      active.value = (active.value + 1) % results.value.length
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (results.value.length) {
      active.value = (active.value - 1 + results.value.length) % results.value.length
    }
  } else if (e.key === 'Enter') {
    if (open.value && active.value >= 0 && results.value[active.value]) {
      e.preventDefault()
      select(results.value[active.value]!)
    }
  } else if (e.key === 'Escape') {
    open.value = false
  } else if (e.key === 'Tab') {
    open.value = false
  }
}

function onBlur() {
  window.setTimeout(() => { open.value = false }, 120)
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="relative">
    <label v-if="label" class="mb-1.5 block text-xs font-medium text-on-surface-variant">
      {{ label }}
    </label>

    <div
      class="flex items-center gap-2 rounded-xl border px-3 transition focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/40"
      :class="disabled ? 'border-outline-variant bg-surface-container/30 opacity-60' : 'border-outline-variant bg-surface-container/50'"
    >
      <Icon v-if="icon" :name="icon" class="h-4 w-4 shrink-0 text-on-surface-variant" />
      <input
        ref="inputEl"
        :value="modelValue"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-label="label || placeholder"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
        class="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <Icon v-if="loading" name="lucide:loader-2" class="h-4 w-4 shrink-0 animate-spin text-on-surface-variant" />
      <button
        v-else-if="modelValue"
        type="button"
        class="shrink-0 rounded p-0.5 text-on-surface-variant transition hover:text-on-surface"
        aria-label="入力をクリア"
        @mousedown.prevent
        @click="clear"
      >
        <Icon name="lucide:x" class="h-4 w-4" />
      </button>
    </div>

    <Transition name="sycs-pop">
      <div
        v-if="open && (results.length || loading || showEmpty)"
        class="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-2xl"
      >
        <p v-if="loading && !results.length" class="flex items-center gap-2 px-3 py-3 text-xs text-on-surface-variant">
          <Icon name="lucide:loader-2" class="h-3.5 w-3.5 animate-spin" />
          {{ loadingText }}
        </p>
        <p v-else-if="showEmpty" class="px-3 py-3 text-xs text-on-surface-variant">
          {{ emptyText }}
        </p>
        <ul v-else role="listbox" class="max-h-64 overflow-y-auto py-1">
          <li v-for="(item, index) in results" :key="item" role="option" :aria-selected="index === active">
            <button
              type="button"
              class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition"
              :class="index === active ? 'bg-indigo-600/20 text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-highest'"
              @mousedown.prevent
              @mouseenter="active = index"
              @click="select(item)"
            >
              <Icon name="lucide:corner-down-right" class="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span class="truncate">{{ item }}</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
