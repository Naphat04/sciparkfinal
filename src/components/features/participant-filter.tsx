"use client"

import React, { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Search } from "lucide-react"

type Participant = {
  id: string
  type: string
  createdAt: string | Date
  user?: { name?: string | null; email?: string }
  studentProfile?: { studentId?: string; faculty?: string; program?: string }
  lecturerProfile?: { faculty?: string; position?: string }
}

type Props = {
  participants: Participant[]
  renderTable: (filtered: Participant[]) => React.ReactNode
}

const TYPE_OPTIONS = [
  { id: "STUDENT", label: "นักศึกษา" },
  { id: "PROJECT_MANAGER", label: "ผู้จัดการโครงการ" },
  { id: "LECTURER", label: "อาจารย์" },
  { id: "RESEARCHER", label: "นักวิจัย" },
  { id: "ENTREPRENEUR", label: "ผู้ประกอบการ" },
]

export function ParticipantFilter({ participants, renderTable }: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const filtered = useMemo(() => {
    let result = participants

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      result = result.filter((p) => {
        const name = (p.user?.name || "").toLowerCase()
        const email = (p.user?.email || "").toLowerCase()
        const studentId = (p.studentProfile?.studentId || "").toLowerCase()
        return name.includes(q) || email.includes(q) || studentId.includes(q)
      })
    }

    if (selectedTypes.length > 0) {
      result = result.filter((p) => selectedTypes.includes(p.type))
    }

    return result
  }, [participants, searchTerm, selectedTypes])

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleReset = () => {
    setSearchTerm("")
    setSelectedTypes([])
  }

  const hasActiveFilters = searchTerm.trim() || selectedTypes.length > 0

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">ตัวกรองผู้เข้าร่วม</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                <RotateCcw className="mr-1 h-3 w-3" />
                รีเซ็ต
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-70">
                ค้นหา (ชื่อ / อีเมล / รหัสนักศึกษา)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="พิมพ์เพื่อค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background/50 h-9"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-70">ประเภท (Role)</label>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((t) => (
                  <Badge
                    key={t.id}
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      selectedTypes.includes(t.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleType(t.id)}
                  >
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {renderTable(filtered)}
    </div>
  )
}

