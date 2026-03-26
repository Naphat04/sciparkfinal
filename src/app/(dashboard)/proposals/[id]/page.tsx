import { Metadata } from "next"
import { 
  ChevronLeft, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Download,
  AlertCircle,
  MessageSquare,
  Trophy,
  Users,
  Briefcase
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import * as proposalService from "@/services/proposal.service"
import * as evaluationService from "@/services/evaluation.service"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table"
import prisma from "@/lib/prisma"
import { ScoreProposalModal } from "@/components/features/score-proposal-modal"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const proposal = await prisma.proposal.findUnique({ where: { id: resolvedParams.id } })
  return {
     title: `${proposal?.title || "ข้อเสนอโครงการ"} | การประเมินผล`,
  }
}

const statusBadgeStyles: any = {
  DRAFT: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  SUBMITTED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  UNDER_REVIEW: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusThai: Record<string, string> = {
  DRAFT: "ฉบับร่าง",
  SUBMITTED: "ส่งแล้ว",
  UNDER_REVIEW: "อยู่ระหว่างพิจารณา",
  APPROVED: "ผ่านการอนุมัติ",
  REJECTED: "ไม่ผ่านการอนุมัติ",
}

export default async function ProposalEvaluationPage({ params }: Props) {
  const resolvedParams = await params
  const proposal = await prisma.proposal.findUnique({
    where: { id: resolvedParams.id },
    include: {
      team: {
        include: {
           project: { select: { id: true, name: true } },
           members: { include: { participant: { include: { user: true } } } }
        }
      }
    }
  })

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center p-20 opacity-50 italic">ไม่พบข้อมูลข้อเสนอโครงการ</div>
    )
  }

  const evaluations = await evaluationService.getEvaluationsByProposal(resolvedParams.id)
  const averageScore = evaluations.length > 0 ? evaluations.reduce((acc: number, curr: any) => acc + curr.score, 0) / evaluations.length : null

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <Link href="/proposals" className="text-xs text-muted-foreground flex items-center hover:text-primary mb-2 transition-colors">
               <ChevronLeft className="h-4 w-4 mr-1" />
               คิวข้อเสนอโครงการ
            </Link>
            <div className="flex flex-wrap items-center gap-3">
               <h1 className="text-4xl font-extrabold tracking-tight underline decoration-primary/20">{proposal.title}</h1>
               <Badge variant="outline" className={`${statusBadgeStyles[proposal.status]} font-black h-7 text-xs px-4 uppercase tracking-widest`}>
                  {statusThai[proposal.status] || proposal.status}
               </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">ทีม: {proposal.team.name}</span>
                <span className="text-[10px] text-muted-foreground opacity-50">• รหัสการส่ง: {proposal.id}</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <Button 
               variant="outline" 
               size="sm" 
               nativeButton={false}
               render={
                  <a href={proposal.fileUrl || "/"} target="_blank" rel="noreferrer">
                     <Download className="h-4 w-4 mr-2" />
                     เอกสารประกอบโครงการ
                  </a>
               }
            />
            {(proposal.status === "SUBMITTED" || proposal.status === "UNDER_REVIEW") && (
                <ScoreProposalModal proposalId={proposal.id} proposalTitle={proposal.title} />
            )}
         </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 flex flex-col gap-6">
           <Card className="border-none shadow-sm bg-card/60 overflow-hidden ring-1 ring-primary/5">
             <CardHeader className="bg-primary/5 pb-6 border-b border-primary/10">
                <CardTitle className="text-xl font-bold tracking-tight">Executive Abstract</CardTitle>
                <CardDescription className="italic">Official innovation summary provided by the participating team.</CardDescription>
             </CardHeader>
             <CardContent className="p-8 pt-6">
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-base italic font-light">
                   {proposal.description || "No abstract provided for this submission."}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-10 p-6 rounded-3xl bg-muted/20 border border-dashed border-muted-foreground/10">
                    <div className="flex flex-col items-center justify-center p-4 border-r border-dotted">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1 opacity-60">โครงการที่สมัคร</span>
                        <span className="text-base font-bold text-center underline decoration-primary/20">{proposal.team.project.name}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1 opacity-60">วันที่ส่งผลงาน</span>
                        <span className="text-base font-bold text-center">{new Date(proposal.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-card/60">
              <CardHeader>
                 <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Committee Evaluations
                 </CardTitle>
                 <CardDescription>Consolidated feedback and scorecard from official innovation judges.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                 {evaluations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 opacity-50 space-y-3">
                       <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
                       <div className="text-sm italic font-light">This proposal has not been scored yet. Waiting for committee review.</div>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {evaluations.map((evalItem: any) => (
                          <div key={evalItem.id} className="p-6 border border-primary/10 rounded-3xl bg-background/50 relative overflow-hidden group shadow-sm">
                             <div className="absolute top-0 right-0 p-4">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-black h-8 px-4 text-base shadow-sm ring-1 ring-primary/5">
                                   {evalItem.score} <span className="text-[10px] ml-1 opacity-50 font-mono tracking-tighter">/ 100</span>
                                </Badge>
                             </div>
                             <div className="flex items-center gap-3 mb-4">
                               <Avatar className="h-8 w-8 ring-1 ring-primary/10 shadow-sm border border-background">
                                  <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">{evalItem.judge.name.substring(0,2).toUpperCase()}</AvatarFallback>
                               </Avatar>
                               <div className="grid leading-tight">
                                  <span className="text-sm font-bold tracking-tight">{evalItem.judge.name}</span>
                                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">คณะกรรมการตัดสิน</span>
                               </div>
                             </div>
                             <p className="text-sm text-muted-foreground italic leading-relaxed pl-11 font-light opacity-90 border-l-2 border-primary/10 ml-4">
                                "{evalItem.comment || "ไม่มีความเห็นเพิ่มเติมสำหรับรายการนี้"}"
                             </p>
                          </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
           {averageScore !== null && (
              <Card className="border-none shadow-2xl bg-primary text-primary-foreground overflow-hidden relative group p-1 ring-4 ring-primary/10">
                 <Trophy className="absolute -bottom-4 -right-4 h-32 w-32 opacity-15 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 animate-pulse" />
                 <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] uppercase font-black tracking-[0.3em] opacity-80">Final Committee Verdict</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-6xl font-black italic tracking-tighter mb-2 group-hover:scale-110 transition-transform origin-left">{averageScore.toFixed(1)}</div>
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-bold opacity-90 flex items-center gap-1.5 uppercase tracking-wide">
                            <CheckCircle2 className="h-3 w-3" /> คะแนนเฉลี่ยจากกรรมการ {evaluations.length} ท่าน
                        </p>
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                           <div className="bg-white h-full transition-all duration-1000 ease-out" style={{ width: `${averageScore}%` }} />
                        </div>
                    </div>
                 </CardContent>
              </Card>
           )}

           <Card className="border-none shadow-sm bg-card/50">
              <CardHeader className="pb-3 pt-6 border-b">
                 <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Team Roster
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-0">
                 <Table>
                    <TableBody>
                       {proposal.team.members.map((m: any) => (
                          <TableRow key={m.id} className="hover:bg-muted/10 transition-colors border-none group">
                             <TableCell className="pl-6 flex items-center gap-3 py-3">
                                <Avatar className="h-8 w-8 ring-1 ring-muted group-hover:ring-primary/20 transition-all shadow-xs">
                                   <AvatarFallback className="text-[10px] font-black bg-muted/20">{m.participant.user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid leading-tight">
                                   <span className="text-sm font-bold truncate max-w-[150px]">{m.participant.user.name}</span>
                                   <span className="text-[10px] text-muted-foreground font-mono opacity-60 underline decoration-muted-foreground/10">{m.participant.user.email}</span>
                                </div>
                             </TableCell>
                             <TableCell className="text-right pr-6">
                                <Badge variant="outline" className="h-4 text-[8px] font-black tracking-widest uppercase mix-blend-multiply opacity-50 px-2">
                                   {m.role}
                                </Badge>
                             </TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-card/40 opacity-70 border-t-2 border-primary/20">
              <CardHeader className="pb-3 border-b border-muted">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em]">Judge Protocol</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-xs space-y-4 leading-relaxed font-light">
                 <p className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    Review executive brief and documentation resource before scoring.
                 </p>
                 <p className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    Base your score on Innovation (50%), Viability (30%), and Capability (20%).
                 </p>
                 <p className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    Final evaluations cannot be modified once committee verdict is reached.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
