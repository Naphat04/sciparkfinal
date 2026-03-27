import prisma from "@/lib/prisma"

type ProposalStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"

export async function createProposal(data: {
  teamId: string
  title: string
  description?: string
  fileUrl?: string
}) {
  return await prisma.proposal.create({
    data: {
      teamId: data.teamId,
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl,
      status: "DRAFT"
    }
  })
}

export async function submitProposal(id: string) {
  return await prisma.proposal.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date()
    }
  })
}

export async function getProposalsByTeam(teamId: string) {
  return await prisma.proposal.findMany({
    where: { teamId },
    orderBy: { updatedAt: "desc" },
    include: {
      evaluations: {
        include: {
          judge: { select: { name: true } }
        }
      }
    }
  })
}

export async function getAllProposals(filters?: { status?: ProposalStatus }) {
  return await prisma.proposal.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      team: {
        include: {
          project: { select: { name: true } }
        }
      },
      _count: { select: { evaluations: true } }
    }
  })
}

export async function updateProposalStatus(id: string, status: ProposalStatus) {
  return await prisma.proposal.update({
    where: { id },
    data: { status }
  })
}
