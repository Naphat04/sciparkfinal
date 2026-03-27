import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-handler"
import prisma from "@/lib/prisma"

type AwardInput = {
  rank: number
  teamId: string | null
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

      const awards = await prisma.projectAward.findMany({
        where: { projectId },
        orderBy: { rank: "asc" },
        include: {
          team: { select: { id: true, name: true } },
        },
      })

      return NextResponse.json({ awards })
    },
    { permission: "projects:read" }
  )
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(
    req,
    async () => {
      const resolvedParams = await params
      const projectId = resolvedParams.id

      try {
        const body = await req.json()
        const awards: AwardInput[] = Array.isArray(body?.awards) ? body.awards : []

        // validate ranks 1-3, allow null teamId (meaning "unset")
        const cleaned = awards
          .filter((a) => a && typeof a.rank === "number")
          .map((a) => ({
            rank: a.rank,
            teamId: a.teamId ?? null,
          }))
          .filter((a) => [1, 2, 3].includes(a.rank))

        // ensure no duplicate ranks
        const rankSet = new Set(cleaned.map((a) => a.rank))
        if (rankSet.size !== cleaned.length) {
          return NextResponse.json({ error: "Duplicate ranks are not allowed" }, { status: 400 })
        }

        // ensure no duplicate teams across ranks (excluding null)
        const teamIds = cleaned.map((a) => a.teamId).filter(Boolean) as string[]
        const teamSet = new Set(teamIds)
        if (teamSet.size !== teamIds.length) {
          return NextResponse.json({ error: "A team cannot receive multiple ranks" }, { status: 400 })
        }

        // ensure selected teams belong to this project
        if (teamIds.length > 0) {
          const teams = await prisma.team.findMany({
            where: { id: { in: teamIds }, projectId },
            select: { id: true },
          })
          const ok = new Set(teams.map((t) => t.id))
          const invalid = teamIds.find((id) => !ok.has(id))
          if (invalid) {
            return NextResponse.json({ error: "Selected team does not belong to this project" }, { status: 400 })
          }
        }

        await prisma.$transaction(async (tx) => {
          await tx.projectAward.deleteMany({ where: { projectId } })

          for (const a of cleaned) {
            if (!a.teamId) continue
            await tx.projectAward.create({
              data: {
                projectId,
                teamId: a.teamId,
                rank: a.rank,
              },
            })
          }
        })

        const saved = await prisma.projectAward.findMany({
          where: { projectId },
          orderBy: { rank: "asc" },
          include: { team: { select: { id: true, name: true } } },
        })

        return NextResponse.json({ awards: saved })
      } catch (error: any) {
        console.error("/api/projects/[id]/awards PUT error", error)
        return NextResponse.json({ error: error?.message || "Failed to save awards" }, { status: 500 })
      }
    },
    { roles: ["SUPER_ADMIN", "PROJECT_MANAGER"] }
  )
}

