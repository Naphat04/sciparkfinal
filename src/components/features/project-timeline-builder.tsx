"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, Clock3, Edit3, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Milestone = {
  id: string
  title: string
  description?: string | null
  dueDate: string | Date
  status: "PLANNED" | "IN_PROGRESS" | "DUE" | "DONE" | "DELAYED"
}

type Props = {
  projectId: string
  initialMilestones: Milestone[]
  isParticipant?: boolean
}

const statusLabel: Record<Milestone["status"], string> = {
  PLANNED: "วางแผน",
  IN_PROGRESS: "กำลังดำเนินการ",
  DUE: "ครบกำหนดการ",
  DONE: "เสร็จสิ้น",
  DELAYED: "ล่าช้า",
}

const statusColor: Record<Milestone["status"], string> = {
  PLANNED: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  DUE: "bg-red-500/10 text-red-600 border-red-500/20",
  DONE: "bg-green-500/10 text-green-600 border-green-500/20",
  DELAYED: "bg-amber-500/10 text-amber-700 border-amber-500/20",
}

function toDateInput(value: string | Date) {
  const dt = new Date(value)
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function ProjectTimelineBuilder({ projectId, initialMilestones, isParticipant }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<Milestone["status"]>("PLANNED")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [editStatus, setEditStatus] = useState<Milestone["status"]>("PLANNED")

  const milestones = useMemo(
    () =>
      [...initialMilestones].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
    [initialMilestones]
  )

  async function handleCreate() {
    if (!title.trim() || !dueDate) {
      toast.error("กรุณากรอกชื่อ milestone และวันที่")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dueDate,
          status,
        }),
      })

      const raw = await res.text()
      const data: unknown = raw ? JSON.parse(raw) : null
      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error?: unknown }).error ?? "Failed to create milestone")
            : "Failed to create milestone"
        throw new Error(message)
      }

      toast.success("เพิ่ม milestone สำเร็จ")
      setTitle("")
      setDescription("")
      setDueDate("")
      setStatus("PLANNED")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  function beginEdit(m: Milestone) {
    setEditingId(m.id)
    setEditTitle(m.title)
    setEditDescription(m.description || "")
    setEditDueDate(toDateInput(m.dueDate))
    setEditStatus(m.status)
  }

  async function handleSaveEdit() {
    if (!editingId) return
    if (!editTitle.trim() || !editDueDate) {
      toast.error("กรุณากรอกข้อมูลให้ครบ")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/timeline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: editingId,
          title: editTitle.trim(),
          description: editDescription.trim(),
          dueDate: editDueDate,
          status: editStatus,
        }),
      })

      const raw = await res.text()
      const data: unknown = raw ? JSON.parse(raw) : null
      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error?: unknown }).error ?? "Failed to update milestone")
            : "Failed to update milestone"
        throw new Error(message)
      }

      toast.success("อัปเดต milestone สำเร็จ")
      setEditingId(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("ยืนยันการลบ milestone นี้?")
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/timeline`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: id }),
      })

      const raw = await res.text()
      const data: unknown = raw ? JSON.parse(raw) : null
      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error?: unknown }).error ?? "Failed to delete milestone")
            : "Failed to delete milestone"
        throw new Error(message)
      }

      toast.success("ลบ milestone สำเร็จ")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-sm bg-card/40">
      <CardHeader>
        <CardTitle className="text-lg">Timeline Builder</CardTitle>
        <CardDescription>สร้างและจัดการ milestone ของโครงการแบบเรียงตามเวลา</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!isParticipant && (
          <div className="grid gap-3 rounded-xl border p-4 bg-background/50">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="timeline_title">ชื่อ Milestone</Label>
              <Input
                id="timeline_title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น เปิดรับสมัครรอบแรก"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeline_due_date">วันที่</Label>
              <Input
                id="timeline_due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="timeline_status">สถานะ</Label>
              <select
                id="timeline_status"
                className="h-8 rounded-md border border-input bg-background px-2.5 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as Milestone["status"])}
                disabled={loading}
              >
                <option value="PLANNED">วางแผน</option>
                <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                <option value="DONE">เสร็จสิ้น</option>
                <option value="DELAYED">ล่าช้า</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeline_desc">คำอธิบาย (ไม่บังคับ)</Label>
              <Input
                id="timeline_desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียดกิจกรรม/เงื่อนไข"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <Button type="button" size="sm" onClick={handleCreate} disabled={loading}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              เพิ่ม Milestone
            </Button>
          </div>
        </div>
        )}

        <div className="space-y-3">
          {milestones.length === 0 ? (
            <div className="text-sm text-muted-foreground">ยังไม่มี milestone ในโครงการนี้</div>
          ) : (
            milestones.map((m) => (
              <div key={m.id} className="rounded-xl border p-4 bg-background/60">
                {editingId === m.id ? (
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} disabled={loading} />
                      <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} disabled={loading} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2.5 text-sm"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as Milestone["status"])}
                        disabled={loading}
                      >
                        <option value="PLANNED">วางแผน</option>
                        <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                        <option value="DUE">ครบกำหนดการ</option>
                        <option value="DONE">เสร็จสิ้น</option>
                        <option value="DELAYED">ล่าช้า</option>
                      </select>
                      <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} disabled={loading} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="xs" onClick={handleSaveEdit} disabled={loading}>
                        <Save className="h-3 w-3 mr-1" />
                        บันทึก
                      </Button>
                      <Button type="button" size="xs" variant="outline" onClick={() => setEditingId(null)} disabled={loading}>
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        {m.status === "DONE" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock3 className="h-4 w-4 text-primary" />
                        )}
                        <span className="font-semibold text-sm">{m.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        กำหนดการ: {new Date(m.dueDate).toLocaleDateString("th-TH")}
                      </div>
                      {m.description ? <div className="text-xs text-muted-foreground">{m.description}</div> : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusColor[m.status]}>
                        {statusLabel[m.status]}
                      </Badge>
                      {!isParticipant && (
                        <>
                          <Button type="button" size="icon-xs" variant="ghost" onClick={() => beginEdit(m)} disabled={loading}>
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button type="button" size="icon-xs" variant="ghost" onClick={() => handleDelete(m.id)} disabled={loading}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

