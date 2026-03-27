import { Metadata } from "next"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import * as projectService from "@/services/project.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProjectsContent } from "./_components/projects-content"

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
        <Link href="/projects/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            สร้างโครงการ
          </Button>
        </Link>
      </div>

      <Separator />

      <ProjectsContent projects={projects} />
    </div>
  )
}
