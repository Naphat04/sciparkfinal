"use client"

import React from "react"
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
import { ParticipantModal } from "@/components/features/participant-modal"
import { Users } from "lucide-react"

const PARTICIPANT_TYPES: Record<string, { label: string; color: string }> = {
  STUDENT: { label: "นักศึกษา", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  ENTREPRENEUR: { label: "ผู้ประกอบการ", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  RESEARCHER: { label: "นักวิจัย", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  LECTURER: { label: "ที่ปรึกษา/อาจารย์", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" }
}

type Participant = {
  id: string
  name: string
  email: string
  type: string
  createdAt: string
  [key: string]: any
}

type Props = {
  participants: Participant[]
  projectId: string
  isParticipant?: boolean
}

export function ParticipantTable({ participants, projectId, isParticipant }: Props) {
  const typeInfo = (type: string) => PARTICIPANT_TYPES[type] || PARTICIPANT_TYPES.STUDENT

  return (
    <Card className="border-none shadow-sm bg-card/50">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">ผู้เข้าร่วมโครงการ</CardTitle>
          <CardDescription>รายชื่อบุคคลที่เข้าร่วมในโครงการนี้</CardDescription>
        </div>
        {!isParticipant && <ParticipantModal projectId={projectId} mode="add" />}
      </CardHeader>

      <CardContent>
        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted-foreground/10 rounded-lg opacity-60">
            <Users className="h-10 w-10 mb-3 text-muted-foreground/30" />
            <div className="text-sm font-semibold text-muted-foreground">ไม่มีผู้เข้าร่วม</div>
            <p className="text-xs text-muted-foreground">คลิก "เพิ่มผู้เข้าร่วม" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="rounded-md border bg-background/50 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[250px]">ชื่อ</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead className="w-[150px]">ประเภท</TableHead>
                  <TableHead>วันที่เข้าร่วม</TableHead>
                  {!isParticipant && <TableHead className="w-[80px] text-center">จัดการ</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => {
                  const info = typeInfo(participant.type)
                  const joinDate = new Date(participant.createdAt).toLocaleDateString("th-TH")

                  return (
                    <TableRow key={participant.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{participant.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${info.color} font-medium`}>
                          {info.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{joinDate}</TableCell>
                      {!isParticipant && (
                        <TableCell className="text-center">
                          <ParticipantModal
                            projectId={projectId}
                            mode="edit"
                            participantData={participant}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
