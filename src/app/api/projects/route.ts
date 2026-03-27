import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import * as projectService from "@/services/project.service"
import prisma from "@/lib/prisma"

/**
 * GET - List all projects
 */
export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async () => {
      const { searchParams } = new URL(req.url)
      const status = searchParams.get("status")
      
      const projects = await projectService.getAllProjects(
        status ? { status: status as any } : undefined
      )
      
      return NextResponse.json(projects)
    },
    { permission: "projects:read" }
  )
}

/**
 * POST - Create a new project
 */
export async function POST(req: NextRequest) {
  return withAuth(
    req,
    async (req, ctx) => {
      try {
        const body = await req.json()

        // Basic validation
        if (!body.name || !body.startDate || !body.endDate) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const startDate = new Date(body.startDate)
        const endDate = new Date(body.endDate)

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
          return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
        }

        if (startDate >= endDate) {
          return NextResponse.json({ error: "Start Date must be before End Date" }, { status: 400 })
        }

        const maxTeams = body.maxTeams ? parseInt(`${body.maxTeams}`, 10) : undefined
        if (maxTeams !== undefined && (Number.isNaN(maxTeams) || maxTeams <= 0)) {
          return NextResponse.json({ error: "Maximum Teams must be a number greater than 0" }, { status: 400 })
        }

        const budget = body.budget ? parseFloat(`${body.budget}`) : undefined
        if (body.budget && budget !== undefined && (Number.isNaN(budget) || budget < 0)) {
          return NextResponse.json({ error: "Budget must be a non-negative number" }, { status: 400 })
        }

        // Use authenticated user as manager (avoid hardcoded IDs)
        // Important: `email` is unique; the mock session id may not match seeded DB ids.
        const managerUser = await prisma.user.upsert({
          where: { email: ctx.session.user.email },
          update: {
            name: ctx.session.user.name,
            role: ctx.session.user.role,
          },
          create: {
            email: ctx.session.user.email,
            name: ctx.session.user.name,
            role: ctx.session.user.role,
            passwordHash: "temp",
          },
        })

        const managerId = managerUser.id

        const project = await projectService.createProject({
          name: `${body.name}`.trim(),
          description: typeof body.description === "string" ? body.description.trim() : body.description,
          startDate,
          endDate,
          managerId,
          budget,
          maxTeams,
          fiscalYear: typeof body.fiscalYear === "string" ? body.fiscalYear.trim() : body.fiscalYear
        })

        return NextResponse.json(project, { status: 201 })
      } catch (error: any) {
        console.error("/api/projects POST error", error)
        return NextResponse.json(
          { error: error?.message || "Failed to create project" },
          { status: 500 }
        )
      }
    },
    { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] }
  )
}
