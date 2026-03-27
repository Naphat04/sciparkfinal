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
import { ParticipantForm } from "@/components/features/participant-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Users, Plus } from "lucide-react"

type Props = {
  projectId: string
  mode?: "add" | "edit"
  participantData?: any
  onSuccess?: () => void
  triggerLabel?: string
}

export function ParticipantModal({
  projectId,
  mode = "add",
  participantData,
  onSuccess,
  triggerLabel
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(data: any) {
    setLoading(true)
    try {
      const url = mode === "edit" ? `/api/participants/${participantData.id}` : "/api/participants"
      const method = mode === "edit" ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          projectId
        })
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error || "Failed to save participant")
      }

      toast.success(
        mode === "edit"
          ? "ผู้เข้าร่วมได้รับการอัปเดตแล้ว"
          : "ผู้เข้าร่วมได้รับการเพิ่มแล้ว"
      )
      setOpen(false)
      router.refresh()
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-lg border transition-all outline-none font-medium ${
              mode === "edit"
                ? "h-6 px-2 text-xs rounded-md bg-transparent text-foreground border-transparent hover:bg-muted"
                : "h-9 gap-2 px-4 text-sm bg-primary text-primary-foreground border-transparent hover:bg-primary/80"
            }`}
          >
            {mode === "edit" ? (
              "แก้ไข"
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {triggerLabel || "เพิ่มผู้เข้าร่วม"}
              </>
            )}
          </button>
        }
      />
      <DialogContent className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto border-none shadow-2xl bg-card">
        <DialogHeader>
          <div className="bg-primary/10 text-primary w-fit p-3 rounded-full mb-2">
            <Users className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {mode === "edit" ? "แก้ไขผู้เข้าร่วม" : "เพิ่มผู้เข้าร่วมโครงการ"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "อัปเดตข้อมูลผู้เข้าร่วมโครงการ"
              : "กรอกข้อมูลผู้เข้าร่วมโครงการตามประเภทที่เลือก"}
          </DialogDescription>
        </DialogHeader>

        <ParticipantForm
          onSubmit={handleSubmit}
          initialData={participantData}
          isLoading={loading}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  )
}
