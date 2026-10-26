<script setup lang="ts">
/**
 * URL を 1 枚のカードに埋め込む。
 *
 * - YouTube / Vimeo / Spotify / SoundCloud はクリック後に iframe を読み込む
 * - 画像 / 動画 / 音声 / 3D の直リンクはその場でプレビュー
 * - それ以外は安全なリンクカード
 *
 * iframe の src は utils/embeds.ts で組み立てたものだけ。本文の URL を
 * そのまま iframe に入れることはない。
 */
import { parseEmbed } from '~/utils/embeds'
import AudioCard from './AudioCard.vue'

// three.js は重いので、3D の URL を実際に開いたときだけ読み込む。
const ModelViewer = defineAsyncComponent(() => import('./ModelViewer.vue'))

const props = withDefaults(
  defineProps<{
    url: string
    /** 入力プレビューなど、高さを抑えたい場所 */
    compact?: boolean
  }>(),
  { compact: false },
)

const info = computed(() => parseEmbed(props.url))
const loaded = ref(false)
const showModel = ref(false)
const imageFailed = ref(false)
const thumbFailed = ref(false)

watch(
  () => props.url,
  () => {
    loaded.value = false
    showModel.value = false
    imageFailed.value = false
    thumbFailed.value = false
  },
)

const iframeHeight = computed(() => info.value.iframe?.height || 0)
const isVerticalFrame = computed(() => !iframeHeight.value)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-outline-variant bg-surface-container/30">
    <!-- 直リンク画像 -->
    <template v-if="info.kind === 'image' && !imageFailed">
      <a
        :href="info.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative block bg-black/30"
        :title="info.title"
      >
        <img
          :src="info.url"
          :alt="info.title"
          loading="lazy"
          decoding="async"
          class="mx-auto object-contain"
          :class="compact ? 'max-h-60 w-auto max-w-full' : 'max-h-[min(70vh,560px)] w-auto max-w-full'"
          @error="imageFailed = true"
        />
        <span
          class="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur"
        >
          <Icon name="lucide:maximize-2" class="h-3 w-3" />
          画像を開く
        </span>
      </a>
    </template>

    <!-- 直リンク動画 -->
    <template v-else-if="info.kind === 'video'">
      <video
        :src="info.url"
        controls
        playsinline
        preload="metadata"
        class="mx-auto max-h-[min(70vh,560px)] w-full bg-black"
        :aria-label="info.title"
      />
      <div class="flex items-center gap-2 border-t border-outline-variant px-3 py-2">
        <Icon name="lucide:video" class="h-3.5 w-3.5 shrink-0 text-fuchsia-300" />
        <p class="min-w-0 flex-1 truncate text-[11px] text-on-surface-variant">{{ info.title }}</p>
        <a
          :href="info.url"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 rounded p-1 text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
          title="元の動画を開く"
        >
          <Icon name="lucide:external-link" class="h-3.5 w-3.5" />
        </a>
      </div>
    </template>

    <!-- 直リンク音声 -->
    <template v-else-if="info.kind === 'audio'">
      <AudioCard :src="info.url" :title="info.title" :subtitle="info.host" compact />
    </template>

    <!-- 直リンク 3D モデル -->
    <template v-else-if="info.kind === 'model'">
      <ModelViewer v-if="showModel" :src="info.url" :name="info.title" />
      <button
        v-else
        type="button"
        class="flex w-full items-center gap-3 p-3 text-left transition hover:bg-surface-container/60"
        @click="showModel = true"
      >
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1"
          :class="info.accent"
        >
          <Icon :name="info.icon" class="h-5 w-5" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-bold text-on-surface">{{ info.title }}</span>
          <span class="mt-0.5 block text-[11px] text-on-surface-variant">
            3Dモデル · クリックで読み込む
          </span>
        </span>
        <Icon name="lucide:box" class="h-4 w-4 shrink-0 text-violet-300" />
      </button>
    </template>

    <!-- iframe プロバイダ (クリックで読み込み) -->
    <template v-else-if="info.iframe">
      <div
        v-if="loaded"
        class="relative w-full overflow-hidden bg-black"
        :class="isVerticalFrame ? 'aspect-video' : ''"
        :style="iframeHeight ? { height: iframeHeight + 'px' } : undefined"
      >
        <iframe
          :src="info.iframe.src"
          :title="info.iframe.title"
          :allow="info.iframe.allow"
          allowfullscreen
          class="absolute inset-0 h-full w-full border-0"
          referrerpolicy="strict-origin-when-cross-origin"
        />
      </div>

      <button
        v-else
        type="button"
        class="group relative block w-full text-left"
        :aria-label="`${info.title} を読み込む`"
        @click="loaded = true"
      >
        <!-- YouTube はサムネイルを大きく見せる -->
        <span
          v-if="info.kind === 'youtube'"
          class="relative block aspect-video w-full overflow-hidden bg-black"
        >
          <img
            v-if="!thumbFailed"
            :src="info.thumbnail"
            alt=""
            loading="lazy"
            class="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
            @error="thumbFailed = true"
          />
          <span v-else class="absolute inset-0 bg-gradient-to-br from-red-950 via-slate-950 to-black" />
          <span class="absolute inset-0 flex items-center justify-center">
            <span
              class="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg shadow-black/40 transition group-hover:scale-110 group-hover:bg-red-500"
            >
              <Icon name="lucide:play" class="ml-0.5 h-5 w-5" />
            </span>
          </span>
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-8">
            <span class="flex items-center gap-1.5 text-[10px] font-medium text-white/75">
              <Icon name="lucide:play" class="h-3 w-3" />
              YouTube · クリックで再生
            </span>
            <span class="mt-0.5 block truncate text-xs font-bold text-white">{{ info.title }}</span>
          </span>
        </span>

        <!-- Spotify / SoundCloud / Vimeo など -->
        <span v-else class="flex items-center gap-3 p-3">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1"
            :class="info.accent"
          >
            <Icon :name="info.icon" class="h-5 w-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-bold text-on-surface">{{ info.title }}</span>
            <span class="mt-0.5 block truncate text-[11px] text-on-surface-variant">
              {{ info.host }} · クリックで{{ info.kind === 'spotify' || info.kind === 'soundcloud' ? '再生' : '読み込む' }}
            </span>
          </span>
          <Icon
            name="lucide:play-circle"
            class="h-5 w-5 shrink-0 text-on-surface-variant transition group-hover:text-white"
          />
        </span>
      </button>
    </template>

    <!-- 汎用リンクカード -->
    <a
      v-else
      :href="info.url"
      target="_blank"
      rel="noopener noreferrer nofollow"
      class="group flex items-center gap-3 p-3 transition hover:bg-surface-container/60"
    >
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1"
        :class="info.accent"
      >
        <Icon :name="info.icon" class="h-5 w-5" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-bold text-on-surface">{{ info.title }}</span>
        <span class="mt-0.5 block truncate text-[11px] text-on-surface-variant">{{ info.subtitle }}</span>
      </span>
      <Icon
        name="lucide:external-link"
        class="h-4 w-4 shrink-0 text-on-surface-variant transition group-hover:text-white"
      />
    </a>
  </div>
</template>
