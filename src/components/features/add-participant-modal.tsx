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
  triggerLabel?: string
}

export function AddParticipantModal({ triggerLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(data: any) {
    setLoading(true)
    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error || "Failed to save participant")
      }

      toast.success("ผู้เข้าร่วมได้รับการเพิ่มแล้ว")
      setOpen(false)
      router.refresh()
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
            className="inline-flex items-center justify-center rounded-lg border transition-all outline-none font-medium h-9 gap-2 px-4 text-sm bg-primary text-primary-foreground border-transparent hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            {triggerLabel || "เพิ่มผู้เข้าร่วม"}
          </button>
        }
      />
      <DialogContent className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto border-none shadow-2xl bg-card">
        <DialogHeader>
          <div className="bg-primary/10 text-primary w-fit p-3 rounded-full mb-2">
            <Users className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            เพิ่มผู้เข้าร่วมใหม่
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลผู้เข้าร่วมในระบบตามประเภทที่เลือก
          </DialogDescription>
        </DialogHeader>

        <ParticipantForm
          onSubmit={handleSubmit}
          isLoading={loading}
          mode="add"
        />
      </DialogContent>
    </Dialog>
  )
}
