import prisma from "@/lib/prisma"
import { ParticipantType } from "@prisma/client"

export async function getAllParticipants() {
  return await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      studentProfile: true,
      lecturerProfile: true,
      researcherProfile: true,
      entrepreneurProfile: true
    }
  })
}

export async function createParticipantWithProfile(data: {
  userId: string
  type: ParticipantType
  profileData: any
}) {
  return await prisma.participant.create({
    data: {
      userId: data.userId,
      type: data.type,
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
