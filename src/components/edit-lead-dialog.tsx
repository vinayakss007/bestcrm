
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { leadStatus } from "@/lib/types"
import type { Lead, User } from "@/lib/types"
import { updateLead } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenuItem } from "./ui/dropdown-menu"

const leadSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  source: z.string().optional(),
  status: z.enum(leadStatus).optional(),
  ownerId: z.string().optional(),
})

type LeadFormValues = z.infer<typeof leadSchema>

interface EditLeadDialogProps {
    lead: Lead;
    users: User[];
    as?: "button" | "menuitem";
}

export function EditLeadDialog({ lead, users, as = "menuitem" }: EditLeadDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: lead.name,
      email: lead.email || "",
      source: lead.source || "",
      status: lead.status || "New",
      ownerId: lead.ownerId ? String(lead.ownerId) : undefined,
    },
  })

  async function onSubmit(data: LeadFormValues) {
    const leadData = {
        ...data,
        ownerId: data.ownerId ? parseInt(data.ownerId, 10) : undefined,
    }
    
    try {
        await updateLead(lead.id, leadData)
        toast({
            title: "Success",
            description: `Lead "${data.name}" has been updated.`,
        })
        form.reset(data)
        setOpen(false)
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update lead. Please try again.",
        })
    }
  }
  
  const Trigger = as === "button" ? Button : DropdownMenuItem;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trigger onSelect={as === "menuitem" ? (e) => e.preventDefault() : undefined}>
          Edit
        </Trigger>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
              <DialogDescription>
                Update the details for {lead.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Lead Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="e.g. john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Web Form" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                            {leadStatus.map((status) => (
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
                    name="ownerId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lead Owner</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an owner" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={String(user.id)}>
                                {user.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
