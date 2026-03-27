import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import prisma from "@/lib/prisma"

import * as participantService from "@/services/participant.service"

/**
 * GET - Get participants for a specific project
 * Query param: projectId
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    try {
      const participants = await participantService.getParticipantsByProject(projectId)
      return NextResponse.json(participants)
    } catch (error: any) {
      console.error("/api/participants GET error", error)
      return NextResponse.json({ error: error.message || "Failed to fetch participants" }, { status: 500 })
    }
  }, { permission: "projects:read" })
}

/**
 * POST - Create a new participant or link existing participant to project
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async () => {
    const body = await req.json()
    const allowedTypes = ["LECTURER", "RESEARCHER", "ENTREPRENEUR", "PROJECT_MANAGER"]

    if (!body.name || !body.email || !body.type) {
      return NextResponse.json({ error: "Missing required fields (name, email, type)" }, { status: 400 })
    }
    if (!allowedTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid participant type" }, { status: 400 })
    }

    try {
      // Check if user with this email exists
      let user = await prisma.user.findUnique({
        where: { email: body.email }
      })

      // If not, create user
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: body.email,
            phone: body.phone || null,
            name: body.name,
            passwordHash: "temp", // TODO: [PRODUCTION] Hash password properly before deployment
            role: "PARTICIPANT"
          }
        })
      } else if (body.phone || body.name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(body.name && { name: body.name }),
            ...(body.phone !== undefined && { phone: body.phone || null }),
          },
        })
      }

      // Check if participant exists for this user
      let participant = await prisma.participant.findUnique({
        where: { userId: user.id }
      })

      // If not, create participant
      if (!participant) {
        const profileData = body.profileData || {}

        participant = await prisma.participant.create({
          data: {
            userId: user.id,
            type: body.type,
            projectId: body.projectId, // Link to project if provided
            ...(body.type === "STUDENT" && {
              studentProfile: {
                create: {
                  studentId: profileData.studentId || "",
                  faculty: profileData.faculty || "",
                  program: profileData.program || "",
                  year: profileData.year || 1
                }
              }
            }),
            ...(body.type === "LECTURER" && {
              lecturerProfile: {
                create: {
                  faculty: profileData.faculty || "",
                  position: profileData.position || ""
                }
              }
            }),
            ...(body.type === "RESEARCHER" && {
              researcherProfile: {
                create: {
                  organization: profileData.organization || "",
                  researchField: profileData.researchField || ""
                }
              }
            }),
            ...(body.type === "ENTREPRENEUR" && {
              entrepreneurProfile: {
                create: {
                  companyName: profileData.companyName || "",
                  businessType: profileData.businessType || ""
                }
              }
            })
          },
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        })
      } else if (body.projectId && (!participant.projectId || participant.projectId !== body.projectId)) {
        // Link existing participant to the project if not already linked
        participant = await prisma.participant.update({
          where: { id: participant.id },
          data: { projectId: body.projectId },
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        })
      }

      return NextResponse.json(
        {
          id: participant.id,
          userId: participant.userId,
          name: user.name || "",
          email: user.email,
          type: participant.type,
          createdAt: participant.createdAt
        },
        { status: 201 }
      )
    } catch (error) {
      console.error("/api/participants error", error)
      return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
    }
  }, { roles: ["PROJECT_MANAGER"] })
}
