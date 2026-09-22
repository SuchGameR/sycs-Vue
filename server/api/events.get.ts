import { createEventStream } from 'h3'
import { requireAuth } from '../utils/auth'
import { subscribeRealtime, unsubscribeRealtime } from '../utils/realtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const stream = createEventStream(event)
  stream.push({ event: 'message', data: JSON.stringify({ type: 'connected' }) }).catch(() => {})

  const sub = {
    userId: user.id,
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
