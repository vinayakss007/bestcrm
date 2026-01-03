
"use client"

import * as React from "react"
import { MoreHorizontal, Trash2 } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AssignmentRule, User } from "@/lib/types"
import { deleteAssignmentRule } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

function DeleteRuleDialog({ ruleId }: { ruleId: number }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteAssignmentRule(ruleId)
      toast({ title: "Success", description: "Assignment rule deleted." })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not delete rule.",
      })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            assignment rule.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export function AssignmentRulesTable({ rules, users }: { rules: AssignmentRule[], users: User[] }) {
    if (rules.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold text-muted-foreground">
          No Assignment Rules Created
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Get started by creating a new rule.
        </p>
      </div>
    )
  }

  const getUser = (id: number) => users.find(u => u.id === id);

  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Object</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Assign To</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rules.map(rule => {
                    const assignedUser = getUser(rule.assignToId);
                    return (
                        <TableRow key={rule.id}>
                            <TableCell className="font-medium capitalize">{rule.object}</TableCell>
                            <TableCell><span className="font-mono bg-muted p-1 rounded-sm text-xs">{rule.conditionField} = &quot;{rule.conditionValue}&quot;</span></TableCell>
                            <TableCell>
                                {assignedUser ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={assignedUser.avatarUrl || ''} />
                                            <AvatarFallback>{assignedUser.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{assignedUser.name}</span>
                                    </div>
                                ) : 'N/A'}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DeleteRuleDialog ruleId={rule.id} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    </div>
  )
}
