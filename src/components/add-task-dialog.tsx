
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createTask, getUsers, getAccounts, getContacts, getLeads, getOpportunities } from "@/lib/actions"
import { taskStatuses, relatedToTypes } from "@/lib/types"
import type { User, Account, Contact, Lead, Opportunity, RelatedToType } from "@/lib/types"

const taskSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  status: z.enum(taskStatuses, { required_error: "Please select a status." }),
  dueDate: z.date({ required_error: "A due date is required." }),
  assignedToId: z.string({ required_error: "Please select a user." }),
  relatedToType: z.enum(relatedToTypes).optional(),
  relatedToId: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

type RelatedData = {
    users: User[];
    accounts: Account[];
    contacts: Contact[];
    leads: Lead[];
    opportunities: Opportunity[];
}

export function AddTaskDialog() {
  const [open, setOpen] = React.useState(false)
  const [relatedData, setRelatedData] = React.useState<RelatedData | null>(null);
  const { toast } = useToast()
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      status: "Pending",
    },
  })

  React.useEffect(() => {
    if (open) {
        Promise.all([
            getUsers(),
            getAccounts(),
            getContacts(),
            getLeads(),
            getOpportunities()
        ]).then(([users, accounts, contacts, leads, opportunities]) => {
            setRelatedData({ users, accounts, contacts, leads, opportunities });
        });
    }
  }, [open]);

  const relatedToType = form.watch("relatedToType")

  async function onSubmit(data: TaskFormValues) {
    const taskData = {
        ...data,
        dueDate: data.dueDate.toISOString(),
        assignedToId: parseInt(data.assignedToId),
        relatedToId: data.relatedToId ? parseInt(data.relatedToId) : undefined,
    }
    try {
        await createTask(taskData);
        toast({
            title: "Success",
            description: "Task has been created.",
        })
        form.reset()
        setOpen(false)
    } catch(e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create task. Please try again.",
        })
    }
  }

  const getRelatedToOptions = () => {
    if (!relatedData) return [];
    switch (relatedToType) {
      case 'Account':
        return relatedData.accounts;
      case 'Contact':
        return relatedData.contacts;
      case 'Lead':
        return relatedData.leads;
      case 'Opportunity':
        return relatedData.opportunities;
      default:
        return [];
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Task
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Follow up with..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taskStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relatedData?.users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="relatedToType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relatedToTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="relatedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>&nbsp;</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!relatedToType}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getRelatedToOptions().map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creating..." : "Create Task"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
