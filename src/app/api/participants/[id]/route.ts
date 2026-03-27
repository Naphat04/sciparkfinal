import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
    const resolvedParams = await params
    const participantId = resolvedParams.id

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
    }

    try {
      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          studentProfile: true,
          lecturerProfile: true,
          researcherProfile: true,
          entrepreneurProfile: true,
          project: { select: { id: true, name: true } },
          teamMemberships: {
            include: {
              team: {
                include: {
                  project: { select: { id: true, name: true } },
                  awards: {
                    include: {
                      project: { select: { id: true, name: true } },
                      team: { select: { id: true, name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!participant) {
        return NextResponse.json({ error: "Participant not found" }, { status: 404 })
      }

      return NextResponse.json(participant)
    } catch (error: unknown) {
      console.error("/api/participants/[id] GET error", error)
      const message = error instanceof Error ? error.message : "Failed to fetch participant"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }, { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
    const resolvedParams = await params
    const participantId = resolvedParams.id
    const body = await req.json()

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
    }

    try {
      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        include: { user: true }
      })

      if (!participant) {
        return NextResponse.json({ error: "Participant not found" }, { status: 404 })
      }

      // Update user name and email if provided
      if (body.name || body.email || body.phone !== undefined) {
        await prisma.user.update({
          where: { id: participant.userId },
          data: {
            ...(body.name && { name: body.name }),
            ...(body.email && { email: body.email }),
            ...(body.phone !== undefined && { phone: body.phone || null }),
          }
        })
      }

      // Update profile data based on type
      if (body.profileData) {
        if (participant.type === "STUDENT") {
          await prisma.studentProfile.update({
            where: { participantId },
            data: body.profileData
          })
        } else if (participant.type === "LECTURER") {
          await prisma.lecturerProfile.update({
            where: { participantId },
            data: body.profileData
          })
        } else if (participant.type === "RESEARCHER") {
          await prisma.researcherProfile.update({
            where: { participantId },
            data: body.profileData
          })
        } else if (participant.type === "ENTREPRENEUR") {
          await prisma.entrepreneurProfile.update({
            where: { participantId },
            data: body.profileData
          })
        }
      }

      const updated = await prisma.participant.findUnique({
        where: { id: participantId },
        include: { user: true }
      })

      return NextResponse.json({
        id: updated!.id,
        userId: updated!.userId,
        name: updated!.user.name || "",
        email: updated!.user.email,
        type: updated!.type,
        createdAt: updated!.createdAt
      })
    } catch (error) {
      console.error("/api/participants/[id] PUT error", error)
      return NextResponse.json({ error: "Failed to update participant" }, { status: 500 })
    }
  }, { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] })
}
