"use client"

import * as React from "react"
import { AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ConfirmDeleteProps {
  title: string
  description: string
  onConfirm: () => Promise<void>
  trigger?: React.ReactElement
}

export function ConfirmDelete({ title, description, onConfirm, trigger }: ConfirmDeleteProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error("Delete failed", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button variant="ghost" size="xs" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3 w-3 mr-1" />
              ลบ
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            {description} สั่งลบแล้วไม่สามารถกู้คืนได้
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-none border font-medium"
          >
            ยกเลิก
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-black font-bold shadow-sm"
          >
            {isLoading ? "กำลังลบ..." : "ยืนยันการลบ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
