import { Metadata } from "next"
import { PlusCircle, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as projectService from "@/services/project.service"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export const metadata: Metadata = {
  title: "โครงการทั้งหมด | Sci-Park",
  description: "จัดการและติดตามโครงการนวัตกรรมและแหล่งบ่มเพาะธุรกิจ",
}

const statusThai: Record<string, string> = {
  ACTIVE: "กำลังดำเนินการ",
  DRAFT: "ฉบับร่าง",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิกแล้ว",
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE": return "bg-green-500/10 text-green-500 border-green-500/20"
    case "DRAFT": return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    case "COMPLETED": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20"
    default: return ""
  }
}

export default async function ProjectsPage() {
  const projects = await projectService.getAllProjects()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">โครงการทั้งหมด</h1>
          <p className="text-muted-foreground">
            จัดการและติดตามโครงการนวัตกรรมและแผนการบ่มเพาะวิสาหกิจ
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          สร้างโครงการ
        </Button>
      </div>

      <Separator />

      <Card className="border-none shadow-sm bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">โครงการที่เปิดรับสมัคร</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="ค้นหาโครงการ..."
                  className="w-[250px] pl-9 bg-background/50 h-9"
                />
              </div>
              <Button variant="outline" size="icon-sm" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            มีโครงการทั้งหมด {projects.length} รายการในระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-background/50">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">ชื่อโครงการ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จำนวนทีม</TableHead>
                  <TableHead>วันที่เริ่ม</TableHead>
                  <TableHead>วันที่สิ้นสุด</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      ไม่พบข้อมูลโครงการ เริ่มต้นสร้างโครงการแรกของคุณได้เลย
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project: any) => (
                    <TableRow key={project.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium">
                        <Link href={`/projects/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(project.status)} font-medium transition-all`}>
                          {statusThai[project.status] || project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">{project._count.teams}</span>
                        <span className="text-muted-foreground ml-1">ทีม</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(project.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(project.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="xs" 
                          nativeButton={false}
                          render={
                            <Link href={`/projects/${project.id}`}>
                              ดูรายละเอียด
                            </Link>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
