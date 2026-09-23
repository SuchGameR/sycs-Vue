import { db } from '../db'
import * as schema from '../db/schema'
import { and, eq } from 'drizzle-orm'

export interface BlockRelation {
  /** current user has blocked `otherId` */
  blocked: boolean
  /** `otherId` has blocked the current user */
  blockedBy: boolean
}

export async function getBlockRelation(userId: string, otherId: string): Promise<BlockRelation> {
  if (!otherId || userId === otherId) return { blocked: false, blockedBy: false }
  const [a, b] = await Promise.all([
    db.query.userBlocks.findFirst({
      where: and(eq(schema.userBlocks.userId, userId), eq(schema.userBlocks.blockedId, otherId)),
      columns: { id: true },
    }),
    db.query.userBlocks.findFirst({
      where: and(eq(schema.userBlocks.userId, otherId), eq(schema.userBlocks.blockedId, userId)),
      columns: { id: true },
    }),
  ])
  return { blocked: !!a, blockedBy: !!b }
}

export async function hasBlockEitherWay(userId: string, otherId: string): Promise<boolean> {
  const r = await getBlockRelation(userId, otherId)
  return r.blocked || r.blockedBy
}