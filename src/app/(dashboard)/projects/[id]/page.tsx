import { Metadata } from "next"
import { 
  Building2, 
  Calendar, 
  ChevronLeft, 
  Mail, 
  PlusCircle, 
  Users, 
  Briefcase, 
  DollarSign, 
  LayoutDashboard,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  MoreVertical
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as projectService from "@/services/project.service"
import * as teamService from "@/services/team.service"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await projectService.getProjectById(params.id)
  return {
    title: `${project?.name || "Project"} | Sci-Park`,
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await projectService.getProjectById(params.id)
  const teams = await teamService.getTeamsByProject(params.id)

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="text-xl font-semibold opacity-50 italic">Project not found</div>
        <Button variant="outline" asChild>
          <Link href="/projects">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header & Navigation */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/projects" className="text-sm text-muted-foreground flex items-center hover:text-primary transition-colors">
            <ChevronLeft className="mr-1 h-3 w-3" />
            Projects
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-extrabold tracking-tight">{project.name}</h1>
             <Badge variant="outline" className="h-6 px-3 bg-primary/5 text-primary border-primary/20">{project.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1 max-w-2xl text-lg opacity-80 leading-relaxed font-light">
             {project.description || "The future of innovation starts here. No detailed description provided."}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm">Edit Details</Button>
           <Button variant="destructive" size="sm" disabled>Archive</Button>
        </div>
      </div>

      <Separator />

      {/* Stats Quick Grid */}
      <div className="grid gap-4 md:grid-cols-3">
         <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xs">
           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
             <CardTitle className="text-sm font-medium opacity-60">BUDGET ALLOCATED</CardTitle>
             <DollarSign className="h-4 w-4 text-green-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">${project.budget?.toLocaleString()}</div>
             <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Fixed Innovation Grant</p>
           </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xs">
           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
             <CardTitle className="text-sm font-medium opacity-60">TIMELINE</CardTitle>
             <Calendar className="h-4 w-4 text-primary" />
           </CardHeader>
           <CardContent>
             <div className="text-base font-semibold">{new Date(project.startDate).toLocaleDateString()} — {new Date(project.endDate).toLocaleDateString()}</div>
             <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Program duration window</p>
           </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xs">
           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
             <CardTitle className="text-sm font-medium opacity-60">TEAM ENROLLMENT</CardTitle>
             <Users className="h-4 w-4 text-blue-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{teams.length} Teams Registered</div>
             <div className="w-full bg-muted h-1 mt-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[45%]" />
             </div>
           </CardContent>
         </Card>
      </div>

      {/* Detailed Tabs Section */}
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-4 bg-muted/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams" className="relative">
             Teams
             {teams.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground font-bold">{teams.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="activity">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
           <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm bg-card/40">
                 <CardHeader>
                    <CardTitle className="text-lg">Project Manager & Staff</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="flex items-center gap-4 border p-4 rounded-xl bg-background/50">
                       <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{project.manager?.name?.substring(0,2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div className="grid leading-tight">
                          <span className="font-bold text-base">{project.manager?.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{project.manager?.email}</span>
                          <span className="text-[10px] text-primary font-medium uppercase mt-1 tracking-widest bg-primary/10 w-fit px-1.5 rounded">Primary Lead</span>
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-card/40">
                 <CardHeader>
                    <CardTitle className="text-lg">Milestones & Phases</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Program Kickoff Meeting</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium">Application Deadline (Due 15 May)</span>
                       </div>
                       <div className="flex items-center gap-3 opacity-40">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Proposal Evaluations (Internal)</span>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="teams">
           <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold tracking-tight">Ecosystem Teams</h2>
                   <p className="text-sm text-muted-foreground italic font-light">List of active innovation teams competing in this project.</p>
                </div>
                <div className="flex gap-2">
                   <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search teams..." className="pl-9 w-[280px] bg-background/50 h-9" />
                   </div>
                   <Button size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Register Team
                   </Button>
                </div>
              </div>

              {teams.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl opacity-60">
                    <Users className="h-10 w-10 mb-4" />
                    <div className="text-lg font-semibold">No Teams Joined Yet</div>
                    <p className="text-sm text-muted-foreground">Start the program by adding or inviting the first team.</p>
                 </div>
              ) : (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                       <Card key={team.id} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/50 hover:bg-card hover:shadow-lg transition-all group overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon-sm" className="h-8 w-8 hover:bg-muted"><MoreVertical className="h-4 w-4" /></Button>
                          </div>
                          <CardHeader className="pb-3 px-6">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">{team.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                               <Badge variant={team.status === "APPROVED" ? "default" : "secondary"} className="h-5 text-[10px] font-bold">
                                  {team.status}
                               </Badge>
                               <span className="text-[10px] uppercase font-mono tracking-tighter">{team._count.members} Members Enrolled</span>
                            </CardDescription>
                          </CardHeader>
                          <Separator className="opacity-50" />
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                               <div className="flex -space-x-2">
                                  {team.members.slice(0, 4).map((m: any) => (
                                     <Avatar key={m.id} className="h-8 w-8 border-2 border-card ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
                                        <AvatarFallback className="text-[10px] font-bold bg-muted/40">{m.participant.user.name?.substring(0, 1)}</AvatarFallback>
                                     </Avatar>
                                  ))}
                                  {team._count.members > 4 && (
                                     <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-bold">
                                        +{team._count.members - 4}
                                     </div>
                                  )}
                               </div>
                               <Button size="xs" variant="ghost" asChild>
                                  <Link href={`/teams/${team.id}`}>
                                     View Team
                                  </Link>
                               </Button>
                            </div>
                          </CardContent>
                       </Card>
                    ))}
                 </div>
              )}
           </div>
        </TabsContent>

        <TabsContent value="submissions">
           <Card className="border-none shadow-sm bg-card/40 opacity-70 italic text-center py-20">
              <CardTitle className="text-muted-foreground font-light mb-2">Proposal Tracking Under Development</CardTitle>
              <CardDescription>Advanced submission workflow implementation pending in Phase 4.</CardDescription>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
