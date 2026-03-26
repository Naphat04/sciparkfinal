import { UserRole } from "@prisma/client"
import { RolePermissions, Permission, AuthenticatedUser } from "@/types/auth"

/**
 * Checks if a user has a specific permission based on their role.
 */
export function hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  if (user.role === "SUPER_ADMIN") return true // God mode
  const permissions = RolePermissions[user.role] || []
  return permissions.includes(permission)
}

/**
 * Higher-order role check. Returns true if user has the role or higher (if ordered).
 * Currently, we use exact matching or hierarchical check for ADMINs.
 */
export function hasRole(user: AuthenticatedUser, allowedRoles: UserRole[]): boolean {
  if (allowedRoles.includes(user.role)) return true
  if (user.role === "SUPER_ADMIN") return true
  return false
}

/**
 * Mocking a session for current development Phase 2.
 * In a real app, this would be retrieved from NextAuth / Auth.js.
 */
export async function getMockSession(): Promise<{ user: AuthenticatedUser } | null> {
  // Simulating a SUPER_ADMIN for Phase 2/3 development.
  return {
    user: {
      id: "admin-123",
      email: "admin@scipark.university",
      name: "Sci-Park Master Admin",
      role: "SUPER_ADMIN"
    }
  }
}
