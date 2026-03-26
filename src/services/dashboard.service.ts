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
