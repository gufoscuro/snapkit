import type { Permission, UserResource } from '$lib/types/api-types'

/**
 * Whether the user holds a permission. Superadmins hold every permission.
 * Drives visibility only — the backend stays the source of truth (403).
 */
export function hasPermission(user: UserResource | null | undefined, permission: Permission): boolean {
  return (user?.is_superadmin ?? false) || (user?.all_permissions?.includes(permission) ?? false)
}
