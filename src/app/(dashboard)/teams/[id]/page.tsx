import { Metadata } from "next"
import { 
  ChevronLeft, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  ExternalLink,
  MoreHorizontal,
  Download,
  Briefcase
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import * as teamService from "@/services/team.service"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { SubmitProposalModal } from "@/components/features/submit-proposal-modal"
import { SubmitProposalAction } from "@/components/features/proposal-actions"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const team = await teamService.getTeamById(resolvedParams.id)
  return {
    title: `${team?.name || "Team"} Detail | Sci-Park`,
  }
}

export default async function TeamDetailPage({ params }: Props) {
  const resolvedParams = await params
  const team = await teamService.getTeamById(resolvedParams.id)

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="text-xl font-semibold opacity-50 italic">Team not found</div>
        <Button 
          variant="outline" 
          nativeButton={false}
          render={
            <Link href="/projects">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          }
        />
      </div>
    )
  }

  const leader = team.members.find((m: any) => m.role === "LEADER")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
           <Link href={`/projects/${team.projectId}`} className="text-xs text-muted-foreground flex items-center hover:text-primary transition-colors mb-1">
             <ChevronLeft className="mr-1 h-3 w-3" />
             Back to {team.project.name}
           </Link>
           <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
           <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{team.status}</Badge>
              <span className="text-xs text-muted-foreground">• Team ID: {team.id}</span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm">Invite Member</Button>
           <SubmitProposalModal teamId={team.id} teamName={team.name} />
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 flex flex-col gap-6">
           <Card className="border-none shadow-sm bg-card/50">
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-lg">Team Members</CardTitle>
                   <CardDescription>Members currently participating in this innovation track.</CardDescription>
                </div>
                <Button variant="outline" size="icon-sm">
                   <UserPlus className="h-4 w-4" />
                </Button>
             </CardHeader>
             <CardContent className="px-0">
                <Table>
                   <TableHeader className="bg-muted/30">
                      <TableRow>
                         <TableHead className="pl-6 font-mono text-[10px] tracking-widest uppercase">Name</TableHead>
                         <TableHead className="font-mono text-[10px] tracking-widest uppercase">Role</TableHead>
                         <TableHead className="font-mono text-[10px] tracking-widest uppercase">Type</TableHead>
                         <TableHead className="text-right pr-6 font-mono text-[10px] tracking-widest uppercase">Action</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {team.members.map((member: any) => (
                         <TableRow key={member.id} className="hover:bg-muted/10 transition-colors">
                            <TableCell className="pl-6 font-medium">
                               <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 ring-1 ring-primary/10">
                                     <AvatarFallback>{member.participant.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="grid leading-tight">
                                     <span className="text-sm font-semibold">{member.participant.user.name}</span>
                                     <span className="text-[10px] text-muted-foreground font-mono">{member.participant.user.email}</span>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <Badge variant={member.role === "LEADER" ? "default" : "outline"} className="text-[9px] h-5 font-bold uppercase tracking-tighter">
                                  {member.role}
                               </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                               {member.participant.type}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                               <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-card/50">
              <CardHeader>
                 <CardTitle className="text-lg">Proposals & Submissions</CardTitle>
                 <CardDescription>Official business plans and innovation abstracts submitted for evaluation.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                 {team.proposals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-muted-foreground/10 rounded-2xl bg-muted/5 group">
                       <FileText className="h-10 w-10 text-muted-foreground/30 mb-3 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-500" />
                       <div className="text-sm font-bold text-muted-foreground">No Submissions Found</div>
                       <p className="text-[11px] text-muted-foreground italic mb-4">You must create a proposal draft first.</p>
                       <SubmitProposalModal teamId={team.id} teamName={team.name} />
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {team.proposals.map((proposal: any) => (
                          <div key={proposal.id} className="flex flex-col p-5 border border-primary/5 rounded-2xl bg-background/40 hover:bg-background/60 hover:shadow-lg transition-all duration-300 group ring-1 ring-transparent hover:ring-primary/10">
                             <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                   <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                      <FileText className="h-6 w-6" />
                                   </div>
                                   <div className="grid leading-snug">
                                      <div className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">{proposal.title}</div>
                                      <div className="text-[11px] text-muted-foreground font-light mb-2 max-w-[400px] line-clamp-1">{proposal.description || "No summary provided."}</div>
                                      <div className="flex items-center gap-3">
                                         <Badge variant={proposal.status === "DRAFT" ? "outline" : "default"} className="text-[10px] h-4.5 px-2 tracking-tighter mix-blend-multiply dark:mix-blend-normal">
                                            {proposal.status === "DRAFT" && <Clock className="h-2.5 w-2.5 mr-1" />}
                                            {proposal.status === "SUBMITTED" && <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                                            {proposal.status}
                                         </Badge>
                                         <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono uppercase opacity-70">
                                            Updated: {new Date(proposal.updatedAt).toLocaleDateString()}
                                         </span>
                                      </div>
                                   </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                   {proposal.status === "DRAFT" ? (
                                      <SubmitProposalAction proposalId={proposal.id} />
                                   ) : (
                                      <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full">
                                         <CheckCircle2 className="h-3 w-3" />
                                         Finalized
                                      </div>
                                   )}
                                   {proposal.fileUrl && (
                                       <Button 
                                          variant="ghost" 
                                          size="xs" 
                                          className="h-6 text-[10px] opacity-70" 
                                          nativeButton={false}
                                          render={
                                            <a href={proposal.fileUrl} target="_blank" rel="noreferrer">
                                               <Download className="h-3 w-3 mr-1" />
                                               Resource
                                            </a>
                                          }
                                       />
                                   )}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
           <Card className="border-none shadow-sm bg-card/50 overflow-hidden group">
              <CardHeader className="bg-primary/5 pb-4 border-b group-hover:bg-primary/10 transition-colors">
                 <CardTitle className="text-base font-bold tracking-tight">Team Authority</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                 {leader ? (
                    <div className="flex flex-col items-center text-center gap-4">
                       <Avatar className="h-24 w-24 border-8 border-background shadow-2xl ring-2 ring-primary/10 group-hover:scale-105 transition-transform duration-500">
                          <AvatarFallback className="text-3xl font-black bg-primary/5 text-primary tracking-tighter">{leader.participant.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div className="grid gap-1.5">
                          <div className="text-2xl font-black tracking-tight">{leader.participant.user.name}</div>
                          <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-3 py-1 rounded-full">{leader.participant.user.email}</div>
                          <Badge variant="outline" className="w-fit mx-auto mt-2 bg-primary/10 text-primary border-primary/20 uppercase text-[9px] font-black tracking-[0.2em] px-4 py-1">{leader.participant.type}</Badge>
                       </div>
                    </div>
                 ) : (
                    <div className="text-center text-sm italic text-muted-foreground">No leader assigned.</div>
                 )}
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-card/50">
              <CardHeader className="pb-3 pt-6">
                 <CardTitle className="text-base font-bold">Innovation Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                 <div className="grid gap-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em]">Active Program</span>
                    <Link href={`/projects/${team.projectId}`} className="text-sm font-extrabold hover:text-primary flex items-center gap-1.5 transition-all group/link">
                       <Briefcase className="h-4 w-4 text-primary/40 group-hover/link:text-primary transition-colors" />
                       {team.project.name}
                       <ExternalLink className="h-3 w-3 opacity-30 group-hover/link:opacity-100" />
                    </Link>
                 </div>
                 <Separator className="opacity-50" />
                 <div className="grid gap-2 mt-4 pt-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em] mb-1">Milestone Status</span>
                    <div className="flex items-center gap-3">
                       <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                       </div>
                       <span className="text-sm font-semibold opacity-90">Enrollment Validated</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 animate-pulse">
                          <Clock className="h-3 w-3 text-amber-500" />
                       </div>
                       <span className="text-sm font-semibold opacity-90 underline decoration-amber-500/20 underline-offset-4">Awaiting Submission</span>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
