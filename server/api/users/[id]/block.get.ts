import { requireAuth } from '../../utils/auth'
import { getBlockRelation } from '../../utils/blocks'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const targetId = getRouterParam(event, 'id')
  const rel = await getBlockRelation(user.id, targetId!)
  return rel
})