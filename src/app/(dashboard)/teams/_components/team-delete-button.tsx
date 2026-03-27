"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDelete } from "@/components/features/confirm-delete"

interface TeamDeleteButtonProps {
  teamId: string
  teamName: string
}

export function TeamDeleteButton({ teamId, teamName }: TeamDeleteButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete team")
      }

      toast.success(`ลบทีม "${teamName}" เรียบร้อยแล้ว`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการลบทีม")
      throw error
    }
  }

  return (
    <div onClick={(e) => e.preventDefault()}>
      <ConfirmDelete
        title="ลบทีม"
        description={`คุณต้องการลบทีม "${teamName}" ใช่หรือไม่? ข้อมูลสมาชิกของทีมจะยังคงอยู่ในระบบแต่จะไม่ได้อยู่ในทีมนี้อีกต่อไป`}
        onConfirm={handleDelete}
        trigger={
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:text-white hover:bg-red-500 rounded-full h-7 w-7 transition-all duration-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
      />
    </div>
  )
}
