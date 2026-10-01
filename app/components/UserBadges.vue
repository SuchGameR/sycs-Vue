<script setup lang="ts">
const props = defineProps<{ badges?: any[]; size?: 'sm' | 'md' }>()

const box = computed(() => (props.size === 'md' ? 'h-6 w-6' : 'h-4 w-4'))

/**
 * Badge shape normalisation.
 *
 * The server sends `{ kind: 'icon' | 'image', value, label }` (PublicBadge in
 * server/utils/userExtras.ts) while older callers pass `{ icon, image, label }`.
 * Reading `b.icon` directly against the server shape gave `undefined`, and
 * Iconify then threw `can't access property "startsWith"` from inside the
 * render function -- which killed the whole feed, since the exception fires
 * while rendering every post that has a badge.
 *
 * Anything with neither a usable icon nor a usable image is dropped rather
 * than rendered: `<Icon name=undefined>` is exactly what crashed the page.
 */
type NormalisedBadge = {
  key: string
  icon: string
  image: string
  label: string
}

const normalised = computed<NormalisedBadge[]>(() => {
  const out: NormalisedBadge[] = []
  for (const [i, b] of (props.badges || []).entries()) {
    if (!b) continue
    // Accept both shapes so either producer works.
    const image = String(b.image ?? (b.kind === 'image' ? b.value : '') ?? '').trim()
    const rawIcon = String(b.icon ?? (b.kind === 'icon' ? b.value : '') ?? '').trim()
    if (!image && !rawIcon) continue
    out.push({
      key: `${image || rawIcon}-${i}`,
      icon: rawIcon,
      image,
      label: String(b.label ?? '').trim(),
    })
  }
  return out
})

const shown = computed(() => normalised.value.slice(0, 4))
const overflow = computed(() => Math.max(0, normalised.value.length - shown.value.length))
</script>

<template>
  <span v-if="shown.length || overflow" class="inline-flex items-center gap-1 shrink-0">
    <span
      v-for="b in shown"
      :key="b.key"
      class="group/badge relative inline-flex shrink-0"
      :aria-label="b.label || undefined"
      :title="b.label || undefined"
    >
      <img
        v-if="b.image"
        :src="b.image"
        :alt="b.label || ''"
        class="rounded object-contain"
        :class="box"
      />
      <Icon
        v-else
        :name="b.icon"
        class="shrink-0 text-indigo-500 [&_svg]:fill-current"
        :class="box"
      />

      <!-- ホバー / タップでラベルを出す -->
      <span
        v-if="b.label"
        class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-outline-variant bg-surface-container px-1.5 py-0.5 text-[10px] font-medium leading-none text-on-surface opacity-0 shadow-lg transition-opacity duration-150 group-hover/badge:opacity-100 group-focus-within/badge:opacity-100"
        aria-hidden="true"
      >{{ b.label }}</span>
    </span>

    <span
      v-if="overflow"
      class="inline-flex shrink-0 items-center justify-center rounded-full bg-surface-container px-1 text-[9px] font-bold leading-none text-on-surface-variant"
    >+{{ overflow }}</span>
  </span>
</template>