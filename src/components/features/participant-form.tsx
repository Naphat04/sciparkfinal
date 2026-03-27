"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const PARTICIPANT_TYPES = [
  { id: "STUDENT", label: "นักศึกษา" },
  { id: "PROJECT_MANAGER", label: "ผู้จัดการโครงการ" },
  { id: "ENTREPRENEUR", label: "ผู้ประกอบการ" },
  { id: "RESEARCHER", label: "นักวิจัย" },
  { id: "LECTURER", label: "ที่ปรึกษา/อาจารย์" }
]

type InitialParticipantData = {
  name?: string
  email?: string
  phone?: string
  user?: { name?: string | null; email?: string; phone?: string | null }
  type?: string
  studentProfile?: { studentId?: string; faculty?: string; program?: string; year?: number | string }
  lecturerProfile?: { faculty?: string; position?: string }
  researcherProfile?: { organization?: string; researchField?: string }
  entrepreneurProfile?: { companyName?: string; businessType?: string }
}

type ParticipantFormPayload = {
  name: string
  email: string
  phone?: string
  type: string
  profileData: Record<string, unknown>
}

type Props = {
  onSubmit: (data: ParticipantFormPayload) => Promise<void>
  initialData?: InitialParticipantData
  isLoading?: boolean
  mode?: "add" | "edit"
}

export function ParticipantForm({ onSubmit, initialData, isLoading = false, mode = "add" }: Props) {
  const [name, setName] = useState(initialData?.name || initialData?.user?.name || "")
  const [email, setEmail] = useState(initialData?.email || initialData?.user?.email || "")
  const [phone, setPhone] = useState(initialData?.phone || initialData?.user?.phone || "")
  const [type, setType] = useState(
    initialData?.type || (mode === "add" ? "ENTREPRENEUR" : "STUDENT")
  )
  const [studentId, setStudentId] = useState(initialData?.studentProfile?.studentId || "")
  const [faculty, setFaculty] = useState(initialData?.studentProfile?.faculty || initialData?.lecturerProfile?.faculty || "")
  const [program, setProgram] = useState(initialData?.studentProfile?.program || "")
  const [year, setYear] = useState<string>(String(initialData?.studentProfile?.year ?? "1"))
  const [position, setPosition] = useState(initialData?.lecturerProfile?.position || "")
  const [organization, setOrganization] = useState(initialData?.researcherProfile?.organization || "")
  const [researchField, setResearchField] = useState(initialData?.researcherProfile?.researchField || "")
  const [companyName, setCompanyName] = useState(initialData?.entrepreneurProfile?.companyName || "")
  const [businessType, setBusinessType] = useState(initialData?.entrepreneurProfile?.businessType || "")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !type) {
      setError("กรุณากรอกข้อมูลที่จำเป็น (ชื่อ อีเมล ประเภท)")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง")
      return
    }

    const profileData: Record<string, unknown> = {}

    if (type === "STUDENT") {
      if (!studentId.trim() || !faculty.trim()) {
        setError("กรุณากรอกรหัสนักศึกษาและคณะ")
        return
      }
      profileData.studentId = studentId
      profileData.faculty = faculty
      profileData.program = program
      profileData.year = parseInt(year)
    } else if (type === "LECTURER") {
      if (!faculty.trim()) {
        setError("กรุณากรอกคณะ")
        return
      }
      profileData.faculty = faculty
      profileData.position = position
    } else if (type === "RESEARCHER") {
      if (!organization.trim()) {
        setError("กรุณากรอกองค์กร")
        return
      }
      profileData.organization = organization
      profileData.researchField = researchField
    } else if (type === "ENTREPRENEUR") {
      if (!companyName.trim()) {
        setError("กรุณากรอกชื่อบริษัท")
        return
      }
      profileData.companyName = companyName
      profileData.businessType = businessType
    }

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        type,
        profileData
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      setError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">ชื่อ *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น สมชาย"
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">อีเมล *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            disabled={isLoading || mode === "edit"}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">เบอร์โทร</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="เช่น 0812345678"
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="type">ประเภทผู้เข้าร่วม *</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isLoading || mode === "edit"}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
        >
          {PARTICIPANT_TYPES.filter((pt) => (mode === "add" ? pt.id !== "STUDENT" : true)).map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.label}
            </option>
          ))}
        </select>
      </div>

      <Separator className="my-4" />

      {/* Conditional fields based on type */}
      {type === "STUDENT" && (
        <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
          <h4 className="font-semibold text-sm">ข้อมูลนักศึกษา</h4>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="studentId">รหัสนักศึกษา *</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="เช่น 66123456"
                disabled={isLoading}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="faculty">คณะ *</Label>
                <Input
                  id="faculty"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="เช่น วิศวกรรมศาสตร์"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="program">สาขา</Label>
                <Input
                  id="program"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="เช่น วิศวกรรมซอฟต์แวร์"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">ชั้นปี</Label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={isLoading}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {type === "LECTURER" && (
        <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
          <h4 className="font-semibold text-sm">ข้อมูลอาจารย์</h4>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="faculty_lecturer">คณะ *</Label>
              <Input
                id="faculty_lecturer"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="เช่น วิศวกรรมศาสตร์"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">ตำแหน่ง</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="เช่น ผู้ช่วยศาสตราจารย์"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {type === "RESEARCHER" && (
        <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
          <h4 className="font-semibold text-sm">ข้อมูลนักวิจัย</h4>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="organization">องค์กร *</Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="เช่น มหาวิทยาลัย XYZ"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="researchField">สาขาวิจัย</Label>
              <Input
                id="researchField"
                value={researchField}
                onChange={(e) => setResearchField(e.target.value)}
                placeholder="เช่น AI & Machine Learning"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {type === "ENTREPRENEUR" && (
        <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
          <h4 className="font-semibold text-sm">ข้อมูลผู้ประกอบการ</h4>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">ชื่อบริษัท *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="เช่น Tech Startup XYZ"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessType">ประเภทธุรกิจ</Label>
              <Input
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="เช่น Software Development"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "กำลังบันทึก..." : mode === "edit" ? "อัปเดต" : "เพิ่มผู้เข้าร่วม"}
        </Button>
      </div>
    </form>
  )
}
