import { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import * as participantService from "@/services/participant.service"

type Props = {
  params: Promise<{ id: string }>
}

type Award = {
  rank: number
  project?: { id: string; name: string } | null
}

type TeamMembership = {
  id: string
  role: string
  team?: {
    id: string
    name: string
    project?: { id: string; name: string } | null
    awards?: Award[]
  } | null
}

type ParticipantDetail = {
  id: string
  type: string
  user?: { name?: string | null; email?: string; phone?: string | null } | null
  studentProfile?: { studentId?: string; faculty?: string; program?: string; year?: number } | null
  lecturerProfile?: { faculty?: string; position?: string } | null
  researcherProfile?: { organization?: string; researchField?: string } | null
  entrepreneurProfile?: { companyName?: string; businessType?: string } | null
  project?: { id: string; name: string } | null
  teamMemberships?: TeamMembership[]
}

const typeMap: Record<string, { label: string; color: string }> = {
  PROJECT_MANAGER: { label: "ผู้จัดการโครงการ", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  PROJECT_MANAGER: { label: "ผู้จัดการโครงการ", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  LECTURER: { label: "อาจารย์", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  RESEARCHER: { label: "นักวิจัย", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  ENTREPRENEUR: { label: "ผู้ประกอบการ", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
}

const rankLabel = (rank: number) =>
  rank === 1 ? "รางวัลที่ 1" : rank === 2 ? "รางวัลที่ 2" : rank === 3 ? "รางวัลที่ 3" : `รางวัลที่ ${rank}`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const p = await participantService.getParticipantDetailById(resolvedParams.id)
  return {
    title: `${p?.user?.name || "ผู้เข้าร่วม"} | Sci-Park`,
  }
}

export default async function ParticipantDetailPage({ params }: Props) {
  const resolvedParams = await params
  const participant = (await participantService.getParticipantDetailById(resolvedParams.id)) as unknown as ParticipantDetail | null

  if (!participant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="text-xl font-semibold opacity-50 italic">ไม่พบข้อมูลผู้เข้าร่วม</div>
        <Button variant="outline" nativeButton={false} render={<Link href="/participants">กลับไปหน้า Participants</Link>} />
      </div>
    )
  }

  const typeInfo = typeMap[participant.type] || { label: participant.type, color: "" }

  const memberships = participant.teamMemberships ?? []


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/participants" className="text-sm text-muted-foreground flex items-center hover:text-primary transition-colors">
            <ChevronLeft className="mr-1 h-3 w-3" />
            ผู้เข้าร่วมทั้งหมด
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{participant.user?.name || "-"}</h1>
            <Badge variant="outline" className={`${typeInfo.color} font-medium`}>
              {typeInfo.label}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground font-mono">{participant.user?.email}</div>
          <div className="text-xs text-muted-foreground">{participant.user?.phone || "-"}</div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5 flex flex-col gap-6">
          <Card className="border-none shadow-sm bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">ข้อมูลโปรไฟล์</CardTitle>
              <CardDescription>รายละเอียดตามประเภทของผู้เข้าร่วม</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">


              {participant.type === "LECTURER" && (
                <div className="grid gap-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">คณะ</span>
                    <span className="font-medium">{participant.lecturerProfile?.faculty || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">ตำแหน่ง</span>
                    <span className="font-medium">{participant.lecturerProfile?.position || "-"}</span>
                  </div>
                </div>
              )}

              {participant.type === "RESEARCHER" && (
                <div className="grid gap-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">องค์กร</span>
                    <span className="font-medium">{participant.researcherProfile?.organization || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">สาขาวิจัย</span>
                    <span className="font-medium">{participant.researcherProfile?.researchField || "-"}</span>
                  </div>
                </div>
              )}

              {participant.type === "ENTREPRENEUR" && (
                <div className="grid gap-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">บริษัท</span>
                    <span className="font-medium">{participant.entrepreneurProfile?.companyName || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">ประเภทธุรกิจ</span>
                    <span className="font-medium">{participant.entrepreneurProfile?.businessType || "-"}</span>
                  </div>
                </div>
              )}

              {participant.type === "PROJECT_MANAGER" && (
                <div className="grid gap-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">ประเภท</span>
                    <span className="font-medium">ผู้จัดการโครงการ</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7 flex flex-col gap-6">
          <Card className="border-none shadow-sm bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">ประวัติโครงการที่เข้าร่วม</CardTitle>
              <CardDescription>
                โชว์ “เคยแข่งรายการไหน” และ “ได้รางวัลอะไร” (ถ้ามี)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {memberships.length === 0 ? (
                <div className="text-sm text-muted-foreground">ยังไม่พบประวัติการเข้าร่วมโครงการ</div>
              ) : (
                <div className="space-y-3">

                  {memberships.map((m) => {
                    const team = m.team
                    const project = team?.project
                    const awards = team?.awards ?? []
                    const awardsInThisProject = awards.filter((a) => a.project?.id === project?.id)

                    return (
                      <div
                        key={m.id}
                        className="rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="grid gap-1">
                            <div className="text-xs text-muted-foreground">
                              ทีม: <span className="font-semibold text-foreground">{team?.name || "-"}</span>{" "}
                              <span className="text-[10px] font-mono ml-2 opacity-70">({m.role})</span>
                            </div>
                            {project?.id ? (
                              <Link href={`/projects/${project.id}`} className="text-sm font-extrabold hover:underline w-fit">
                                {project.name}
                              </Link>
                            ) : (
                              <div className="text-sm font-extrabold">{project?.name || "-"}</div>
                            )}
                          </div>

                          {team?.id && (
                            <Button
                              variant="ghost"
                              size="xs"
                              nativeButton={false}
                              render={<Link href={`/teams/${team.id}`}>ดูทีม</Link>}
                            />
                          )}
                        </div>

                        {awardsInThisProject.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {awardsInThisProject.map((a) => (
                              <Badge key={`${a.project?.id}-${a.rank}`} variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                                🏆 {rankLabel(a.rank)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-3 text-xs text-muted-foreground">ยังไม่มีข้อมูลรางวัล</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

