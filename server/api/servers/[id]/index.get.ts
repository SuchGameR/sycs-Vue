import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, inArray } from 'drizzle-orm'
import { requireServerMember } from '../../../utils/serverAuth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const ctx = await requireServerMember(event, id)

  const [channels, members, roles] = await Promise.all([
    db.query.serverChannels.findMany({ where: eq(schema.serverChannels.serverId, id) }),
    db.query.serverMembers.findMany({ where: eq(schema.serverMembers.serverId, id) }),
    db.query.serverRoles.findMany({ where: eq(schema.serverRoles.serverId, id) }),
  ])

  const userIds = members.map(m => m.userId)
  const users = userIds.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, userIds) })
    : []
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))

  const roleIds = [...new Set(roles.map(r => r.id))]
  const roleMap = Object.fromEntries(roles.map(r => [r.id, r]))

  const membersWithUser = members.map(m => ({ ...m, user: userMap[m.userId] || null, role: m.roleId ? roleMap[m.roleId] || null : null }))

  return {
    server: ctx.server,
    channels,
    members: membersWithUser,
    roles,
    myMember: ctx.member ? { ...ctx.member, role: ctx.role } : null,
    myPermissions: ctx.permissions,
    isOwner: ctx.isOwner,
  }
})
