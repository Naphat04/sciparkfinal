"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Users, Briefcase } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogin(role: string) {
    setLoading(true)
    try {
      await fetch("/api/auth/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      })
      
      if (role === "SUPER_ADMIN") {
        router.push("/")
      } else {
        router.push("/projects")
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex bg-muted/20 min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-black tracking-tight text-primary">Sci-Park</CardTitle>
          <CardDescription className="text-base mt-2">
            เลือกระดับผู้ใช้งาน (Role) เพื่อจำลองการล็อกอิน
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex items-center justify-start gap-4 text-lg border-2 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => handleLogin("SUPER_ADMIN")}
            disabled={loading}
          >
            <div className="bg-red-500/10 p-3 rounded-xl text-red-500"><ShieldAlert className="h-6 w-6" /></div>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-bold">Super Admin</span>
              <span className="text-sm text-muted-foreground font-normal">ดูแลทั้งหมด / จัดการบัญชีผู้ใช้</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex items-center justify-start gap-4 text-lg border-2 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => handleLogin("PROJECT_MANAGER")}
            disabled={loading}
          >
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500"><Briefcase className="h-6 w-6" /></div>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-bold">Project Manager</span>
              <span className="text-sm text-muted-foreground font-normal">สร้างและจัดการโครงการ / ให้รางวัล</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex items-center justify-start gap-4 text-lg border-2 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => handleLogin("PARTICIPANT")}
            disabled={loading}
          >
            <div className="bg-green-500/10 p-3 rounded-xl text-green-500"><Users className="h-6 w-6" /></div>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-bold">Participant</span>
              <span className="text-sm text-muted-foreground font-normal">ผู้เข้าแข่งขัน / ส่งผลงาน / ดูทีม</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
