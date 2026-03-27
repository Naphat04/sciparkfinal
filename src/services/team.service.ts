import prisma from "@/lib/prisma"

export async function createTeam(data: {
  name: string
  projectId: string
  leaderId: string
  memberIds?: string[]
}) {
  const members = [
    { participantId: data.leaderId, role: "LEADER" },
    ...((data.memberIds ?? [])
      .filter((id) => id !== data.leaderId)
      .map((id) => ({ participantId: id, role: "MEMBER" })))
  ]

  return await prisma.team.create({
    data: {
      name: data.name,
      projectId: data.projectId,
      leaderId: data.leaderId,
      members: {
        create: members
      }
    },
    include: {
      _count: { select: { members: true, proposals: true } },
      project: { select: { id: true, name: true } }
    }
  })
}

export async function addMemberToTeam(teamId: string, participantId: string, role: string = "MEMBER") {
  return await prisma.teamMember.create({
    data: {
      teamId,
      participantId,
      role
    }
  })
}

export async function getAllTeams(filters?: {
  search?: string
  projectId?: string
  status?: string
  fiscalYear?: string
}) {
  const where: any = {}
  
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { 
        members: {
          some: {
            participant: {
              user: {
                name: { contains: filters.search }
              }
            }
          }
        }
      }
    ]
  }

  if (filters?.projectId) {
    where.projectId = filters.projectId
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.fiscalYear) {
    where.project = {
      ...where.project,
      fiscalYear: filters.fiscalYear
    }
  }

  return await prisma.team.findMany({
    where,
    include: {
      project: { select: { id: true, name: true } },
      _count: { select: { members: true, proposals: true } }
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function getTeamsByProject(projectId: string) {
  return await prisma.team.findMany({
    where: { projectId },
    include: {
      members: {
        include: {
          participant: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        }
      },
      _count: { select: { members: true, proposals: true } }
    }
  })
}

export async function getTeamById(id: string) {
  return await prisma.team.findUnique({
    where: { id },
    include: {
      project: true,
      awards: {
        orderBy: { rank: "asc" },
        select: {
          rank: true,
          project: { select: { id: true, name: true } },
        },
      },
      members: {
        include: {
          participant: {
            include: { user: { select: { name: true, email: true } } }
          }
        }
      },
      proposals: true
    }
  })
}
