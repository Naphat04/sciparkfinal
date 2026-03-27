import { Metadata } from "next"

import * as participantService from "@/services/participant.service"
import { Separator } from "@/components/ui/separator"
import { AddParticipantModal } from "@/components/features/add-participant-modal"
import { ParticipantsContent } from "@/app/(dashboard)/participants/_components/participants-content"

type ParticipantRow = {
  id: string
  type: string
  createdAt: string | Date
  user: { name?: string | null; email?: string }
  studentProfile?: { studentId?: string; faculty?: string; program?: string; year?: number }
  lecturerProfile?: { faculty?: string; position?: string }
  researcherProfile?: { organization?: string; researchField?: string }
  entrepreneurProfile?: { companyName?: string; businessType?: string }
}

export const metadata: Metadata = {
  title: "ผู้เข้าร่วม | Sci-Park",
  description: "ระบบฐานข้อมูลผู้เข้าร่วมในระบบนิเวศนวัตกรรม",
}

export default async function ParticipantsPage() {
  const participants = await participantService.getAllParticipants()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">ผู้เข้าร่วม</h1>
          <p className="text-muted-foreground">
            ดูและจัดการรายชื่อนักวิจัย นักศึกษา และผู้ประกอบการในโครงการ
          </p>
        </div>
        <AddParticipantModal />
      </div>

      <Separator />

      <ParticipantsContent participants={participants as unknown as ParticipantRow[]} />
    </div>
  )
}
