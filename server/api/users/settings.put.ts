import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

const THEME_STYLES = ['classic', 'material3', 'liquid-glass']
const THEME_SCHEMES = ['light', 'dark', 'system']

/**
 * 外観設定の正規化。
 *
 * 旧形式の `theme: 'dark' | 'light'` を `themeScheme` へ引き継ぎ、
 * 使われなくなった `theme` を落とす。値が壊れている場合は既定値にリセットする。
 */
function normalizeTheme(merged: Record<string, any>) {
  if (!THEME_STYLES.includes(merged.themeStyle)) delete merged.themeStyle
  if (!THEME_SCHEMES.includes(merged.themeScheme)) delete merged.themeScheme
  if (typeof merged.themeSeed !== 'string' || merged.themeSeed.length > 32) {
    delete merged.themeSeed
  }

  if (merged.theme === 'light' || merged.theme === 'dark') {
    if (!merged.themeScheme) merged.themeScheme = merged.theme
  }
  delete merged.theme

  if (THEME_STYLES.includes(merged.themeStyle) || merged.themeScheme) {
    merged.themeStyle ??= 'classic'
    merged.themeScheme ??= 'dark'
  }
  return merged
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const existing = JSON.parse(user.settings || '{}')
  const merged = normalizeTheme({ ...existing, ...body })

  await db.update(schema.users)
    .set({ settings: JSON.stringify(merged) })
    .where(eq(schema.users.id, user.id))

  return { settings: merged }
})
