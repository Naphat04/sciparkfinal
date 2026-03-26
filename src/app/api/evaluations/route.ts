import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import * as evaluationService from "@/services/evaluation.service"

/**
 * POST - Submit a new evaluation for a proposal (Judge)
 */
export async function POST(req: NextRequest) {
  return withAuth(
    req,
    async () => {
      const body = await req.json()
      
      if (!body.proposalId || body.score === undefined) {
        return NextResponse.json({ error: "Missing required fields (proposalId, score)" }, { status: 400 })
      }

      const evaluation = await evaluationService.createEvaluation({
        proposalId: body.proposalId,
        judgeId: body.judgeId || "judge-123", // Using mock judge ID for demo
        score: parseFloat(body.score),
        comments: body.comments
      })
      
      return NextResponse.json(evaluation, { status: 201 })
    },
    { roles: ["JUDGE", "SUPER_ADMIN"] }
  )
}
