<script setup lang="ts">
import { searchEmoji } from '~/utils/emoji'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  rows?: number
  maxlength?: number
  submitOnEnter?: boolean
  autoResize?: boolean
  textareaClass?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  focus: []
  blur: []
}>()

const ta = ref<HTMLTextAreaElement | null>(null)
const suggestions = ref<EmojiSuggestion[]>([])
const activeIdx = ref(0)
const open = ref(false)
const custom = useCustomEmojis()
let queryStart = -1
let queryEnd = -1
let blurTimer: ReturnType<typeof setTimeout> | null = null

interface EmojiSuggestion {
  key: string
  name: string
  insert: string
  char?: string
  url?: string
}

function close() {
  open.value = false
  suggestions.value = []
  queryStart = -1
  queryEnd = -1
}

function refreshSuggestions() {
  const el = ta.value
  if (!el) return
  const pos = el.selectionStart ?? 0
  const before = props.modelValue.slice(0, pos)
  const match = before.match(/:([a-z0-9_+-]+)$/i)
  if (!match) { close(); return }
  const q = match[1].toLowerCase()
  const customHits: EmojiSuggestion[] = custom.emojis.value
    .filter(e => e.name.includes(q))
    .slice(0, 30)
    .map(e => ({ key: 'c-' + e.id, name: e.name, url: e.url, insert: ':' + e.name + ':' }))
  const unicodeHits: EmojiSuggestion[] = searchEmoji(match[1], 30)
    .map(e => ({ key: 'u-' + e.name, name: e.name, char: e.char, insert: e.char }))
  const list = [...customHits, ...unicodeHits]
  if (!list.length) { close(); return }
  queryStart = pos - match[0].length
  queryEnd = pos
  suggestions.value = list
  activeIdx.value = 0
  open.value = true
}

function choose(entry: EmojiSuggestion) {
  const el = ta.value
  if (!el || queryStart < 0) return
  const value = props.modelValue
  const next = value.slice(0, queryStart) + entry.insert + value.slice(queryEnd)
  const caret = queryStart + entry.insert.length
  emit('update:modelValue', next)
  close()
  nextTick(() => {
    el.focus()
    el.setSelectionRange(caret, caret)
    autoResize()
  })
}

function autoResize() {
  if (!props.autoResize) return
  const el = ta.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
  refreshSuggestions()
  autoResize()
}

function onKeydown(e: KeyboardEvent) {
  if (open.value) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      activeIdx.value = (activeIdx.value + 1) % suggestions.value.length
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeIdx.value = (activeIdx.value - 1 + suggestions.value.length) % suggestions.value.length
      return
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      choose(suggestions.value[activeIdx.value])
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
  }
  if (props.submitOnEnter && e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    emit('submit')
  }
}

function onBlur() {
  emit('blur')
  if (blurTimer) clearTimeout(blurTimer)
  blurTimer = setTimeout(close, 120)
}

function focus() {
  ta.value?.focus()
}

defineExpose({ focus })

onMounted(() => {
  custom.ensure()
  if (props.autoResize) nextTick(autoResize)
})
onUnmounted(() => { if (blurTimer) clearTimeout(blurTimer) })
</script>

<template>
  <div class="relative w-full min-w-0">
    <textarea
      ref="ta"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows || 1"
      :maxlength="maxlength"
      :class="textareaClass"
      @input="onInput"
      @keydown="onKeydown"
      @click="refreshSuggestions"
      @blur="onBlur"
      @focus="emit('focus')"
    />

    <Transition name="emoji-pop">
      <div
        v-if="open"
        class="absolute bottom-full left-0 mb-1 w-full max-w-sm max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-[150]"
      >
        <div class="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 sticky top-0 bg-slate-900">
          絵文字
        </div>
        <button
          v-for="(s, i) in suggestions"
          :key="s.key"
          type="button"
          @mousedown.prevent="choose(s)"
          @mouseenter="activeIdx = i"
          class="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition"
          :class="i === activeIdx ? 'bg-indigo-600/30' : 'hover:bg-slate-800'"
        >
          <img v-if="s.url" :src="s.url" :alt="':' + s.name + ':'" class="sycs-emoji sycs-emoji--lg shrink-0" draggable="false" />
          <span v-else class="text-lg leading-none shrink-0">{{ s.char }}</span>
          <span class="text-xs text-slate-400 truncate">:{{ s.name }}:</span>
          <span v-if="s.url" class="ml-auto text-[10px] text-slate-600 shrink-0">カスタム</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.emoji-pop-enter-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.emoji-pop-leave-active { transition: opacity 0.08s ease; }
.emoji-pop-enter-from { opacity: 0; transform: translateY(4px); }
.emoji-pop-leave-to { opacity: 0; }
</style>
