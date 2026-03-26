import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import * as proposalService from "@/services/proposal.service"

/**
 * GET - List all proposals (Admin/Judge)
 */
export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async () => {
      const { searchParams } = new URL(req.url)
      const status = searchParams.get("status")
      
      const proposals = await proposalService.getAllProposals(
        status ? { status: status as any } : undefined
      )
      
      return NextResponse.json(proposals)
    },
    { roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "JUDGE"] }
  )
}

/**
 * POST - Create a new proposal draft (Participant)
 */
export async function POST(req: NextRequest) {
  return withAuth(
    req,
    async () => {
      const body = await req.json()
      
      if (!body.teamId || !body.title) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const proposal = await proposalService.createProposal({
        teamId: body.teamId,
        title: body.title,
        description: body.description,
        fileUrl: body.fileUrl
      })
      
      return NextResponse.json(proposal, { status: 201 })
    },
    { roles: ["PARTICIPANT", "SUPER_ADMIN"] }
  )
}
