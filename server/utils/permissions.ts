export const PERMISSIONS = {
  VIEW_CHANNEL: 1 << 0,
  SEND_MESSAGES: 1 << 1,
  MANAGE_MESSAGES: 1 << 2,
  CREATE_INVITE: 1 << 3,
  MANAGE_INVITES: 1 << 4,
  KICK_MEMBERS: 1 << 5,
  MANAGE_MEMBERS: 1 << 6,
  MANAGE_CHANNELS: 1 << 7,
  MANAGE_ROLES: 1 << 8,
  MANAGE_SERVER: 1 << 9,
  ADMINISTRATOR: 1 << 10,
} as const

export type PermissionKey = keyof typeof PERMISSIONS

export const ALL_PERMISSIONS_MASK = Object.values(PERMISSIONS).reduce((acc, v) => acc | v, 0)

export function hasPermission(mask: number | null | undefined, perm: number): boolean {
  return (mask ?? 0) > 0 && (mask & perm) === perm
}

export function hasAdministrator(mask: number | null | undefined): boolean {
  return hasPermission(mask, PERMISSIONS.ADMINISTRATOR)
}

export const PERMISSION_GROUPS: {
  label: string
  permissions: { key: PermissionKey; label: string; description: string }[]
}[] = [
  {
    label: '一般',
    permissions: [
      { key: 'VIEW_CHANNEL', label: 'チャンネルを見る', description: 'チャンネルを閲覧できます' },
      { key: 'SEND_MESSAGES', label: 'メッセージを送信', description: 'チャンネルにメッセージを送信できます' },
      { key: 'MANAGE_MESSAGES', label: 'メッセージを管理', description: 'メッセージの削除・編集ができます' },
    ],
  },
  {
    label: 'メンバー管理',
    permissions: [
      { key: 'CREATE_INVITE', label: '招待を作成', description: '招待リンクを作成できます' },
      { key: 'MANAGE_INVITES', label: '招待を管理', description: '招待リンクの作成・削除ができます' },
      { key: 'KICK_MEMBERS', label: 'メンバーをキック', description: 'メンバーをサーバーから退出させられます' },
      { key: 'MANAGE_MEMBERS', label: 'メンバーを管理', description: 'ロールの付与やニックネームの変更ができます' },
    ],
  },
  {
    label: 'サーバー管理',
    permissions: [
      { key: 'MANAGE_CHANNELS', label: 'チャンネルを管理', description: 'チャンネルの作成・編集・削除ができます' },
      { key: 'MANAGE_ROLES', label: 'ロールを管理', description: 'ロールの作成・編集・削除ができます' },
      { key: 'MANAGE_SERVER', label: 'サーバーを管理', description: 'サーバー設定やコミュニティ設定を変更できます' },
      { key: 'ADMINISTRATOR', label: '管理者', description: 'このロールにすべての権限を与えます' },
    ],
  },
]

export function permissionLabel(key: PermissionKey): string {
  for (const group of PERMISSION_GROUPS) {
    const found = group.permissions.find(p => p.key === key)
    if (found) return found.label
  }
  return key
}
