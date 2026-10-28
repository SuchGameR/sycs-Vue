export type InterfaceSize = 'small' | 'medium' | 'large'

const FONT_SCALES: Record<InterfaceSize, number> = {
  small: 0.9,
  medium: 1,
  large: 1.12,
}

function isInterfaceSize(value: unknown): value is InterfaceSize {
  return value === 'small' || value === 'medium' || value === 'large'
}

function parseSettings(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function nearestFontSize(scale: number): InterfaceSize {
  if (scale < 0.95) return 'small'
  if (scale > 1.06) return 'large'
  return 'medium'
}

export function useInterfaceScale() {
  const fontSize = useState<InterfaceSize>('interface:font-size', () => 'medium')
  const buttonSize = useState<InterfaceSize>('interface:button-size', () => 'medium')
  const themeTokens = useThemeTokens()

  function applyButtonSize() {
    if (import.meta.client) {
      document.documentElement.dataset.buttonSize = buttonSize.value
    }
  }

  function setFontSize(size: InterfaceSize) {
    fontSize.value = size
    themeTokens.patch({ fontScale: FONT_SCALES[size] })
  }

  function setButtonSize(size: InterfaceSize) {
    buttonSize.value = size
    applyButtonSize()
  }

  function hydrate(settings: unknown) {
    const saved = parseSettings(settings)
    if (isInterfaceSize(saved.fontSize)) {
      fontSize.value = saved.fontSize
      themeTokens.patch({ fontScale: FONT_SCALES[saved.fontSize] })
    } else {
      fontSize.value = nearestFontSize(themeTokens.tokens.value.fontScale)
    }

    buttonSize.value = isInterfaceSize(saved.buttonSize) ? saved.buttonSize : 'medium'
    applyButtonSize()
  }

  return {
    fontSize,
    buttonSize,
    setFontSize,
    setButtonSize,
    hydrate,
  }
}
