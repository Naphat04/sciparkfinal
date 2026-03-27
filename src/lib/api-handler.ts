import { NextRequest, NextResponse } from "next/server"
import { getMockSession, hasRole, hasPermission } from "@/lib/auth-utils"
import { Permission, UserRole } from "@/types/auth"

type HandlerContext = {
  params: Record<string, string>
  session: { user: any }
}

/**
 * Enhanced API handler with built-in RBAC checks.
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, ctx: HandlerContext) => Promise<NextResponse>,
  options?: {
    roles?: UserRole[]
    permission?: Permission
  }
) {
  const session = await getMockSession() // Replace with NextAuth session in Phase 3
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check roles if specified
  if (options?.roles && !hasRole(session.user, options.roles)) {
    return NextResponse.json({ error: "Forbidden - Insufficient Role" }, { status: 403 })
  }

  // Check specific permission if specified
  if (options?.permission && !hasPermission(session.user, options.permission)) {
    return NextResponse.json({ error: "Forbidden - Insufficient Permission" }, { status: 403 })
  }

  // Pass control to the specific route logic
  return handler(req, { params: {}, session })
}
