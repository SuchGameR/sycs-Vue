/**
 * トースト通知のキュー。
 *
 * 画面のどこからでも `toast.success('保存しました')` の形で呼べる。
 * アクション付き (元に戻す) は自動で長めに残る。
 */

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick?: () => void | Promise<void>
  /** アクションを押しても閉じない */
  keepOpen?: boolean
}

export interface ToastOptions {
  type?: ToastType
  title?: string
  message?: string
  icon?: string
  /** ミリ秒。0 で自動 dismiss しない */
  duration?: number
  action?: ToastAction | null
}

export interface ToastItem extends Required<Omit<ToastOptions, 'action'>> {
  id: number
  action: ToastAction | null
  createdAt: number
}

let seq = 0

export function useToast() {
  const items = useState<ToastItem[]>('ui:toasts', () => [])

  function dismiss(id: number) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  function clear() {
    items.value = []
  }

  function push(input: string | ToastOptions): number {
    const opts: ToastOptions = typeof input === 'string' ? { message: input } : input
    const id = ++seq
    const action = opts.action ?? null
    const item: ToastItem = {
      id,
      type: opts.type ?? 'default',
      title: opts.title ?? '',
      message: opts.message ?? '',
      icon: opts.icon ?? '',
      duration: opts.duration ?? (action ? 6500 : 4200),
      action,
      createdAt: Date.now(),
    }
    items.value = [...items.value, item]
    if (import.meta.client && item.duration > 0) {
      window.setTimeout(() => dismiss(id), item.duration)
    }
    return id
  }

  async function runAction(item: ToastItem) {
    try {
      await item.action?.onClick?.()
    } catch {
      /* アクションの失敗は通知側で処理する */
    }
    if (!item.action?.keepOpen) dismiss(item.id)
  }

  const success = (message: string, opts: Omit<ToastOptions, 'type' | 'message'> = {}) =>
    push({ ...opts, type: 'success', message })
  const error = (message: string, opts: Omit<ToastOptions, 'type' | 'message'> = {}) =>
    push({ ...opts, type: 'error', message })
  const info = (message: string, opts: Omit<ToastOptions, 'type' | 'message'> = {}) =>
    push({ ...opts, type: 'info', message })
  const warning = (message: string, opts: Omit<ToastOptions, 'type' | 'message'> = {}) =>
    push({ ...opts, type: 'warning', message })

  /** 取り消せる操作。onUndo は「元に戻す」を押したときだけ走る。 */
  function undo(
    message: string,
    onUndo: () => void | Promise<void>,
    opts: Omit<ToastOptions, 'action'> = {},
  ) {
    return push({
      ...opts,
      message,
      action: { label: '元に戻す', onClick: onUndo },
    })
  }

  /** Promise の進行を 1 つのトーストで追跡する。 */
  async function promise<T>(
    task: Promise<T>,
    messages: { loading: string; success: string | ((v: T) => string); error: string },
  ): Promise<T> {
    const id = push({
      type: 'info',
      message: messages.loading,
      duration: 0,
      icon: 'lucide:loader-2',
    })
    try {
      const value = await task
      dismiss(id)
      push({
        type: 'success',
        message: typeof messages.success === 'function' ? messages.success(value) : messages.success,
      })
      return value
    } catch (e) {
      dismiss(id)
      error(messages.error)
      throw e
    }
  }

  return {
    items,
    push,
    dismiss,
    clear,
    runAction,
    success,
    error,
    info,
    warning,
    undo,
    promise,
  }
}
