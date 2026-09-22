<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { HardBreak } from '@tiptap/extension-hard-break'
import { searchEmoji, shouldJumboEmoji } from '~/utils/emoji'
import { EmojiImage, serializeDoc, textToDoc } from '~/utils/richEditor'

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

const custom = useCustomEmojis()
const hasContent = ref(false)
const suggestions = ref<EmojiSuggestion[]>([])
const activeIdx = ref(0)
const open = ref(false)
let matchFrom = -1
let matchTo = -1

interface EmojiSuggestion {
  key: string
  name: string
  insert: string
  char?: string
  url?: string
}

const editableClass = computed(() =>
  [props.textareaClass || 'outline-none w-full text-sm text-white placeholder-slate-500', 'outline-none overflow-y-auto'].join(' ')
)

function minHeight() {
  const rows = props.rows || 1
  return `${(rows * 1.5).toFixed(2)}rem`
}

function refreshState(ed: any) {
  hasContent.value = !ed.isEmpty
  const text = serializeDoc(ed.state.doc)
  const jumbo = shouldJumboEmoji(text, custom.map.value)
  if (ed.view?.dom) {
    ed.view.dom.style.fontSize = jumbo ? '1.75rem' : ''
    ed.view.dom.style.minHeight = jumbo ? '' : minHeight()
    ed.view.dom.style.maxHeight = props.autoResize ? '200px' : ''
  }
  emit('update:modelValue', text)
}

function close() {
  open.value = false
  suggestions.value = []
  matchFrom = -1
  matchTo = -1
}

function refreshSuggestions(ed: any) {
  const from = ed.state.selection.from
  const before = ed.state.doc.textBetween(0, from, '\n')
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
  matchFrom = from - match[0].length
  matchTo = from
  suggestions.value = list
  activeIdx.value = 0
  open.value = true
}

function choose(entry?: EmojiSuggestion) {
  if (!entry || matchFrom < 0) return
  const chain = editor.value?.chain().focus().deleteRange({ from: matchFrom, to: matchTo })
  if (entry.url) chain?.insertContent({ type: 'emojiImage', attrs: { name: entry.name, src: entry.url } }).run()
  else chain?.insertContent(entry.char || entry.insert).run()
  close()
}

function convertTypedEmoji(ed: any) {
  if (ed.view.composing || open.value) return
  const { state } = ed
  if (!state.selection.empty) return
  const from = state.selection.from
  if (from < 3) return
  const textBefore = state.doc.textBetween(Math.max(0, from - 40), from, '\n', '\0')
  const match = textBefore.match(/:([a-z0-9_+-]+):$/)
  if (!match) return
  const name = match[1].toLowerCase()
  const url = custom.byName.value[name]?.url
  if (!url) return
  const rangeFrom = from - match[0].length
  ed.chain().insertContentAt({ from: rangeFrom, to: from }, { type: 'emojiImage', attrs: { name, src: url } }).run()
}

const editor = useEditor({
  extensions: [Document, Paragraph, Text, HardBreak, EmojiImage],
  editorProps: {
    attributes: {
      class: '',
    },
    handleKeyDown: (view, event) => {
      if (open.value) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          activeIdx.value = (activeIdx.value + 1) % suggestions.value.length
          return true
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          activeIdx.value = (activeIdx.value - 1 + suggestions.value.length) % suggestions.value.length
          return true
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault()
          choose(suggestions.value[activeIdx.value])
          return true
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          close()
          return true
        }
      }
      if (props.submitOnEnter && event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault()
        emit('submit')
        return true
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    refreshState(editor)
    convertTypedEmoji(editor)
    refreshSuggestions(editor)
  },
  onSelectionUpdate: ({ editor }) => {
    if (open.value) refreshSuggestions(editor)
  },
  onBlur: () => { close(); emit('blur') },
  onFocus: () => { emit('focus') },
})

function setFromModel(value: string) {
  const ed = editor.value
  if (!ed) return
  const current = serializeDoc(ed.state.doc)
  if (current === value) return
  ed.commands.setContent(textToDoc(value, custom.map.value), { emitUpdate: false })
  const text = serializeDoc(ed.state.doc)
  hasContent.value = !ed.isEmpty
  if (ed.view?.dom) ed.view.dom.style.fontSize = shouldJumboEmoji(text, custom.map.value) ? '1.75rem' : ''
}

watch(() => props.modelValue, (v) => setFromModel(String(v ?? '')))

watch(() => custom.map.value, () => {
  if (!editor.value) return
  setFromModel(props.modelValue)
})

function focus() {
  editor.value?.commands.focus()
}

function applyDomConfig() {
  const dom = editor.value?.view?.dom
  if (!dom) return
  dom.classList.add(...editableClass.value.split(' ').filter(Boolean))
  dom.style.minHeight = minHeight()
  dom.style.maxHeight = props.autoResize ? '200px' : ''
}

defineExpose({ focus })

watch(editor, () => {
  if (!editor.value) return
  nextTick(() => {
    applyDomConfig()
    setFromModel(props.modelValue)
  })
}, { immediate: true })

onMounted(() => {
  custom.ensure()
  nextTick(() => {
    applyDomConfig()
    setFromModel(props.modelValue)
  })
})
</script>

<template>
  <div class="relative w-full min-w-0">
    <EditorContent :editor="editor" />
    <div
      v-if="!hasContent"
      class="absolute top-0 left-0 right-0 pointer-events-none text-sm text-slate-500 select-none overflow-hidden"
    >
      {{ props.placeholder || '' }}
    </div>

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
