import { Metadata } from "next"
import { Users, PlusCircle, Search, Filter, ChevronRight, Briefcase } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import * as teamService from "@/services/team.service"
import * as projectService from "@/services/project.service"
import { TeamFilters } from "@/components/features/team-filters"

export const metadata: Metadata = {
  title: "ทีมทั้งหมด | Sci-Park",
  description: "รายชื่อทีมผู้ประกอบการนวัตกรรมที่ลงทะเบียนในระบบ",
}

const statusThai: Record<string, string> = {
  PENDING:  "รอดำเนินการ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ปฏิเสธ",
}

const statusBadgeStyles: Record<string, string> = {
  PENDING:  "bg-amber-500/10 text-amber-500 border-amber-500/20",
  APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    projectId?: string
    status?: string
    fiscalYear?: string
  }>
}

export default async function TeamsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const [teams, projects] = await Promise.all([
    teamService.getAllTeams({
      search: sp.search,
      projectId: sp.projectId === "all" ? undefined : sp.projectId,
      status: sp.status === "all" ? undefined : sp.status,
      fiscalYear: sp.fiscalYear === "all" ? undefined : sp.fiscalYear,
    }),
    projectService.getAllProjects()
  ])

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold tracking-tight">ทีมทั้งหมด</h1>
          <p className="text-muted-foreground font-light text-lg">
            รายชื่อทีมผู้เข้าร่วมโครงการนวัตกรรมภายใต้ Sci-Park
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold border-2">นำข้อมูลออก</Button>
          <Link href="/teams/create">
            <Button className="font-bold gap-2">
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียนทีม
            </Button>
          </Link>
        </div>
      </div>

      <Separator />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card/60 ring-1 ring-primary/5">
          <CardContent className="pt-6 pb-5 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-black">{teams.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">ทีมทั้งหมด</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/60 ring-1 ring-primary/5">
          <CardContent className="pt-6 pb-5 flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-xl">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-black">{teams.filter((t: any) => t.status === "APPROVED").length}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">อนุมัติแล้ว</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/60 ring-1 ring-primary/5">
          <CardContent className="pt-6 pb-5 flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-xl">
              <Users className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-black">{teams.filter((t: any) => t.status === "PENDING").length}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">รอการรตรวจสอบ</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Listing Grid */}
      <div>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold tracking-tight whitespace-nowrap">รายชื่อทีมที่ลงทะเบียน</h2>
          <TeamFilters projects={projects.map(p => ({ id: p.id, name: p.name, fiscalYear: (p as any).fiscalYear || null }))} />
        </div>

        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-muted-foreground/10 rounded-3xl opacity-60">
            <Users className="h-12 w-12 mb-4 text-muted-foreground/30" />
            <div className="text-lg font-bold text-muted-foreground">ยังไม่มีทีมลงทะเบียน</div>
            <p className="text-sm text-muted-foreground italic mt-1">ทีมจะปรากฏขึ้นเมื่อมีการสร้างทีมภายในโครงการ</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team: any) => (
              <Link key={team.id} href={`/teams/${team.id}`} className="group">
                <Card className="border-none shadow-sm bg-card/60 hover:bg-card hover:shadow-xl transition-all duration-300 group-hover:ring-1 group-hover:ring-primary/10 overflow-hidden h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                          {team.name}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Briefcase className="h-3 w-3 text-primary/50" />
                          <span className="font-medium">{team.project.name}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${statusBadgeStyles[team.status] || ""} text-[9px] h-5 font-black tracking-widest uppercase px-2`}
                      >
                        {statusThai[team.status] || team.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <Separator className="opacity-30" />
                  <CardContent className="pt-4 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-muted/30 rounded-lg px-2.5 py-1.5">
                          <Users className="h-3 w-3 text-primary/60" />
                          <span className="text-xs font-black">{team._count.members}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase">สมาชิก</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/30 rounded-lg px-2.5 py-1.5">
                          <span className="text-xs font-black">{team._count.proposals}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase">ข้อเสนอ</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
