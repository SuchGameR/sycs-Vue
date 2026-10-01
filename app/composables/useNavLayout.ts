import type { Ref } from 'vue'

/**
 * Which nav owns the desktop breakpoint.
 *  - 'pill'    : the floating pill at the bottom (same as mobile)
 *  - 'sidebar' : the left rail
 * Mobile always uses the pill; only the desktop choice is persisted.
 */
export type DesktopNavMode = 'pill' | 'sidebar'

const MODE_KEY = 'sycs:desktop-nav'
const COLLAPSED_KEY = 'sycs:sidebar-collapsed'

export function useNavLayout() {
  const desktopNav = useState<DesktopNavMode>('nav:desktop-mode', () => 'pill')
  const sidebarCollapsed = useState<boolean>('nav:sidebar-collapsed', () => false)

  /** localStorage is read once, on the client, after first paint. */
  const hydrated = useState<boolean>('nav:hydrated', () => false)

  function hydrate() {
    if (hydrated.value || !import.meta.client) return
    const mode = localStorage.getItem(MODE_KEY)
    if (mode === 'pill' || mode === 'sidebar') desktopNav.value = mode
    sidebarCollapsed.value = localStorage.getItem(COLLAPSED_KEY) === '1'
    hydrated.value = true
  }

  function setDesktopNav(mode: DesktopNavMode) {
    desktopNav.value = mode
    if (import.meta.client) localStorage.setItem(MODE_KEY, mode)
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    if (import.meta.client) localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
  }

  function toggleDesktopNav() {
    setDesktopNav(desktopNav.value === 'pill' ? 'sidebar' : 'pill')
  }

  function toggleSidebar() {
    setSidebarCollapsed(!sidebarCollapsed.value)
  }

  /**
   * The pill is the only nav below 681px. On desktop it only wins when the user
   * picked it -- otherwise the two would render at once.
   */
  const pillActive: Ref<boolean> = computed(() => desktopNav.value === 'pill')

  return {
    desktopNav,
    sidebarCollapsed,
    hydrated,
    pillActive,
    hydrate,
    setDesktopNav,
    setSidebarCollapsed,
    toggleDesktopNav,
    toggleSidebar,
  }
}