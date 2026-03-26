import { Metadata } from "next"
import { Search, Filter, FileText, Clock, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as proposalService from "@/services/proposal.service"
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
  title: "รายการข้อเสนอโครงการ | Sci-Park Admin",
  description: "ติดตามและจัดการข้อเสนอโครงการนวัตกรรมในระบบนิเวศ",
}

const statusThai: Record<string, string> = {
  DRAFT: "ฉบับร่าง",
  SUBMITTED: "ส่งแล้ว",
  UNDER_REVIEW: "อยู่ระหว่างพิจารณา",
  APPROVED: "ผ่านการอนุมัติ",
  REJECTED: "ไม่ผ่านการอนุมัติ",
}

const statusBadgeStyles: any = {
  DRAFT: "bg-gray-500/10 text-gray-500 border-gray-500/20 shadow-sm ring-1 ring-gray-500/10",
  SUBMITTED: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-sm ring-1 ring-blue-500/10",
  UNDER_REVIEW: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm ring-1 ring-amber-500/10",
  APPROVED: "bg-green-500/10 text-green-500 border-green-500/20 shadow-sm ring-1 ring-green-500/10",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20 shadow-sm ring-1 ring-red-500/10",
}

function getStatusIcon(status: string) {
  switch (status) {
    case "SUBMITTED": return <Clock className="h-3 w-3" />
    case "APPROVED": return <CheckCircle2 className="h-3 w-3" />
    case "REJECTED": return <XCircle className="h-3 w-3" />
    case "UNDER_REVIEW": return <Search className="h-3 w-3" />
    default: return <FileText className="h-3 w-3" />
  }
}

export default async function ProposalsPage() {
  const proposals = await proposalService.getAllProposals()

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold tracking-tight">ข้อเสนอโครงการ</h1>
          <p className="text-muted-foreground font-light text-lg">
             จัดการวงจรชีวิตของแนวคิดนวัตกรรมและการส่งผลงานของทีมผู้สมัคร
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="font-bold border-2">นำทะเบียนออก</Button>
            <Button disabled className="font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20">กระบวนการตรวจสอบ</Button>
        </div>
      </div>

      <Separator />

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/60 backdrop-blur-xl ring-1 ring-primary/5">
        <CardHeader className="pb-6 px-8 pt-8 border-b border-primary/5">
           <div className="flex items-center justify-between">
             <CardTitle className="text-xl font-bold tracking-tight">การติดตามผลงาน</CardTitle>
             <div className="flex items-center gap-4">
               <div className="relative group/search">
                 <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground/50 group-hover/search:text-primary transition-colors duration-500" />
                 <Input
                   type="search"
                   placeholder="ค้นหาข้อมูลโครงการ..."
                   className="w-[350px] pl-11 bg-background/50 h-10 border-none ring-1 ring-primary/5 focus-visible:ring-primary/20 focus-visible:ring-2 transition-all"
                 />
               </div>
               <Button variant="outline" size="icon" className="h-10 w-10 border-none ring-1 ring-primary/5 hover:bg-muted/40 hover:ring-primary/20 transition-all">
                 <Filter className="h-4 w-4" />
               </Button>
             </div>
           </div>
           <CardDescription>
             มุมมองรวมของ {proposals.length} ข้อเสนอโครงการในวงจรการแข่งขันนวัตกรรมปัจจุบัน
           </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <Table>
            <TableHeader className="bg-muted/20 border-b border-primary/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-8 w-[350px] text-[10px] font-black uppercase tracking-[0.2em]">ชื่อข้อเสนอและวันที่ส่ง</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">ทีมที่เสนอ</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">โครงการหลัก</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">สถานะ</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">เมตริกการประเมิน</TableHead>
                <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-[0.2em]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40 gap-2">
                       <FileText className="h-10 w-10" />
                       <span className="italic font-light">ไม่มีรายการที่ส่งเข้ามาในคิว</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-primary/5 transition-all duration-300 group">
                    <TableCell className="pl-8 font-medium">
                       <div className="grid gap-0.5">
                         <Link href={`/proposals/${p.id}`} className="text-sm font-bold truncate max-w-[300px] group-hover:text-primary transition-colors underline-offset-4 decoration-primary/10">{p.title}</Link>
                         <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest opacity-60">
                           {p.submittedAt ? `ตรวจสอบแล้วเมื่อ ${new Date(p.submittedAt).toLocaleDateString()}` : "ขั้นตอนเริ่มต้น (ร่าง)"}
                         </span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/teams/${p.team.id}`} className="text-xs font-black hover:text-primary transition-colors underline decoration-dotted decoration-primary/30 underline-offset-4">
                         {p.team.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-light truncate max-w-[150px]">
                       {p.team.project.name}
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className={`${statusBadgeStyles[p.status]} font-black h-5 px-3 text-[9px] tracking-widest uppercase flex items-center gap-1.5 w-fit`}>
                          {getStatusIcon(p.status)}
                          {p.status}
                       </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className="bg-primary/5 border border-primary/10 rounded-lg px-2 py-0.5 flex items-center gap-1.5 ring-1 ring-primary/5">
                             <span className="text-xs font-black text-primary">{p._count.evaluations}</span>
                             <span className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter opacity-50">ใบคะแนน</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        className="h-7 text-[10px] font-black uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500" 
                        nativeButton={false}
                        render={
                          <Link href={`/proposals/${p.id}`}>
                              Examine Concept
                          </Link>
                        }
                      />
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
