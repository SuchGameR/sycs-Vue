import { loadBatchBadges, startBatchBadgeWatcher } from '../utils/batchBadges'

export default defineNitroPlugin(async () => {
  if (process.env.NITRO_PRESET === 'static' || process.env.GITHUB_PAGES === 'true') {
    console.log('[batch-badges] Skipping watcher (static build)')
    return
  }
  try {
    await loadBatchBadges()
    await startBatchBadgeWatcher()
    console.log('[batch-badges] Watching data/batch.json')
  } catch (err) {
    console.error('[batch-badges] Failed to initialize:', err)
  }
})
