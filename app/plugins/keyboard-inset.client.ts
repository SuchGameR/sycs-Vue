/**
 * ソフトキーボードの高さを --app-keyboard-inset に流し込む。
 *
 * モバイルのブラウザはキーボードを出すとき、100dvh を縮めない（URLバーの
 * 伸縮とは別物）。そのままだと画面下のコンポーザやフローティングナビが
 * キーボードの裏に隠れる。visualViewport と layout viewport の差分をキーボード
 * 高さとして公開し、レイアウト側で main の高さから差し引く。
 *
 * 値が一定を超えたら html に sycs-keyboard-open を付け、ナビ等を隠す
 * (ネイティブのタブバーと同じ挙動)。
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  const vv = window.visualViewport
  if (!vv) return

  const root = document.documentElement
  const THRESHOLD = 80

  function update() {
    const inset = Math.max(0, Math.round(window.innerHeight - (vv!.height + vv!.offsetTop)))
    root.style.setProperty('--app-keyboard-inset', `${inset}px`)
    root.classList.toggle('sycs-keyboard-open', inset > THRESHOLD)
  }

  vv.addEventListener('resize', update)
  vv.addEventListener('scroll', update)
  update()
})
