import { UserRole } from "@prisma/client"

export type AuthenticatedUser = {
  id: string
  name: string | null
  email: string
  role: UserRole
  image?: string | null
}

export type AuthSession = {
  user: AuthenticatedUser
  expires: string
}

export type Permission = 
  | "projects:read" 
  | "projects:write" 
  | "teams:read" 
  | "teams:write" 
  | "proposals:read" 
  | "proposals:write" 
  | "evaluations:read" 
  | "evaluations:write"
  | "users:manage"

export const RolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "projects:read", "projects:write",
    "teams:read", "teams:write",
    "proposals:read", "proposals:write",
    "evaluations:read", "evaluations:write",
    "users:manage"
  ],
  PROJECT_MANAGER: [
    "projects:read", "projects:write",
    "teams:read", "teams:write",
    "proposals:read", "proposals:write",
    "evaluations:read"
  ],
  PARTICIPANT: [
    "projects:read",
    "teams:read", "teams:write",
    "proposals:read", "proposals:write"
  ],
  JUDGE: [
    "proposals:read",
    "evaluations:read", "evaluations:write"
  ]
}
