
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


export const AddToPlaylistModal: typeof import("../app/components/AddToPlaylistModal.vue")['default']
export const AppHeader: typeof import("../app/components/AppHeader.vue")['default']
export const BridgeConsole: typeof import("../app/components/BridgeConsole.vue")['default']
export const ChatEditor: typeof import("../app/components/ChatEditor.vue")['default']
export const CustomTimelineModal: typeof import("../app/components/CustomTimelineModal.vue")['default']
export const EmojiIcon: typeof import("../app/components/EmojiIcon.vue")['default']
export const EmojiTextarea: typeof import("../app/components/EmojiTextarea.vue")['default']
export const ExtensionWindow: typeof import("../app/components/ExtensionWindow.vue")['default']
export const MediaDetailPane: typeof import("../app/components/MediaDetailPane.vue")['default']
export const MediaMiniPlayer: typeof import("../app/components/MediaMiniPlayer.vue")['default']
export const MobileNav: typeof import("../app/components/MobileNav.vue")['default']
export const PostAttachments: typeof import("../app/components/PostAttachments.vue")['default']
export const PostComments: typeof import("../app/components/PostComments.vue")['default']
export const PostComposer: typeof import("../app/components/PostComposer.vue")['default']
export const PostItem: typeof import("../app/components/PostItem.vue")['default']
export const ReactionPicker: typeof import("../app/components/ReactionPicker.vue")['default']
export const ServerListModal: typeof import("../app/components/ServerListModal.vue")['default']
export const ServerSettingsModal: typeof import("../app/components/ServerSettingsModal.vue")['default']
export const SettingsModal: typeof import("../app/components/SettingsModal.vue")['default']
export const SidebarLeft: typeof import("../app/components/SidebarLeft.vue")['default']
export const SidebarRight: typeof import("../app/components/SidebarRight.vue")['default']
export const TimelineTabs: typeof import("../app/components/TimelineTabs.vue")['default']
export const UserBadges: typeof import("../app/components/UserBadges.vue")['default']
export const UserTitle: typeof import("../app/components/UserTitle.vue")['default']
export const VoiceCallDock: typeof import("../app/components/VoiceCallDock.vue")['default']
export const WorkbenchFooter: typeof import("../app/components/WorkbenchFooter.vue")['default']
export const ExtensionsClockWidget: typeof import("../app/components/extensions/ClockWidget.vue")['default']
export const ExtensionsNotesWidget: typeof import("../app/components/extensions/NotesWidget.vue")['default']
export const ExtensionsTrendingWidget: typeof import("../app/components/extensions/TrendingWidget.vue")['default']
export const MediaFileCard: typeof import("../app/components/media/FileCard.vue")['default']
export const MediaImageGallery: typeof import("../app/components/media/ImageGallery.vue")['default']
export const MediaModelViewer: typeof import("../app/components/media/ModelViewer.vue")['default']
export const MediaMusicPlayer: typeof import("../app/components/media/MusicPlayer.vue")['default']
export const MediaVideoPlayer: typeof import("../app/components/media/VideoPlayer.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const Icon: typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']
export const ColorScheme: typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAddToPlaylistModal: LazyComponent<typeof import("../app/components/AddToPlaylistModal.vue")['default']>
export const LazyAppHeader: LazyComponent<typeof import("../app/components/AppHeader.vue")['default']>
export const LazyBridgeConsole: LazyComponent<typeof import("../app/components/BridgeConsole.vue")['default']>
export const LazyChatEditor: LazyComponent<typeof import("../app/components/ChatEditor.vue")['default']>
export const LazyCustomTimelineModal: LazyComponent<typeof import("../app/components/CustomTimelineModal.vue")['default']>
export const LazyEmojiIcon: LazyComponent<typeof import("../app/components/EmojiIcon.vue")['default']>
export const LazyEmojiTextarea: LazyComponent<typeof import("../app/components/EmojiTextarea.vue")['default']>
export const LazyExtensionWindow: LazyComponent<typeof import("../app/components/ExtensionWindow.vue")['default']>
export const LazyMediaDetailPane: LazyComponent<typeof import("../app/components/MediaDetailPane.vue")['default']>
export const LazyMediaMiniPlayer: LazyComponent<typeof import("../app/components/MediaMiniPlayer.vue")['default']>
export const LazyMobileNav: LazyComponent<typeof import("../app/components/MobileNav.vue")['default']>
export const LazyPostAttachments: LazyComponent<typeof import("../app/components/PostAttachments.vue")['default']>
export const LazyPostComments: LazyComponent<typeof import("../app/components/PostComments.vue")['default']>
export const LazyPostComposer: LazyComponent<typeof import("../app/components/PostComposer.vue")['default']>
export const LazyPostItem: LazyComponent<typeof import("../app/components/PostItem.vue")['default']>
export const LazyReactionPicker: LazyComponent<typeof import("../app/components/ReactionPicker.vue")['default']>
export const LazyServerListModal: LazyComponent<typeof import("../app/components/ServerListModal.vue")['default']>
export const LazyServerSettingsModal: LazyComponent<typeof import("../app/components/ServerSettingsModal.vue")['default']>
export const LazySettingsModal: LazyComponent<typeof import("../app/components/SettingsModal.vue")['default']>
export const LazySidebarLeft: LazyComponent<typeof import("../app/components/SidebarLeft.vue")['default']>
export const LazySidebarRight: LazyComponent<typeof import("../app/components/SidebarRight.vue")['default']>
export const LazyTimelineTabs: LazyComponent<typeof import("../app/components/TimelineTabs.vue")['default']>
export const LazyUserBadges: LazyComponent<typeof import("../app/components/UserBadges.vue")['default']>
export const LazyUserTitle: LazyComponent<typeof import("../app/components/UserTitle.vue")['default']>
export const LazyVoiceCallDock: LazyComponent<typeof import("../app/components/VoiceCallDock.vue")['default']>
export const LazyWorkbenchFooter: LazyComponent<typeof import("../app/components/WorkbenchFooter.vue")['default']>
export const LazyExtensionsClockWidget: LazyComponent<typeof import("../app/components/extensions/ClockWidget.vue")['default']>
export const LazyExtensionsNotesWidget: LazyComponent<typeof import("../app/components/extensions/NotesWidget.vue")['default']>
export const LazyExtensionsTrendingWidget: LazyComponent<typeof import("../app/components/extensions/TrendingWidget.vue")['default']>
export const LazyMediaFileCard: LazyComponent<typeof import("../app/components/media/FileCard.vue")['default']>
export const LazyMediaImageGallery: LazyComponent<typeof import("../app/components/media/ImageGallery.vue")['default']>
export const LazyMediaModelViewer: LazyComponent<typeof import("../app/components/media/ModelViewer.vue")['default']>
export const LazyMediaMusicPlayer: LazyComponent<typeof import("../app/components/media/MusicPlayer.vue")['default']>
export const LazyMediaVideoPlayer: LazyComponent<typeof import("../app/components/media/VideoPlayer.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyIcon: LazyComponent<typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']>
export const LazyColorScheme: LazyComponent<typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
