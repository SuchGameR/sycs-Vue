export interface UaInfo {
  isMobile: boolean
  isTablet: boolean
  isIOS: boolean
  isAndroid: boolean
  platform: string
}

/**
 * Device class from the User-Agent.
 *
 * Deliberately a function of the *string*, not the viewport. The one place this
 * matters is mobile-root-url.client.ts: a narrow desktop window is still a
 * desktop browser and must keep normal URLs, while a phone asking for a desktop
 * site (requestDesktopSite) should still be treated as a phone. matchMedia
 * cannot tell those two apart.
 *
 * `navigator.userAgentData.mobile` is preferred when the browser sends Client
 * Hints, because it is computed by the browser rather than sniffed from the
 * string. Everything else falls back to the classic UA.
 */
const MOBILE_UA_RE = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Silk|Kindle|Nintendo|Opera Mini/i
const TABLET_UA_RE = /iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i
const IOS_UA_RE = /iPhone|iPad|iPod/i
const ANDROID_UA_RE = /Android/i

const FALLBACK: UaInfo = {
  isMobile: false,
  isTablet: false,
  isIOS: false,
  isAndroid: false,
  platform: 'server',
}

function detect(): UaInfo {
  if (!import.meta.client || typeof navigator === 'undefined') return FALLBACK

  const data = (navigator as Navigator & {
    userAgentData?: { mobile?: boolean, platform?: string }
  }).userAgentData

  const ua = navigator.userAgent || ''
  const isTablet = TABLET_UA_RE.test(ua)
  // Client Hints already folds tablets into "not mobile", so only trust the
  // string for the tablet case when the hints are absent.
  const isMobile = typeof data?.mobile === 'boolean' ? data.mobile && !isTablet : MOBILE_UA_RE.test(ua) && !isTablet

  return {
    isMobile,
    isTablet,
    isIOS: IOS_UA_RE.test(ua),
    isAndroid: ANDROID_UA_RE.test(ua),
    platform: data?.platform || (isIOS_UA_RE.test(ua) ? 'iOS' : isAndroid ? 'Android' : 'desktop'),
  }
}

export function useUaInfo() {
  return useState<UaInfo>('ua-info', detect)
}
