export interface SavedAccount {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  token: string
  savedAt?: number
}

const ACCOUNTS_KEY = 'sycs:accounts'

/**
 * Multi-account switching. Tokens are stored locally (a private JWT for each
 * saved account); switching POSTs the chosen token to /api/auth/swap which
 * swaps the active httpOnly session cookie.
 */
export function useAccounts() {
  const accounts = useState<SavedAccount[]>('sycs:accounts-list', () => {
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem(ACCOUNTS_KEY)
        if (raw) {
          const arr = JSON.parse(raw)
          if (Array.isArray(arr)) return arr
        }
      } catch { /* ignore */ }
    }
    return []
  })

  function persist() {
    if (import.meta.client) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.value))
  }

  function addAccount(user: any, token: string) {
    if (!user?.id || !token) return
    const existing = accounts.value.find(a => a.id === user.id)
    if (existing) {
      existing.token = token
      existing.username = user.username
      existing.displayName = user.displayName
      existing.avatarUrl = user.avatarUrl
    } else {
      accounts.value.push({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || null,
        token,
        savedAt: Date.now(),
      })
    }
    persist()
  }

  /**
   * Reads the short-lived `sycs_client_token` cookie set by the server after a
   * fresh login and persists that account locally, so switching later works
   * without re-entering a password.
   */
  async function captureStoredToken() {
    if (!import.meta.client) return
    if (document.cookie.includes('sycs_client_token=')) {
      const m = document.cookie.match(/(?:^|;\s*)sycs_client_token=([^;]+)/)
      if (!m) return
      const token = decodeURIComponent(m[1])
      try {
        const res = await $fetch<{ user: any }>('/api/auth/me')
        addAccount(res.user, token)
      } catch { /* expired */ }
      finally {
        document.cookie = 'sycs_client_token=; Max-Age=0; path=/'
      }
    }
  }

  async function switchAccount(account: SavedAccount) {
    await $fetch<{ user: any }>('/api/auth/swap', {
      method: 'POST',
      body: { token: account.token },
    })
    if (import.meta.client) window.location.reload()
  }

  function removeAccount(id: string) {
    accounts.value = accounts.value.filter(a => a.id !== id)
    persist()
  }

  const switcherOpen = useState('sycs:account-switcher-open', () => false)
  function openSwitcher() { switcherOpen.value = true }
  function closeSwitcher() { switcherOpen.value = false }

  return { accounts, addAccount, captureStoredToken, switchAccount, removeAccount, switcherOpen, openSwitcher, closeSwitcher }
}