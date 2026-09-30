/**
 * テーマの初期化。
 *
 * 描画前に正しいテーマを確定させるため:
 *   1. nuxt.config.ts のインライン script が localStorage から <html> に data 属性を付与 (FOUC 防止)
 *   2. このプラグインが prefers-color-scheme の監視と、サーバ settings からの復元を行う
 */
export default defineNuxtPlugin(() => {
  const theme = useTheme()
  theme.init()

  // 誰就直接に ref を書き換えても <html> が追従するようにする。
  // (SettingsModal などで setter を経由しない経路の保険)
  watch(
    [theme.style, theme.resolvedScheme, theme.seed],
    () => theme.apply(),
    { flush: 'post' },
  )

  // この端末で選び直す前のユーザー (別デバイス / リモートログイン) だけ同期する。
  // localStorage に確定済みのユーザーがそれ以上書き換えてはいけない。
  const alreadyChosen = import.meta.client && !!localStorage.getItem('sycs:theme-style')

  if (alreadyChosen) return

  $fetch<{ user: { settings?: string } | null }>('/api/auth/me')
    .then((res) => {
      if (!res?.user) return
      try {
        theme.hydrateFromServer(JSON.parse(res.user.settings || '{}'))
      } catch {
        /* settings が壊れていても既定値で続行 */
      }
    })
    .catch(() => {
      /* 未ログインなら何もしない */
    })
})
