
"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { deleteLead } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

interface DeleteLeadDialogProps {
  leadId: number
}

export function DeleteLeadDialog({ leadId }: DeleteLeadDialogProps) {
  const { toast } = useToast()

  async function handleDelete() {
    try {
      await deleteLead(leadId)
      toast({
        title: "Success",
        description: "Lead has been deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete lead. Please try again.",
      })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the lead as deleted. It won't be permanently removed,
            but it will be hidden from view.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
