"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function CreateProjectPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [fiscalYear, setFiscalYear] = useState("")
  const [maxTeams, setMaxTeams] = useState("")
  const [budget, setBudget] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Project name is required")
      return
    }

    if (!startDate || !endDate) {
      setError("Start date and End date are required")
      return
    }

    const sd = new Date(startDate)
    const ed = new Date(endDate)
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
      setError("Invalid date format")
      return
    }

    if (sd >= ed) {
      setError("Start Date must be before End Date")
      return
    }

    const maxTeamsValue = Number(maxTeams)
    if (maxTeams && (Number.isNaN(maxTeamsValue) || maxTeamsValue <= 0)) {
      setError("Maximum Teams must be a number greater than 0")
      return
    }

    const budgetValue = budget ? Number(budget) : undefined
    if (budget && budgetValue !== undefined && (Number.isNaN(budgetValue) || budgetValue < 0)) {
      setError("Budget must be a non-negative number")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          startDate,
          endDate,
          fiscalYear: fiscalYear.trim() || undefined,
          maxTeams: maxTeams ? maxTeamsValue : undefined,
          budget: budgetValue
        })
      })

      // API might fail before returning JSON; handle safely.
      const raw = await response.text()
      const json = raw ? (() => { try { return JSON.parse(raw) } catch { return null } })() : null
      if (!response.ok) {
        throw new Error((json as any)?.error || raw || "Failed to create project")
      }

      router.push("/projects")
    } catch (err: any) {
      setError(err.message || "Internal error")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl py-10">
      <Card className="border-none shadow-sm bg-card/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-extrabold">สร้างโครงการใหม่</CardTitle>
              <CardDescription>ป้อนข้อมูลโครงการเพื่อลงทะเบียนใน Sci-Park</CardDescription>
            </div>
            <Link href="/projects" className="text-sm text-primary hover:underline">กลับไปยังโครงการ</Link>
          </div>
        </CardHeader>

        <Separator />

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น โครงการพัฒนา AI เพื่อ Smart City"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียดโครงการ"
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fiscalYear">ปีงบประมาณ</Label>
              <Input
                id="fiscalYear"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                placeholder="เช่น 2567"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxTeams">Maximum Teams</Label>
                <Input
                  id="maxTeams"
                  type="number"
                  min={1}
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(e.target.value)}
                  placeholder="เช่น 10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="เช่น 50000.00"
                />
              </div>
            </div>

            {error && <div className="rounded-md bg-destructive/10 text-destructive px-4 py-2 text-sm">{error}</div>}

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/projects")} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
