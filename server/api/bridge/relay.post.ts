import { broadcast } from '../../utils/realtime'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const type = typeof body.type === 'string' ? body.type : 'bridge.event'
  const payload = body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload) ? body.payload : { ...body }
  const source = typeof body.source === 'string' ? body.source : 'bridge'

  broadcast({ type, source, payload, ts: Date.now() })

  return { ok: true }
})