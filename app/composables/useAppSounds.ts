/**
 * アプリ全体の効果音を1か所にまとめたマネージャ。
 *
 * 呼び出し側は「何を鳴らしたいか」だけを伝え、ファイルパス・ループ・音量は
 * ここに閉じ込める。音源の差し替えや音量調整、新しい効果音の追加はこのファイル
 * だけで完結する。
 *
 *  - 着信音 : public/sounds/call/ringtoneCall.wav     (着信中はループ)
 *  - 発信音 : public/sounds/call/notificationCall.wav (相手の応答待ちでループ)
 *  - 受信音 : public/sounds/notify/message.wav        (メッセージ・通知の1回鳴り)
 *
 * ブラウザの自動再生制限対策も一元化してある。最初のユーザー操作(タップ/キー)
 * までは play() が弾かれるので、鳴らす「予定」を覚えておき、操作の瞬間に
 * 鳴らし直す。さらにバックグラウンドから復帰したときも鳴り残しを再開する。
 */

export type AppSound = 'incoming' | 'outgoing' | 'message'

export const SOUND_SRC: Record<AppSound, string> = {
  /** 着信音 — 相手から通話が来ている間ずっと鳴らす。 */
  incoming: '/sounds/call/ringtoneCall.wav',
  /** 発信音 — 自分が発信して相手が応答するまでの待機中に鳴らす。 */
  outgoing: '/sounds/call/notificationCall.wav',
  /** 受信音 — メッセージや通知の到着時に一度だけ鳴らす。 */
  message: '/sounds/notify/message.wav',
}

const VOLUME: Record<AppSound, number> = {
  incoming: 0.6,
  outgoing: 0.6,
  message: 0.7,
}

const LOOP: Record<AppSound, boolean> = {
  incoming: true,
  outgoing: true,
  message: false,
}

// ループ音の「鳴っているべき」状態。自動再生がブロックされても、次のユーザー
// 操作でここを見て鳴らし直せるようにする。
const wantsLoop: Record<AppSound, boolean> = { incoming: false, outgoing: false, message: false }

const audios = new Map<AppSound, HTMLAudioElement>()
let gestureBound = false
let unlocked = false
// 一度だけ鳴らす音を取りこぼしたときの再試行フラグ（複数回は鳴らさない）。
let pendingOneShot: AppSound | null = null

function audioFor(name: AppSound): HTMLAudioElement | null {
  if (!import.meta.client) return null
  let el = audios.get(name)
  if (!el) {
    el = new Audio(SOUND_SRC[name])
    el.loop = LOOP[name]
    el.preload = 'auto'
    el.volume = VOLUME[name]
    el.setAttribute('playsinline', 'true')
    // 事前ロードして初回の鳴り始めを速くする。
    try { el.load() } catch { /* ignore */ }
    audios.set(name, el)
  }
  return el
}

function play(name: AppSound) {
  const el = audioFor(name)
  if (!el) return
  if (!LOOP[name]) el.currentTime = 0
  el.play().then(() => { unlocked = true }).catch(() => {
    // 自動再生が未許可。ループ音はユーザー操作時に鳴らし直し、1回鳴りは
    // 次の操作で1度だけ鳴らす。
    if (!LOOP[name]) pendingOneShot = name
  })
}

function stop(name: AppSound) {
  const el = audioFor(name)
  if (!el) return
  if (el.paused) return
  el.pause()
  el.currentTime = 0
}

function setLoop(name: AppSound, on: boolean) {
  wantsLoop[name] = on
  if (on) play(name)
  else stop(name)
}

/**
 * 最初のユーザー操作で自動再生を解錠し、鳴らし損ねた効果音をまとめて再開する。
 */
function bindGestureUnlock() {
  if (!import.meta.client || gestureBound) return
  gestureBound = true

  const retry = () => {
    if (unlocked && !pendingOneShot) return
    unlocked = true
    for (const name of Object.keys(SOUND_SRC) as AppSound[]) {
      if (wantsLoop[name]) play(name)
    }
    if (pendingOneShot) {
      const name = pendingOneShot
      pendingOneShot = null
      play(name)
    }
  }

  window.addEventListener('pointerdown', retry, { passive: true })
  window.addEventListener('keydown', retry)
  window.addEventListener('touchstart', retry, { passive: true })

  // バックグラウンド復帰時にブラウザが Audio を止めていることがあるため、
  // 鳴っているべきループを再開する。
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    for (const name of Object.keys(SOUND_SRC) as AppSound[]) {
      if (wantsLoop[name]) play(name)
    }
  })
}

export function useAppSounds() {
  bindGestureUnlock()
  return {
    /** 着信音を鳴らし始める（ループ）。 */
    startIncomingRing: () => setLoop('incoming', true),
    stopIncomingRing: () => setLoop('incoming', false),
    /** 発信音を鳴らし始める（発信中・ループ）。 */
    startOutgoingRing: () => setLoop('outgoing', true),
    stopOutgoingRing: () => setLoop('outgoing', false),
    /** 受信音を一度鳴らす（メッセージ・通知）。 */
    playMessage: () => play('message'),
    /** すべて停止（退出時など）。 */
    stopAll: () => {
      setLoop('incoming', false)
      setLoop('outgoing', false)
    },
  }
}
