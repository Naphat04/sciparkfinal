import prisma from "../src/lib/prisma"

async function test() {
  try {
    console.log("Testing findMany with projectId...")
    const participants = await prisma.participant.findMany({
      where: { projectId: "some-id" } as any
    })
    console.log("Success! Found:", participants.length)
  } catch (err: any) {
    console.error("FAILED - Prisma error:", err.message)
    if (err.message.includes("projectId")) {
      console.log("CONFIRMED: projectId is UNKNOWN to Prisma Client at runtime.")
    }
  } finally {
    await prisma.$disconnect()
  }
}

test()
