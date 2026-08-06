import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_INVITES, '招待を管理する権限がありません')

  const invites = await db.query.serverInvites.findMany({
    where: eq(schema.serverInvites.serverId, serverId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })

  return { invites }
})
