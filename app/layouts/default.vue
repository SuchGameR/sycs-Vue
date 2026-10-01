<script setup lang="ts">
const route = useRoute()
const isServerPage = computed(() => route.path.startsWith('/servers/') && !!route.params.id)

/**
 * /search hides the 56px app header entirely.
 *
 * That header's desktop slot is just a shortcut that navigates to /search, and
 * its mobile slot is the logo -- both redundant while the page's own search UI
 * is on screen. Reclaiming the height is what lets the big search box and the
 * reel feed each get a full screen. `--app-header-h` is consumed by <main> and
 * the sticky columns, so they slide up rather than leaving a 56px gap.
 */
const isSearchPage = computed(() => route.path === '/search')

const isDesktop = useIsDesktop()
const workbench = useWorkbench()
const { layout } = workbench

const { desktopNav, hydrate: hydrateNav } = useNavLayout()
onMounted(hydrateNav)

/**
 * Room for the floating pill. It is 0 on mobile (pages pad themselves), and 0
 * on desktop when the sidebar is the active nav -- otherwise switching to the
 * sidebar would leave a phantom gap above the footer.
 */
const navReserveStyle = computed(() => {
  const style: Record<string, string> = {}
  // Only --app-nav-reserve needs overriding: it is 5.25rem on desktop to make
  // room for the pill, and must drop to 0 when the sidebar is the active nav.
  // --app-nav-clear needs no override because its desktop value is already 0
  // (main's height is what absorbs the pill there) and on mobile the pill is
  // shown regardless of the desktop preference.
  if (desktopNav.value !== 'pill') style['--app-nav-reserve'] = '0px'
  if (isSearchPage.value) style['--app-header-h'] = '0px'
  return Object.keys(style).length ? style : undefined
})

const serverCache = ref<any>(null)

const mediaPane = useMediaPane()

watch(mediaPane.selected, (post) => {
  if (post && !workbench.layout.value.mediaPane) workbench.setLayout({ mediaPane: true })
})

async function loadServerHeader() {
  if (!isServerPage.value) { serverCache.value = null; return }
  const id = route.params.id as string
  try {
    const data = await $fetch(`/api/servers/${id}`)
    serverCache.value = data.server
  } catch { serverCache.value = null }
}

watch(isServerPage, loadServerHeader, { immediate: true })
watch(() => route.params.id, loadServerHeader)

const { on } = useRealtime()
let offRealtime: (() => void)[] = []

const { switcherOpen, closeSwitcher } = useAccounts()

const customEmojis = useCustomEmojis()

/**
 * Surfaces uncaught client errors instead of letting them vanish into the
 * console. A render-time throw used to blank the page with no explanation,
 * which is indistinguishable from "the route doesn't work".
 */
const clientError = ref('')
function showClientError(label: string, err: any) {
  const e = err
  const msg = e?.message || e?.data?.message || String(e)
  clientError.value = label + ': ' + msg
  console.error('[layout]', label, e)
}
onMounted(() => {
  window.addEventListener('error', ev => showClientError('エラー', ev.error || ev.message))
  window.addEventListener('unhandledrejection', ev => showClientError('未処理のPromise', ev.reason))
})

onMounted(() => {
  customEmojis.ensure()
  useUnread().init()
  const { captureStoredToken } = useAccounts()
  captureStoredToken()
})

const offEmojiRealtime = [
  on('emoji.new', () => customEmojis.refresh()),
  on('emoji.deleted', () => customEmojis.refresh()),
]

watch(isServerPage, (v) => {
  offRealtime.forEach(off => off())
  offRealtime = []
  if (v) {
    offRealtime = [
      on('server.updated', (p) => {
        if (route.params.id && p.serverId === route.params.id) loadServerHeader()
      }),
      on('server.deleted', (p) => {
        if (route.params.id && p.serverId === route.params.id) {
          serverCache.value = null
        }
      }),
    ]
  }
}, { immediate: true })

onUnmounted(() => {
  offRealtime.forEach(off => off())
  offEmojiRealtime.forEach(off => off())
})
</script>

<template>
  <div class="min-h-screen bg-surface text-on-surface [--app-footer-h:0px] min-[681px]:[--app-footer-h:30px] [--app-header-h:56px]" :style="navReserveStyle">
    <div v-if="clientError" class="fixed inset-x-3 top-[4.5rem] z-[300] mx-auto max-w-md rounded-xl border border-red-500/40 bg-red-950/90 p-3 text-sm text-red-200 shadow-2xl backdrop-blur">
      <div class="flex items-start gap-2">
        <Icon name="lucide:alert-triangle" class="w-4 h-4 shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="font-bold">読み込みに失敗しました</p>
          <p class="mt-0.5 text-xs break-words opacity-90">{{ clientError }}</p>
        </div>
        <button class="p-1 rounded hover:bg-white/10" @click="clientError = ''">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <AppHeader
      v-if="!isSearchPage"
      :is-server-page="isServerPage"
      :server="serverCache"
      class="sticky top-0 z-50 bg-surface sycs-header-bg border-b border-outline-variant sycs-glass"
    />
    <div class="flex">
      <!-- サイドバーはdesktopのみ。閉じる場合はピル_navが引き継ぐ。 -->
      <SidebarLeft v-if="layout.sidebar && desktopNav === 'sidebar'" />
      <main class="flex-1 min-w-0 h-[calc(100vh-var(--app-header-h)-var(--app-footer-h)-var(--app-nav-reserve))] overflow-y-auto">
        <slot />
      </main>
      <MediaDetailPane v-if="isDesktop && layout.mediaPane" />
    </div>
    <MobileNav />
    <MediaMiniPlayer v-if="!isDesktop" />
    <VoiceCallDock />
    <WorkbenchFooter />
    <AddToPlaylistModal />
    <QuoteComposerModal />
    <AccountSwitcher v-if="switcherOpen" @close="closeSwitcher" />
  </div>
</template>
