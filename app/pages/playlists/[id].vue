<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const mediaPane = useMediaPane()
const { removeItem, remove: removePlaylist } = usePlaylists()

const playlist = ref<any>(null)
const posts = ref<any[]>([])
const loading = ref(true)
const notFound = ref(false)

async function load() {
  loading.value = true
  try {
    const data = await $fetch<any>(`/api/playlists/${id}`)
    playlist.value = data.playlist
    posts.value = data.posts || []
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

function open(post: any) {
  mediaPane.openSmart(post, playlist.value?.name || 'プレイリスト')
}

function coverOf(post: any) {
  const att = post.attachments?.find((a: any) => a.type === 'image' || a.type === 'video')
  return att?.url || null
}

function isVideo(post: any) {
  return post.attachments?.[0]?.type === 'video'
}

async function removeFromList(postId: string) {
  await removeItem(id, postId)
  posts.value = posts.value.filter(p => p.id !== postId)
  if (playlist.value) playlist.value.count = posts.value.length
}

async function deleteList() {
  if (!confirm('このプレイリストを削除しますか？')) return
  await removePlaylist(id)
  router.push('/actions')
}
</script>

<template>
  <div class="max-w-3xl mx-auto pb-24 min-[681px]:pb-8">
    <div v-if="loading" class="text-center text-slate-500 py-12">読み込み中...</div>
    <div v-else-if="notFound" class="text-center text-slate-500 py-12">プレイリストが見つかりません</div>
    <template v-else>
      <div class="relative p-4 min-[681px]:p-6">
        <div class="flex items-start gap-4">
          <div class="w-24 h-24 rounded-xl bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
            <img v-if="coverOf(posts[0])" :src="coverOf(posts[0])" class="w-full h-full object-cover" />
            <Icon v-else name="lucide:list-video" class="w-8 h-8 text-slate-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-indigo-400 uppercase tracking-wider">プレイリスト</p>
            <h1 class="text-2xl font-bold text-white truncate">{{ playlist?.name }}</h1>
            <p v-if="playlist?.description" class="text-sm text-slate-400 mt-1">{{ playlist.description }}</p>
            <p class="text-sm text-slate-500 mt-1">{{ posts.length }} 件の投稿</p>
            <button @click="deleteList" class="mt-2 text-xs text-red-400 hover:text-red-300 transition">削除</button>
          </div>
        </div>
      </div>

      <div class="px-4 min-[681px]:px-6">
        <p v-if="!posts.length" class="text-center text-slate-500 py-8">まだ投稿がありません。投稿の「…」メニューから追加できます。</p>
        <div v-else class="grid grid-cols-2 min-[681px]:grid-cols-3 gap-3">
          <button
            v-for="post in posts"
            :key="post.id"
            @click="open(post)"
            class="group relative aspect-video rounded-xl overflow-hidden bg-slate-800 border border-slate-800 hover:border-indigo-500/60 transition text-left"
          >
            <img v-if="coverOf(post)" :src="coverOf(post)" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            <div v-else class="w-full h-full p-2 text-xs text-slate-300 line-clamp-4">{{ post.content }}</div>
            <span v-if="isVideo(post)" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                <Icon name="lucide:play" class="w-5 h-5 text-white" />
              </span>
            </span>
            <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 text-[11px] text-white line-clamp-2">
              {{ post.content || 'メディア' }}
            </span>
            <span
              @click.stop="removeFromList(post.id)"
              class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white items-center justify-center hidden group-hover:flex"
              title="プレイリストから削除"
            >
              <Icon name="lucide:x" class="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
