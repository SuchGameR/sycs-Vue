import { ensureDb } from '../db'

export default defineNitroPlugin(async () => {
  // GitHub Pages / 静的 generate 時は DB に接続しない
  // （Actions 上に Postgres が無いため、ここで throw すると generate が落ちる）
  if (process.env.NITRO_PRESET === 'static' || process.env.GITHUB_PAGES === 'true' || process.env.SKIP_DB === 'true') {
    console.log('[db] Skipping database init (static / GitHub Pages build)')
    return
  }

  console.log('[db] Connecting to database...')
  try {
    await ensureDb()
    console.log('[db] Database initialized successfully')
  } catch (err) {
    console.error('[db] Failed to initialize database:', err)
    throw err
  }
})
