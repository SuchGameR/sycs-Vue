export type MediaOpenMode = 'sheet' | 'page' | 'mini'

const MEDIA_MODE_KEY = 'sycs:media-open-mode'

/** How media opens on mobile: bottom action sheet / full page / mini player. */
export function useAppPreferences() {
  const mediaOpenMode = useState<MediaOpenMode>('app-preferences:media-open-mode', () => {
    if (import.meta.client) {
      const saved = localStorage.getItem(MEDIA_MODE_KEY)
      if (saved === 'sheet' || saved === 'page' || saved === 'mini') return saved
    }
    return 'sheet'
  })

  function setMediaOpenMode(mode: MediaOpenMode) {
    mediaOpenMode.value = mode
    if (import.meta.client) localStorage.setItem(MEDIA_MODE_KEY, mode)
  }

  return { mediaOpenMode, setMediaOpenMode }
}