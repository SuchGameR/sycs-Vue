<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { HardBreak } from '@tiptap/extension-hard-break'

const props = defineProps<{ placeholder?: string }>()
const emit = defineEmits<{ submit: [text: string]; update: [text: string] }>()

const hasContent = ref(false)

const editor = useEditor({
  extensions: [Document, Paragraph, Text, HardBreak],
  editorProps: {
    attributes: {
      class: 'outline-none w-full text-sm text-slate-200 placeholder-slate-500',
    },
    handleKeyDown: (view, event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault()
        const text = view.state.doc.textBetween(0, view.state.doc.content.size, '\n')
        if (text.trim()) emit('submit', text)
        return true
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    hasContent.value = !editor.isEmpty
    emit('update', editor.getText())
  },
})

function clear() {
  editor.value?.commands.setContent('')
  hasContent.value = false
  emit('update', '')
}

function focus() {
  editor.value?.commands.focus()
}

function getText() {
  return editor.value?.getText() || ''
}

defineExpose({ clear, focus, getText })
</script>

<template>
  <div class="relative flex-1 min-w-0">
    <div
      v-if="!hasContent"
      class="absolute inset-0 pointer-events-none text-sm text-slate-500 select-none overflow-hidden whitespace-pre-wrap"
    >
      {{ props.placeholder || '' }}
    </div>
    <EditorContent :editor="editor" class="min-h-0" />
  </div>
</template>
