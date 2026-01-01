
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
import type { Lead } from "@/lib/types"
import { convertLead } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenuItem } from "./ui/dropdown-menu"

const convertLeadSchema = z.object({
  accountName: z.string().min(2, { message: "Account name must be at least 2 characters." }),
  opportunityName: z.string().min(2, { message: "Opportunity name must be at least 2 characters." }),
})

type ConvertLeadFormValues = z.infer<typeof convertLeadSchema>

interface ConvertLeadDialogProps {
  lead: Lead
  as?: "button" | "menuitem"
}

export function ConvertLeadDialog({ lead, as = "button" }: ConvertLeadDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<ConvertLeadFormValues>({
    resolver: zodResolver(convertLeadSchema),
    defaultValues: {
      accountName: `${lead.name}'s Company`,
      opportunityName: `${lead.name} - New Deal`,
    },
  })

  async function onSubmit(data: ConvertLeadFormValues) {
    try {
      await convertLead(lead.id, data)
      toast({
        title: "Success",
        description: `Lead "${lead.name}" has been converted.`,
      })
      form.reset()
      setOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to convert lead. Please try again.",
      })
    }
  }

  const Trigger = as === "button" ? Button : DropdownMenuItem;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trigger onSelect={as === 'menuitem' ? (e) => e.preventDefault() : undefined}>
          {as === 'button' ? 'Convert to Deal' : 'Convert to Opportunity'}
        </Trigger>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Convert Lead: {lead.name}</DialogTitle>
              <DialogDescription>
                Create a new Account, Contact, and Opportunity from this lead.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Account Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="opportunityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Opportunity Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Converting..." : "Convert"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
