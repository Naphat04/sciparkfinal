import { Metadata } from "next"
import { Activity, ArrowRight, Briefcase, GraduationCap, PlusCircle, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import * as dashboardService from "@/services/dashboard.service"

export const metadata: Metadata = {
  title: "แผงควบคุมหลัก | Sci-Park",
  description: "ระบบบริหารจัดการนวัตกรรมองค์กร",
}

function formatDateYMD(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function statusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-500/10 text-green-600 border border-green-500/20">ACTIVE</Badge>
    case "DRAFT":
      return <Badge variant="secondary">DRAFT</Badge>
    case "COMPLETED":
      return <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20">COMPLETED</Badge>
    case "CANCELLED":
      return <Badge variant="destructive">CANCELLED</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function StatCard({
  title,
  icon: Icon,
  value,
  description,
  color,
}: {
  title: string
  icon: any
  value: number
  description: string
  color: string
}) {
  return (
    <Card className="border-none shadow-sm bg-card/50 overflow-hidden relative">
      <div className={`absolute top-0 right-0 p-8 opacity-10 ${color}`}>
         <Icon className="h-16 w-16" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-background shadow-xs border ${color}`}>
            <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const [stats, recentProjects, upcoming, recentTeams, recentParticipants] = await Promise.all([
    dashboardService.getDashboardStats(),
    dashboardService.getRecentProjects(5),
    dashboardService.getUpcomingDeadlines(5),
    dashboardService.getRecentTeams(5),
    dashboardService.getRecentParticipants(5),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ภาพรวมระบบ</h1>
          <p className="text-muted-foreground">
            ยินดีต้อนรับเข้าใช้งานระบบบริหารจัดการ Sci-Park
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">ดาวน์โหลดรายงาน</Button>
            <Button
              nativeButton={false}
              render={
                <Link href="/projects/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  สร้างโครงการใหม่
                </Link>
              }
            />
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="โครงการทั้งหมด" 
          icon={Briefcase} 
          value={stats.totalProjects} 
          description="+12% จากเดือนที่แล้ว"
          color="text-primary border-primary/20"
        />
        <StatCard 
          title="โครงการที่ดำเนินการอยู่" 
          icon={Activity} 
          value={stats.activeProjects} 
          description="โครงการที่อยู่ระหว่างการดำเนินงาน"
          color="text-green-500 border-green-500/20"
        />
        <StatCard 
          title="ทีมทั้งหมด" 
          icon={Users} 
          value={stats.totalTeams} 
          description="+5 ทีมที่ลงทะเบียนใหม่"
          color="text-blue-500 border-blue-500/20"
        />
        <StatCard 
          title="ผู้เข้าร่วมทั้งหมด" 
          icon={GraduationCap} 
          value={stats.totalParticipants} 
          description="นักวิจัยและนักศึกษาในระบบ"
          color="text-orange-500 border-orange-500/20"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 mt-4">
        <Card className="lg:col-span-7 border-none shadow-sm bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">โครงการล่าสุด</CardTitle>
                <CardDescription>
                  โครงการที่ถูกสร้าง/อัปเดตล่าสุดในระบบ
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link href="/projects">
                    ดูทั้งหมด <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                }
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border/60 rounded-xl border bg-background/40">
              {recentProjects.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground italic">
                  ยังไม่มีโครงการในระบบ
                </div>
              ) : (
                recentProjects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="truncate font-semibold">{p.name}</div>
                        <div className="shrink-0">{statusBadge(p.status)}</div>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-mono">
                          {formatDateYMD(new Date(p.startDate))} → {formatDateYMD(new Date(p.endDate))}
                        </span>
                        <span>ทีม {p._count.teams}</span>
                        <span>ผู้เข้าร่วม {p._count.participants}</span>
                        <span className="hidden sm:inline">
                          ผู้จัดการ: {p.manager?.name || "—"} ({p.manager?.email || "—"})
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      nativeButton={false}
                      render={<Link href={`/projects/${p.id}`}>เปิด</Link>}
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-5 border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">กำหนดส่งใกล้ถึง</CardTitle>
            <CardDescription>
              โครงการที่กำลังจะสิ้นสุดตามกำหนดเวลา
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border/60 rounded-xl border bg-background/40">
              {upcoming.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground italic">
                  ไม่มีโครงการที่อยู่ในช่วงกำหนดส่ง
                </div>
              ) : (
                upcoming.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">สิ้นสุด {formatDateYMD(new Date(p.endDate))}</span>
                        <span>ทีม {p._count.teams}</span>
                        <span>{statusBadge(p.status)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      nativeButton={false}
                      render={<Link href={`/projects/${p.id}`}>เปิด</Link>}
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        <Card className="lg:col-span-6 border-none shadow-sm bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">ทีมล่าสุด</CardTitle>
                <CardDescription>ทีมที่ลงทะเบียนเข้าร่วมโครงการล่าสุด</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link href="/teams">
                    ดูทั้งหมด <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                }
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border/60 rounded-xl border bg-background/40">
              {recentTeams.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground italic">ยังไม่มีทีมในระบบ</div>
              ) : (
                recentTeams.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="truncate font-semibold">{t.name}</div>
                        <div className="shrink-0">{statusBadge(t.status)}</div>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="truncate">
                          โครงการ: <span className="font-medium text-foreground/80">{t.project?.name}</span>
                        </span>
                        <span>สมาชิก {t._count.members}</span>
                        <span className="font-mono">สร้าง {formatDateYMD(new Date(t.createdAt))}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      nativeButton={false}
                      render={<Link href={`/teams/${t.id}`}>เปิด</Link>}
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 border-none shadow-sm bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">ผู้เข้าร่วมล่าสุด</CardTitle>
                <CardDescription>รายชื่อผู้เข้าร่วมที่ถูกเพิ่มเข้าระบบล่าสุด</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link href="/participants">
                    ดูทั้งหมด <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                }
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border/60 rounded-xl border bg-background/40">
              {recentParticipants.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground italic">ยังไม่มีผู้เข้าร่วมในระบบ</div>
              ) : (
                recentParticipants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="truncate font-semibold">{p.user?.name || "—"}</div>
                        <Badge variant="outline" className="text-[10px]">{p.type}</Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="truncate">{p.user?.email}</span>
                        <span className="truncate">
                          โครงการ: <span className="font-medium text-foreground/80">{p.project?.name || "—"}</span>
                        </span>
                        <span className="font-mono">เพิ่ม {formatDateYMD(new Date(p.createdAt))}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      nativeButton={false}
                      render={<Link href="/participants">เปิด</Link>}
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
