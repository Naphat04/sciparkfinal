"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TeamFiltersProps {
  projects: { id: string; name: string; fiscalYear: string | null }[]
}

export function TeamFilters({ projects }: TeamFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [projectId, setProjectId] = useState(searchParams.get("projectId") || "all")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [fiscalYear, setFiscalYear] = useState(searchParams.get("fiscalYear") || "all")

  // Extract unique fiscal years from projects
  const uniqueFiscalYears = Array.from(new Set(projects.map(p => p.fiscalYear).filter(Boolean)))
    .sort()
    .reverse()

  // Debounce search update
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) params.set("search", search)
      else params.delete("search")

      if (projectId && projectId !== "all") params.set("projectId", projectId)
      else params.delete("projectId")

      if (status && status !== "all") params.set("status", status)
      else params.delete("status")

      if (fiscalYear && fiscalYear !== "all") params.set("fiscalYear", fiscalYear)
      else params.delete("fiscalYear")

      router.push(`${pathname}?${params.toString()}`)
    }, 500)

    return () => clearTimeout(handler)
  }, [search, projectId, status, fiscalYear, pathname, router, searchParams])

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="relative w-full sm:w-[280px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
        <Input
          type="search"
          placeholder="ค้นหาชื่อทีม หรือสมาชิก..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 bg-background/50 h-9 border-none ring-1 ring-primary/10 focus-visible:ring-primary/20"
        />
      </div>
      
      <Select value={projectId} onValueChange={(v) => setProjectId(v || "all")}>
        <SelectTrigger className="w-full sm:w-[240px] h-9 border-none ring-1 ring-primary/10 bg-background/50">
          <SelectValue placeholder="ทุกโครงการ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกโครงการ</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={fiscalYear} onValueChange={(v) => setFiscalYear(v || "all")}>
        <SelectTrigger className="w-full sm:w-[150px] h-9 border-none ring-1 ring-primary/10 bg-background/50">
          <SelectValue placeholder="ทุกปีงบประมาณ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกปีงบประมาณ</SelectItem>
          {uniqueFiscalYears.map((year) => (
            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => setStatus(v || "all")}>
        <SelectTrigger className="w-full sm:w-[180px] h-9 border-none ring-1 ring-primary/10 bg-background/50">
          <SelectValue placeholder="ทุกสถานะ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกสถานะ</SelectItem>
          <SelectItem value="PENDING">รอดำเนินการ</SelectItem>
          <SelectItem value="APPROVED">อนุมัติแล้ว</SelectItem>
          <SelectItem value="REJECTED">ปฏิเสธ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
