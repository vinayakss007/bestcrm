
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
import { createContact } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import type { Account } from "@/lib/types"
import { DropdownMenuItem } from "./ui/dropdown-menu"

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  accountId: z.string({ required_error: "Please select an account." }),
})

type ContactFormValues = z.infer<typeof contactSchema>

interface AddContactDialogProps {
    accounts: Account[];
    accountId?: number; // Optional accountId for pre-selection
    as?: "button" | "menuitem";
}

export function AddContactDialog({ accounts, accountId, as = "button" }: AddContactDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      accountId: accountId ? String(accountId) : undefined,
    },
  })
  
  React.useEffect(() => {
    if (accountId) {
      form.setValue("accountId", String(accountId));
    }
  }, [accountId, form]);


  async function onSubmit(data: ContactFormValues) {
    const contactData = {
      ...data,
      accountId: parseInt(data.accountId),
    }
    
    try {
      await createContact(contactData)
      toast({
        title: "Success",
        description: `Contact "${data.name}" has been created.`,
      })
      form.reset()
      setOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create contact. Please try again.",
      })
    }
  }
  
  const Trigger = as === "button" ? (
    <Button size="sm" className="h-8 gap-1">
      <PlusCircle className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        Add Contact
      </span>
    </Button>
  ) : (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>New Contact</DropdownMenuItem>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {Trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new contact.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="123-456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!accountId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={String(account.id)}>
                            {account.name}
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
                {form.formState.isSubmitting ? "Creating..." : "Create Contact"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
