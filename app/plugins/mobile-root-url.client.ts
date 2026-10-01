/**
 * Mobile builds behave like an installed app: the address bar stays on "/"
 * while the router swaps pages underneath.
 *
 * How it works, and why it is safe here:
 *
 * Every in-app navigation in this codebase goes through vue-router — there is no
 * `location.href = ...` or `location.assign` anywhere — so vue-router is the only
 * writer of the address bar. It publishes through `history.pushState` and
 * `history.replaceState` and keeps its own reactive route state, which is what
 * actually drives the page swap. Replacing those two methods therefore changes
 * the visible URL without touching navigation.
 *
 * pushState is *replaced*, not redirected, rather than delegating to the
 * original pushState with "/" as the target. That keeps the session history one
 * entry long: a phone that never grows a hundred identical "/" entries per
 * session cannot leak memory, and Back leaves the app instead of walking a list
 * of pages whose URLs are indistinguishable. The floating nav (home / social /
 * search / profile) already covers moving around in-app.
 *
 * SSR is untouched — this file is `.client` only, so the server still renders
 * the route that was requested and a refresh deep-link still works on first
 * paint before the URL is normalised below.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const { isMobile } = useUaInfo()

  // Escape hatch for checking the behaviour from a desktop browser.
  let forced = false
  try {
    forced = localStorage.getItem('sycs:force-root-url') === '1'
  } catch {
    /* private mode */
  }
  if (!forced && !isMobile.value) return

  const ROOT = '/'
  const original = history.replaceState.bind(history)

  history.replaceState = (state, title, _url) => original(state, title, ROOT)
  history.pushState = (state, title, _url) => original(state, title, ROOT)

  // A deep link such as /social renders correctly, but should not leave the
  // address bar showing it once the app is on screen.
  nuxtApp.hook('app:mounted', () => {
    if (window.location.pathname !== ROOT) original(history.state, '', ROOT)
  })
})
