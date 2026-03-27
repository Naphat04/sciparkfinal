"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Project = {
  id: string
  name: string
  description?: string | null
  status: string
  startDate: string | Date
  endDate: string | Date
  budget?: number | null
  manager?: { name?: string | null; email?: string }
  _count?: { teams?: number }
}

type Props = {
  projects: Project[]
  onFilterChange?: (filtered: Project[]) => void
  renderTable: (filtered: Project[]) => React.ReactNode
}

const STATUS_OPTIONS = [
  { id: "ACTIVE", label: "กำลังดำเนินการ" },
  { id: "DRAFT", label: "ฉบับร่าง" },
  { id: "COMPLETED", label: "เสร็จสิ้น" },
  { id: "CANCELLED", label: "ยกเลิก" }
]

export function ProjectFilter({ projects, onFilterChange, renderTable }: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [startDateFrom, setStartDateFrom] = useState("")
  const [endDateTo, setEndDateTo] = useState("")

  const filteredProjects = useMemo(() => {
    let result = projects

    // Search by name
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    // Filter by status
    if (selectedStatuses.length > 0) {
      result = result.filter((p) => selectedStatuses.includes(p.status))
    }

    // Filter by start date range
    if (startDateFrom) {
      const fromDate = new Date(startDateFrom)
      result = result.filter((p) => new Date(p.startDate) >= fromDate)
    }
    
    // Filter by end date (<=)
    if (endDateTo) {
      const toDate = new Date(endDateTo)
      result = result.filter((p) => new Date(p.endDate) <= toDate)
    }

    onFilterChange?.(result)
    return result
  }, [searchTerm, selectedStatuses, startDateFrom, endDateTo, projects, onFilterChange])

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const handleReset = () => {
    setSearchTerm("")
    setSelectedStatuses([])
    setStartDateFrom("")
    setEndDateTo("")
  }

  const hasActiveFilters = searchTerm || selectedStatuses.length > 0 || startDateFrom || endDateTo

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <Card className="border-none shadow-sm bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">ตัวกรองโครงการ</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                รีเซ็ต
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Search */}
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-70">ค้นหาชื่อโครงการ</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="พิมพ์ชื่อโครงการ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background/50 h-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-70">สถานะโครงการ</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <Badge
                    key={status.id}
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      selectedStatuses.includes(status.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleStatus(status.id)}
                  >
                    {status.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Date Ranges */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest opacity-70 block mb-2">
                  ช่วงวันที่เริ่มโครงการ
                </label>
                <div className="grid md:grid-cols-1 gap-2">
                  <Input
                    type="date"
                    value={startDateFrom}
                    onChange={(e) => setStartDateFrom(e.target.value)}
                    placeholder="ตั้งแต่"
                    className="h-9 bg-background/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest opacity-70 block mb-2">
                  ช่วงวันที่สิ้นสุดโครงการ
                </label>
                <div className="grid md:grid-cols-1 gap-2">
                  <Input
                    type="date"
                    value={endDateTo}
                    onChange={(e) => setEndDateTo(e.target.value)}
                    placeholder="ถึง"
                    className="h-9 bg-background/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {renderTable(filteredProjects)}
    </div>
  )
}
