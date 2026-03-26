"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileText, PlusCircle, Loader2, UploadCloud } from "lucide-react"
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
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  fileUrl: z.string().url("Please provide a valid URL for the business plan file").or(z.string().length(0)),
})

type Props = {
  teamId: string
  teamName: string
}

export function SubmitProposalModal({ teamId, teamName }: Props) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      fileUrl: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          teamId,
        }),
      })

      if (!response.ok) throw new Error("Failed to create proposal")

      toast.success("Proposal draft created successfully!")
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast.error("Error creating proposal")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Proposal
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-card">
        <DialogHeader>
           <div className="bg-primary/10 text-primary w-fit p-3 rounded-full mb-2">
              <FileText className="h-6 w-6" />
           </div>
          <DialogTitle className="text-2xl font-bold">New Innovation Proposal</DialogTitle>
          <DialogDescription>
            Submit your core concept for <span className="font-semibold text-foreground underline decoration-primary/40 underline-offset-2">{teamName}</span>. 
            You can keep this as a draft before final submission.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest opacity-70">Proposal Title</Label>
            <Input
              id="title"
              placeholder="e.g. Smart Grid Optimization Phase 1"
              {...form.register("title")}
              className="bg-muted/30 border-none h-11 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest opacity-70">Executive Summary</Label>
            <textarea
              id="description"
              placeholder="A brief overview of your innovation..."
              {...form.register("description")}
              className="flex min-h-[100px] w-full rounded-md border-none bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fileUrl" className="text-xs font-bold uppercase tracking-widest opacity-70">Business Plan / Poster URL</Label>
            <div className="relative group">
               <UploadCloud className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
               <Input
                  id="fileUrl"
                  placeholder="https://drive.google.com/your-file"
                  {...form.register("fileUrl")}
                  className="bg-muted/30 border-none h-11 pl-10 focus-visible:ring-2 focus-visible:ring-primary/20"
               />
            </div>
            {form.formState.errors.fileUrl && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.fileUrl.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[140px] font-bold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
