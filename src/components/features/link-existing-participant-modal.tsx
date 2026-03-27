"use client"

import React, { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Link2, Check, Search, Users, AlertCircle, Filter } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

type Participant = {
  id: string
  type: string
  user: {
    name: string | null
    email: string
  }
}

type Props = {
  projectId: string
  currentParticipantIds: string[]
  availableParticipants: Participant[]
  hideStudents?: boolean
}

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "นักศึกษา",
  LECTURER: "ที่ปรึกษา/อาจารย์",
  RESEARCHER: "นักวิจัย",
  ENTREPRENEUR: "ผู้ประกอบการ",
  PROJECT_MANAGER: "ผู้จัดการโครงการ",
}

const ROLE_COLORS: Record<string, string> = {
  STUDENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  LECTURER: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  RESEARCHER: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  ENTREPRENEUR: "bg-green-500/10 text-green-500 border-green-500/20",
  PROJECT_MANAGER: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
}

export function LinkExistingParticipantModal({ projectId, currentParticipantIds, availableParticipants, hideStudents }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string | null>(null)
  const router = useRouter()

  // Show everyone as requested ("มีรายชื่อเต็ม")
  const filteredParticipants = useMemo(() => {
    return availableParticipants.filter(p => {
      // Hide students if prop is true
      if (hideStudents && p.type === "STUDENT") return false

      // Filter by role if selected (User still wants filters, but not hard exclusions)
      if (filterRole && p.type !== filterRole) return false
      
      // Search by name/email
      if (searchTerm) {
        const name = (p.user.name || "").toLowerCase()
        const email = p.user.email.toLowerCase()
        const q = searchTerm.toLowerCase()
        return name.includes(q) || email.includes(q)
      }
      
      return true
    })
  }, [availableParticipants, filterRole, searchTerm, hideStudents])

  async function handleLink() {
    if (!selectedId) return

    const participant = availableParticipants.find(p => p.id === selectedId)
    if (!participant) return

    setLoading(true)
    try {
      // Re-using the POST endpoint which handles linking existing participants via email
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          projectId,
          email: participant.user.email,
          name: participant.user.name,
          type: participant.type
        })
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error || "Failed to link participant")
      }

      toast.success("เพิ่มผู้เข้าร่วมเข้าโครงการแล้ว")
      setOpen(false)
      setSelectedId(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  const roleTypes = ["STUDENT", "LECTURER", "RESEARCHER", "ENTREPRENEUR", "PROJECT_MANAGER"].filter(type => {
    if (hideStudents && type === "STUDENT") return false
    return true
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 h-9 bg-background/50 hover:bg-background border-dashed">
            <Users className="h-4 w-4" />
            เลือกจากรายชื่อที่มีอยู่
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[550px] border-none shadow-2xl bg-card p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary p-3 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">เลือกผู้เข้าร่วมจากระบบ</DialogTitle>
              <DialogDescription>
                คลิกเลือกรายชื่อที่ต้องการเพื่อเพิ่มเข้าสู่โครงการนี้
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          <div className="sticky top-0 bg-card z-10 pb-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อ หรือ อีเมล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/40 border-none h-10 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <div className="flex items-center gap-1.5 mr-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-1 rounded">
                <Filter className="h-3 w-3" />
                บทบาท:
              </div>
              <Badge
                variant={filterRole === null ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap h-7"
                onClick={() => setFilterRole(null)}
              >
                ทั้งหมด
              </Badge>
              {roleTypes.map((type) => (
                <Badge
                  key={type}
                  variant={filterRole === type ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap h-7 ${filterRole === type ? "" : "hover:bg-muted"}`}
                  onClick={() => setFilterRole(type)}
                >
                  {ROLE_LABELS[type]}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredParticipants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-muted/20 rounded-2xl border border-dashed">
                <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-bold">ไม่พบรายชื่อที่ต้องการ</p>
                  <p className="text-[11px] text-muted-foreground mt-1 px-10">ลองเปลี่ยนคำค้นหา หรือใช้ตัวกรองบทบาทอื่น</p>
                </div>
              </div>
            ) : (
              filteredParticipants.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedId === p.id
                      ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-sm"
                      : "bg-background/40 border-transparent hover:bg-background hover:border-border hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                      selectedId === p.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }`}>
                      {(p.user.name && p.user.name.length > 0) ? p.user.name.charAt(0) : "U"}
                    </div>
                    <div className="grid leading-tight">
                      <span className="text-sm font-bold truncate max-w-[200px]">{p.user.name || "ไม่ระบุชื่อ"}</span>
                      <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">{p.user.email}</span>
                      <Badge variant="outline" className={`mt-1.5 h-5 text-[9px] w-fit font-bold border-none ${ROLE_COLORS[p.type]}`}>
                        {ROLE_LABELS[p.type]}
                      </Badge>
                    </div>
                  </div>
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedId === p.id ? "bg-primary border-primary scale-110 shadow-md" : "border-muted-foreground/20 group-hover:border-primary/50"
                  }`}>
                    {selectedId === p.id && <Check className="h-3 w-3 text-primary-foreground stroke-[3px]" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 bg-muted/30 border-t flex items-center justify-between gap-4 mt-auto">
          <div className="text-xs text-muted-foreground font-medium">
            {selectedId ? "เลือกแล้ว 1 รายชื่อ" : "ยังไม่ได้เลือกรายชื่อ"}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="h-10 px-6 font-bold rounded-xl" onClick={() => {
              setOpen(false)
              setSelectedId(null)
            }}>ยกเลิก</Button>
            <Button
              onClick={handleLink}
              disabled={!selectedId || loading}
              className="h-10 px-8 font-bold shadow-lg shadow-primary/20 rounded-xl bg-primary hover:bg-primary/90"
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันการเลือก"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
