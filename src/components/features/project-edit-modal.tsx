"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type Props = {
  projectId: string
  initialValues: {
    name: string
    description?: string | null
    startDate: string // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
    fiscalYear?: string | null
    budget?: number | null
    maxTeams?: number | null
  }
}

export function ProjectEditModal({ projectId, initialValues }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(initialValues.name)
  const [description, setDescription] = useState(initialValues.description ?? "")
  const [startDate, setStartDate] = useState(initialValues.startDate)
  const [endDate, setEndDate] = useState(initialValues.endDate)
  const [fiscalYear, setFiscalYear] = useState(initialValues.fiscalYear ?? "")
  const [budget, setBudget] = useState<string>(
    initialValues.budget === null || initialValues.budget === undefined ? "" : String(initialValues.budget)
  )
  const [maxTeams, setMaxTeams] = useState<string>(
    initialValues.maxTeams === null || initialValues.maxTeams === undefined ? "" : String(initialValues.maxTeams)
  )

  useEffect(() => {
    if (!open) return
    setName(initialValues.name)
    setDescription(initialValues.description ?? "")
    setStartDate(initialValues.startDate)
    setEndDate(initialValues.endDate)
    setFiscalYear(initialValues.fiscalYear ?? "")
    setBudget(
      initialValues.budget === null || initialValues.budget === undefined ? "" : String(initialValues.budget)
    )
    setMaxTeams(
      initialValues.maxTeams === null || initialValues.maxTeams === undefined ? "" : String(initialValues.maxTeams)
    )
  }, [open, initialValues])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("กรุณากรอกชื่อโครงการ")
      return
    }
    if (!startDate || !endDate) {
      toast.error("กรุณากรอกวันเริ่มและวันสิ้นสุด")
      return
    }

    const sd = new Date(startDate)
    const ed = new Date(endDate)
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime()) || sd >= ed) {
      toast.error("วันที่เริ่มต้องน้อยกว่าวันสิ้นสุด")
      return
    }

    const budgetValue = budget === "" ? null : Number(budget)
    if (budgetValue !== null && (Number.isNaN(budgetValue) || budgetValue < 0)) {
      toast.error("งบประมาณต้องเป็นตัวเลขไม่ติดลบ")
      return
    }

    const maxTeamsValue = maxTeams === "" ? null : Number(maxTeams)
    if (maxTeamsValue !== null && (!Number.isFinite(maxTeamsValue) || maxTeamsValue < 0)) {
      toast.error("จำนวนทีมสูงสุดต้อง >= 0")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          startDate,
          endDate,
          fiscalYear: fiscalYear.trim() || null,
          budget: budgetValue,
          maxTeams: maxTeamsValue,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to update project")

      toast.success("อัปเดตโครงการสำเร็จ")
      setOpen(false)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={loading}>
            แก้ไขรายละเอียด
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[720px] border-none shadow-2xl bg-card">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold">แก้ไขโครงการ</DialogTitle>
              <DialogDescription>ปรับข้อมูลหลักของโครงการนี้</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Card className="border-none shadow-none bg-transparent">
          <Separator className="my-4" />
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="project_name">ชื่อโครงการ *</Label>
              <Input
                id="project_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project_description">คำอธิบาย</Label>
              <textarea
                id="project_description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fiscalYear">ปีงบประมาณ</Label>
              <Input
                id="fiscalYear"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                disabled={loading}
                placeholder="เช่น 2567"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxTeams">Maximum Teams</Label>
                <Input
                  id="maxTeams"
                  type="number"
                  min={0}
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <DialogFooter className="gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </Button>
            </DialogFooter>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

