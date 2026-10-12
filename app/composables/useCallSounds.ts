/**
 * 通話システムの効果音を1か所にまとめたマネージャ。
 *
 * 呼び出し側は「何を鳴らしたいか」（着信 / 発信中）だけを伝え、ファイルパス・
 * ループ・音量といった「どう鳴らすか」はここに閉じ込める。音源の差し替えや
 * 音量調整、新しい効果音の追加はこのファイルだけで完結する。
 *
 *  - 着信音: public/sounds/call/ringtoneCall.wav     (着手中はループ)
 *  - 受信音: public/sounds/call/notificationCall.wav (発信中=相手の応答待ちでループ)
 */

export const CALL_SOUND_SRC = {
  /** 着信音 — 相手から通話が来ている間ずっと鳴らす。 */
  incoming: '/sounds/call/ringtoneCall.wav',
  /** 受信音 — 自分が発信して相手が応答するまでの待機中に鳴らす。 */
  outgoing: '/sounds/call/notificationCall.wav',
} as const

export type CallSoundName = keyof typeof CALL_SOUND_SRC

const CALL_SOUND_VOLUME: Record<CallSoundName, number> = {
  incoming: 0.6,
  outgoing: 0.6,
}

// 鳴らす「予定」の状態。ブラウザの自動再生制限で play() が弾かれても、
// 次にユーザー操作(タップ/キー)があった時点でここを見て鳴らし直せる。
const wantsLoop: Record<CallSoundName, boolean> = { incoming: false, outgoing: false }
const audios = new Map<CallSoundName, HTMLAudioElement>()
let gestureBound = false

function audioFor(name: CallSoundName): HTMLAudioElement | null {
  if (!import.meta.client) return null
  let el = audios.get(name)
  if (!el) {
    el = new Audio(CALL_SOUND_SRC[name])
    el.loop = true
    el.preload = 'auto'
    el.volume = CALL_SOUND_VOLUME[name]
    audios.set(name, el)
  }
  return el
}

function apply(name: CallSoundName) {
  const el = audioFor(name)
  if (!el) return
  if (wantsLoop[name]) {
    if (!el.paused) return
    el.currentTime = 0
    // 自動再生がブロックされたら握りつぶす。次のユーザー操作で再度試みる。
    el.play().catch(() => {})
  } else {
    if (el.paused) return
    el.pause()
    el.currentTime = 0
  }
}

// 一度でもユーザー操作があれば自動再生が許可されるので、そのタイミングで
// 鳴らし損ねた効果音をまとめて鳴らし直す。
function bindGestureUnlock() {
  if (!import.meta.client || gestureBound) return
  gestureBound = true
  const retry = () => {
    for (const name of Object.keys(CALL_SOUND_SRC) as CallSoundName[]) {
      if (wantsLoop[name]) apply(name)
    }
  }
  window.addEventListener('pointerdown', retry, { passive: true })
  window.addEventListener('keydown', retry)
  window.addEventListener('touchstart', retry, { passive: true })
}

function setLoop(name: CallSoundName, on: boolean) {
  wantsLoop[name] = on
  apply(name)
}

export function useCallSounds() {
  bindGestureUnlock()
  return {
    /** 着信音を鳴らし始める（ループ）。 */
    startIncomingRing: () => setLoop('incoming', true),
    stopIncomingRing: () => setLoop('incoming', false),
    /** 受信音を鳴らし始める（発信中・ループ）。 */
    startOutgoingRing: () => setLoop('outgoing', true),
    stopOutgoingRing: () => setLoop('outgoing', false),
    /** すべて停止（退出時など）。 */
    stopAll: () => {
      setLoop('incoming', false)
      setLoop('outgoing', false)
    },
  }
}
