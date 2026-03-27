import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const role = body.role || "PARTICIPANT"
  
  // Map to mock emails so prisma operations work without issue
  const emailMap: Record<string, string> = {
    "SUPER_ADMIN": "admin@scipark.university",
    "PROJECT_MANAGER": "manager@scipark.university",
    "PARTICIPANT": "participant@scipark.university"
  }
  const nameMap: Record<string, string> = {
    "SUPER_ADMIN": "Sci-Park Master Admin",
    "PROJECT_MANAGER": "Sci-Park Project Manager",
    "PARTICIPANT": "Sci-Park Participant"
  }

  const email = emailMap[role] || emailMap["PARTICIPANT"]
  const name = nameMap[role] || nameMap["PARTICIPANT"]

  const cookieStore = await cookies()
  cookieStore.set("mock-auth-role", role, { path: "/" })
  cookieStore.set("mock-auth-email", email, { path: "/" })
  cookieStore.set("mock-auth-name", name, { path: "/" })

  return NextResponse.json({ success: true, role })
}
