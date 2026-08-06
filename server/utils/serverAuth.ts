import { db } from '../db'
import * as schema from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth, getCurrentUser } from './auth'
import { hasPermission, hasAdministrator, ALL_PERMISSIONS_MASK } from './permissions'

export interface ServerContext {
  server: any
  member: any
  role: any | null
  permissions: number
  isOwner: boolean
  user: any | null
}

export function rolePermissionsMask(role: any | null | undefined): number {
  if (!role) return 0
  if (role.isAdmin || role.permissions === 'all') return ALL_PERMISSIONS_MASK
  return typeof role.permissionsMask === 'number' ? role.permissionsMask : 0
}

export async function getServerContext(event: any, serverId: string): Promise<ServerContext | null> {
  const user = await getCurrentUser(event)
  if (!user) return null

  const server = await db.query.servers.findFirst({ where: eq(schema.servers.id, serverId) })
  if (!server) return null

  const isOwner = server.ownerId === user.id
  const member = await db.query.serverMembers.findFirst({
    where: and(
      eq(schema.serverMembers.serverId, serverId),
      eq(schema.serverMembers.userId, user.id)
    ),
  })

  let role: any = null
  if (member?.roleId) {
    role = await db.query.serverRoles.findFirst({ where: eq(schema.serverRoles.id, member.roleId) })
  }

  let permissions = rolePermissionsMask(role)
  if (isOwner || role?.isAdmin || hasAdministrator(permissions)) {
    permissions = ALL_PERMISSIONS_MASK
  }

  return { server, member, role, permissions, isOwner, user }
}

export async function requireServerMember(event: any, serverId: string): Promise<ServerContext> {
  const ctx = await getServerContext(event, serverId)
  if (!ctx?.server) throw createError({ statusCode: 404, message: 'サーバーが見つかりません' })
  if (!ctx.isOwner && !ctx.member) {
    throw createError({ statusCode: 403, message: 'このサーバーのメンバーではありません' })
  }
  return ctx
}

export async function requireServerOwner(event: any, serverId: string): Promise<ServerContext> {
  const ctx = await getServerContext(event, serverId)
  if (!ctx?.server) throw createError({ statusCode: 404, message: 'サーバーが見つかりません' })
  if (!ctx.isOwner) throw createError({ statusCode: 403, message: 'サーバー所有者のみ操作できます' })
  return ctx
}

export async function requireServerPermission(
  event: any,
  serverId: string,
  perm: number,
  message = '権限がありません'
): Promise<ServerContext> {
  await requireAuth(event)
  const ctx = await getServerContext(event, serverId)
  if (!ctx?.server) throw createError({ statusCode: 404, message: 'サーバーが見つかりません' })
  if (!ctx.isOwner && !ctx.member) {
    throw createError({ statusCode: 403, message: 'このサーバーのメンバーではありません' })
  }
  if (!ctx.isOwner && !hasPermission(ctx.permissions, perm)) {
    throw createError({ statusCode: 403, message })
  }
  return ctx
}
