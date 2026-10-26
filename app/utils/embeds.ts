/**
 * URL からリッチな埋め込みカードを作るための小さなパーサ。
 *
 * 方針:
 * - iframe を作るのは「ホワイトリストのプロバイダ + 検証済み ID」だけ。
 * - それ以外はリンクカード (画像 / 動画 / 音声 / 3D / 汎用) に落とす。
 * - ネットワークへ取りに行くのはユーザーがクリックした後だけ (サムネイル以外)。
 *
 * ここで返す URL はすべて URL コンストラクタで組み立てるので、
 * 投稿本文に細工された URL が入っていても `javascript:` などは通らない。
 */

export type EmbedKind =
  | 'youtube'
  | 'vimeo'
  | 'spotify'
  | 'soundcloud'
  | 'twitter'
  | 'github'
  | 'twitch'
  | 'tiktok'
  | 'figma'
  | 'codepen'
  | 'image'
  | 'video'
  | 'audio'
  | 'model'
  | 'link'

export interface EmbedIframe {
  src: string
  /** 固定高さが必要なプロバイダ用。0 なら 16:9 で埋める */
  height: number
  allow: string
  title: string
}

export interface EmbedInfo {
  url: string
  kind: EmbedKind
  host: string
  title: string
  subtitle: string
  icon: string
  accent: string
  thumbnail?: string
  iframe?: EmbedIframe
}

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg'])
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv', 'mkv'])
const AUDIO_EXT = new Set(['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus'])
const MODEL_EXT = new Set(['glb', 'gltf', 'obj', 'fbx', 'stl', '3ds'])

const ACCENTS: Record<EmbedKind, string> = {
  youtube: 'from-red-500/25 to-rose-500/10 text-red-300 ring-red-500/25',
  vimeo: 'from-sky-500/25 to-cyan-500/10 text-sky-300 ring-sky-500/25',
  spotify: 'from-emerald-500/25 to-green-500/10 text-emerald-300 ring-emerald-500/25',
  soundcloud: 'from-orange-500/25 to-amber-500/10 text-orange-300 ring-orange-500/25',
  twitter: 'from-slate-400/20 to-slate-500/10 text-slate-200 ring-slate-400/25',
  github: 'from-slate-500/25 to-slate-700/10 text-slate-200 ring-slate-500/25',
  twitch: 'from-violet-500/25 to-purple-500/10 text-violet-300 ring-violet-500/25',
  tiktok: 'from-pink-500/25 to-rose-500/10 text-pink-300 ring-pink-500/25',
  figma: 'from-fuchsia-500/25 to-purple-500/10 text-fuchsia-300 ring-fuchsia-500/25',
  codepen: 'from-slate-500/25 to-zinc-500/10 text-slate-200 ring-slate-500/25',
  image: 'from-indigo-500/25 to-blue-500/10 text-indigo-300 ring-indigo-500/25',
  video: 'from-fuchsia-500/25 to-indigo-500/10 text-fuchsia-300 ring-fuchsia-500/25',
  audio: 'from-pink-500/25 to-rose-500/10 text-pink-300 ring-pink-500/25',
  model: 'from-violet-500/25 to-fuchsia-500/10 text-violet-300 ring-violet-500/25',
  link: 'from-slate-500/20 to-slate-600/10 text-slate-300 ring-slate-500/20',
}

const ICONS: Record<EmbedKind, string> = {
  youtube: 'lucide:play',
  vimeo: 'lucide:clapperboard',
  spotify: 'lucide:music-2',
  soundcloud: 'lucide:audio-lines',
  twitter: 'lucide:message-circle',
  github: 'lucide:github',
  twitch: 'lucide:tv',
  tiktok: 'lucide:music',
  figma: 'lucide:figma',
  codepen: 'lucide:code-2',
  image: 'lucide:image',
  video: 'lucide:video',
  audio: 'lucide:audio-lines',
  model: 'lucide:box',
  link: 'lucide:external-link',
}

/** 本文から http(s) URL を拾う。末尾の句読点は落とす。 */
export function extractUrls(text: string, max = 3): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const match of String(text ?? '').matchAll(/https?:\/\/[^\s<>"']+/gi)) {
    let raw = match[0]
    // `https://example.com/foo).` のような閉じ括弧・句点を URL から外す。
    while (/[.,;:!?)\]}"']$/.test(raw)) {
      const open = (raw.match(/\(/g) || []).length
      const close = (raw.match(/\)/g) || []).length
      if (raw.endsWith(')') && open >= close) break
      raw = raw.slice(0, -1)
    }
    try {
      const parsed = new URL(raw)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') continue
      const url = parsed.toString()
      if (seen.has(url)) continue
      seen.add(url)
      out.push(url)
      if (out.length >= max) break
    } catch {
      /* 壊れた URL は無視 */
    }
  }
  return out
}

export function firstUrl(text: string): string | null {
  return extractUrls(text, 1)[0] || null
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function fileName(url: URL): string {
  const last = url.pathname.split('/').filter(Boolean).pop() || ''
  return safeDecode(last) || url.hostname
}

function extension(url: URL): string {
  const name = url.pathname.split('/').pop() || ''
  const m = name.match(/\.([a-z0-9]+)$/i)
  return (m?.[1] || '').toLowerCase()
}

function baseInfo(url: URL, kind: EmbedKind, title: string, subtitle: string): EmbedInfo {
  return {
    url: url.toString(),
    kind,
    host: url.hostname.replace(/^www\./, ''),
    title,
    subtitle,
    icon: ICONS[kind],
    accent: ACCENTS[kind],
  }
}

function youtubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '')
  let raw = ''
  if (host === 'youtu.be') {
    raw = url.pathname.split('/').filter(Boolean)[0] || ''
  } else if (host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') raw = url.searchParams.get('v') || ''
    else raw = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/]+)/)?.[1] || ''
  } else {
    return null
  }
  return /^[A-Za-z0-9_-]{6,20}$/.test(raw) ? raw : null
}

function vimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '')
  if (!host.endsWith('vimeo.com')) return null
  const raw = url.pathname.match(/\/(\d{6,})/)?.[1] || ''
  return /^\d{6,12}$/.test(raw) ? raw : null
}

function spotifyInfo(url: URL): EmbedInfo | null {
  const host = url.hostname.replace(/^www\./, '')
  if (host !== 'open.spotify.com') return null
  const m = url.pathname.match(/^\/(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/)
  if (!m) return null
  const type = m[1]!
  const id = m[2]!
  const label: Record<string, string> = {
    track: 'トラック',
    album: 'アルバム',
    playlist: 'プレイリスト',
    episode: 'エピソード',
    show: 'ポッドキャスト',
    artist: 'アーティスト',
  }
  const info = baseInfo(url, 'spotify', `Spotify ${label[type] || ''}`, 'open.spotify.com')
  info.iframe = {
    src: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`,
    height: type === 'episode' || type === 'show' ? 232 : 152,
    allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
    title: 'Spotify プレイヤー',
  }
  return info
}

function soundcloudInfo(url: URL): EmbedInfo | null {
  const host = url.hostname.replace(/^www\./, '')
  if (host !== 'soundcloud.com' && host !== 'on.soundcloud.com' && host !== 'm.soundcloud.com') return null
  const canonical = `${url.origin}${url.pathname}`
  const info = baseInfo(url, 'soundcloud', 'SoundCloud オーディオ', 'soundcloud.com')
  info.iframe = {
    src:
      'https://w.soundcloud.com/player/?url=' +
      encodeURIComponent(canonical) +
      '&color=%236366f1&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false',
    height: 166,
    allow: 'autoplay',
    title: 'SoundCloud プレイヤー',
  }
  return info
}

function githubInfo(url: URL): EmbedInfo | null {
  const host = url.hostname.replace(/^www\./, '')
  if (host !== 'github.com') return null
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 2) return baseInfo(url, 'github', 'GitHub', 'github.com')
  return baseInfo(url, 'github', `${parts[0]}/${parts[1]}`, 'GitHub')
}

function xInfo(url: URL): EmbedInfo | null {
  const host = url.hostname.replace(/^www\./, '')
  if (host !== 'x.com' && host !== 'twitter.com' && host !== 'mobile.twitter.com') return null
  const parts = url.pathname.split('/').filter(Boolean)
  const handle = parts[0] && !['i', 'intent', 'share'].includes(parts[0]) ? `@${parts[0]}` : ''
  return baseInfo(url, 'twitter', handle ? `${handle} のポスト` : 'X のポスト', 'x.com')
}

function directInfo(url: URL, ext: string): EmbedInfo | null {
  if (IMAGE_EXT.has(ext)) return baseInfo(url, 'image', fileName(url), url.hostname.replace(/^www\./, ''))
  if (VIDEO_EXT.has(ext)) return baseInfo(url, 'video', fileName(url), url.hostname.replace(/^www\./, ''))
  if (AUDIO_EXT.has(ext)) return baseInfo(url, 'audio', fileName(url), url.hostname.replace(/^www\./, ''))
  if (MODEL_EXT.has(ext)) return baseInfo(url, 'model', fileName(url), url.hostname.replace(/^www\./, ''))
  return null
}

/** http(s) 以外はリンクにしない (javascript: などを href に入れない)。 */
function unsafeInfo(input: string): EmbedInfo {
  return {
    url: '#',
    kind: 'link',
    host: '',
    title: input || 'リンク',
    subtitle: '安全でない URL',
    icon: ICONS.link,
    accent: ACCENTS.link,
  }
}

export function parseEmbed(input: string): EmbedInfo {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    return unsafeInfo(input)
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return unsafeInfo(input)
  }

  const yt = youtubeId(url)
  if (yt) {
    const info = baseInfo(url, 'youtube', 'YouTube 動画', 'youtube.com')
    info.thumbnail = `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`
    info.iframe = {
      src: `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`,
      height: 0,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      title: 'YouTube 動画',
    }
    return info
  }

  const vimeo = vimeoId(url)
  if (vimeo) {
    const info = baseInfo(url, 'vimeo', 'Vimeo 動画', 'vimeo.com')
    info.iframe = {
      src: `https://player.vimeo.com/video/${vimeo}`,
      height: 0,
      allow: 'autoplay; fullscreen; picture-in-picture',
      title: 'Vimeo 動画',
    }
    return info
  }

  const spotify = spotifyInfo(url)
  if (spotify) return spotify

  const soundcloud = soundcloudInfo(url)
  if (soundcloud) return soundcloud

  const github = githubInfo(url)
  if (github) return github

  const x = xInfo(url)
  if (x) return x

  const host = url.hostname.replace(/^www\./, '')
  if (host === 'twitch.tv' || host.endsWith('.twitch.tv')) {
    return baseInfo(url, 'twitch', 'Twitch 配信', 'twitch.tv')
  }
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) {
    return baseInfo(url, 'tiktok', 'TikTok 動画', 'tiktok.com')
  }
  if (host === 'figma.com' || host.endsWith('.figma.com')) {
    return baseInfo(url, 'figma', 'Figma ファイル', 'figma.com')
  }
  if (host === 'codepen.io') {
    return baseInfo(url, 'codepen', 'CodePen', 'codepen.io')
  }

  const direct = directInfo(url, extension(url))
  if (direct) return direct

  const title = fileName(url)
  const subtitle = host + (url.pathname === '/' ? '' : safeDecode(url.pathname))
  return baseInfo(url, 'link', title, subtitle)
}
