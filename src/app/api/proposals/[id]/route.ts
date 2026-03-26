import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import * as proposalService from "@/services/proposal.service"

type Props = {
  params: { id: string }
}

/**
 * PUT - Update a proposal's status (Submit, Approve, Reject)
 */
export async function PUT(req: NextRequest, { params }: Props) {
  return withAuth(
    req,
    async () => {
      const body = await req.json()
      const { status, action } = body

      // If action is "SUBMIT", use the specialized service function
      if (action === "SUBMIT") {
        const proposal = await proposalService.submitProposal(params.id)
        return NextResponse.json(proposal)
      }

      // Standard status updates (for Admin/Judge)
      if (status) {
        const proposal = await proposalService.updateProposalStatus(params.id, status as any)
        return NextResponse.json(proposal)
      }

      return NextResponse.json({ error: "Missing action or status" }, { status: 400 })
    },
    { roles: ["PARTICIPANT", "SUPER_ADMIN", "PROJECT_MANAGER", "JUDGE"] }
  )
}
