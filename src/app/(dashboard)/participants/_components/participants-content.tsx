"use client"

import React from "react"
import Link from "next/link"
import { ParticipantFilter } from "@/components/features/participant-filter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const typeMap: Record<string, { label: string; color: string }> = {
  STUDENT: { label: "นักศึกษา", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  PROJECT_MANAGER: { label: "ผู้จัดการโครงการ", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  LECTURER: { label: "อาจารย์", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  RESEARCHER: { label: "นักวิจัย", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  ENTREPRENEUR: { label: "ผู้ประกอบการ", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
}

type Participant = {
  id: string
  type: string
  createdAt: string | Date
  user: { name?: string | null; email?: string }
  studentProfile?: { studentId?: string; faculty?: string; program?: string; year?: number }
  lecturerProfile?: { faculty?: string; position?: string }
  researcherProfile?: { organization?: string; researchField?: string }
  entrepreneurProfile?: { companyName?: string; businessType?: string }
}

function getParticipantDetails(p: Participant) {
  if (p.type === "STUDENT") {
    const prof = p.studentProfile
    return prof ? `${prof.faculty || "ไม่ระบุคณะ"} - ${prof.program || "ไม่ระบุสาขา"} (ปี ${prof.year || "?"})` : "-"
  }
  if (p.type === "LECTURER") {
    const prof = p.lecturerProfile
    return prof ? `${prof.position || "อาจารย์/ที่ปรึกษา"} ณ ${prof.faculty || "ไม่ระบุคณะ"}` : "-"
  }
  if (p.type === "RESEARCHER") {
    const prof = p.researcherProfile
    return prof ? `${prof.organization || "ไม่ระบุหน่วยงาน"} (${prof.researchField || "ไม่ระบุสาขาวิจัย"})` : "-"
  }
  if (p.type === "ENTREPRENEUR") {
    const prof = p.entrepreneurProfile
    return prof ? `${prof.companyName || "ไม่ระบุบริษัท"} (${prof.businessType || "ไม่ระบุประเภทธุรกิจ"})` : "-"
  }
  if (p.type === "PROJECT_MANAGER") {
    return "ผู้จัดการโครงการ"
  }
  return "-"
}

export function ParticipantsContent({ participants }: { participants: Participant[] }) {
  return (
    <ParticipantFilter
      participants={participants}
      renderTable={(filtered) => (
        <Card className="border-none shadow-sm bg-card/50">
          <CardHeader className="pb-3 px-6">
            <CardTitle className="text-lg font-semibold">ทะเบียนรายชื่อ</CardTitle>
            <CardDescription>
              พบ {filtered.length} รายการจากทั้งหมด {participants.length} รายการ
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-6 w-[260px]">ชื่อ</TableHead>
                  <TableHead className="w-[140px]">รหัสนิสิต</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead className="w-[160px]">ประเภท</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead className="text-right pr-6 w-[140px]">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      ไม่พบข้อมูลผู้เข้าร่วมที่ตรงกับเงื่อนไข
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-6 font-medium">
                        <Link href={`/participants/${p.id}`} className="hover:underline">
                          {p.user?.name || "-"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {p.type === "STUDENT" ? (p.studentProfile?.studentId || "-") : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{p.user?.email || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${typeMap[p.type]?.color} font-medium tracking-tight`}>
                          {typeMap[p.type]?.label || p.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{getParticipantDetails(p)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="xs" nativeButton={false} render={<Link href={`/participants/${p.id}`}>ดูรายละเอียด</Link>} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    />
  )
}

