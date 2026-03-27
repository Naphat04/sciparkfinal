import { Metadata } from "next"
import * as projectService from "@/services/project.service"
import * as participantService from "@/services/participant.service"
import { TeamRegistrationForm } from "@/components/features/team-registration-form"

export const metadata: Metadata = {
  title: "ลงทะเบียนทีม | Sci-Park",
  description: "สร้างทีมใหม่และเชื่อมโยงกับโครงการ",
}

export default async function CreateTeamPage() {
  const projects = await projectService.getAllProjects()
  const participants = await participantService.getAllParticipants()

  return (
    <div className="mx-auto w-full max-w-5xl py-10">
      <TeamRegistrationForm projects={projects} participants={participants} />
    </div>
  )
}
