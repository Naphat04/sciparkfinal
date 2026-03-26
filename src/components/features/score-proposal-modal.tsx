"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Trophy, Loader2, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  score: z.coerce.number().min(0, "Min score is 0").max(100, "Max score is 100"),
  comments: z.string().min(10, "Please provide at least 10 characters of feedback"),
})

type Props = {
  proposalId: string
  proposalTitle: string
}

export function ScoreProposalModal({ proposalId, proposalTitle }: Props) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: 70,
      comments: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          proposalId,
          judgeId: "judge-123" // Mock judgeId
        }),
      })

      if (!response.ok) throw new Error("Failed to submit evaluation")

      toast.success("Evaluation submitted successfully!")
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast.error("Error submitting evaluation")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="font-bold gap-2">
             <Star className="h-4 w-4" />
             Evaluation Scoring
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px] border-none shadow-2xl bg-card overflow-hidden">
        <DialogHeader className="relative pb-6 border-b border-primary/10">
           <Trophy className="absolute -top-6 -right-6 h-24 w-24 opacity-5 text-primary rotate-12" />
           <DialogTitle className="text-2xl font-bold tracking-tight">Official Scoring</DialogTitle>
           <DialogDescription>
             Submitting score for: <span className="font-bold text-foreground opacity-80 decoration-primary/20 underline underline-offset-4">{proposalTitle}</span>.
           </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <div className="grid gap-3">
             <div className="flex items-center justify-between">
                <Label htmlFor="score" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Committee Score (0-100)</Label>
                <div className="text-2xl font-black text-primary bg-primary/10 h-10 w-16 rounded-xl flex items-center justify-center border border-primary/20">
                   {form.watch("score")}
                </div>
             </div>
             <Input
               id="score"
               type="range"
               min="0"
               max="100"
               step="1"
               {...form.register("score")}
               className="h-2 w-full bg-muted/30 rounded-lg appearance-none cursor-pointer accent-primary"
             />
             {form.formState.errors.score && (
               <p className="text-[10px] text-destructive font-bold">{form.formState.errors.score.message}</p>
             )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="comments" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Constructive Feedback</Label>
            <textarea
              id="comments"
              placeholder="Detail your assessment of the proposal's innovation merit..."
              {...form.register("comments")}
              className="flex min-h-[120px] w-full rounded-2xl border-none bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-light"
            />
            {form.formState.errors.comments && (
               <p className="text-[10px] text-destructive font-bold">{form.formState.errors.comments.message}</p>
            )}
            <p className="text-[9px] text-muted-foreground italic px-1 pt-1 opacity-60">
                Feedback will be shared with the team if the proposal is finalized.
            </p>
          </div>

          <DialogFooter className="pt-4 border-t border-muted-foreground/10 gap-2">
             <Button type="button" variant="ghost" className="text-xs" onClick={() => setOpen(false)} disabled={loading}>
                Dismiss
             </Button>
             <Button type="submit" disabled={loading} className="min-w-[150px] font-black uppercase tracking-widest text-[11px] h-11">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Finalize Scoring"}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
