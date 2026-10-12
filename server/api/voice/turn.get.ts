/**
 * ICE のリレー(TURN)候補をクライアントへ配る。
 *
 * 対称NAT配下の端末同士は STUN だけでは接続できず、TURN が必須になる。
 * 資格情報は次の優先順で解決する:
 *
 *   1. Cloudflare Calls の TURN（推奨・短命資格情報）
 *        CLOUDFLARE_TURN_KEY_ID / CLOUDFLARE_TURN_API_TOKEN を設定
 *   2. 静的 TURN（自前 coturn など）
 *        TURN_URLS / TURN_USERNAME / TURN_PASSWORD を設定
 *   3. どちらも無ければ STUN のみ（urls: []）
 *
 * どれも設定されていない場合でも STUN で接続できるネットワークなら通話は成立する。
 */
interface TurnConfig {
  urls: string[]
  username?: string
  credential?: string
}

// Cloudflare の資格情報は ttl 付きで発行される。毎回発行すると無駄なので
// 短めにキャッシュする（期限より十分手前で捨てて切れ目を無くす）。
const CLOUDFLARE_TTL_SECONDS = 86_400
const CACHE_MS = 60 * 60 * 1000
let cache: { value: TurnConfig; expiresAt: number } | null = null

async function cloudflareTurn(): Promise<TurnConfig | null> {
  const keyId = process.env.CLOUDFLARE_TURN_KEY_ID
  const token = process.env.CLOUDFLARE_TURN_API_TOKEN
  if (!keyId || !token) return null

  const res = await $fetch<any>(
    `https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: { ttl: CLOUDFLARE_TTL_SECONDS },
    },
  )
  const ice = res?.iceServers
  if (!ice) return null
  const urls = Array.isArray(ice.urls) ? ice.urls : (ice.urls ? [ice.urls] : [])
  if (!urls.length) return null
  return { urls, username: ice.username, credential: ice.credential }
}

function staticTurn(): TurnConfig | null {
  const urls = process.env.TURN_URLS
  if (!urls) return null
  const list = urls.split(',').map((u: string) => u.trim()).filter(Boolean)
  if (!list.length) return null
  return { urls: list, username: process.env.TURN_USERNAME, credential: process.env.TURN_PASSWORD }
}

export default defineEventHandler(async () => {
  const now = Date.now()
  if (cache && cache.expiresAt > now) return cache.value

  const resolved =
    (await cloudflareTurn().catch(() => null))
    || staticTurn()
    || { urls: [] as string[] }

  cache = { value: resolved, expiresAt: now + CACHE_MS }
  return resolved
})
