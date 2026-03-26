import prisma from "@/lib/prisma"

export async function createTeam(data: {
  name: string
  projectId: string
  leaderId: string
}) {
  return await prisma.team.create({
    data: {
      name: data.name,
      projectId: data.projectId,
      leaderId: data.leaderId,
      members: {
        create: {
          participantId: data.leaderId,
          role: "LEADER"
        }
      }
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

export async function getAllTeams() {
  return await prisma.team.findMany({
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
