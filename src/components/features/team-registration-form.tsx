"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

type Project = {
  id: string
  name: string
}

type Participant = {
  id: string
  user: { name: string | null; email: string }
  studentProfile?: { studentId: string } | null
}

type Props = {
  projects: Project[]
  participants: Participant[]
  defaultProjectId?: string
}

export function TeamRegistrationForm({ projects, participants, defaultProjectId }: Props) {
  const router = useRouter()
  const [teamName, setTeamName] = useState("")
  const [projectId, setProjectId] = useState(defaultProjectId || "")
  const [leaderId, setLeaderId] = useState("")
  const [leaderSearch, setLeaderSearch] = useState("")
  const [memberSearch, setMemberSearch] = useState("")
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredParticipants = useMemo(() => {
    const q = memberSearch.trim().toLowerCase()
    if (!q) return participants
    return participants.filter((p) =>
      p.user.name?.toLowerCase().includes(q) || 
      p.user.email?.toLowerCase().includes(q) ||
      p.studentProfile?.studentId?.toLowerCase().includes(q)
    )
  }, [memberSearch, participants])

  const filteredLeaders = useMemo(() => {
    const q = leaderSearch.trim().toLowerCase()
    if (!q) return participants
    return participants.filter((p) =>
      p.id === leaderId || // Always keep selected leader
      p.user.name?.toLowerCase().includes(q) || 
      p.user.email?.toLowerCase().includes(q) ||
      p.studentProfile?.studentId?.toLowerCase().includes(q)
    )
  }, [leaderSearch, participants, leaderId])

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!teamName.trim() || !projectId || !leaderId) {
      setError("Please fill in required fields (team name, project, leader).")
      return
    }

    if (!memberIds.includes(leaderId)) {
      setError("Leader must be included as a member")
      return
    }

    const others = memberIds.filter((id) => id !== leaderId)
    if (others.length < 1) {
      setError("Team must include at least 1 member besides leader")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          projectId,
          leaderId,
          memberIds
        })
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || "Failed to create team")
      }

      toast.success("Team registered successfully")
      router.push(`/projects/${projectId}`)
    } catch (err: any) {
      setError(err.message || "Error creating team")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-sm bg-card/50 mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="text-3xl">Team Registration</CardTitle>
        <CardDescription>ลงทะเบียนทีมสำหรับโครงการ</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="teamName">Team Name *</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="ทีม X นวัตกรรม"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project">Select Project *</Label>
            <select
              id="project"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            >
              <option value="">-- Choose a project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="leader">Leader *</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="leaderSearch"
                value={leaderSearch}
                onChange={(e) => setLeaderSearch(e.target.value)}
                placeholder="Search leader by name, email or ID..."
                className="h-9 text-xs"
              />
              <select
                id="leader"
                value={leaderId}
                onChange={(event) => setLeaderId(event.target.value)}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
              >
                <option value="">-- Choose a leader --</option>
                {filteredLeaders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user.name || "Unknown"} {p.studentProfile?.studentId ? `(${p.studentProfile.studentId} - ${p.user.email})` : `(${p.user.email})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="memberSearch">Team Members (Searchable Multi-Select) *</Label>
            <Input
              id="memberSearch"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search by name, email or student ID"
            />
            <div className="max-h-56 overflow-y-auto rounded-md border border-input bg-background p-2">
              {filteredParticipants.map((p) => (
                <label key={p.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={memberIds.includes(p.id)}
                    onChange={() => toggleMember(p.id)}
                    className="h-4 w-4 rounded border-muted-foreground focus:ring-primary"
                  />
                  <span className="text-sm">
                    {p.user.name || "Unknown"} {p.studentProfile?.studentId ? `(${p.studentProfile.studentId} - ${p.user.email})` : `(${p.user.email})`}
                  </span>
                </label>
              ))}
              {filteredParticipants.length === 0 && (
                <div className="text-xs text-muted-foreground">No participants found.</div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Leader must also be selected as member.</p>
          </div>

          {error && <div className="rounded-md bg-destructive/10 text-destructive px-4 py-2 text-sm">{error}</div>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/teams")} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Team"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
