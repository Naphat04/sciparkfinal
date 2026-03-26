import { Metadata } from "next"
import { Briefcase, Users, GraduationCap, Activity, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import * as dashboardService from "@/services/dashboard.service"

export const metadata: Metadata = {
  title: "Dashboard | Sci-Park",
  description: "Enterprise Innovation Management Dashboard",
}

function StatCard({ title, icon: Icon, value, description, color }: any) {
  return (
    <Card className="border-none shadow-sm bg-card/50 overflow-hidden relative">
      <div className={`absolute top-0 right-0 p-8 opacity-10 ${color}`}>
         <Icon className="h-16 w-16" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-background shadow-xs border ${color}`}>
            <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const stats = await dashboardService.getDashboardStats()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Welcome back to the Sci-Park administration portal.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">Download Report</Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Projects" 
          icon={Briefcase} 
          value={stats.totalProjects} 
          description="+12% from last month"
          color="text-primary border-primary/20"
        />
        <StatCard 
          title="Active Projects" 
          icon={Activity} 
          value={stats.activeProjects} 
          description="Projects in execution status"
          color="text-green-500 border-green-500/20"
        />
        <StatCard 
          title="Total Teams" 
          icon={Users} 
          value={stats.totalTeams} 
          description="+5 newly registered teams"
          color="text-blue-500 border-blue-500/20"
        />
        <StatCard 
          title="Total Participants" 
          icon={GraduationCap} 
          value={stats.totalParticipants} 
          description="Researchers and students"
          color="text-orange-500 border-orange-500/20"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="md:col-span-4 border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Registration Activity</CardTitle>
            <CardDescription>
              A visual overview of the latest innovation teams that joined.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center border-t border-dashed rounded-lg m-4 mt-0 bg-muted/10">
            <span className="text-muted-foreground text-sm italic">
                Analytics charting and timeline under development.
            </span>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3 border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Platform Status</CardTitle>
            <CardDescription>
              Overall system health and critical alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">API Performance</div>
                  <div className="text-xs text-muted-foreground">Optimal latency (45ms AVG)</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-semibold">User Onboarding</div>
                    <div className="text-xs text-muted-foreground">Stable traffic (1.2k unique/day)</div>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                 <div className="text-xs font-semibold text-primary uppercase tracking-tighter mb-1">Upcoming Deadline</div>
                 <div className="text-sm">Proposal submissions for Smart City close in 2 days.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
