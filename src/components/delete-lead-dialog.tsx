
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
import { Button } from "./ui/button"
import { Trash2 } from "lucide-react"

interface DeleteLeadDialogProps {
  leadId: number
  as?: "button" | "menuitem"
}

export function DeleteLeadDialog({ leadId, as = "menuitem" }: DeleteLeadDialogProps) {
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
  
  const Trigger = as === 'button' 
    ? <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
    : <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>;


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {Trigger}
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
