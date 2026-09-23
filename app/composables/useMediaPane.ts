export type MediaKind = 'video' | 'image' | 'audio' | 'model' | 'file' | 'text'

const MODEL_EXT = /\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i

function isModelAttachment(att: any): boolean {
  const mime = String(att?.mime || att?.type || '').toLowerCase()
  if (mime.startsWith('model/')) return true
  return MODEL_EXT.test(String(att?.url || ''))
}

export function mediaKindOf(post: any): MediaKind {
  const atts: any[] = post?.attachments || []
  if (atts.some(a => String(a.mime || a.type || '').startsWith('video'))) return 'video'
  if (atts.some(a => String(a.mime || a.type || '').startsWith('audio'))) return 'audio'
  if (atts.some(isModelAttachment)) return 'model'
  if (atts.some(a => String(a.mime || a.type || '').startsWith('image'))) return 'image'
  if (atts.length) return 'file'
  return 'text'
}

export function hasMedia(post: any): boolean {
  return mediaKindOf(post) !== 'text'
}

const WIDTH_KEY = 'sycs:media-pane-width'

export function useMediaPane() {
  const selected = useState<any>('media-pane:post', () => null)
  const sourceLabel = useState<string>('media-pane:source', () => '')
  const width = useState<number>('media-pane:width', () => {
    if (import.meta.client) {
      const saved = Number(localStorage.getItem(WIDTH_KEY))
      if (saved && saved >= 320 && saved <= 900) return saved
    }
    return 460
  })
  const mobileFull = useState<boolean>('media-pane:mobile-full', () => false)
  const mobileMinimized = useState<boolean>('media-pane:mobile-min', () => false)

  const isOpen = computed(() => !!selected.value)
  const kind = computed<MediaKind>(() => mediaKindOf(selected.value))

  function openPost(post: any, label = '') {
    if (!post) return
    if (selected.value?.id === post.id) {
      close()
      return
    }
    selected.value = post
    sourceLabel.value = label
    mobileFull.value = false
    mobileMinimized.value = false
  }

  /**
   * Device-aware open. Desktop always uses the side pane; on mobile the
   * configured presentation (action sheet / full page / mini player) decides.
   */
  function openSmart(post: any, label = '') {
    if (!post) return
    const isMobile = import.meta.client && window.innerWidth < 1024
    if (!isMobile) {
      openPost(post, label)
      return
    }
    const { mediaOpenMode } = useAppPreferences()
    if (mediaOpenMode.value === 'mini') {
      // Dock only: keep it compact, don't auto-expand.
      if (selected.value?.id === post.id) { minimizeMobile(); return }
      selected.value = post
      sourceLabel.value = label
      mobileFull.value = false
      mobileMinimized.value = false
      return
    }
    openMobileFull(post, label)
  }

  function togglePost(post: any, label = '') {
    openPost(post, label)
  }

  function close() {
    selected.value = null
    sourceLabel.value = ''
    mobileFull.value = false
    mobileMinimized.value = false
  }

  function setWidth(value: number) {
    const clamped = Math.min(Math.max(value, 320), 900)
    width.value = clamped
    if (import.meta.client) localStorage.setItem(WIDTH_KEY, String(clamped))
  }

  function openMobileFull(post?: any, label = '') {
    if (post) {
      selected.value = post
      sourceLabel.value = label
    }
    mobileFull.value = true
    mobileMinimized.value = false
  }

  function minimizeMobile() {
    mobileFull.value = false
    mobileMinimized.value = true
  }

  function closeMobile() {
    mobileFull.value = false
    mobileMinimized.value = false
    close()
  }

  function updatePost(post: any) {
    if (selected.value?.id === post.id) selected.value = post
  }

  return {
    selected, sourceLabel, width, mobileFull, mobileMinimized,
    isOpen, kind,
    openPost, openSmart, togglePost, close, setWidth,
    openMobileFull, minimizeMobile, closeMobile, updatePost,
  }
}
