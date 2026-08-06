<script setup lang="ts">
import { PERMISSIONS, PERMISSION_GROUPS, hasPermission } from '~/utils/serverPermissions'

const props = defineProps<{
  serverId: string
  server: any
  channels: any[]
  roles: any[]
  members: any[]
  myPermissions: number
  isOwner: boolean
  initialTab?: string
  initialChannelId?: string | null
}>()

const emit = defineEmits<{ close: []; refresh: []; deleted: [] }>()

const { on } = useRealtime()

const tab = ref(props.initialTab || 'overview')
const tabs = [
  { key: 'overview', label: '概要', icon: 'lucide:settings' },
  { key: 'channels', label: 'チャンネル', icon: 'lucide:hash' },
  { key: 'roles', label: 'ロール', icon: 'lucide:shield' },
  { key: 'members', label: 'メンバー', icon: 'lucide:users' },
  { key: 'invites', label: '招待', icon: 'lucide:link' },
] as const

const can = {
  server: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_SERVER),
  channels: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_CHANNELS),
  roles: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_ROLES),
  members: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_MEMBERS),
  invites: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_INVITES),
}

const saving = ref(false)
const notice = ref<string | null>(null)
const noticeError = ref<string | null>(null)

function flash(msg: string, isError = false) {
  if (isError) { noticeError.value = msg; notice.value = null } else { notice.value = msg; noticeError.value = null }
  setTimeout(() => { notice.value = null; noticeError.value = null }, 3000)
}

async function api(path: string, opts: any = {}) {
  try {
    const res = await $fetch(path, opts)
    emit('refresh')
    return res
  } catch (e: any) {
    flash(e?.data?.message || 'エラーが発生しました', true)
    return null
  }
}

watch(() => props.serverId, () => { if (props.initialTab) tab.value = props.initialTab })

/* ---------- Overview / community ---------- */
const form = reactive({ name: '', description: '', isPublic: true })

watch(() => props.server, (s) => {
  if (s) {
    form.name = s.name || ''
    form.description = s.description || ''
    form.isPublic = s.isPublic !== false
  }
}, { immediate: true })

async function saveOverview() {
  saving.value = true
  try {
    await $fetch(`/api/servers/${props.serverId}`, {
      method: 'PUT',
      body: { name: form.name, description: form.description, isPublic: form.isPublic },
    })
    emit('refresh')
    flash('サーバー設定を保存しました')
  } catch (e: any) {
    flash(e?.data?.message || '保存に失敗しました', true)
  } finally {
    saving.value = false
  }
}

async function uploadImage(kind: 'icon' | 'banner', file: File) {
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  saving.value = true
  try {
    await $fetch(`/api/upload/server/${props.serverId}/${kind}`, { method: 'POST', body: fd })
    emit('refresh')
    flash(kind === 'icon' ? 'アイコンを更新しました' : 'バナーを更新しました')
  } catch (e: any) {
    flash(e?.data?.message || 'アップロードに失敗しました', true)
  } finally {
    saving.value = false
  }
}

async function deleteServer() {
  if (!confirm('本当にこのサーバーを削除しますか？\nこの操作は取り消せません。')) return
  await $fetch(`/api/servers/${props.serverId}`, { method: 'DELETE' })
  emit('deleted')
}

/* ---------- Channels ---------- */
const newChannel = reactive({ name: '', description: '', type: 'text' })
const expandedChannelId = ref<string | null>(null)
const channelDrafts = reactive<Record<string, any>>({})

const channelTypes = [
  { key: 'text', label: 'テキスト', icon: 'lucide:hash' },
  { key: 'voice', label: '音声', icon: 'lucide:volume-2' },
] as const

function channelTypeIcon(type?: string) {
  return type === 'voice' ? 'lucide:volume-2' : 'lucide:hash'
}

function draftOf(ch: any) {
  if (!channelDrafts[ch.id]) {
    channelDrafts[ch.id] = {
      name: ch.name,
      type: ch.type || 'text',
      description: ch.description || '',
      slowModeSeconds: ch.slowModeSeconds || 0,
      nsfw: !!ch.nsfw,
    }
  }
  return channelDrafts[ch.id]
}

async function createChannel() {
  if (!newChannel.name.trim()) return
  await api(`/api/servers/${props.serverId}/channels`, {
    method: 'POST',
    body: { name: newChannel.name, description: newChannel.description, type: newChannel.type },
  })
  newChannel.name = ''
  newChannel.description = ''
}

async function saveChannel(ch: any) {
  const d = draftOf(ch)
  const res = await api(`/api/servers/${props.serverId}/channels/${ch.id}`, {
    method: 'PUT',
    body: {
      name: d.name,
      description: d.description,
      type: d.type,
      slowModeSeconds: d.slowModeSeconds,
      nsfw: d.nsfw,
    },
  })
  if (res) flash('チャンネルを更新しました')
}

async function deleteChannel(ch: any) {
  if (!confirm(`チャンネル #${ch.name} を削除しますか？`)) return
  const res = await api(`/api/servers/${props.serverId}/channels/${ch.id}`, { method: 'DELETE' })
  if (res) {
    expandedChannelId.value = null
    flash('チャンネルを削除しました')
  }
}

/* ---------- Roles ---------- */
const newRoleName = ref('')
const newRoleColor = ref('#6366f1')
const selectedRoleId = ref<string | null>(null)
const roleDraft = reactive<{ name: string; color: string; mask: number; isAdmin: boolean }>({ name: '', color: '#99aab5', mask: 0, isAdmin: false })

const selectedRole = computed(() => props.roles.find(r => r.id === selectedRoleId.value) || null)

function selectRole(role: any) {
  selectedRoleId.value = role.id
  roleDraft.name = role.name
  roleDraft.color = role.color || '#99aab5'
  roleDraft.mask = typeof role.permissionsMask === 'number' ? role.permissionsMask : 0
  roleDraft.isAdmin = !!role.isAdmin || role.permissions === 'all'
}

function togglePerm(perm: number) {
  roleDraft.mask ^= perm
}

async function addRole() {
  if (!newRoleName.value.trim()) return
  const res = await api(`/api/servers/${props.serverId}/roles`, {
    method: 'POST',
    body: { name: newRoleName.value, color: newRoleColor.value },
  })
  if (res) {
    newRoleName.value = ''
    selectRole(res.role)
  }
}

async function saveRole() {
  if (!roleDraft.name.trim()) return
  const res = await api(`/api/servers/${props.serverId}/roles/${selectedRoleId.value}`, {
    method: 'PUT',
    body: { name: roleDraft.name, color: roleDraft.color, permissionsMask: roleDraft.mask },
  })
  if (res) flash('ロールを保存しました')
}

async function removeRole() {
  if (!selectedRole.value) return
  if (!confirm(`ロール「${selectedRole.value.name}」を削除しますか？`)) return
  const res = await api(`/api/servers/${props.serverId}/roles/${selectedRole.value.id}`, { method: 'DELETE' })
  if (res) {
    selectedRoleId.value = null
    flash('ロールを削除しました')
  }
}

/* ---------- Members ---------- */
const memberDrafts = reactive<Record<string, { nickname: string; roleId: string }>>({})

function memberDraftOf(member: any) {
  if (!memberDrafts[member.userId]) {
    memberDrafts[member.userId] = { nickname: member.nickname || '', roleId: member.roleId || '' }
  }
  return memberDrafts[member.userId]
}

const assignableRoles = computed(() => props.roles.filter(r => !r.isAdmin))

async function saveMember(member: any) {
  const d = memberDraftOf(member)
  const res = await api(`/api/servers/${props.serverId}/members/${member.userId}`, {
    method: 'PUT',
    body: { nickname: d.nickname, roleId: d.roleId || null },
  })
  if (res) flash('メンバー設定を保存しました')
}

async function kickMember(member: any) {
  if (!confirm(`${member.user?.displayName || member.nickname || 'このメンバー'}をキックしますか？`)) return
  const res = await api(`/api/servers/${props.serverId}/members/${member.userId}`, { method: 'DELETE' })
  if (res) flash('メンバーをキックしました')
}

/* ---------- Invites ---------- */
const invites = ref<any[]>([])
const inviteForm = reactive({ maxUses: 0, expiresInHours: 0 })
const copiedCode = ref<string | null>(null)

async function loadInvites() {
  try {
    const res = await $fetch(`/api/servers/${props.serverId}/invites`)
    invites.value = res.invites
  } catch { invites.value = [] }
}

async function createInvite() {
  const res = await api(`/api/servers/${props.serverId}/invites`, {
    method: 'POST',
    body: { maxUses: inviteForm.maxUses, expiresInHours: inviteForm.expiresInHours },
  })
  if (res) {
    await loadInvites()
    flash('招待を作成しました')
  }
}

async function revokeInvite(invite: any) {
  const res = await api(`/api/servers/${props.serverId}/invites/${invite.id}`, { method: 'DELETE' })
  if (res) {
    await loadInvites()
    flash('招待を取り消しました')
  }
}

async function copyInvite(invite: any) {
  const link = `${window.location.origin}/invite/${invite.code}`
  try {
    await navigator.clipboard.writeText(link)
    copiedCode.value = invite.code
    setTimeout(() => { copiedCode.value = null }, 2000)
  } catch {
    flash('コピーに失敗しました', true)
  }
}

function expiresLabel(invite: any) {
  if (!invite.expiresAt) return '期限なし'
  return `〜 ${new Date(invite.expiresAt).toLocaleDateString('ja-JP')}`
}

watch(tab, async (t) => {
  if (t === 'invites') await loadInvites()
})
onMounted(() => {
  if (props.initialChannelId) {
    tab.value = 'channels'
    expandedChannelId.value = props.initialChannelId
  }
  if (tab.value === 'invites') loadInvites()
  offRealtime = on('server.updated', (p) => {
    if (p.serverId === props.serverId && tab.value === 'invites') loadInvites()
  })
})

let offRealtime: (() => void) | null = null
onUnmounted(() => { offRealtime?.() })

const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none'
const labelCls = 'text-xs text-slate-500 font-medium block mb-1'
const btnPrimary = 'px-4 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50'
const btnGhost = 'px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition'
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[90] flex items-center justify-center p-4" @click.self="emit('close')">
      <div class="absolute inset-0 bg-black/60" />
      <div class="relative bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h2 class="text-lg font-bold text-white">サーバー設定</h2>
          <button @click="emit('close')" class="text-slate-500 hover:text-white transition">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex flex-1 min-h-0">
          <!-- Sidebar tabs -->
          <div class="w-44 shrink-0 border-r border-slate-800 p-3 space-y-1 overflow-y-auto">
            <button
              v-for="t in tabs"
              :key="t.key"
              @click="tab = t.key"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition"
              :class="tab === t.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'"
            >
              <Icon :name="t.icon" class="w-4 h-4" />
              {{ t.label }}
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 overflow-y-auto p-5">
            <div v-if="notice" class="mb-4 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-400">
              {{ notice }}
            </div>
            <div v-if="noticeError" class="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              {{ noticeError }}
            </div>

            <!-- ============ Overview / Community ============ -->
            <template v-if="tab === 'overview'">
              <h3 class="text-lg font-bold text-white mb-1">コミュニティ設定</h3>
              <p class="text-sm text-slate-500 mb-5">サーバーの基本情報と公開設定を管理します。</p>

              <div class="flex items-center gap-5 mb-6">
                <div class="relative w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden shrink-0">
                  <img v-if="server?.iconUrl" :src="server.iconUrl" class="w-full h-full object-cover" />
                  <template v-else>{{ server?.name?.charAt(0) }}</template>
                </div>
                <div class="flex flex-col gap-2">
                  <label v-if="can.server()" class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 transition w-fit">
                    <Icon name="lucide:image" class="w-3.5 h-3.5" />
                    アイコンを変更
                    <input type="file" accept="image/*" class="hidden" @change="e => uploadImage('icon', (e.target as HTMLInputElement).files![0])" />
                  </label>
                  <span class="text-[11px] text-slate-600">正方形画像（256×256）</span>
                </div>
              </div>

              <div class="space-y-4" :class="can.server() ? '' : 'pointer-events-none opacity-60'">
                <div>
                  <label class="labelCls">サーバー名</label>
                  <input v-model="form.name" :class="inputCls" maxlength="100" />
                </div>
                <div>
                  <label class="labelCls">説明</label>
                  <textarea v-model="form.description" rows="3" :class="inputCls" placeholder="サーバーの説明" maxlength="500" />
                </div>
                <div class="flex items-center justify-between bg-slate-800/50 border border-slate-800 rounded-lg px-4 py-3">
                  <div>
                    <p class="text-sm font-bold text-white">公開サーバー</p>
                    <p class="text-xs text-slate-500 mt-0.5">オンにするとサーバーを公開し、誰でも招待リンクから参加できます</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="form.isPublic"
                    @click="form.isPublic = !form.isPublic"
                    class="w-11 h-6 rounded-full transition relative shrink-0"
                    :class="form.isPublic ? 'bg-indigo-600' : 'bg-slate-700'"
                  >
                    <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" :class="form.isPublic ? 'left-[22px]' : 'left-0.5'" />
                  </button>
                </div>

                <div>
                  <label class="labelCls">バナー画像</label>
                  <div class="relative h-24 rounded-xl overflow-hidden border border-slate-800">
                    <img v-if="server?.bannerUrl" :src="server.bannerUrl" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-slate-600 text-xs bg-slate-800/40">バナー未設定</div>
                    <label class="absolute bottom-2 right-2 cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-xs text-white hover:bg-black/80 transition">
                      <Icon name="lucide:upload" class="w-3.5 h-3.5" />
                      変更
                      <input type="file" accept="image/*" class="hidden" @change="e => uploadImage('banner', (e.target as HTMLInputElement).files![0])" />
                    </label>
                  </div>
                  <p class="text-[11px] text-slate-600 mt-1">横長画像（1600×450）がおすすめです</p>
                </div>
              </div>

              <div v-if="can.server()" class="flex justify-end gap-2 mt-6">
                <button @click="emit('close')" :class="btnGhost">キャンセル</button>
                <button @click="saveOverview" :disabled="saving" :class="btnPrimary">保存</button>
              </div>

              <div v-if="isOwner" class="border-t border-slate-800 mt-8 pt-5">
                <h4 class="text-sm font-bold text-red-400 mb-2">危険ゾーン</h4>
                <p class="text-xs text-slate-500 mb-3">サーバーを削除すると、すべてのチャンネル・メッセージ・メンバー情報が削除されます。</p>
                <button @click="deleteServer" class="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition border border-red-600/30">
                  サーバーを削除
                </button>
              </div>
            </template>

            <!-- ============ Channels ============ -->
            <template v-if="tab === 'channels'">
              <h3 class="text-lg font-bold text-white mb-1">チャンネル設定</h3>
              <p class="text-sm text-slate-500 mb-5">チャンネルの作成・編集・削除ができます。</p>

              <div v-if="can.channels()" class="bg-slate-800/30 border border-slate-800 rounded-xl p-4 mb-4 space-y-2.5">
                <p class="text-sm font-bold text-slate-400">新しいチャンネル</p>
                <div class="flex gap-2">
                  <input v-model="newChannel.name" :class="inputCls" placeholder="チャンネル名" maxlength="50" />
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex rounded-lg bg-slate-800 border border-slate-700 p-0.5">
                    <button
                      v-for="t in channelTypes"
                      :key="t.key"
                      type="button"
                      @click="newChannel.type = t.key"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition"
                      :class="newChannel.type === t.key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'"
                    >
                      <Icon :name="t.icon" class="w-3.5 h-3.5" />
                      {{ t.label }}
                    </button>
                  </div>
                  <input v-model="newChannel.description" :class="inputCls" placeholder="説明（任意）" maxlength="200" />
                  <button @click="createChannel" :disabled="!newChannel.name.trim()" :class="btnPrimary" class="shrink-0">作成</button>
                </div>
              </div>

              <div class="space-y-2">
                <div v-for="ch in channels" :key="ch.id" class="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden">
                  <div class="flex items-center gap-2 px-4 py-3">
                    <Icon :name="channelTypeIcon(ch.type)" class="w-4 h-4 text-slate-500 shrink-0" />
                    <span class="text-sm font-bold text-white flex-1 truncate">{{ ch.name }}</span>
                    <span v-if="ch.type === 'voice'" class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-0.5">音声</span>
                    <span v-if="ch.nsfw" class="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5">NSFW</span>
                    <span v-if="ch.slowModeSeconds > 0" class="text-[10px] text-slate-500">スローモード {{ ch.slowModeSeconds }}s</span>
                    <button v-if="can.channels()" @click="expandedChannelId = expandedChannelId === ch.id ? null : ch.id" class="text-slate-500 hover:text-white transition">
                      <Icon :name="expandedChannelId === ch.id ? 'lucide:chevron-up' : 'lucide:settings-2'" class="w-4 h-4" />
                    </button>
                  </div>

                  <div v-if="expandedChannelId === ch.id && can.channels()" class="border-t border-slate-800 p-4 space-y-3">
                    <div>
                      <label :class="labelCls">チャンネル名</label>
                      <input v-model="draftOf(ch).name" :class="inputCls" maxlength="50" />
                    </div>
                    <div>
                      <label :class="labelCls">チャンネルタイプ</label>
                      <div class="flex rounded-lg bg-slate-800 border border-slate-700 p-0.5 w-fit">
                        <button
                          v-for="t in channelTypes"
                          :key="t.key"
                          type="button"
                          @click="draftOf(ch).type = t.key"
                          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition"
                          :class="draftOf(ch).type === t.key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'"
                        >
                          <Icon :name="t.icon" class="w-3.5 h-3.5" />
                          {{ t.label }}
                        </button>
                      </div>
                      <p v-if="draftOf(ch).type === 'voice'" class="text-[11px] text-emerald-500 mt-1">音声チャンネルでは通話に参加できます。メッセージは表示されません。</p>
                    </div>
                    <div>
                      <label :class="labelCls">説明</label>
                      <input v-model="draftOf(ch).description" :class="inputCls" maxlength="200" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label :class="labelCls">スローモード（秒）</label>
                        <input v-model.number="draftOf(ch).slowModeSeconds" type="number" min="0" max="21600" :class="inputCls" />
                      </div>
                      <div class="flex items-end pb-1">
                        <button
                          type="button"
                          role="switch"
                          :aria-checked="draftOf(ch).nsfw"
                          @click="draftOf(ch).nsfw = !draftOf(ch).nsfw"
                          class="w-11 h-6 rounded-full transition relative"
                          :class="draftOf(ch).nsfw ? 'bg-red-600' : 'bg-slate-700'"
                        >
                          <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" :class="draftOf(ch).nsfw ? 'left-[22px]' : 'left-0.5'" />
                        </button>
                        <span class="text-sm text-slate-400 ml-2">NSFWチャンネル</span>
                      </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-1">
                      <button @click="deleteChannel(ch)" class="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition border border-red-600/30">
                        削除
                      </button>
                      <button @click="saveChannel(ch)" class="px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition">保存</button>
                    </div>
                  </div>
                </div>
                <p v-if="!channels.length" class="text-sm text-slate-500 text-center py-6">チャンネルがありません</p>
              </div>
            </template>

            <!-- ============ Roles ============ -->
            <template v-if="tab === 'roles'">
              <h3 class="text-lg font-bold text-white mb-1">ロールと権限</h3>
              <p class="text-sm text-slate-500 mb-5">ロールを作成し、詳細な権限を設定できます。</p>

              <div class="grid grid-cols-[180px_1fr] gap-4">
                <div class="space-y-1">
                  <div
                    v-for="role in roles"
                    :key="role.id"
                    @click="selectRole(role)"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition"
                    :class="selectedRoleId === role.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
                  >
                    <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: role.color || '#6366f1' }" />
                    <span class="text-sm truncate">{{ role.name }}</span>
                  </div>
                  <div v-if="can.roles()" class="border-t border-slate-800 pt-3 mt-3 space-y-2">
                    <input v-model="newRoleName" :class="inputCls" placeholder="新しいロール名" maxlength="30" />
                    <div class="flex gap-2 items-center">
                      <input v-model="newRoleColor" type="color" class="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer" />
                      <button @click="addRole" :disabled="!newRoleName.trim()" class="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">ロールを作成</button>
                    </div>
                  </div>
                </div>

                <div class="bg-slate-800/30 border border-slate-800 rounded-xl p-4 min-h-[300px]">
                  <template v-if="selectedRole">
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-2">
                        <span class="w-4 h-4 rounded-full" :style="{ backgroundColor: roleDraft.color }" />
                        <span class="font-bold text-white">{{ roleDraft.name }}</span>
                      </div>
                      <div v-if="can.roles()" class="flex gap-2">
                        <button v-if="!roleDraft.isAdmin" @click="removeRole" class="text-slate-500 hover:text-red-400 transition">
                          <Icon name="lucide:trash-2" class="w-4 h-4" />
                        </button>
                        <button @click="saveRole" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition">保存</button>
                      </div>
                    </div>

                    <div v-if="can.roles()" class="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label :class="labelCls">ロール名</label>
                        <input v-model="roleDraft.name" :class="inputCls" maxlength="30" />
                      </div>
                      <div>
                        <label :class="labelCls">色</label>
                        <input v-model="roleDraft.color" type="color" class="w-full h-10 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer" />
                      </div>
                    </div>

                    <p v-if="roleDraft.isAdmin" class="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-3">
                      <Icon name="lucide:crown" class="w-3.5 h-3.5 inline mr-1" />
                      管理者ロールはすべての権限を持ち、権限を編集できません。
                    </p>

                    <div v-if="can.roles() && !roleDraft.isAdmin">
                      <div v-for="group in PERMISSION_GROUPS" :key="group.label" class="mb-4">
                        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{{ group.label }}</p>
                        <div class="space-y-1">
                          <button
                            v-for="p in group.permissions"
                            :key="p.key"
                            @click="togglePerm(PERMISSIONS[p.key])"
                            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition text-left"
                          >
                            <span
                              class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
                              :class="(roleDraft.mask & PERMISSIONS[p.key]) === PERMISSIONS[p.key] ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600'"
                            >
                              <Icon v-if="(roleDraft.mask & PERMISSIONS[p.key]) === PERMISSIONS[p.key]" name="lucide:check" class="w-3.5 h-3.5 text-white" />
                            </span>
                            <span>
                              <span class="block text-sm text-slate-200">{{ p.label }}</span>
                              <span class="block text-xs text-slate-500">{{ p.description }}</span>
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <p v-if="!can.roles() && !roleDraft.isAdmin" class="text-xs text-slate-500">
                      ロールを編集する権限がありません。現在の権限は読み取り専用です。
                    </p>
                  </template>
                  <p v-else class="text-sm text-slate-500 text-center py-10">ロールを選択してください</p>
                </div>
              </div>
            </template>

            <!-- ============ Members ============ -->
            <template v-if="tab === 'members'">
              <h3 class="text-lg font-bold text-white mb-1">メンバー管理</h3>
              <p class="text-sm text-slate-500 mb-5">{{ members.length }} 人のメンバー</p>

              <div class="space-y-2">
                <div v-for="member in members" :key="member.userId" class="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                      <img v-if="member.user?.avatarUrl" :src="member.user.avatarUrl" class="w-full h-full object-cover" />
                      <template v-else>{{ member.user?.displayName?.charAt(0) || '?' }}</template>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-white truncate">{{ member.user?.displayName || member.nickname || '不明' }}</span>
                        <span v-if="member.role" class="text-[11px] px-2 py-0.5 rounded-full" :style="{ color: member.role.color || '#99aab5', backgroundColor: (member.role.color || '#99aab5') + '22' }">
                          {{ member.role.name }}
                        </span>
                        <span v-if="server?.ownerId === member.userId" class="text-[11px] text-amber-400">所有者</span>
                      </div>
                      <p class="text-xs text-slate-500 truncate">@{{ member.user?.username }}</p>
                    </div>
                  </div>

                  <div v-if="can.members() && server?.ownerId !== member.userId" class="flex flex-wrap items-end gap-2 mt-3 pt-3 border-t border-slate-800">
                    <div class="flex-1 min-w-[140px]">
                      <label :class="labelCls">ニックネーム</label>
                      <input v-model="memberDraftOf(member).nickname" :class="inputCls" placeholder="サーバー内ニックネーム" maxlength="30" />
                    </div>
                    <div class="min-w-[140px]">
                      <label :class="labelCls">ロール</label>
                      <select v-model="memberDraftOf(member).roleId" :class="inputCls">
                        <option value="">（ロールなし）</option>
                        <option v-for="r in assignableRoles" :key="r.id" :value="r.id">{{ r.name }}</option>
                      </select>
                    </div>
                    <button @click="kickMember(member)" class="px-3 py-2 rounded-lg bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition border border-red-600/30 shrink-0">
                      キック
                    </button>
                    <button @click="saveMember(member)" class="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0">保存</button>
                  </div>
                </div>
              </div>
            </template>

            <!-- ============ Invites ============ -->
            <template v-if="tab === 'invites'">
              <h3 class="text-lg font-bold text-white mb-1">招待</h3>
              <p class="text-sm text-slate-500 mb-5">招待リンクを作成・管理できます。</p>

              <div v-if="can.invites()" class="bg-slate-800/30 border border-slate-800 rounded-xl p-4 mb-4 space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label :class="labelCls">最大使用回数（0 = 無制限）</label>
                    <input v-model.number="inviteForm.maxUses" type="number" min="0" :class="inputCls" />
                  </div>
                  <div>
                    <label :class="labelCls">有効時間（時間 / 0 = 無期限）</label>
                    <input v-model.number="inviteForm.expiresInHours" type="number" min="0" :class="inputCls" />
                  </div>
                </div>
                <button @click="createInvite" :class="btnPrimary" class="w-full flex items-center justify-center gap-1.5">
                  <Icon name="lucide:plus" class="w-4 h-4" />
                  招待リンクを作成
                </button>
              </div>

              <div class="space-y-2">
                <div v-for="invite in invites" :key="invite.id" class="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <code class="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-indigo-400 text-sm">{{ invite.code }}</code>
                      <span v-if="invite.useCount >= invite.maxUses && invite.maxUses > 0" class="text-[10px] font-bold text-red-400">満了</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1.5">
                      使用: {{ invite.useCount }}{{ invite.maxUses > 0 ? ` / ${invite.maxUses}` : '' }} 回
                      · {{ expiresLabel(invite) }}
                    </p>
                  </div>
                  <button @click="copyInvite(invite)" class="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 transition shrink-0">
                    {{ copiedCode === invite.code ? 'コピーしました' : 'リンクをコピー' }}
                  </button>
                  <button v-if="can.invites()" @click="revokeInvite(invite)" class="text-slate-500 hover:text-red-400 transition shrink-0">
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </button>
                </div>
                <p v-if="!invites.length" class="text-sm text-slate-500 text-center py-6">招待はまだありません</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
