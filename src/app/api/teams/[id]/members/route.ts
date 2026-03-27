import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import * as teamService from "@/services/team.service"

/**
 * POST - Add a member to a team
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
    const { id: teamId } = await params
    const body = await req.json()

    if (!body.participantId) {
      return NextResponse.json({ error: "participantId is required" }, { status: 400 })
    }

    try {
      const member = await teamService.addMemberToTeam(
        teamId,
        body.participantId,
        body.role || "MEMBER"
      )

      return NextResponse.json(member, { status: 201 })
    } catch (error: any) {
      console.error("/api/teams/[id]/members error", error)
      return NextResponse.json({ error: error.message || "Failed to add member" }, { status: 500 })
    }
  }, { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] })
}
