import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import prisma from "@/lib/prisma"

/**
 * PATCH - Update team status (approve / reject)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
    const { id } = await params
    const body = await req.json()

    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"]
    if (!body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    try {
      const team = await prisma.team.update({
        where: { id },
        data: { status: body.status },
      })

      return NextResponse.json(team)
    } catch (error: any) {
      console.error("/api/teams/[id] PATCH error", error)
      return NextResponse.json({ error: error.message || "Failed to update team" }, { status: 500 })
    }
  }, { roles: ["PROJECT_MANAGER"] })
}
