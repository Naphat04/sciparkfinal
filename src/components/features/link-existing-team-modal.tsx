"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Link2, Check, ChevronDown, Users, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

type Team = {
  id: string
  name: string
  status: string
  _count: { members: number }
  project: { id: string; name: string } | null
}

type Props = {
  projectId: string
  currentTeamIds: string[]
  availableTeams: Team[]
}

export function LinkExistingTeamModal({ projectId, currentTeamIds, availableTeams }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  // Only show teams that are not already in this project
  const linkableTeams = availableTeams.filter(t => !currentTeamIds.includes(t.id))

  async function handleLink() {
    if (!selectedId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${selectedId}/link-project`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId })
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error || "Failed to link team")
      }

      toast.success("เชื่อมทีมเข้ากับโครงการแล้ว")
      setOpen(false)
      setSelectedId(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <Link2 className="h-4 w-4" />
            เลือกทีมที่มีอยู่
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[480px] border-none shadow-2xl bg-card">
        <DialogHeader>
          <div className="bg-blue-500/10 text-blue-500 w-fit p-3 rounded-full mb-2">
            <Link2 className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold">เชื่อมทีมเข้ากับโครงการ</DialogTitle>
          <DialogDescription>
            เลือกทีมที่มีอยู่แล้วเพื่อเพิ่มเข้าในโครงการนี้ ทีมที่อยู่ในโครงการนี้แล้วจะไม่แสดงในรายการ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {linkableTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 opacity-50">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">ไม่มีทีมที่สามารถเชื่อมได้</p>
              <p className="text-[11px] text-muted-foreground">ทีมทั้งหมดอยู่ในโครงการนี้แล้ว หรือยังไม่มีทีมในระบบ</p>
            </div>
          ) : (
            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
              {linkableTeams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedId(team.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedId === team.id
                      ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/20"
                      : "bg-background/50 border-transparent hover:bg-muted/50 hover:border-muted-foreground/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${selectedId === team.id ? "bg-blue-500/20" : "bg-muted/40"}`}>
                      <Users className={`h-4 w-4 ${selectedId === team.id ? "text-blue-500" : "text-muted-foreground"}`} />
                    </div>
                    <div className="grid leading-tight">
                      <span className="text-sm font-bold">{team.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 py-0">
                          {team.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {team._count.members} สมาชิก
                        </span>
                        {team.project && (
                          <span className="text-[10px] text-amber-500 font-mono">
                            • อยู่ใน: {team.project.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedId === team.id && <Check className="h-4 w-4 text-blue-500" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>ยกเลิก</Button>
          <Button
            onClick={handleLink}
            disabled={!selectedId || loading}
            className="px-8 bg-blue-500 hover:bg-blue-600"
          >
            {loading ? "กำลังเชื่อม..." : "ยืนยันการเชื่อม"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
