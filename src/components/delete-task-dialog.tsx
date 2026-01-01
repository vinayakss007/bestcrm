
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
import { deleteTask } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Button } from "./ui/button"
import { Trash2 } from "lucide-react"

interface DeleteTaskDialogProps {
  taskId: number;
  as?: "button" | "menuitem";
}

export function DeleteTaskDialog({ taskId, as = "menuitem" }: DeleteTaskDialogProps) {
  const { toast } = useToast()

  async function handleDelete() {
    try {
      await deleteTask(taskId)
      toast({
        title: "Success",
        description: "Task has been deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task. Please try again.",
      })
    }
  }

  const Trigger = as === 'button'
    ? <Button variant="destructive" size="icon" className="ml-auto"><Trash2 className="h-4 w-4" /></Button>
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
            This action cannot be undone. This will permanently delete the task.
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
