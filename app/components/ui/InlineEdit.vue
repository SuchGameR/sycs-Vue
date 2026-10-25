<script setup lang="ts">
/**
 * その場で編集 (インライン操作)。
 *
 * 表示テキストをクリックすると入力に変わり、Enter で保存 / Esc で取消。
 * validate が文字列を返したときは保存せず、その場にエラーを出す。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    multiline?: boolean
    validate?: (value: string) => string | true
    icon?: string
  }>(),
  { label: '', placeholder: 'クリックして入力', multiline: false, icon: 'lucide:pencil' },
)

const emit = defineEmits<{ save: [value: string]; cancel: [] }>()

const editing = ref(false)
const draft = ref(props.modelValue)
const error = ref('')
const inputEl = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

watch(
  () => props.modelValue,
  (value) => {
    if (!editing.value) draft.value = value
  },
)

async function start() {
  editing.value = true
  draft.value = props.modelValue
  error.value = ''
  await nextTick()
  inputEl.value?.focus()
}

function commit() {
  const value = draft.value.trim()
  const result = props.validate?.(value)
  if (result && result !== true) {
    error.value = result
    return
  }
  emit('save', value)
  editing.value = false
  error.value = ''
}

function cancel() {
  editing.value = false
  draft.value = props.modelValue
  error.value = ''
  emit('cancel')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !props.multiline) {
    e.preventDefault()
    commit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancel()
  }
}
</script>

<template>
  <div>
    <p v-if="label" class="mb-1 text-[11px] font-medium text-on-surface-variant">{{ label }}</p>

    <div
      v-if="!editing"
      class="group flex cursor-text items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-surface-container/60"
      role="button"
      tabindex="0"
      :aria-label="`${label || '値を'}編集`"
      @click="start"
      @keydown.enter.prevent="start"
      @keydown.space.prevent="start"
    >
      <span
        class="min-w-0 flex-1 truncate text-sm"
        :class="modelValue ? 'text-on-surface' : 'text-on-surface-variant/60'"
      >
        {{ modelValue || placeholder }}
      </span>
      <Icon
        :name="icon"
        class="h-3.5 w-3.5 shrink-0 text-on-surface-variant opacity-0 transition group-hover:opacity-70 group-focus-visible:opacity-70"
      />
    </div>

    <div v-else>
      <textarea
        v-if="multiline"
        ref="inputEl"
        v-model="draft"
        rows="3"
        class="w-full resize-none rounded-lg border border-indigo-500/60 bg-surface-container px-2.5 py-2 text-sm text-on-surface outline-none ring-2 ring-indigo-500/20"
        @keydown="onKeydown"
      />
      <input
        v-else
        ref="inputEl"
        v-model="draft"
        type="text"
        class="w-full rounded-lg border border-indigo-500/60 bg-surface-container px-2.5 py-2 text-sm text-on-surface outline-none ring-2 ring-indigo-500/20"
        @keydown="onKeydown"
      />

      <p v-if="error" class="mt-1 flex items-center gap-1 text-[11px] text-red-400">
        <Icon name="lucide:alert-circle" class="h-3 w-3" />
        {{ error }}
      </p>

      <div class="mt-1.5 flex items-center gap-1.5">
        <button
          type="button"
          class="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-indigo-500 active:scale-95"
          @click="commit"
        >
          保存
        </button>
        <button
          type="button"
          class="rounded-md px-2.5 py-1 text-[11px] text-on-surface-variant transition hover:bg-white/10"
          @click="cancel"
        >
          キャンセル
        </button>
        <span class="ml-auto text-[10px] text-on-surface-variant/60">Enter で保存</span>
      </div>
    </div>
  </div>
</template>
