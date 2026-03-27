import prisma from "@/lib/prisma"

export async function getDashboardStats() {
  const [totalProjects, totalTeams, totalParticipants, activeProjects] = await Promise.all([
    prisma.project.count(),
    prisma.team.count(),
    prisma.participant.count(),
    prisma.project.count({ where: { status: "ACTIVE" } })
  ])

  return {
    totalProjects,
    totalTeams,
    totalParticipants,
    activeProjects
  }
}

export async function getRecentProjects(take = 5) {
  return prisma.project.findMany({
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      budget: true,
      createdAt: true,
      manager: { select: { name: true, email: true } },
      _count: { select: { teams: true, participants: true } },
    },
  })
}

export async function getUpcomingDeadlines(take = 5) {
  const now = new Date()
  return prisma.project.findMany({
    take,
    where: { endDate: { gte: now }, status: { in: ["ACTIVE", "DRAFT"] } },
    orderBy: { endDate: "asc" },
    select: {
      id: true,
      name: true,
      status: true,
      endDate: true,
      _count: { select: { teams: true } },
    },
  })
}

export async function getRecentTeams(take = 5) {
  return prisma.team.findMany({
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      project: { select: { id: true, name: true } },
      _count: { select: { members: true } },
    },
  })
}

export async function getRecentParticipants(take = 5) {
  return prisma.participant.findMany({
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      createdAt: true,
      project: { select: { id: true, name: true } },
      user: { select: { name: true, email: true } },
    },
  })
}
