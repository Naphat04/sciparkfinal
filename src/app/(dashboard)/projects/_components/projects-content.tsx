"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { ProjectFilter } from "@/components/features/project-filter"
import { ConfirmDelete } from "@/components/features/confirm-delete"

type Project = {
  id: string
  name: string
  description?: string | null
  status: string
  startDate: string | Date
  endDate: string | Date
  budget?: number | null
  manager?: { name?: string | null; email?: string }
  _count?: { teams?: number }
}

const statusThai: Record<string, string> = {
  ACTIVE: "กำลังดำเนินการ",
  DRAFT: "ฉบับร่าง",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิกแล้ว",
}

function formatDateYMD(d: string | Date) {
  const dt = new Date(d)
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
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

type Props = {
  projects: Project[]
}

export function ProjectsContent({ projects }: Props) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete project")
      }

      toast.success("ลบโครงการเรียบร้อยแล้ว")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการลบโครงการ")
      throw error
    }
  }

  return (
    <ProjectFilter
      projects={projects}
      renderTable={(filteredProjects) => (
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              โครงการที่เปิดรับสมัคร
            </CardTitle>
            <CardDescription>
              พบโครงการทั้งหมด {filteredProjects.length} รายการจากทั้งหมด {projects.length} โครงการ
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
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        ไม่พบโครงการที่ตรงกับเงื่อนไขการกรอง
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project: any) => (
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
                          <span className="font-semibold text-primary">{project._count?.teams || 0}</span>
                          <span className="text-muted-foreground ml-1">ทีม</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateYMD(project.startDate)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateYMD(project.endDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/projects/${project.id}`}>
                              <Button variant="ghost" size="xs">
                                รายละเอียด
                              </Button>
                            </Link>
                            <ConfirmDelete
                              title="ลบโครงการ"
                              description={`คุณต้องการลบโครงการ "${project.name}" ใช่หรือไม่? การลบจะทำให้ทีมและข้อมูลที่เกี่ยวข้องทั้งหมดถูกลบไปด้วย`}
                              onConfirm={() => handleDelete(project.id)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    />
  )
}
