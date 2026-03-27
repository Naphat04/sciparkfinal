"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserPlus, Search, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Participant = {
  id: string
  name: string
  email: string
  type: string
}

type Props = {
  teamId: string
  projectId: string
  currentMembers: string[] // Array of participant IDs
}

export function AddTeamMemberModal({ teamId, projectId, currentMembers }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchParticipants()
    }
  }, [open])

  async function fetchParticipants() {
    setLoading(true)
    try {
      // Get participants from the project
      const response = await fetch(`/api/participants?projectId=${projectId}`)
      if (!response.ok) throw new Error("Failed to fetch participants")
      const data = await response.json()
      setParticipants(data)
    } catch (error) {
      console.error(error)
      toast.error("ไม่สามารถโหลดรายชื่อผู้เข้าร่วมได้")
    } finally {
      setLoading(false)
    }
  }

  const filteredParticipants = participants.filter(p => {
    const name = p.name || ""
    const email = p.email || ""
    const searchTerm = search.toLowerCase()
    
    return (name.toLowerCase().includes(searchTerm) || 
            email.toLowerCase().includes(searchTerm)) &&
           !currentMembers.includes(p.id)
  })

  async function handleAddMember() {
    if (!selectedId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: selectedId,
          role: "MEMBER"
        })
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error || "Failed to add member")
      }

      toast.success("เพิ่มสมาชิกในทีมแล้ว")
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
            <UserPlus className="h-4 w-4" />
            เพิ่มสมาชิก
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-card">
        <DialogHeader>
          <div className="bg-primary/10 text-primary w-fit p-3 rounded-full mb-2">
            <UserPlus className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold">เพิ่มสมาชิกในทีม</DialogTitle>
          <DialogDescription>
            เลือกผู้เข้าร่วมจากโครงการนี้เพื่อเพิ่มเข้าในทีมของคุณ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อหรืออีเมล..."
              className="pl-9 bg-muted/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {loading && participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">กำลังโหลด...</div>
            ) : filteredParticipants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2 opacity-50">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm">ไม่พบรายชื่อที่สามารถเพิ่มได้</p>
                <p className="text-[10px]">ผู้เข้าร่วมต้องถูกเพิ่มในโครงการก่อน</p>
              </div>
            ) : (
              filteredParticipants.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedId === p.id
                      ? "bg-primary/10 border-primary ring-1 ring-primary/20"
                      : "bg-background/50 border-transparent hover:bg-muted/50 hover:border-muted-foreground/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border-2 border-background">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold font-mono">
                        {(p.name || "UN").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid leading-tight">
                      <span className="text-sm font-bold">{p.name || "Unknown"}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{p.email || "No email"}</span>
                      <span className="text-[8px] uppercase tracking-widest text-primary/60 font-black mt-0.5">{p.type}</span>
                    </div>
                  </div>
                  {selectedId === p.id && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>ยกเลิก</Button>
          <Button 
            onClick={handleAddMember} 
            disabled={!selectedId || loading}
            className="px-8"
          >
            {loading ? "กำลังบันทึก..." : "ยืนยันการเพิ่ม"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
