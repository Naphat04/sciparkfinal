"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  proposalId: string
}

export function SubmitProposalAction({ proposalId }: Props) {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleFinalSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SUBMIT" }),
      })

      if (!response.ok) throw new Error("Failed to submit proposal")

      toast.success("Proposal submitted for evaluation!")
      router.refresh()
    } catch (error) {
       toast.error("Error submitting proposal")
       console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      size="xs" 
      variant="outline" 
      className="text-[10px] h-6 px-3 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all font-bold gap-1.5"
      onClick={handleFinalSubmit}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <>
          <Send className="h-3 w-3" />
          Submit Final
        </>
      )}
    </Button>
  )
}
