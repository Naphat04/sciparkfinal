"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type TeamOption = { id: string; name: string }
type Award = { rank: number; teamId: string; teamName: string }

type Props = {
  projectId: string
  teams: TeamOption[]
  initialAwards: Award[]
}

function toMap(awards: Award[]) {
  const m = new Map<number, string>()
  for (const a of awards) m.set(a.rank, a.teamId)
  return m
}

export function ProjectAwardsModal({ projectId, teams, initialAwards }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const initial = useMemo(() => toMap(initialAwards), [initialAwards])
  const [rank1, setRank1] = useState<string>(initial.get(1) ?? "")
  const [rank2, setRank2] = useState<string>(initial.get(2) ?? "")
  const [rank3, setRank3] = useState<string>(initial.get(3) ?? "")

  function resetToInitial() {
    setRank1(initial.get(1) ?? "")
    setRank2(initial.get(2) ?? "")
    setRank3(initial.get(3) ?? "")
  }

  function validateUnique(teamIds: string[]) {
    const ids = teamIds.filter(Boolean)
    return new Set(ids).size === ids.length
  }

  async function handleSave() {
    const selected = [rank1, rank2, rank3]
    if (!validateUnique(selected)) {
      toast.error("ห้ามเลือกทีมซ้ำในหลายรางวัล")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/awards`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awards: [
            { rank: 1, teamId: rank1 || null },
            { rank: 2, teamId: rank2 || null },
            { rank: 3, teamId: rank3 || null },
          ],
        }),
      })

      const raw = await res.text()
      const json: unknown = raw ? (() => { try { return JSON.parse(raw) } catch { return null } })() : null
      if (!res.ok) {
        const message =
          typeof json === "object" && json !== null && "error" in json
            ? String((json as { error?: unknown }).error ?? raw)
            : raw
        throw new Error(message || "Failed to save awards")
      }

      toast.success("บันทึกรางวัลสำเร็จ")
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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) resetToInitial()
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 h-7 text-[0.8rem] font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
            disabled={loading}
          >
            ตั้งค่ารางวัล
          </button>
        }
      />

      <DialogContent className="sm:max-w-[720px] border-none shadow-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">ตั้งค่ารางวัลทีม</DialogTitle>
          <DialogDescription>
            เลือกทีมที่ได้รางวัลที่ 1, 2, 3 (ห้ามเลือกซ้ำ)
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="award_rank_1">รางวัลที่ 1</Label>
            <select
              id="award_rank_1"
              value={rank1}
              onChange={(e) => setRank1(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              disabled={loading}
            >
              <option value="">— ยังไม่เลือก —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="award_rank_2">รางวัลที่ 2</Label>
            <select
              id="award_rank_2"
              value={rank2}
              onChange={(e) => setRank2(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              disabled={loading}
            >
              <option value="">— ยังไม่เลือก —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="award_rank_3">รางวัลที่ 3</Label>
            <select
              id="award_rank_3"
              value={rank3}
              onChange={(e) => setRank3(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              disabled={loading}
            >
              <option value="">— ยังไม่เลือก —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

