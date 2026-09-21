export interface CustomEmoji {
  id: string
  name: string
  url: string
  mime: string
  animated: boolean
  creatorId: string | null
  createdAt?: string
}

export function useCustomEmojis() {
  const emojis = useState<CustomEmoji[]>('custom-emojis', () => [])
  const loaded = useState<boolean>('custom-emojis:loaded', () => false)
  const loading = useState<boolean>('custom-emojis:loading', () => false)

  const map = computed<Record<string, string>>(() =>
    Object.fromEntries(emojis.value.map(e => [e.name, e.url]))
  )

  const byName = computed<Record<string, CustomEmoji>>(() =>
    Object.fromEntries(emojis.value.map(e => [e.name, e]))
  )

  function has(name: string): boolean {
    return !!byName.value[name.toLowerCase()]
  }

  async function refresh() {
    if (loading.value) return
    loading.value = true
    try {
      const res = await $fetch<{ emojis: CustomEmoji[] }>('/api/emojis')
      emojis.value = res.emojis || []
      loaded.value = true
    } catch {
      /* ignore */
    } finally {
      loading.value = false
    }
  }

  async function ensure() {
    if (loaded.value || loading.value) return
    await refresh()
  }

  async function upload(name: string, file: File): Promise<CustomEmoji> {
    const form = new FormData()
    form.append('name', name.replace(/^:|:$/g, '').toLowerCase())
    form.append('file', file)
    const res = await $fetch<{ emoji: CustomEmoji }>('/api/emojis', { method: 'POST', body: form })
    emojis.value = [res.emoji, ...emojis.value]
    return res.emoji
  }

  async function remove(id: string) {
    await $fetch(`/api/emojis/${id}`, { method: 'DELETE' })
    emojis.value = emojis.value.filter(e => e.id !== id)
  }

  return { emojis, map, byName, loaded, loading, has, refresh, ensure, upload, remove }
}
