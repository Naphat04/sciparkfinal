"use client"

import * as React from "react"
import { useState } from "react"
import { PlusCircle } from "lucide-react"
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
import { TeamRegistrationForm } from "@/components/features/team-registration-form"

type Props = {
  projectId: string
  projects: { id: string; name: string }[]
  participants: { id: string; user: { name: string | null; email: string } }[]
}

export function AddTeamModal({ projectId, projects, participants }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Team
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[680px] max-h-[90dvh] overflow-y-auto border-none shadow-2xl bg-card">
        <DialogHeader>
          <DialogTitle>Register Team for Project</DialogTitle>
          <DialogDescription>
            สร้างทีมใหม่โดยอิงตามโครงการนี้ และเลือกสมาชิกให้ครบตามกฎ
          </DialogDescription>
        </DialogHeader>

        <TeamRegistrationForm
          projects={projects}
          participants={participants}
          defaultProjectId={projectId}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
