"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type Props = {
  projectId: string
  currentStatus: string
}

const statusThai: Record<string, string> = {
  ACTIVE: "กำลังดำเนินการ",
  DRAFT: "ฉบับร่าง",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิกแล้ว",
}

const allowedStatuses = ["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"] as const

export function ProjectStatusActions({ projectId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  const selectOptions = useMemo(
    () => allowedStatuses.map((s) => ({ value: s, label: statusThai[s] || s })),
    []
  )

  async function update(nextStatus: string) {
    const confirmed = window.confirm(`ยืนยันการตั้งค่าสถานะเป็น: ${statusThai[nextStatus] || nextStatus}`)
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to update project status")

      toast.success("อัปเดตสถานะโครงการสำเร็จ")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
          className="h-7 rounded-md border border-input bg-background px-2.5 text-[0.8rem] outline-none transition focus:ring-2 focus:ring-primary/40"
          aria-label="Project status"
        >
          {selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => update(status)}
          disabled={loading || status === currentStatus}
        >
          บันทึกสถานะ
        </Button>
      </div>

      {currentStatus !== "COMPLETED" && (
        <Button
          type="button"
          size="sm"
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => update("COMPLETED")}
          disabled={loading}
        >
          โครงการนี้เสร็จสิ้นแล้ว
        </Button>
      )}
    </div>
  )
}

