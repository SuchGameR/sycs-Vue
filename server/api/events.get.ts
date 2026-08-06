import { createEventStream } from 'h3'
import { requireAuth } from '../utils/auth'
import { subscribeRealtime, unsubscribeRealtime } from '../utils/realtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const stream = createEventStream(event)
  await stream.push({ event: 'message', data: JSON.stringify({ type: 'connected' }) })

  const sub = {
    push: (data: string) => stream.push({ event: 'message', data }),
  }
  subscribeRealtime(sub)

  const hb = setInterval(() => {
    stream.push({ event: 'heartbeat', data: 'ping' }).catch(() => {})
  }, 25000)

  event.node.req.on('close', () => {
    clearInterval(hb)
    unsubscribeRealtime(sub)
    stream.close()
  })

  return stream.send()
})
