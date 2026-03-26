import prisma from "@/lib/prisma"
import { ProjectStatus } from "@prisma/client"

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
  return await prisma.project.findUnique({
    where: { id },
    include: {
      manager: { select: { name: true, email: true } },
      teams: {
        include: {
          _count: { select: { members: true } }
        }
      }
    }
  })
}

export async function createProject(data: {
  name: string
  description?: string
  startDate: Date
  endDate: Date
  managerId: string
  budget?: number
}) {
  return await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      managerId: data.managerId,
      budget: data.budget ?? 0,
      status: "DRAFT"
    }
  })
}

export async function updateProject(id: string, data: any) {
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
