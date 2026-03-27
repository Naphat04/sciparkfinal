"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Props = {
  teamId: string
  currentStatus: string
}

export function TeamStatusActions({ teamId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateStatus(status: "APPROVED" | "REJECTED" | "PENDING") {
    const labels: Record<string, string> = {
      APPROVED: "อนุมัติ",
      REJECTED: "ปฏิเสธ",
      PENDING: "รีเซ็ตเป็นรอตรวจสอบ"
    }
    const confirmed = window.confirm(`ยืนยันการ${labels[status]}ทีมนี้?`)
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to update status")
      }

      const successLabels: Record<string, string> = {
        APPROVED: "อนุมัติทีมแล้ว ✓",
        REJECTED: "ปฏิเสธทีมแล้ว",
        PENDING: "รีเซ็ตเป็นรอการตรวจสอบแล้ว"
      }
      toast.success(successLabels[status])
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">กำลังบันทึก...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== "APPROVED" && (
        <Button
          size="sm"
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => updateStatus("APPROVED")}
        >
          <CheckCircle2 className="h-4 w-4" />
          อนุมัติทีม
        </Button>
      )}

      {currentStatus !== "REJECTED" && (
        <Button
          size="sm"
          variant="outline"
          className="gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
          onClick={() => updateStatus("REJECTED")}
        >
          <XCircle className="h-4 w-4" />
          ปฏิเสธ
        </Button>
      )}

      {currentStatus !== "PENDING" && (
        <Button
          size="sm"
          variant="ghost"
          className="gap-2 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
          onClick={() => updateStatus("PENDING")}
        >
          <Clock className="h-4 w-4" />
          รีเซ็ตเป็นรอตรวจสอบ
        </Button>
      )}
    </div>
  )
}
