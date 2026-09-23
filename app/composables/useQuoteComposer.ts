export function useQuoteComposer() {
  const target = useState<any>('quote-composer:target', () => null)
  const busy = useState<boolean>('quote-composer:busy', () => false)
  const _error = useState<string | null>('quote-composer:error', () => null)

  function openQuote(post: any) {
    if (!post) return
    target.value = post
    _error.value = null
  }

  function closeQuote() {
    target.value = null
    busy.value = false
    _error.value = null
  }

  async function submitQuote(content: string, attachments?: Array<any>, visibility?: string, visibleTo?: string[]) {
    const quotedPost = target.value
    if (!quotedPost) return
    busy.value = true
    _error.value = null
    try {
      await $fetch('/api/posts', {
        method: 'POST',
        body: {
          content,
          attachments,
          visibility: visibility || 'public',
          visibleTo,
          quotedPostId: quotedPost.id,
        },
      })
      target.value = null
      return true
    } catch (e: any) {
      _error.value = e?.data?.message || '引用リポストに失敗しました'
      return false
    } finally {
      busy.value = false
    }
  }

  return { target, busy, error: _error, openQuote, closeQuote, submitQuote }
}