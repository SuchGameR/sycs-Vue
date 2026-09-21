import { Node } from '@tiptap/core'
import type { CustomEmojiMap } from '~/utils/emoji'

export const EmojiImage = Node.create({
  name: 'emojiImage',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      name: { default: '' },
      src: { default: '' },
    }
  },
  parseHTML() {
    return [{ tag: 'img[data-emoji-name]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', {
      src: HTMLAttributes.src,
      'data-emoji-name': HTMLAttributes.name,
      class: 'sycs-emoji',
      alt: ':' + HTMLAttributes.name + ':',
      title: ':' + HTMLAttributes.name + ':',
      draggable: 'false',
    }]
  },
})

export function serializeDoc(doc: any): string {
  return doc.content.content
    .map((block: any) => {
      let s = ''
      block.descendants((n: any) => {
        if (n.isText) s += n.text
        else if (n.type.name === 'emojiImage') s += ':' + n.attrs.name + ':'
        else if (n.type.name === 'hardBreak') s += '\n'
      })
      return s
    })
    .join('\n')
}

export function textToDoc(text: string, custom?: CustomEmojiMap): any {
  const lines = String(text ?? '').split('\n')
  return {
    type: 'doc',
    content: lines.map((line) => {
      const content: any[] = []
      const re = /:([a-z0-9_+-]+):/gi
      let last = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(line))) {
        const name = m[1].toLowerCase()
        const url = custom && custom[name]
        if (!url) continue
        if (m.index > last) content.push({ type: 'text', text: line.slice(last, m.index) })
        content.push({ type: 'emojiImage', attrs: { name, src: url } })
        last = m.index + m[0].length
      }
      if (last < line.length) content.push({ type: 'text', text: line.slice(last) })
      return content.length ? { type: 'paragraph', content } : { type: 'paragraph' }
    }),
  }
}
