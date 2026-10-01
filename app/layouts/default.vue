<script setup lang="ts">
const route = useRoute()
const isServerPage = computed(() => route.path.startsWith('/servers/') && !!route.params.id)

const isDesktop = useIsDesktop()
const workbench = useWorkbench()
const { layout } = workbench

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
  const msg = err?.message || err?.data?.message || String(err)
  clientError.value = label + ': ' + msg
  console.error('[layout]', label, err)
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
  <div class="min-h-screen bg-surface text-on-surface [--app-footer-h:0px] min-[681px]:[--app-footer-h:30px]">
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
      :is-server-page="isServerPage"
      :server="serverCache"
      class="sticky top-0 z-50 bg-surface sycs-header-bg border-b border-outline-variant sycs-glass"
    />
    <div class="flex">
      <SidebarLeft
        v-if="layout.sidebar"
        class="hidden min-[681px]:flex w-48 min-[1024px]:w-60 border-r border-outline-variant sticky top-14"
      />
      <main class="flex-1 min-w-0 h-[calc(100vh-56px-var(--app-footer-h))] overflow-y-auto">
        <slot />
      </main>
      <MediaDetailPane v-if="isDesktop && layout.mediaPane" />
    </div>
    <MobileNav class="min-[681px]:hidden" />
    <MediaMiniPlayer v-if="!isDesktop" />
    <VoiceCallDock />
    <WorkbenchFooter />
    <AddToPlaylistModal />
    <QuoteComposerModal />
    <AccountSwitcher v-if="switcherOpen" @close="closeSwitcher" />
  </div>
</template>
