import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db"
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting seed...")

  // 1. Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@scipark.university" },
    update: {},
    create: {
      email: "admin@scipark.university",
      name: "Sci-Park Master Admin",
      passwordHash: "hashed_password_placeholder", // In prod, use bcrypt
      role: "SUPER_ADMIN"
    }
  })

  // 2. Create Sample Projects
  const project1 = await prisma.project.create({
    data: {
      name: "Digital Nomad Incubator 2026",
      description: "A specialized track for remote-first startups and digital collaboration tools.",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-09-01"),
      status: "ACTIVE",
      budget: 50000,
      managerId: admin.id
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: "Sustainability & Green Tech Track",
      description: "Focused on circular economy and renewable energy solutions for urban environments.",
      startDate: new Date("2026-04-15"),
      endDate: new Date("2026-11-15"),
      status: "DRAFT",
      budget: 120000,
      managerId: admin.id
    }
  })

  // 3. Create Sample Participants
  const user1 = await prisma.user.create({
    data: {
      email: "jane.researcher@university.edu",
      name: "Dr. Jane Smith",
      passwordHash: "hashed_placeholder",
      role: "PARTICIPANT"
    }
  })

  const participant1 = await prisma.participant.create({
    data: {
      userId: user1.id,
      type: "RESEARCHER",
      researcherProfile: {
        create: {
          organization: "BioTech Institute",
          researchField: "Molecular Biology"
        }
      }
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: "alex.student@university.edu",
      name: "Alex Doe",
      passwordHash: "hashed_placeholder",
      role: "PARTICIPANT"
    }
  })

  const participant2 = await prisma.participant.create({
    data: {
      userId: user2.id,
      type: "STUDENT",
      studentProfile: {
        create: {
          studentId: "STD-998811",
          faculty: "Computer Science",
          program: "BS Software Engineering",
          year: 3
        }
      }
    }
  })

  // 4. Create a Sample Team
  const team1 = await prisma.team.create({
    data: {
      name: "The Green Warriors",
      projectId: project1.id,
      leaderId: participant1.id,
      status: "APPROVED"
    }
  })

  // Add members manually due to Prisma team-member relation
  await prisma.teamMember.create({
    data: { teamId: team1.id, participantId: participant1.id, role: "LEADER" }
  })
  await prisma.teamMember.create({
    data: { teamId: team1.id, participantId: participant2.id, role: "MEMBER" }
  })

  // 5. Create a Sample Proposal
  const proposal1 = await prisma.proposal.create({
    data: {
      title: "Blockchain for Sustainability",
      description: "A decentralized platform to track carbon footprint in the supply chain.",
      teamId: team1.id,
      status: "UNDER_REVIEW",
      fileUrl: "https://example.com/proposal.pdf"
    }
  })

  // 6. Create Sample Evaluation
  await prisma.evaluation.create({
    data: {
      proposalId: proposal1.id,
      judgeId: admin.id,
      score: 85,
      comment: "Solid technical approach. Team shows great potential."
    }
  })

  console.log("Seed finished!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
