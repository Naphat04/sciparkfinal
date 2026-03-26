import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import * as projectService from "@/services/project.service"

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
    async () => {
      const body = await req.json()
      
      // Basic validation
      if (!body.name || !body.startDate || !body.endDate) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const project = await projectService.createProject({
        name: body.name,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        managerId: body.managerId || "admin-123", // Using current mock admin as manager
        budget: body.budget ? parseFloat(body.budget) : 0
      })
      
      return NextResponse.json(project, { status: 201 })
    },
    { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] }
  )
}
