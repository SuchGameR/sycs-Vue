import { replaceShortcodes, shouldJumboEmoji, type CustomEmojiMap } from './emoji'

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

/**
 * Hashtag grammar. Mirrors server/utils/hashtags.ts so the client renders the
 * same tags the server indexed — if these two drift, a tag shows as a link on
 * one side and inert text on the other.
 *
 * Same rules: 1-30 chars of [A-Za-z0-9_ \u3040-\u30FF], no leading or trailing
 * \u30FC, and a lookbehind that rejects `##foo`, `a#b` and URL fragments
 * (`https://x.com/a#b`).
 */
const TAG_CHARS = 'A-Za-z0-9_\\u3040-\\u30FF'
const TAG_LAST_CHARS = 'A-Za-z0-9_\\u3040-\\u30FB\\u30FD-\\u30FF'
const TAG_NOT_PRECEDED_BY = 'A-Za-z0-9_\\u3040-\\u30FF/#'
const HASHTAG_RE = new RegExp(
  `(?<![${TAG_NOT_PRECEDED_BY}])#([${TAG_CHARS}]{0,29}[${TAG_LAST_CHARS}])`,
  'g',
)

/**
 * Turn hashtags into links inside one chunk of already-escaped text.
 *
 * Runs on NON-URL segments only. That ordering matters: the URL pass runs first
 * and wraps matches in <a>, so a blind global hashtag replace would also fire
 * inside an already-linked href and produce nested/broken markup.
 */
function linkifyHashtags(escaped: string): string {
  return escaped.replace(HASHTAG_RE, (_m, raw: string) => {
    const tag = String(raw).toLowerCase()
    return `<a href="/hashtag/${encodeURIComponent(tag)}" class="sycs-hashtag">#${raw}</a>`
  })
}

export function renderRichText(input: string, options: { emoji?: boolean; custom?: CustomEmojiMap } = {}): string {
  const emoji = options.emoji !== false
  let out = escapeHtml(input)

  // URL を先に確定させ、URL に含まれる `#fragment` をハッシュタグ扱いしない。
  const parts = out.split(URL_RE)
  out = parts
    .map((part, i) =>
      i % 2 === 1
        ? `<a href="${part}" target="_blank" rel="noopener noreferrer nofollow" class="text-indigo-400 hover:underline">${part}</a>`
        : linkifyHashtags(part),
    )
    .join('')

  if (emoji) {
    out = replaceShortcodes(out, options.custom)
    const jumbo = shouldJumboEmoji(input, options.custom)
    if (jumbo) out = `<span class="sycs-emoji-jumbo">${out}</span>`
  }
  return out
}
