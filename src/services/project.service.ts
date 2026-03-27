import prisma from "@/lib/prisma"

type ProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"

function getThaiDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const year = parts.find((p) => p.type === "year")?.value ?? "1970"
  const month = parts.find((p) => p.type === "month")?.value ?? "01"
  const day = parts.find((p) => p.type === "day")?.value ?? "01"
  return `${year}-${month}-${day}`
}

export async function getAllProjects(filters?: { status?: ProjectStatus }) {
  return await prisma.project.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      manager: { select: { name: true, email: true } },
      _count: { select: { teams: true } }
    }
  })
}

export async function getProjectById(id: string) {
  const todayKey = getThaiDateKey(new Date())
  const candidates = await prisma.projectTimelineMilestone.findMany({
    where: { projectId: id, status: { in: ["PLANNED", "IN_PROGRESS", "DUE"] } },
    select: { id: true, dueDate: true, status: true },
  })

  const toDue: string[] = []
  const toInProgress: string[] = []
  const toPlanned: string[] = []

  for (const m of candidates) {
    const dueKey = getThaiDateKey(m.dueDate)
    if (dueKey < todayKey) toDue.push(m.id)
    if (dueKey === todayKey && (m.status === "PLANNED" || m.status === "DUE")) toInProgress.push(m.id)
    if (dueKey > todayKey && (m.status === "DUE" || m.status === "IN_PROGRESS")) toPlanned.push(m.id)
  }

  if (toDue.length > 0) {
    await prisma.projectTimelineMilestone.updateMany({
      where: { id: { in: toDue } },
      data: { status: "DUE" },
    })
  }

  if (toInProgress.length > 0) {
    await prisma.projectTimelineMilestone.updateMany({
      where: { id: { in: toInProgress } },
      data: { status: "IN_PROGRESS" },
    })
  }

  if (toPlanned.length > 0) {
    await prisma.projectTimelineMilestone.updateMany({
      where: { id: { in: toPlanned } },
      data: { status: "PLANNED" },
    })
  }

  return await prisma.project.findUnique({
    where: { id },
    include: {
      manager: { select: { name: true, email: true } },
      teams: {
        include: {
          _count: { select: { members: true } }
        }
      },
      awards: {
        orderBy: { rank: "asc" },
        include: { team: { select: { id: true, name: true } } }
      },
      milestones: {
        orderBy: [{ dueDate: "asc" }, { order: "asc" }],
      },
    }
  })
}

export async function createProject(data: {
  name: string
  description?: string
  startDate: Date
  endDate: Date
  managerId: string
  fiscalYear?: string
  budget?: number
  maxTeams?: number
}) {
  return await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      managerId: data.managerId,
      fiscalYear: data.fiscalYear,
      budget: data.budget ?? 0,
      maxTeams: data.maxTeams ?? 0,
      status: "DRAFT"
    }
  })
}

export async function updateProject(
  id: string,
  data: {
    name?: string
    description?: string | null
    status?: ProjectStatus
    budget?: number | null
    maxTeams?: number | null
    fiscalYear?: string | null
    startDate?: Date
    endDate?: Date
  }
) {
  return await prisma.project.update({
    where: { id },
    data
  })
}

export async function deleteProject(id: string) {
  return await prisma.project.delete({
    where: { id }
  })
}
