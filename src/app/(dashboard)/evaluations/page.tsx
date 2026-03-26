import { Metadata } from "next"
import { BarChart, Trophy, FileText, Star, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import * as evaluationService from "@/services/evaluation.service"

export const metadata: Metadata = {
  title: "การประเมินผล | Sci-Park",
  description: "ดูรายการประเมินและผลคะแนนจากคณะกรรมการนวัตกรรม",
}

export default async function EvaluationsPage() {
  const evaluations = await evaluationService.getAllEvaluations()

  const avgScore = evaluations.length > 0
    ? evaluations.reduce((a: number, e: any) => a + e.score, 0) / evaluations.length
    : 0

  const topScore = evaluations.length > 0
    ? Math.max(...evaluations.map((e: any) => e.score))
    : 0

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold tracking-tight">การประเมินผล</h1>
          <p className="text-muted-foreground font-light text-lg">
            ทะเบียนใบคะแนนรวมจากคณะกรรมการพิจารณานวัตกรรม
          </p>
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card/60 ring-1 ring-primary/5">
          <CardContent className="pt-6 pb-5 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <BarChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-black">{evaluations.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">ใบคะแนนทั้งหมด</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/60 ring-1 ring-primary/5">
          <CardContent className="pt-6 pb-5 flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-xl">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-black">{avgScore.toFixed(1)}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">คะแนนเฉลี่ย</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary text-primary-foreground ring-4 ring-primary/20">
          <CardContent className="pt-6 pb-5 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black">{topScore}</div>
              <div className="text-[10px] uppercase tracking-widest opacity-80 font-bold">คะแนนสูงสุด</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluations Table */}
      <Card className="border-none shadow-sm bg-card/60 ring-1 ring-primary/5">
        <CardHeader className="pb-4 border-b border-primary/5 px-7 pt-7">
          <CardTitle className="text-xl font-bold tracking-tight">ทะเบียนใบคะแนน</CardTitle>
          <CardDescription>
            รายการบันทึกการให้คะแนนทั้งหมด {evaluations.length} รายการจากคณะกรรมการ
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <Table>
            <TableHeader className="bg-muted/20 border-b border-primary/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-7 text-[10px] font-black uppercase tracking-widest">กรรมการ</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">ข้อเสนอ</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">ทีม</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">โครงการ</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">คะแนน</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">วันที่</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40 gap-2">
                      <BarChart className="h-10 w-10" />
                      <span className="italic font-light text-sm">ยังไม่มีการส่งผลการประเมิน</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((ev: any) => (
                  <TableRow key={ev.id} className="hover:bg-primary/5 transition-all group">
                    <TableCell className="pl-7">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 ring-1 ring-primary/10">
                          <AvatarFallback className="text-[9px] font-black bg-primary/5 text-primary">
                            {ev.judge.name?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-bold">{ev.judge.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{ev.judge.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/proposals/${ev.proposalId}`}
                        className="text-sm font-semibold hover:text-primary transition-colors underline decoration-dotted underline-offset-4 max-w-[180px] truncate block"
                      >
                        {ev.proposal.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium">
                      {ev.proposal.team.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {ev.proposal.team.project.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={`font-black text-sm px-3 h-7 ${
                          ev.score >= 80 ? "bg-green-500/10 text-green-600" :
                          ev.score >= 60 ? "bg-amber-500/10 text-amber-600" :
                          "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {ev.score}
                        <span className="text-[9px] ml-1 opacity-50 font-mono">/ 100</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(ev.createdAt).toLocaleDateString()}
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
