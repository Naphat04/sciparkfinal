import prisma from "@/lib/prisma"

export async function createEvaluation(data: {
  proposalId: string
  judgeId: string
  score: number
  comments?: string
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the evaluation
    const evaluation = await tx.evaluation.create({
      data: {
        proposalId: data.proposalId,
        judgeId: data.judgeId,
        score: data.score,
        comments: data.comments
      }
    })

    // 2. Automatically move proposal to UNDER_REVIEW status
    await tx.proposal.update({
      where: { id: data.proposalId },
      data: { status: "UNDER_REVIEW" }
    })

    return evaluation
  })
}

export async function getEvaluationsByProposal(proposalId: string) {
  return await prisma.evaluation.findMany({
    where: { proposalId },
    include: {
      judge: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function getJudgeEvaluations(judgeId: string) {
  return await prisma.evaluation.findMany({
    where: { judgeId },
    include: {
      proposal: {
        include: {
          team: { select: { name: true } },
          team_project: { select: { name: true } } // Wait, let me check relation name in schema
        }
      }
    }
  })
}
