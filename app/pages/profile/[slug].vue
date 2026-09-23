<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()
definePageMeta({})

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: me } = await useFetch('/api/auth/me', { key: 'profile-me' })
const isOwnProfile = computed(() => {
  if (!me.value?.user) return false
  return me.value.user.username === resolvedUsername.value || me.value.user.id === resolvedId.value
})

const profile = ref<any>(null)
const userPosts = ref<any[]>([])
const loading = ref(true)
const showSettings = ref(false)

const postOffset = ref(0)
const postHasMore = ref(true)
const { sentinel: postSentinel, loading: loadingMorePosts, reset: resetPostScroll } = useInfiniteScroll(async () => {
  return await loadPosts(false)
})

async function loadPosts(reset = true) {
  if (!resolvedId.value) return { hasMore: false }
  if (reset) {
    postOffset.value = 0
    postHasMore.value = true
    resetPostScroll()
  }
  if (!postHasMore.value) return { hasMore: false }
  try {
    const pageSize = reset ? FEED_PAGE_SIZE : 5
    const data = await $fetch(`/api/users/${resolvedId.value}/posts`, {
      params: { limit: pageSize, offset: postOffset.value },
    })
    const incoming = data.posts || []
    postOffset.value = data.nextOffset ?? (postOffset.value + incoming.length)
    postHasMore.value = data.hasMore ?? incoming.length === pageSize
    if (reset) {
      userPosts.value = incoming
    } else {
      const seen = new Set(userPosts.value.map(p => p.id))
      userPosts.value = [...userPosts.value, ...incoming.filter(p => !seen.has(p.id))]
    }
    return { hasMore: postHasMore.value }
  } catch {
    if (reset) userPosts.value = []
    return { hasMore: false }
  }
}

const resolvedId = ref('')
const resolvedUsername = ref('')

const activeTab = ref<'all' | 'images' | 'videos'>('all')
const showFilter = ref(false)
const showStickyBar = ref(false)
const profileNameRef = ref<HTMLElement | null>(null)
const profileHeaderState = useState<{displayName: string; username: string; avatarUrl: string | null; bannerUrl: string | null; badges?: any[]; title?: string | null} | null>('profile-header-state', () => null)

function onScroll() {
  if (!profileNameRef.value || !profile.value) return
  const top = profileNameRef.value.getBoundingClientRect().top
  showStickyBar.value = top < 58
  profileHeaderState.value = top < 58 ? { displayName: profile.value.user.displayName, username: profile.value.user.username, avatarUrl: profile.value.user.avatarUrl, bannerUrl: profile.value.user.bannerUrl, badges: profile.value.user.badges, title: profile.value.user.title } : null
}

onMounted(() => {
  loadProfile()
  const container = document.querySelector('main')
  container?.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  const container = document.querySelector('main')
  container?.removeEventListener('scroll', onScroll)
  profileHeaderState.value = null
})

async function loadProfile() {
  loading.value = true
  try {
    const s = slug.value
    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 10000)
    let data
    if (s.startsWith('@')) {
      const username = s.slice(1)
      resolvedUsername.value = username
      const resolved = await $fetch(`/api/users/by-username/${username}`, { signal: ac.signal })
      resolvedId.value = resolved.user.id
      data = await $fetch(`/api/users/${resolved.user.id}/profile`, { signal: ac.signal })
    } else {
      data = await $fetch(`/api/users/${s}/profile`, { signal: ac.signal })
      resolvedId.value = s
      resolvedUsername.value = data.user.username
    }
    profile.value = data
    friendStatus.value = data.friendStatus || 'none'
    clearTimeout(timeout)
    if (!data.locked) await loadPosts(true)
  } catch {
    profile.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)

const settings = computed(() => {
  try { return JSON.parse(profile.value?.user?.settings || '{}') } catch { return {} }
})

const filteredPosts = computed(() => {
  let posts = userPosts.value
  if (activeTab.value === 'images') {
    posts = posts.filter((p: any) => p.imageUrl || p.attachments?.some((a: any) => a.mime?.startsWith('image/')))
  } else if (activeTab.value === 'videos') {
    posts = posts.filter((p: any) => p.attachments?.some((a: any) => a.mime?.startsWith('video/')))
  }
  return posts
})

const followBusy = ref(false)
async function toggleFollow() {
  if (!profile.value || followBusy.value) return
  followBusy.value = true
  const isFollowing = profile.value.isFollowing
  try {
    await $fetch(`/api/users/${resolvedId.value}/${isFollowing ? 'unfollow' : 'follow'}`, { method: 'POST' })
    profile.value.isFollowing = !isFollowing
    const delta = isFollowing ? -1 : 1
    profile.value.stats.followers = Math.max(0, (profile.value.stats.followers || 0) + delta)
  } catch (e: any) {
    await loadProfile()
  } finally {
    followBusy.value = false
  }
}

async function toggleCloseFriend() {
  try { await $fetch(`/api/users/${resolvedId.value}/close-friends`, { method: 'POST' }) }
  catch { await $fetch(`/api/users/${resolvedId.value}/close-friends`, { method: 'DELETE' }) }
}

const friendBusy = ref(false)
const friendCooldown = ref(0)
let friendCooldownTimer: ReturnType<typeof setInterval> | null = null
watch(friendCooldown, (cd) => {
  if (cd <= 0) {
    if (friendCooldownTimer) { clearInterval(friendCooldownTimer); friendCooldownTimer = null }
  } else if (!friendCooldownTimer) {
    friendCooldownTimer = setInterval(() => { friendCooldown.value = Math.max(0, friendCooldown.value - 1) }, 1000)
  }
})
onUnmounted(() => { if (friendCooldownTimer) clearInterval(friendCooldownTimer) })

const friendStatus = ref<'none' | 'sent' | 'received' | 'accepted'>('none')
const isFriend = computed(() => friendStatus.value === 'accepted')
const sentCountdown = computed(() => friendCooldown.value > 0 ? `(${friendCooldown.value}秒)` : '')

async function sendFriendRequest() {
  if (!profile.value || friendBusy.value) return
  if (friendStatus.value === 'sent' && friendCooldown.value > 0) return
  friendBusy.value = true
  try {
    await $fetch(`/api/users/${resolvedId.value}/friends`, { method: 'POST' })
    friendStatus.value = 'sent'
    friendCooldown.value = 30
  } catch (e: any) {
    const code = e?.data?.code
    if (code === 'ALREADY_FRIENDS') {
      friendStatus.value = 'accepted'
      friendCooldown.value = 0
    } else if (code === 'INBOUND_PENDING') {
      friendStatus.value = 'received'
    } else {
      alert(e?.data?.message || 'フレンド申請を送信できませんでした')
    }
  } finally {
    friendBusy.value = false
  }
}

async function acceptFriendRequest() {
  if (!profile.value || friendBusy.value) return
  friendBusy.value = true
  try {
    await $fetch(`/api/users/${resolvedId.value}/friends/accept`, { method: 'POST' })
    friendStatus.value = 'accepted'
    friendCooldown.value = 0
  } catch {
    alert('フレンド申請を承認できませんでした')
  } finally {
    friendBusy.value = false
  }
}

const startingDM = ref(false)
async function startDM() {
  if (startingDM.value) return
  startingDM.value = true
  try { const data = await $fetch('/api/dm/channels', { method: 'POST', body: { participantId: resolvedId.value } }); await navigateTo(`/dm/${data.channel.id}`) }
  catch { alert('DMを作成できませんでした') }
  finally { startingDM.value = false }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'たった今'
  if (m < 60) return `${m}分前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}時間前`
  return `${Math.floor(h / 24)}日前`
}

async function toggleRepost(postId: string) {
  const p = userPosts.value.find(x => x.id === postId)
  if (!p) return
  try {
    if (p.reposted) { await $fetch(`/api/posts/${postId}/unrepost`, { method: 'POST' }); p.reposted = false; p.repostCount = Math.max(0, (p.repostCount || 0) - 1) }
    else { await $fetch(`/api/posts/${postId}/repost`, { method: 'POST' }); p.reposted = true; p.repostCount = (p.repostCount || 0) + 1 }
  } catch {}
}

async function toggleBookmark(postId: string) {
  const p = userPosts.value.find(x => x.id === postId)
  if (!p) return
  try { const res = await $fetch<{ bookmarked: boolean }>('/api/bookmarks/toggle', { method: 'POST', body: { postId } }); p.bookmarked = res.bookmarked } catch {}
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <p v-if="loading" class="text-center text-slate-500 py-8">読み込み中...</p>
    <p v-else-if="!profile" class="text-center text-slate-500 py-8">ユーザーが見つかりません</p>
    <template v-else>
      <!-- Profile header - full width -->
      <div class="bg-slate-800/30 border-b border-slate-800">
        <div :class="profile.user.bannerUrl ? 'aspect-[3/1]' : 'h-32'" class="bg-gradient-to-r from-indigo-900/50 to-purple-900/50"
          :style="profile.user.bannerUrl ? `background-image: url(${profile.user.bannerUrl}); background-size: cover; background-position: center;` : ''" />
        <div class="px-5 pb-5">
          <div class="flex items-end -mt-12 mb-3">
            <img v-if="profile.user.avatarUrl" :src="profile.user.avatarUrl"
              class="w-20 h-20 rounded-full border-4 border-[#0b0f19] object-cover" />
            <div v-else class="w-20 h-20 rounded-full border-4 border-[#0b0f19] bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
              {{ profile.user.displayName?.charAt(0) || '?' }}
            </div>
          </div>
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 ref="profileNameRef" class="text-xl font-bold text-white">{{ profile.user.displayName }}</h1>
                <UserBadges :badges="profile.user.badges" size="md" />
                <UserTitle :title="profile.user.title" />
                <Icon v-if="profile.isPrivate" name="lucide:lock" class="w-4 h-4 text-slate-400" title="鍵アカウント" />
              </div>
              <p class="text-slate-500">@{{ profile.user.username }}</p>
              <p v-if="profile.user.bio" class="mt-2 text-slate-300 text-sm">{{ profile.user.bio }}</p>
              <div v-if="settings.website || settings.github || settings.twitter" class="flex flex-wrap gap-3 mt-2">
                <a v-if="settings.website" :href="settings.website" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition"><Icon name="lucide:globe" class="w-3.5 h-3.5" /> {{ settings.website.replace(/^https?:\/\//, '').replace(/\/$/, '') }}</a>
                <a v-if="settings.github" :href="`https://github.com/${settings.github}`" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition"><Icon name="lucide:github" class="w-3.5 h-3.5" /> {{ settings.github }}</a>
                <a v-if="settings.twitter" :href="`https://x.com/${settings.twitter.replace('@', '')}`" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition"><Icon name="lucide:twitter" class="w-3.5 h-3.5" /> {{ settings.twitter }}</a>
              </div>
            </div>
            <div class="flex gap-2 shrink-0 flex-wrap justify-end">
              <template v-if="isOwnProfile">
                <button @click="showSettings = true" class="px-4 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5"><Icon name="lucide:settings" class="w-4 h-4" /> 設定</button>
              </template>
              <template v-else-if="me?.user">
                <button @click="toggleFollow" :disabled="followBusy"
                  class="px-4 py-1.5 rounded-lg text-sm font-bold transition disabled:opacity-50"
                  :class="profile.isFollowing ? 'border border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-indigo-600 text-white hover:bg-indigo-700'">
                  {{ profile.isFollowing ? 'フォロー中' : 'フォロー' }}
                </button>
                <button @click="toggleCloseFriend" class="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition" title="親しい友達"><Icon name="lucide:heart" class="w-4 h-4" /></button>
                <template v-if="friendStatus === 'accepted'">
                  <span class="px-3 py-1.5 rounded-lg border border-emerald-700/60 bg-emerald-500/10 text-sm text-emerald-400 font-medium"
                    title="フレンド"><Icon name="lucide:user-check" class="w-4 h-4" /></span>
                </template>
                <button v-else-if="friendStatus === 'received'" @click="acceptFriendRequest" :disabled="friendBusy"
                  class="px-3 py-1.5 rounded-lg border border-emerald-600 text-sm text-emerald-400 hover:bg-emerald-600/10 transition disabled:opacity-50"
                  title="相手から申請が来ています - 承認"><Icon name="lucide:user-check" class="w-4 h-4" /></button>
                <button v-else @click="sendFriendRequest" :disabled="friendBusy || (friendStatus === 'sent' && friendCooldown > 0)"
                  class="px-3 py-1.5 rounded-lg border border-slate-700 text-sm transition disabled:opacity-50"
                  :class="friendStatus === 'sent' ? 'text-indigo-400 border-indigo-700/60 bg-indigo-500/10' : 'text-slate-300 hover:bg-slate-800'"
                  :title="friendStatus === 'sent' ? `申請済み - ${friendCooldown}秒後に再送できます` : 'フレンド申請'">
                  <Icon :name="friendStatus === 'sent' ? 'lucide:check-check' : 'lucide:user-plus'" class="w-4 h-4" />
                  <span v-if="friendStatus === 'sent'" class="ml-1">{{ sentCountdown }}</span>
                </button>
                <button @click="startDM" class="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition" title="DMを送る"><Icon name="lucide:message-square" class="w-4 h-4" /></button>
              </template>
            </div>
          </div>
          <!-- Stats -->
          <div class="flex gap-5 mt-4 text-sm">
            <span><span class="font-bold text-white">{{ profile.stats.posts }}</span> <span class="text-slate-500">投稿</span></span>
            <span><span class="font-bold text-white">{{ profile.stats.followers }}</span> <span class="text-slate-500">フォロワー</span></span>
            <span><span class="font-bold text-white">{{ profile.stats.following }}</span> <span class="text-slate-500">フォロー中</span></span>
          </div>
          <div v-if="settings.birthday || settings.birthplace" class="flex gap-4 mt-3 text-xs text-slate-500">
            <span v-if="settings.birthday"><Icon name="lucide:cake" class="w-3.5 h-3.5 inline mr-1" />{{ settings.birthday }}</span>
            <span v-if="settings.birthplace"><Icon name="lucide:map-pin" class="w-3.5 h-3.5 inline mr-1" />{{ settings.birthplace }}</span>
          </div>
        </div>
      </div>

      <SettingsModal v-if="isOwnProfile && showSettings" @close="showSettings = false; loadProfile()" />

      <!-- Tabs -->
      <div class="flex items-center border-b border-slate-800 px-5 sticky top-0 backdrop-blur-[10px] z-40">
        <button v-for="tab in [{ key: 'all', label: '投稿' }, { key: 'images', label: '画像' }, { key: 'videos', label: '動画' }]" :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-3 text-sm font-medium transition border-b-2 -mb-[1px]"
          :class="activeTab === tab.key ? 'text-white border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'">
          {{ tab.label }}
        </button>
        <div class="relative ml-auto">
          <button @click="showFilter = !showFilter" class="p-2 text-slate-500 hover:text-white transition"><Icon name="lucide:sliders-horizontal" class="w-4 h-4" /></button>
          <div v-if="showFilter" class="absolute top-full right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl z-50 min-w-40" @click.outside="showFilter = false">
            <button class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition">人気順</button>
            <button class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition">新しい順</button>
            <button class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition">古い順</button>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div class="px-5 space-y-3 py-4">
        <div v-if="profile.locked" class="text-center py-12 text-slate-400">
          <Icon name="lucide:lock" class="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <p class="font-bold text-white">このアカウントは非公開です</p>
          <p class="text-sm mt-1">フォローすると投稿を閲覧できます。</p>
        </div>
        <template v-else-if="filteredPosts.length">
          <div v-for="post in filteredPosts" :key="post.id" class="p-4 bg-slate-800/30 border border-slate-800 rounded-xl">
            <div class="flex gap-3">
              <NuxtLink :to="`/profile/@${post.user.username}`" class="shrink-0">
                <img v-if="post.user.avatarUrl" :src="post.user.avatarUrl" class="w-10 h-10 rounded-full object-cover" />
                <div v-else class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">{{ post.user.displayName.charAt(0) }}</div>
              </NuxtLink>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <NuxtLink :to="`/profile/@${post.user.username}`" class="font-bold text-white hover:underline truncate">{{ post.user.displayName }}</NuxtLink>
                  <UserBadges :badges="post.user.badges" />
                  <UserTitle :title="post.user.title" />
                  <span class="text-slate-500 text-sm shrink-0">@{{ post.user.username }} · {{ timeAgo(post.createdAt) }}</span>
                </div>
                <p class="text-slate-200 leading-relaxed whitespace-pre-wrap break-words" v-html="renderRichText(post.content, { custom: customEmojiMap })" />
                <PostAttachments v-if="post.attachments?.length" :attachments="post.attachments" />
                <div class="flex items-center gap-4 mt-3 text-slate-500">
                  <button @click="toggleRepost(post.id)" class="flex items-center gap-1.5 transition text-sm" :class="post.reposted ? 'text-green-400' : 'hover:text-green-400'">
                    <Icon name="lucide:repeat-2" class="w-4 h-4" /> <span>{{ post.repostCount || 0 }}</span>
                  </button>
                  <button @click="toggleBookmark(post.id)" class="flex items-center gap-1.5 transition text-sm" :class="post.bookmarked ? 'text-amber-400' : 'hover:text-amber-400'">
                    <svg viewBox="0 0 24 24" class="w-4 h-4" :class="post.bookmarked ? 'fill-amber-400 stroke-amber-400' : 'stroke-current fill-none'"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
        <p v-else-if="!profile.locked" class="text-center text-slate-500 py-8">まだ投稿がありません</p>

        <div v-if="!profile.locked" ref="postSentinel" class="h-1" aria-hidden="true"></div>
        <div v-if="!profile.locked && loadingMorePosts" class="text-center text-slate-500 py-4 text-sm">読み込み中...</div>
        <p v-else-if="!profile.locked && userPosts.length && !postHasMore" class="text-center text-slate-600 py-4 text-xs">すべて表示しました</p>
      </div>
    </template>
  </div>
</template>
