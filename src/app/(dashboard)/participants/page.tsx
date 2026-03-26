import { Metadata } from "next"
import { PlusCircle, Search, Filter, Mail, Globe, Briefcase, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as participantService from "@/services/participant.service"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const metadata: Metadata = {
  title: "ผู้เข้าร่วม | Sci-Park",
  description: "ระบบฐานข้อมูลผู้เข้าร่วมในระบบนิเวศนวัตกรรม",
}

function getParticipantIcon(type: string) {
  switch (type) {
    case "STUDENT": return <GraduationCap className="h-4 w-4" />
    case "LECTURER": return <Mail className="h-4 w-4" />
    case "RESEARCHER": return <Activity className="h-4 w-4" /> // Using Activity for now
    case "ENTREPRENEUR": return <Briefcase className="h-4 w-4" />
    default: return <PlusCircle className="h-4 w-4" />
  }
}

function getParticipantDetails(participant: any) {
  if (participant.type === "STUDENT") {
    return `${participant.studentProfile?.program} - ชั้นปีที่ ${participant.studentProfile?.year}`
  }
  if (participant.type === "LECTURER") {
     return `${participant.lecturerProfile?.position} ณ ${participant.lecturerProfile?.faculty}`
  }
  if (participant.type === "RESEARCHER") {
     return `${participant.researcherProfile?.organization} (${participant.researcherProfile?.researchField})`
  }
  if (participant.type === "ENTREPRENEUR") {
     return `${participant.entrepreneurProfile?.companyName} (${participant.entrepreneurProfile?.businessType})`
  }
  return ""
}

const typeMap: any = {
  STUDENT: { label: "นักศึกษา", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  LECTURER: { label: "อาจารย์", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  RESEARCHER: { label: "นักวิจัย", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  ENTREPRENEUR: { label: "ผู้ประกอบการ", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
}

// Importing icons again because I can't use Activity (replaced in function)
import { Activity } from "lucide-react"

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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          เพิ่มผู้เข้าร่วม
        </Button>
      </div>

      <Separator />

      <Card className="border-none shadow-sm bg-card/50">
        <CardHeader className="pb-3 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">ทะเบียนรายชื่อ</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="รหัส, ชื่อ หรือ องค์กร..."
                  className="w-[300px] pl-9 bg-background/50 h-9"
                />
              </div>
              <Button variant="outline" size="icon-sm" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            แสดงรายชื่อสมาชิก {participants.length} รายในระบบนิเวศนวัตกรรม
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6 w-[250px]">ชื่อและอีเมล</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ความเชี่ยวชาญ / รายละเอียด</TableHead>
                <TableHead>วันที่เข้ารวม</TableHead>
                <TableHead className="text-right pr-6">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    ไม่พบข้อมูลผู้เข้าร่วมในระบบ
                  </TableCell>
                </TableRow>
              ) : (
                participants.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback>{p.user.name?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                         </Avatar>
                         <div className="grid leading-tight">
                            <span className="font-semibold text-sm">{p.user.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{p.user.email}</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${typeMap[p.type]?.color} font-medium tracking-tight`}>
                         {typeMap[p.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                       {getParticipantDetails(p)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                       {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="xs">แก้ไข</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
