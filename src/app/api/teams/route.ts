import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import * as teamService from "@/services/team.service"

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const teams = await teamService.getAllTeams()
    return NextResponse.json(teams)
  }, { permission: "teams:read" })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async () => {
    const body = await req.json()

    if (!body.name || !body.projectId || !body.leaderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!Array.isArray(body.memberIds)) {
      body.memberIds = []
    }

    if (!body.memberIds.includes(body.leaderId)) {
      body.memberIds.push(body.leaderId)
    }

    // enforce team rules
    const nonLeaderMember = (body.memberIds || []).filter((id: string) => id !== body.leaderId)
    if (nonLeaderMember.length < 1) {
      return NextResponse.json({ error: "Team must include at least 1 member besides the leader" }, { status: 400 })
    }

    try {
      const team = await teamService.createTeam({
        name: body.name,
        projectId: body.projectId,
        leaderId: body.leaderId,
        memberIds: body.memberIds
      })

      return NextResponse.json(team, { status: 201 })
    } catch (error) {
      console.error("/api/teams error", error)
      return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
    }
  }, { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] })
}
