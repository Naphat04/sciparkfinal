import prisma from "@/lib/prisma"

type ParticipantType = "STUDENT" | "ENTREPRENEUR" | "RESEARCHER" | "LECTURER" | "PROJECT_MANAGER"

export async function getAllParticipants() {
  return await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      studentProfile: true,
      lecturerProfile: true,
      researcherProfile: true,
      entrepreneurProfile: true
    }
  })
}

export async function getParticipantsByProject(projectId: string) {
  // Get participants directly associated with the project
  const directParticipants = await prisma.participant.findMany({
    where: { project: { id: projectId } },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      studentProfile: true,
      lecturerProfile: true,
      researcherProfile: true,
      entrepreneurProfile: true
    }
  })

  // Get participants from teams in this project
  const teams = await prisma.team.findMany({
    where: { projectId },
    include: {
      members: {
        include: {
          participant: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
              studentProfile: true,
              lecturerProfile: true,
              researcherProfile: true,
              entrepreneurProfile: true
            }
          }
        }
      }
    }
  })

  const participantMap = new Map<string, any>()
  
  // Add direct participants first
  directParticipants.forEach((p: any) => {
    participantMap.set(p.id, {
      id: p.id,
      userId: p.userId,
      user: p.user,
      type: p.type,
      studentProfile: p.studentProfile,
      lecturerProfile: p.lecturerProfile,
      researcherProfile: p.researcherProfile,
      entrepreneurProfile: p.entrepreneurProfile,
      createdAt: p.createdAt,
      projectId: p.projectId
    })
  })

  // Add team members (may override or add more info like teamId)
  teams.forEach((team: any) => {
    team.members.forEach((member: any) => {
      const existing = participantMap.get(member.participant.id)
      participantMap.set(member.participant.id, {
        ...(existing || {}),
        id: member.participant.id,
        userId: member.participant.userId,
        user: member.participant.user,
        type: member.participant.type,
        studentProfile: member.participant.studentProfile,
        lecturerProfile: member.participant.lecturerProfile,
        researcherProfile: member.participant.researcherProfile,
        entrepreneurProfile: member.participant.entrepreneurProfile,
        createdAt: member.participant.createdAt,
        teamId: team.id
      })
    })
  })

  return Array.from(participantMap.values())
}

export async function createParticipantWithProfile(data: {
  userId: string
  type: ParticipantType
  profileData: any
  projectId?: string
}) {
  return await prisma.participant.create({
    data: {
      userId: data.userId,
      type: data.type,
      projectId: data.projectId,
      ...(data.type === "STUDENT" && { studentProfile: { create: data.profileData } }),
      ...(data.type === "LECTURER" && { lecturerProfile: { create: data.profileData } }),
      ...(data.type === "RESEARCHER" && { researcherProfile: { create: data.profileData } }),
      ...(data.type === "ENTREPRENEUR" && { entrepreneurProfile: { create: data.profileData } }),
    }
  })
}

export async function getParticipantById(id: string) {
  return await prisma.participant.findUnique({
    where: { id },
    include: {
      user: true,
      studentProfile: true,
      lecturerProfile: true,
      researcherProfile: true,
      entrepreneurProfile: true
    }
  })
}

export async function getParticipantDetailById(id: string) {
  return await prisma.participant.findUnique({
    where: { id },
    include: {
      user: true,
      studentProfile: true,
      lecturerProfile: true,
      researcherProfile: true,
      entrepreneurProfile: true,
      project: true,
      teamMemberships: {
        include: {
          team: {
            include: {
              project: true,
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
}

export async function updateParticipant(
  id: string,
  data: {
    profileData?: Record<string, any>
  }
) {
  const participant = await prisma.participant.findUnique({ where: { id } })
  if (!participant) throw new Error("Participant not found")

  if (data.profileData) {
    if (participant.type === "STUDENT") {
      await prisma.studentProfile.update({
        where: { participantId: id },
        data: data.profileData
      })
    } else if (participant.type === "LECTURER") {
      await prisma.lecturerProfile.update({
        where: { participantId: id },
        data: data.profileData
      })
    } else if (participant.type === "RESEARCHER") {
      await prisma.researcherProfile.update({
        where: { participantId: id },
        data: data.profileData
      })
    } else if (participant.type === "ENTREPRENEUR") {
      await prisma.entrepreneurProfile.update({
        where: { participantId: id },
        data: data.profileData
      })
    }
  }

  return await getParticipantById(id)
}

