/**
 * SYCS Interaction Kit のカタログ。
 *
 * ここが「どのインタラクションパターンが存在するか」の単一の真実。
 * 設定画面 / Interaction Studio / コマンドパレット / 各デモはすべて
 * この配列から生成するので、パターンを増やすときはここに 1 件足すだけでよい。
 */

export type InteractionCategory =
  | 'feedback'
  | 'input'
  | 'navigation'
  | 'layout'
  | 'customize'

export interface InteractionCategoryDef {
  id: InteractionCategory
  label: string
  description: string
  icon: string
}

export const INTERACTION_CATEGORIES: InteractionCategoryDef[] = [
  {
    id: 'feedback',
    label: 'フィードバック',
    description: '状態・結果・読み込みをユーザーへ伝える',
    icon: 'lucide:activity',
  },
  {
    id: 'input',
    label: '入力・操作',
    description: '指・ポインタ・フォームからの操作を受ける',
    icon: 'lucide:pointer',
  },
  {
    id: 'navigation',
    label: 'ナビゲーション',
    description: '行き先と操作をすばやく見つける',
    icon: 'lucide:compass',
  },
  {
    id: 'layout',
    label: 'レイアウト',
    description: '情報の見せ方と画面の動き',
    icon: 'lucide:layout-dashboard',
  },
  {
    id: 'customize',
    label: 'カスタマイズ',
    description: '自分好みの見た目・動き・ワークスペース',
    icon: 'lucide:sliders-horizontal',
  },
]

export const INTERACTIONS = [
  {
    id: 'pull-to-refresh',
    label: '引っ張って更新',
    en: 'Pull to Refresh',
    description: '先頭で下へ引っ張ると最新の内容を読み込みます。',
    icon: 'lucide:refresh-cw',
    category: 'feedback',
    source: 'UiPullToRefresh',
  },
  {
    id: 'skeleton-screen',
    label: 'スケルトン画面',
    en: 'Skeleton Screen',
    description: '読み込み中に完成形と同じ骨格を表示し、体感速度を上げます。',
    icon: 'lucide:loader',
    category: 'feedback',
    source: 'UiSkeletonBlock',
  },
  {
    id: 'toast',
    label: 'トースト',
    en: 'Toast',
    description: '操作の結果を画面を止めずに短く通知します。',
    icon: 'lucide:message-square',
    category: 'feedback',
    source: 'UiToastStack',
  },
  {
    id: 'bottom-sheet',
    label: 'ボトムシート',
    en: 'Bottom Sheet',
    description: '下からせり上がる面。モバイルの主要な操作入口です。',
    icon: 'lucide:panel-bottom',
    category: 'feedback',
    source: 'BottomSheet',
  },
  {
    id: 'swipe-action',
    label: 'スワイプ操作',
    en: 'Swipe Action',
    description: '行を左右にスワイプして、隠れた操作をすばやく実行します。',
    icon: 'lucide:move-horizontal',
    category: 'input',
    source: 'UiSwipeAction',
  },
  {
    id: 'autocomplete',
    label: 'オートコンプリート',
    en: 'Autocomplete',
    description: '入力に合わせて候補を絞り込み、キーボードでも選択できます。',
    icon: 'lucide:list-filter',
    category: 'input',
    source: 'UiAutocompleteInput',
  },
  {
    id: 'long-press',
    label: '長押し',
    en: 'Long Press',
    description: '押し続けると詳細メニューを開きます。誤タップを防ぎます。',
    icon: 'lucide:fingerprint',
    category: 'input',
    source: 'LongPress',
  },
  {
    id: 'fab-speed-dial',
    label: 'FAB / スピードダイヤル',
    en: 'Floating Action Button / Speed Dial',
    description: '主要操作を浮かせ、関連アクションを扇状に展開します。',
    icon: 'lucide:plus-circle',
    category: 'navigation',
    source: 'UiFabSpeedDial',
  },
  {
    id: 'multi-select',
    label: '複数選択モード',
    en: 'Multi-select Mode',
    description: '複数の項目を選び、まとめて操作するモードです。',
    icon: 'lucide:list-checks',
    category: 'input',
    source: 'UiSelectionToolbar',
  },
  {
    id: 'optimistic-ui',
    label: '楽観的 UI',
    en: 'Optimistic UI',
    description: '成功を前提に先に画面を更新し、失敗したら巻き戻します。',
    icon: 'lucide:zap',
    category: 'input',
    source: 'useOptimistic',
  },
  {
    id: 'inline-validation',
    label: 'インライン検証',
    en: 'Inline Validation',
    description: '入力欄のすぐ横にエラーを出し、送信前に直せます。',
    icon: 'lucide:check-circle',
    category: 'input',
    source: 'useFormValidation',
  },
  {
    id: 'empty-state',
    label: '空状態',
    en: 'Empty State',
    description: 'データが無い理由と次の一歩を、余白ではなく案内で埋めます。',
    icon: 'lucide:inbox',
    category: 'feedback',
    source: 'UiEmptyState',
  },
  {
    id: 'offline-state',
    label: 'オフライン / 同期状態',
    en: 'Offline State & Sync Status',
    description: '通信断と同期待ちを可視化し、復帰時に自動で送ります。',
    icon: 'lucide:wifi-off',
    category: 'feedback',
    source: 'UiOfflineBanner',
  },
  {
    id: 'shared-element',
    label: '共有要素トランジション',
    en: 'Shared Element Transition',
    description: '一覧のカードが詳細画面へ、同じ形のまま移動します。',
    icon: 'lucide:maximize-2',
    category: 'layout',
    source: 'useSharedElement',
  },
  {
    id: 'haptic-feedback',
    label: '触覚フィードバック',
    en: 'Haptic Feedback',
    description: '対応端末では操作に合わせて短く振動します。',
    icon: 'lucide:vibrate',
    category: 'feedback',
    source: 'useHaptics',
  },
  {
    id: 'command-palette',
    label: 'コマンドパレット',
    en: 'Command Palette',
    description: 'Ctrl / ⌘ + K で全操作を検索して実行できます。',
    icon: 'lucide:command',
    category: 'navigation',
    source: 'UiCommandPalette',
  },
  {
    id: 'filter-chips',
    label: 'フィルターチップ',
    en: 'Filter Chips',
    description: '条件をチップで選び、その場で一覧を絞り込みます。',
    icon: 'lucide:tags',
    category: 'input',
    source: 'UiFilterChips',
  },
  {
    id: 'drag-and-drop',
    label: 'ドラッグ & ドロップ',
    en: 'Drag & Drop',
    description: '項目をつかんで並べ替えます。キーボード用の代替手段も用意。',
    icon: 'lucide:grip-vertical',
    category: 'input',
    source: 'useDragSort',
  },
  {
    id: 'collapsing-header',
    label: '追従 / 折りたたみヘッダー',
    en: 'Sticky / Collapsing Header',
    description: 'スクロールに合わせてヘッダーが縮み、タイトルだけ残ります。',
    icon: 'lucide:panel-top',
    category: 'layout',
    source: 'UiCollapsingHeader',
  },
  {
    id: 'progressive-disclosure',
    label: '段階的開示',
    en: 'Progressive Disclosure',
    description: 'まず要点だけ見せ、必要な人だけ詳細を開けるようにします。',
    icon: 'lucide:chevrons-down',
    category: 'layout',
    source: 'UiProgressiveDisclosure',
  },
  {
    id: 'mini-player',
    label: '常駐ミニプレイヤー',
    en: 'Persistent Mini Player',
    description: '画面を移動しても再生状態と操作を下部に残します。',
    icon: 'lucide:play-circle',
    category: 'layout',
    source: 'UiMiniPlayerBar',
  },
  {
    id: 'contextual-ui',
    label: 'コンテキスト UI',
    en: 'Contextual UI',
    description: '右クリックや長押しの位置に、その場に合った操作を出します。',
    icon: 'lucide:mouse-pointer-2',
    category: 'navigation',
    source: 'UiFloatingMenu',
  },
  {
    id: 'quick-actions',
    label: 'クイックアクション',
    en: 'Quick Actions',
    description: 'よく使う操作を、対象のすぐ近くに並べます。',
    icon: 'lucide:wand-sparkles',
    category: 'navigation',
    source: 'UiQuickActions',
  },
  {
    id: 'reversible-actions',
    label: '取り消せる操作',
    en: 'Reversible Actions',
    description: '破壊的操作の直後に「元に戻す」を出し、誤操作を救います。',
    icon: 'lucide:undo-2',
    category: 'feedback',
    source: 'useToast',
  },
  {
    id: 'activity-timeline',
    label: 'アクティビティタイムライン',
    en: 'Activity Timeline',
    description: '出来事を時系列に並べ、状態の変化を追えるようにします。',
    icon: 'lucide:history',
    category: 'layout',
    source: 'UiActivityTimeline',
  },
  {
    id: 'adaptive-navigation',
    label: '適応型ナビゲーション',
    en: 'Adaptive Navigation',
    description: '画面幅に応じて、下部ピルとサイドバーを自動で切り替えます。',
    icon: 'lucide:panels-top-left',
    category: 'navigation',
    source: 'useNavLayout',
  },
  {
    id: 'inline-interaction',
    label: 'インライン操作',
    en: 'Inline Interaction',
    description: '画面遷移せず、その場で編集・評価できます。',
    icon: 'lucide:pen-line',
    category: 'input',
    source: 'UiInlineEdit',
  },
  {
    id: 'live-layout-editor',
    label: 'ライブレイアウトエディタ',
    en: 'Live Layout Editor',
    description: 'ブロックの並び・幅・表示を、その場で編集して保存します。',
    icon: 'lucide:layout-template',
    category: 'layout',
    source: 'useLiveLayout',
  },
  {
    id: 'design-tokens',
    label: 'デザイントークン調整',
    en: 'Design Tokens Customizer',
    description: '色・角丸・密度・動き・文字サイズをリアルタイムに調整します。',
    icon: 'lucide:palette',
    category: 'customize',
    source: 'useThemeTokens',
  },
  {
    id: 'modular-navigation',
    label: 'モジュール式ナビ',
    en: 'Modular Navigation',
    description: 'ナビの項目を表示 / 非表示にし、順番を入れ替えます。',
    icon: 'lucide:blocks',
    category: 'navigation',
    source: 'useModularNav',
  },
  {
    id: 'interaction-mapping',
    label: 'ジェスチャー割り当て',
    en: 'Interaction Mapping',
    description: 'スワイプ・長押しなどのジェスチャーに好きな動作を割り当てます。',
    icon: 'lucide:git-fork',
    category: 'navigation',
    source: 'useInteractionMap',
  },
  {
    id: 'workspace-profiles',
    label: 'ワークスペースプロファイル',
    en: 'Workspace Profiles',
    description: 'テーマ・レイアウト・ナビ・機能の組み合わせを丸ごと保存します。',
    icon: 'lucide:briefcase',
    category: 'customize',
    source: 'useWorkspaceProfiles',
  },
  {
    id: 'theme-presets',
    label: 'テーマ & レイアウトプリセット',
    en: 'Theme & Layout Presets',
    description: '用途別の見た目を 1 タップで適用できます。',
    icon: 'lucide:swatch-book',
    category: 'customize',
    source: 'THEME_PRESETS',
  },
] as const

export type InteractionId = (typeof INTERACTIONS)[number]['id']

/** カタログ 1 件分の読み取り専用ビュー (id はリテラル合併型)。 */
export type InteractionDef = {
  id: InteractionId
  label: string
  en: string
  description: string
  icon: string
  category: InteractionCategory
  source: string
}

export const INTERACTION_IDS = INTERACTIONS.map((i) => i.id) as InteractionId[]

export const DEFAULT_INTERACTION_STATE = Object.fromEntries(
  INTERACTIONS.map((i) => [i.id, true]),
) as Record<InteractionId, boolean>

export function findInteraction(id: string): InteractionDef | undefined {
  return INTERACTIONS.find((i) => i.id === id)
}

export function categoryOf(id: InteractionId): InteractionCategoryDef {
  const def = findInteraction(id)
  return (
    INTERACTION_CATEGORIES.find((c) => c.id === def?.category) ??
    INTERACTION_CATEGORIES[0]!
  )
}
