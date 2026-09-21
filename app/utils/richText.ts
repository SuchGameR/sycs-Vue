import { replaceShortcodes, isEmojiOnlyMessage, type CustomEmojiMap } from './emoji'

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(input: string): string {
  return String(input ?? '').replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch])
}

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]}"'])/g

export function renderRichText(input: string, options: { emoji?: boolean; custom?: CustomEmojiMap } = {}): string {
  const emoji = options.emoji !== false
  let out = escapeHtml(input)
  out = out.replace(URL_RE, (url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-indigo-400 hover:underline">${url}</a>`
  )
  if (emoji) {
    out = replaceShortcodes(out, options.custom)
    const jumbo = isEmojiOnlyMessage(input, options.custom)
    if (jumbo) out = `<span class="sycs-emoji-jumbo">${out}</span>`
  }
  return out
}
