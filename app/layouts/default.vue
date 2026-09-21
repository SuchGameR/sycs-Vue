<script setup lang="ts">
const route = useRoute()
const isServerPage = computed(() => route.path.startsWith('/servers/') && !!route.params.id)

const serverCache = ref<any>(null)

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
})
</script>

<template>
  <div class="min-h-screen bg-[#0b0f19] text-slate-100">
    <AppHeader
      :is-server-page="isServerPage"
      :server="serverCache"
      class="sticky top-0 z-50 bg-[#0b0f19] border-b border-slate-800"
    />
    <div class="flex">
      <SidebarLeft class="hidden min-[681px]:flex w-48 min-[1024px]:w-60 border-r border-slate-800 h-[calc(100vh-56px)] sticky top-14" />
      <main class="flex-1 min-w-0 h-[calc(100vh-56px)] overflow-y-auto">
        <slot />
      </main>
      <MediaDetailPane />
    </div>
    <MobileNav class="min-[681px]:hidden" />
    <MediaMiniPlayer />
    <VoiceCallDock />
  </div>
</template>
