import prisma from "@/lib/prisma"

export async function createEvaluation(data: {
  proposalId: string
  judgeId: string
  score: number
  comments?: string
}) {
  return await prisma.$transaction(async (tx) => {
    const evaluation = await tx.evaluation.create({
      data: {
        proposalId: data.proposalId,
        judgeId: data.judgeId,
        score: data.score,
        comment: data.comments
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
          team: {
            include: {
              project: { select: { name: true } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function getAllEvaluations() {
  return await prisma.evaluation.findMany({
    include: {
      judge: { select: { name: true, email: true } },
      proposal: {
        include: {
          team: {
            include: {
              project: { select: { id: true, name: true } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}
