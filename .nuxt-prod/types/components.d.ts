
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  AddToPlaylistModal: typeof import("../../app/components/AddToPlaylistModal.vue")['default']
  AppHeader: typeof import("../../app/components/AppHeader.vue")['default']
  BridgeConsole: typeof import("../../app/components/BridgeConsole.vue")['default']
  ChatEditor: typeof import("../../app/components/ChatEditor.vue")['default']
  CustomTimelineModal: typeof import("../../app/components/CustomTimelineModal.vue")['default']
  EmojiIcon: typeof import("../../app/components/EmojiIcon.vue")['default']
  EmojiTextarea: typeof import("../../app/components/EmojiTextarea.vue")['default']
  ExtensionWindow: typeof import("../../app/components/ExtensionWindow.vue")['default']
  MediaDetailPane: typeof import("../../app/components/MediaDetailPane.vue")['default']
  MediaMiniPlayer: typeof import("../../app/components/MediaMiniPlayer.vue")['default']
  MobileNav: typeof import("../../app/components/MobileNav.vue")['default']
  PostAttachments: typeof import("../../app/components/PostAttachments.vue")['default']
  PostComments: typeof import("../../app/components/PostComments.vue")['default']
  PostComposer: typeof import("../../app/components/PostComposer.vue")['default']
  PostItem: typeof import("../../app/components/PostItem.vue")['default']
  ReactionPicker: typeof import("../../app/components/ReactionPicker.vue")['default']
  ServerListModal: typeof import("../../app/components/ServerListModal.vue")['default']
  ServerSettingsModal: typeof import("../../app/components/ServerSettingsModal.vue")['default']
  SettingsModal: typeof import("../../app/components/SettingsModal.vue")['default']
  SidebarLeft: typeof import("../../app/components/SidebarLeft.vue")['default']
  SidebarRight: typeof import("../../app/components/SidebarRight.vue")['default']
  TimelineTabs: typeof import("../../app/components/TimelineTabs.vue")['default']
  UserBadges: typeof import("../../app/components/UserBadges.vue")['default']
  UserTitle: typeof import("../../app/components/UserTitle.vue")['default']
  VoiceCallDock: typeof import("../../app/components/VoiceCallDock.vue")['default']
  WorkbenchFooter: typeof import("../../app/components/WorkbenchFooter.vue")['default']
  ExtensionsClockWidget: typeof import("../../app/components/extensions/ClockWidget.vue")['default']
  ExtensionsNotesWidget: typeof import("../../app/components/extensions/NotesWidget.vue")['default']
  ExtensionsTrendingWidget: typeof import("../../app/components/extensions/TrendingWidget.vue")['default']
  MediaFileCard: typeof import("../../app/components/media/FileCard.vue")['default']
  MediaImageGallery: typeof import("../../app/components/media/ImageGallery.vue")['default']
  MediaModelViewer: typeof import("../../app/components/media/ModelViewer.vue")['default']
  MediaMusicPlayer: typeof import("../../app/components/media/MusicPlayer.vue")['default']
  MediaVideoPlayer: typeof import("../../app/components/media/VideoPlayer.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  Icon: typeof import("../../node_modules/@nuxt/icon/dist/runtime/components/index")['default']
  ColorScheme: typeof import("../../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAddToPlaylistModal: LazyComponent<typeof import("../../app/components/AddToPlaylistModal.vue")['default']>
  LazyAppHeader: LazyComponent<typeof import("../../app/components/AppHeader.vue")['default']>
  LazyBridgeConsole: LazyComponent<typeof import("../../app/components/BridgeConsole.vue")['default']>
  LazyChatEditor: LazyComponent<typeof import("../../app/components/ChatEditor.vue")['default']>
  LazyCustomTimelineModal: LazyComponent<typeof import("../../app/components/CustomTimelineModal.vue")['default']>
  LazyEmojiIcon: LazyComponent<typeof import("../../app/components/EmojiIcon.vue")['default']>
  LazyEmojiTextarea: LazyComponent<typeof import("../../app/components/EmojiTextarea.vue")['default']>
  LazyExtensionWindow: LazyComponent<typeof import("../../app/components/ExtensionWindow.vue")['default']>
  LazyMediaDetailPane: LazyComponent<typeof import("../../app/components/MediaDetailPane.vue")['default']>
  LazyMediaMiniPlayer: LazyComponent<typeof import("../../app/components/MediaMiniPlayer.vue")['default']>
  LazyMobileNav: LazyComponent<typeof import("../../app/components/MobileNav.vue")['default']>
  LazyPostAttachments: LazyComponent<typeof import("../../app/components/PostAttachments.vue")['default']>
  LazyPostComments: LazyComponent<typeof import("../../app/components/PostComments.vue")['default']>
  LazyPostComposer: LazyComponent<typeof import("../../app/components/PostComposer.vue")['default']>
  LazyPostItem: LazyComponent<typeof import("../../app/components/PostItem.vue")['default']>
  LazyReactionPicker: LazyComponent<typeof import("../../app/components/ReactionPicker.vue")['default']>
  LazyServerListModal: LazyComponent<typeof import("../../app/components/ServerListModal.vue")['default']>
  LazyServerSettingsModal: LazyComponent<typeof import("../../app/components/ServerSettingsModal.vue")['default']>
  LazySettingsModal: LazyComponent<typeof import("../../app/components/SettingsModal.vue")['default']>
  LazySidebarLeft: LazyComponent<typeof import("../../app/components/SidebarLeft.vue")['default']>
  LazySidebarRight: LazyComponent<typeof import("../../app/components/SidebarRight.vue")['default']>
  LazyTimelineTabs: LazyComponent<typeof import("../../app/components/TimelineTabs.vue")['default']>
  LazyUserBadges: LazyComponent<typeof import("../../app/components/UserBadges.vue")['default']>
  LazyUserTitle: LazyComponent<typeof import("../../app/components/UserTitle.vue")['default']>
  LazyVoiceCallDock: LazyComponent<typeof import("../../app/components/VoiceCallDock.vue")['default']>
  LazyWorkbenchFooter: LazyComponent<typeof import("../../app/components/WorkbenchFooter.vue")['default']>
  LazyExtensionsClockWidget: LazyComponent<typeof import("../../app/components/extensions/ClockWidget.vue")['default']>
  LazyExtensionsNotesWidget: LazyComponent<typeof import("../../app/components/extensions/NotesWidget.vue")['default']>
  LazyExtensionsTrendingWidget: LazyComponent<typeof import("../../app/components/extensions/TrendingWidget.vue")['default']>
  LazyMediaFileCard: LazyComponent<typeof import("../../app/components/media/FileCard.vue")['default']>
  LazyMediaImageGallery: LazyComponent<typeof import("../../app/components/media/ImageGallery.vue")['default']>
  LazyMediaModelViewer: LazyComponent<typeof import("../../app/components/media/ModelViewer.vue")['default']>
  LazyMediaMusicPlayer: LazyComponent<typeof import("../../app/components/media/MusicPlayer.vue")['default']>
  LazyMediaVideoPlayer: LazyComponent<typeof import("../../app/components/media/VideoPlayer.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyIcon: LazyComponent<typeof import("../../node_modules/@nuxt/icon/dist/runtime/components/index")['default']>
  LazyColorScheme: LazyComponent<typeof import("../../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
