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
import { Users } from "lucide-react"

type Props = {
  participantData: any
}

export function EditParticipantModal({ participantData }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(data: any) {
    setLoading(true)
    try {
      const response = await fetch(`/api/participants/${participantData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error || "Failed to update participant")
      }

      toast.success("ผู้เข้าร่วมได้รับการอัปเดตแล้ว")
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
            className="inline-flex items-center justify-center rounded-lg border transition-all outline-none font-medium h-6 px-2 text-xs rounded-md bg-transparent text-foreground border-transparent hover:bg-muted"
          >
            แก้ไข
          </button>
        }
      />
      <DialogContent className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto border-none shadow-2xl bg-card">
        <DialogHeader>
          <div className="bg-primary/10 text-primary w-fit p-3 rounded-full mb-2">
            <Users className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            แก้ไขผู้เข้าร่วม
          </DialogTitle>
          <DialogDescription>
            อัปเดตข้อมูลผู้เข้าร่วม
          </DialogDescription>
        </DialogHeader>

        <ParticipantForm
          onSubmit={handleSubmit}
          initialData={participantData}
          isLoading={loading}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  )
}
