import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import prisma from "@/lib/prisma"

const allowedStatuses = ["PLANNED", "IN_PROGRESS", "DUE", "DONE", "DELAYED"] as const
type MilestoneStatus = (typeof allowedStatuses)[number]

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

async function autoUpdateMilestoneStatuses(projectId: string) {
  const todayKey = getThaiDateKey(new Date())
  const candidates = await prisma.projectTimelineMilestone.findMany({
    where: { projectId, status: { in: ["PLANNED", "IN_PROGRESS", "DUE"] } },
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
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(
    req,
    async () => {
      const resolvedParams = await params
      const projectId = resolvedParams.id

      await autoUpdateMilestoneStatuses(projectId)

      const milestones = await prisma.projectTimelineMilestone.findMany({
        where: { projectId },
        orderBy: [{ dueDate: "asc" }, { order: "asc" }],
      })

      return NextResponse.json({ milestones })
    },
    { permission: "projects:read" }
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(
    req,
    async () => {
      const resolvedParams = await params
      const projectId = resolvedParams.id
      const body = await req.json()

      const title = typeof body?.title === "string" ? body.title.trim() : ""
      const dueDate = new Date(body?.dueDate)
      const status = typeof body?.status === "string" ? body.status : "PLANNED"
      const description = typeof body?.description === "string" ? body.description.trim() : null

      if (!title) {
        return NextResponse.json({ error: "title is required" }, { status: 400 })
      }

      if (Number.isNaN(dueDate.getTime())) {
        return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 })
      }

      if (!allowedStatuses.includes(status as MilestoneStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }

      const last = await prisma.projectTimelineMilestone.findFirst({
        where: { projectId },
        orderBy: { order: "desc" },
        select: { order: true },
      })

      const milestone = await prisma.projectTimelineMilestone.create({
        data: {
          projectId,
          title,
          description,
          dueDate,
          status,
          order: (last?.order ?? -1) + 1,
        },
      })

      return NextResponse.json(milestone, { status: 201 })
    },
    { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] }
  )
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(
    req,
    async () => {
      const resolvedParams = await params
      const projectId = resolvedParams.id
      const body = await req.json()

      const milestoneId = typeof body?.milestoneId === "string" ? body.milestoneId : ""
      if (!milestoneId) {
        return NextResponse.json({ error: "milestoneId is required" }, { status: 400 })
      }

      const existing = await prisma.projectTimelineMilestone.findUnique({
        where: { id: milestoneId },
      })

      if (!existing || existing.projectId !== projectId) {
        return NextResponse.json({ error: "Milestone not found in this project" }, { status: 404 })
      }

      const data: {
        title?: string
        description?: string | null
        dueDate?: Date
        status?: MilestoneStatus
      } = {}

      if (body.title !== undefined) {
        const title = typeof body.title === "string" ? body.title.trim() : ""
        if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 })
        data.title = title
      }

      if (body.description !== undefined) {
        data.description = typeof body.description === "string" ? body.description.trim() : null
      }

      if (body.dueDate !== undefined) {
        const dueDate = new Date(body.dueDate)
        if (Number.isNaN(dueDate.getTime())) {
          return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 })
        }
        data.dueDate = dueDate
      }

      if (body.status !== undefined) {
        if (
          typeof body.status !== "string" ||
          !allowedStatuses.includes(body.status as MilestoneStatus)
        ) {
          return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }
        data.status = body.status as MilestoneStatus
      }

      if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No valid fields provided" }, { status: 400 })
      }

      const updated = await prisma.projectTimelineMilestone.update({
        where: { id: milestoneId },
        data,
      })

      return NextResponse.json(updated)
    },
    { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] }
  )
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(
    req,
    async () => {
      const resolvedParams = await params
      const projectId = resolvedParams.id
      const body = await req.json()

      const milestoneId = typeof body?.milestoneId === "string" ? body.milestoneId : ""
      if (!milestoneId) {
        return NextResponse.json({ error: "milestoneId is required" }, { status: 400 })
      }

      const existing = await prisma.projectTimelineMilestone.findUnique({
        where: { id: milestoneId },
      })

      if (!existing || existing.projectId !== projectId) {
        return NextResponse.json({ error: "Milestone not found in this project" }, { status: 404 })
      }

      await prisma.projectTimelineMilestone.delete({ where: { id: milestoneId } })
      return NextResponse.json({ success: true })
    },
    { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] }
  )
}

