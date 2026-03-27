import { Metadata } from "next"
import { 
  Calendar, 
  ChevronLeft, 
  Users, 
  DollarSign, 
  Search,
  MoreVertical
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMockSession } from "@/lib/auth-utils"
import * as projectService from "@/services/project.service"
import * as participantService from "@/services/participant.service"
import * as teamService from "@/services/team.service"
import { AddTeamModal } from "@/components/features/add-team-modal"
import { LinkExistingTeamModal } from "@/components/features/link-existing-team-modal"
import { ParticipantTable } from "@/components/features/participant-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProjectEditModal } from "@/components/features/project-edit-modal"
import { ProjectStatusActions } from "@/components/features/project-status-actions"
import { ProjectAwardsModal } from "@/components/features/project-awards-modal"
import { ProjectTimelineBuilder } from "@/components/features/project-timeline-builder"

type Props = {
  params: Promise<{ id: string }>
}

type AwardView = {
  rank: number
  teamId: string
  team: { id: string; name: string } | null
}

type MilestoneView = {
  id: string
  title: string
  description?: string | null
  dueDate: string | Date
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | "DELAYED"
}

const statusThai: Record<string, string> = {
  ACTIVE: "กำลังดำเนินการ",
  DRAFT: "ฉบับร่าง",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิกแล้ว",
}

function toDateInputValue(d: string | Date) {
  const dt = new Date(d)
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const project = await projectService.getProjectById(resolvedParams.id)
  return {
    title: `${project?.name || "โครงการ"} | Sci-Park`,
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  console.log("ProjectDetailPage rendering")
  const resolvedParams = await params
  const project = await projectService.getProjectById(resolvedParams.id)
  const teams = await teamService.getTeamsByProject(resolvedParams.id)
  const allTeams = await teamService.getAllTeams()
  const projectParticipants = await participantService.getParticipantsByProject(resolvedParams.id)
  const allParticipants = await participantService.getAllParticipants()
  const allProjects = await projectService.getAllProjects()
  
  const session = await getMockSession()
  const isParticipant = session?.user?.role === "PARTICIPANT"
  
  const projectView = project as (typeof project & { awards?: AwardView[]; milestones?: MilestoneView[] }) | null
  const awards = projectView?.awards ?? []
  const milestones = projectView?.milestones ?? []
  const awardByRank = new Map<number, AwardView>(awards.map((a) => [a.rank, a]))

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="text-xl font-semibold opacity-50 italic">ไม่พบข้อมูลโครงการ</div>
        <Button 
          variant="outline" 
          nativeButton={false}
          render={
            <Link href="/projects">
              <ChevronLeft className="mr-2 h-4 w-4" />
              กลับไปยังหน้าโครงการ
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header & Navigation */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/projects" className="text-sm text-muted-foreground flex items-center hover:text-primary transition-colors">
            <ChevronLeft className="mr-1 h-3 w-3" />
            โครงการทั้งหมด
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-extrabold tracking-tight">{project.name}</h1>
             <Badge variant="outline" className="h-6 px-3 bg-primary/5 text-primary border-primary/20">
               {statusThai[project.status] || project.status}
             </Badge>
             {(project as any).fiscalYear && (
               <Badge variant="secondary" className="h-6 px-3">
                 ปีงบประมาณ {(project as any).fiscalYear}
               </Badge>
             )}
          </div>
          <p className="text-muted-foreground mt-1 max-w-2xl text-lg opacity-80 leading-relaxed font-light">
             {project.description || "อนาคตของนวัตกรรมเริ่มต้นที่นี่ ไม่มีการระบุรายละเอียดเพิ่มเติม"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {!isParticipant && (
            <>
              <ProjectStatusActions projectId={resolvedParams.id} currentStatus={project.status} />
              <ProjectEditModal
                projectId={resolvedParams.id}
                initialValues={{
                  name: project.name,
                  description: project.description ?? null,
                  startDate: toDateInputValue(project.startDate),
                  endDate: toDateInputValue(project.endDate),
                  fiscalYear: (project as any).fiscalYear ?? null,
                  budget: project.budget ?? null,
                  maxTeams: project.maxTeams ?? null,
                }}
              />
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Awards / Winners Summary (manual) */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-amber-50/80 via-card/80 to-primary/5 dark:from-amber-500/10 dark:via-card/60 dark:to-primary/10">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <span className="text-sm font-black">🏆</span>
              </span>
              ทีมที่ได้รับรางวัลในโครงการนี้
            </CardTitle>
            <CardDescription className="mt-1">
              แอดมินสามารถเลือกทีมที่ได้รางวัลที่ 1–3 ได้เอง
            </CardDescription>
          </div>
          {!isParticipant && (
            <ProjectAwardsModal
              projectId={resolvedParams.id}
              teams={teams.map((t) => ({ id: t.id, name: t.name }))}
              initialAwards={awards
                .filter((a) => a.team)
                .map((a) => ({ rank: a.rank, teamId: a.teamId, teamName: a.team!.name }))}
            />
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((place) => {
              const placeLabel = place === 1 ? "รางวัลที่ 1" : place === 2 ? "รางวัลที่ 2" : "รางวัลที่ 3"
              const badgeColor =
                place === 1
                  ? "bg-amber-500 text-amber-950"
                  : place === 2
                  ? "bg-slate-700 text-slate-50 dark:bg-slate-200 dark:text-slate-900"
                  : "bg-orange-500 text-orange-950"

              const aw = awardByRank.get(place)
              const teamName = aw?.team?.name as string | undefined
              const teamId = aw?.team?.id as string | undefined

              const content = (
                <div className="group rounded-xl border border-border/60 bg-background/60 px-4 py-3 flex flex-col gap-1 hover:border-primary/50 hover:bg-background transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] ${badgeColor}`}
                    >
                      {placeLabel}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {teamName ? "กำหนดแล้ว" : "ยังไม่เลือก"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-sm font-bold group-hover:text-primary truncate">
                      {teamName || "—"}
                    </span>
                  </div>
                </div>
              )

              return teamId ? (
                <Link key={place} href={`/teams/${teamId}`}>
                  {content}
                </Link>
              ) : (
                <div key={place}>{content}</div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Quick Grid */}
      <div className="grid gap-4 md:grid-cols-3">
         <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xs">
           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-60">งบประมาณที่ได้รับ</CardTitle>
             <DollarSign className="h-4 w-4 text-green-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">${project.budget?.toLocaleString()}</div>
             <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Fixed Innovation Grant</p>
           </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xs">
           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-60">กรอบระยะเวลา</CardTitle>
             <Calendar className="h-4 w-4 text-primary" />
           </CardHeader>
           <CardContent>
             <div className="text-base font-semibold">{new Date(project.startDate).toLocaleDateString()} — {new Date(project.endDate).toLocaleDateString()}</div>
             <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Program duration window</p>
           </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xs">
           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-60">จำนวนทีมที่เข้าร่วม</CardTitle>
             <Users className="h-4 w-4 text-blue-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{teams.length} Teams Registered</div>
             <div className="w-full bg-muted h-1 mt-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[45%]" />
             </div>
           </CardContent>
         </Card>
      </div>

      {/* Detailed Tabs Section */}
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit mb-4 bg-muted/20">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="teams" className="relative">
             ทีม
             {teams.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground font-bold">{teams.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="participants">ผู้เข้าร่วม</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
           <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm bg-card/40">
                 <CardHeader>
                    <CardTitle className="text-lg">Project Manager & Staff</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="flex items-center gap-4 border p-4 rounded-xl bg-background/50">
                       <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{project.manager?.name?.substring(0,2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div className="grid leading-tight">
                          <span className="font-bold text-base">{project.manager?.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{project.manager?.email}</span>
                          <span className="text-[10px] text-primary font-medium uppercase mt-1 tracking-widest bg-primary/10 w-fit px-1.5 rounded">Primary Lead</span>
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <ProjectTimelineBuilder
                projectId={resolvedParams.id}
                initialMilestones={milestones}
                isParticipant={isParticipant}
              />
           </div>
        </TabsContent>

        <TabsContent value="teams">
           <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold tracking-tight">Ecosystem Teams</h2>
                   <p className="text-sm text-muted-foreground italic font-light">List of active innovation teams competing in this project.</p>
                </div>
                <div className="flex gap-2">
                   <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search teams..." className="pl-9 w-[280px] bg-background/50 h-9" />
                   </div>
                   {!isParticipant && (
                     <>
                       <LinkExistingTeamModal
                          projectId={resolvedParams.id}
                          currentTeamIds={teams.map((t) => t.id)}
                          availableTeams={allTeams.map((t) => ({ id: t.id, name: t.name, status: t.status, _count: t._count, project: t.project }))}
                       />
                       <AddTeamModal
                          projectId={resolvedParams.id}
                          projects={allProjects.map((p) => ({ id: p.id, name: p.name }))}
                          participants={allParticipants.map((p) => ({ id: p.id, user: { name: p.user?.name || null, email: p.user.email } }))}
                        />
                     </>
                   )}
                </div>
              </div>

              {teams.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl opacity-60">
                    <Users className="h-10 w-10 mb-4" />
                    <div className="text-lg font-semibold">No Teams Joined Yet</div>
                    <p className="text-sm text-muted-foreground">Start the program by adding or inviting the first team.</p>
                 </div>
              ) : (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                   {teams.map((team) => (
                       <Card key={team.id} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/50 hover:bg-card hover:shadow-lg transition-all group overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon-sm" className="h-8 w-8 hover:bg-muted"><MoreVertical className="h-4 w-4" /></Button>
                          </div>
                          <CardHeader className="pb-3 px-6">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">{team.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                               <Badge variant={team.status === "APPROVED" ? "default" : "secondary"} className="h-5 text-[10px] font-bold">
                                  {team.status}
                               </Badge>
                               <span className="text-[10px] uppercase font-mono tracking-tighter">{team._count.members} สมาชิกที่ลงทะเบียน</span>
                            </CardDescription>
                          </CardHeader>
                          <Separator className="opacity-50" />
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                               <div className="flex -space-x-2">
                                  {team.members.slice(0, 4).map((m) => (
                                     <Avatar key={m.id} className="h-8 w-8 border-2 border-card ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
                                        <AvatarFallback className="text-[10px] font-bold bg-muted/40">{m.participant.user.name?.substring(0, 1)}</AvatarFallback>
                                     </Avatar>
                                  ))}
                                  {team._count.members > 4 && (
                                     <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-bold">
                                        +{team._count.members - 4}
                                     </div>
                                  )}
                               </div>
                               <Button 
                                  size="xs" 
                                  variant="ghost" 
                                  nativeButton={false}
                                  render={
                                    <Link href={`/teams/${team.id}`}>
                                      รายละเอียดทีม
                                    </Link>
                                  }
                               />
                            </div>
                          </CardContent>
                       </Card>
                    ))}
                 </div>
              )}
           </div>
        </TabsContent>

        <TabsContent value="participants">
          <div className="mt-4">
            <ParticipantTable 
              participants={projectParticipants.map((p) => ({
                id: p.id,
                name: p.user?.name || "",
                email: p.user?.email || "",
                type: p.type,
                createdAt: p.createdAt
              }))}
              projectId={resolvedParams.id}
              isParticipant={isParticipant}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
