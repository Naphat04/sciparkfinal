import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import prisma from "@/lib/prisma"

const allowedStatuses = ["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"] as const
type ProjectPatchData = {
  name?: string
  description?: string | null
  status?: (typeof allowedStatuses)[number]
  budget?: number | null
  maxTeams?: number | null
  fiscalYear?: string | null
  startDate?: Date
  endDate?: Date
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

      if (!projectId) {
        return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
      }

      const existing = await prisma.project.findUnique({ where: { id: projectId } })
      if (!existing) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      const data: ProjectPatchData = {}

      if (typeof body.name === "string") {
        const name = body.name.trim()
        if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 })
        data.name = name
      }

      if ("description" in body) {
        // Allow empty string => null for cleaner DB values
        const description = body.description === "" ? null : body.description ?? null
        data.description = description
      }

      if (typeof body.status === "string") {
        const candidate = body.status
        if (!allowedStatuses.includes(candidate as (typeof allowedStatuses)[number])) {
          return NextResponse.json(
            { error: `status must be one of: ${allowedStatuses.join(", ")}` },
            { status: 400 }
          )
        }
        data.status = candidate as (typeof allowedStatuses)[number]
      }

      if (body.budget !== undefined) {
        const budget = body.budget === null ? null : Number(body.budget)
        if (budget !== null && (Number.isNaN(budget) || budget < 0)) {
          return NextResponse.json({ error: "Budget must be a non-negative number" }, { status: 400 })
        }
        data.budget = budget
      }

      if (body.maxTeams !== undefined) {
        const maxTeams = body.maxTeams === null ? null : Number(body.maxTeams)
        if (maxTeams !== null && (!Number.isFinite(maxTeams) || maxTeams < 0)) {
          return NextResponse.json({ error: "Maximum Teams must be >= 0" }, { status: 400 })
        }
        data.maxTeams = maxTeams
      }

      if ("fiscalYear" in body) {
        data.fiscalYear = typeof body.fiscalYear === "string" ? body.fiscalYear.trim() : body.fiscalYear ?? null
      }

      const needsDateValidation = body.startDate !== undefined || body.endDate !== undefined
      if (needsDateValidation) {
        const startDate = body.startDate !== undefined ? new Date(body.startDate) : existing.startDate
        const endDate = body.endDate !== undefined ? new Date(body.endDate) : existing.endDate

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
          return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
        }

        if (startDate >= endDate) {
          return NextResponse.json({ error: "Start Date must be before End Date" }, { status: 400 })
        }

        data.startDate = startDate
        data.endDate = endDate
      }

      if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No valid fields provided" }, { status: 400 })
      }

      const updated = await prisma.project.update({
        where: { id: projectId },
        data,
      })

      return NextResponse.json(updated)
    },
    { roles: ["PROJECT_MANAGER"] }
  )
}

