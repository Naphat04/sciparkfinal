import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import prisma from "@/lib/prisma"

/**
 * PATCH - Link an existing team to a project
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
    const { id: teamId } = await params
    const body = await req.json()

    if (!body.projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    try {
      const team = await prisma.team.update({
        where: { id: teamId },
        data: { projectId: body.projectId },
        include: {
          _count: { select: { members: true } }
        }
      })

      return NextResponse.json(team)
    } catch (error: any) {
      console.error("/api/teams/[id]/link-project error", error)
      return NextResponse.json({ error: error.message || "Failed to link team" }, { status: 500 })
    }
  }, { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] })
}
