import { UserRole } from "@/types/auth"
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
  // Strict role matching — no implicit "God mode" bypass
  return allowedRoles.includes(user.role)
}

import { cookies } from "next/headers"

/**
 * Mocking a session for current development Phase 2.
 * In a real app, this would be retrieved from NextAuth / Auth.js.
/**
 * TODO: [PRODUCTION] Replace with NextAuth / Auth.js session provider before deployment.
 * Current mock session reads role from cookies without any verification.
 */
export async function getMockSession(): Promise<{ user: AuthenticatedUser } | null> {
  let role = "SUPER_ADMIN"
  let email = "admin@scipark.university"
  let name = "Sci-Park Master Admin"
  
  try {
    const cookieStore = await cookies()
    const r = cookieStore.get("mock-auth-role")?.value
    if (r) {
      role = r
      email = cookieStore.get("mock-auth-email")?.value || `${r.toLowerCase()}@scipark.university`
      name = cookieStore.get("mock-auth-name")?.value || `Mock ${r}`
    }
  } catch (err) {
    // If not in a context with cookies, gracefully fallback instead of erroring
  }

  // Simulating a role for Phase 2/3 development based on cookie.
  return {
    user: {
      id: `mock-${role.toLowerCase()}-id`,
      email,
      name,
      role: role as UserRole
    }
  }
}
