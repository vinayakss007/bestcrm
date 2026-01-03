
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle } from "lucide-react"

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { User, CreateAssignmentRuleDto } from "@/lib/types"
import { createAssignmentRule } from "@/lib/actions"
import { assignmentRuleObjects } from "@/lib/types"

const ruleSchema = z.object({
  object: z.enum(assignmentRuleObjects),
  conditionField: z.string().min(1, "Condition field is required"),
  conditionValue: z.string().min(1, "Condition value is required"),
  assignToId: z.string({ required_error: "Please select a user to assign to." }),
})

type RuleFormValues = z.infer<typeof ruleSchema>

interface AssignmentRuleDialogProps {
  users: User[]
}

export function AssignmentRuleDialog({ users }: AssignmentRuleDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      object: "Lead",
      conditionField: "source",
    },
  })

  async function onSubmit(data: RuleFormValues) {
    const ruleData: CreateAssignmentRuleDto = {
        ...data,
        assignToId: parseInt(data.assignToId, 10),
    };
    
    try {
        await createAssignmentRule(ruleData);
        toast({ title: "Success", description: "New assignment rule created." })
        form.reset()
        setOpen(false)
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Could not create assignment rule."
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Rule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Assignment Rule</DialogTitle>
              <DialogDescription>
                Define the conditions for automatic assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="object"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Object</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select an object" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Opportunity">Opportunity</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-sm font-medium">When a {form.watch("object")} is created and:</p>
              <div className="flex items-center gap-2">
                <FormField control={form.control} name="conditionField" render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormControl><Input placeholder="Field (e.g. source)" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <span>equals</span>
                <FormField control={form.control} name="conditionValue" render={({ field }) => (
                    <FormItem className="flex-1">
                       <FormControl><Input placeholder="Value (e.g. 'Website')" {...field} /></FormControl>
                       <FormMessage />
                    </FormItem>
                )} />
              </div>
               <p className="text-sm font-medium">Then assign to:</p>
               <FormField
                control={form.control}
                name="assignToId"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {users.map(user => <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Create Rule</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
