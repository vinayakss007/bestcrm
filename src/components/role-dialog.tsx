
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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import type { Role, Permission } from "@/lib/types"
import { createRole, updateRole } from "@/lib/actions"
import { DropdownMenuItem } from "./ui/dropdown-menu"

const roleSchema = z.object({
  name: z.string().min(2, { message: "Role name must be at least 2 characters." }),
  description: z.string().optional(),
  permissionIds: z.array(z.number()).optional(),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface RoleDialogProps {
  role?: Role
  permissions: Permission[]
  as?: "button" | "menuitem"
}

export function RoleDialog({ role, permissions, as = "button" }: RoleDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()
  
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      permissionIds: role?.permissions?.map(p => p.permissionId) || [],
    },
  })

  // Reset form when dialog opens with new data
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: role?.name || "",
        description: role?.description || "",
        permissionIds: role?.permissions?.map(p => p.permissionId) || [],
      });
    }
  }, [open, role, form]);


  async function onSubmit(data: RoleFormValues) {
    try {
      if (role) {
        await updateRole(role.id, data)
        toast({ title: "Success", description: "Role has been updated." })
      } else {
        await createRole(data)
        toast({ title: "Success", description: "New role has been created." })
      }
      form.reset()
      setOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred.",
      })
    }
  }

  const groupedPermissions = permissions.reduce((acc, p) => {
    const group = p.key.split(':')[0];
    if (!acc[group]) {
        acc[group] = [];
    }
    acc[group].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const isEditing = !!role;

  const Trigger = as === "button" ? (
    <Button size="sm" className="h-8 gap-1">
      <PlusCircle className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        Add Role
      </span>
    </Button>
  ) : (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {Trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Role" : "Create New Role"}</DialogTitle>
              <DialogDescription>
                {isEditing ? `Update the details for the ${role.name} role.` : "Define a new role for your organization."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sales Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Can manage sales team opportunities" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="permissionIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">Permissions</FormLabel>
                    </div>
                    <ScrollArea className="h-72 w-full rounded-md border p-4">
                        <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([group, perms]) => (
                                <div key={group}>
                                    <h4 className="font-medium capitalize mb-2">{group}</h4>
                                    <div className="space-y-2 pl-2">
                                        {perms.map((p) => (
                                            <FormField
                                                key={p.id}
                                                control={form.control}
                                                name="permissionIds"
                                                render={({ field }) => {
                                                return (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                            checked={field.value?.includes(p.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                ? field.onChange([...(field.value || []), p.id])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value) => value !== p.id
                                                                    )
                                                                    )
                                                            }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal">
                                                            {p.description}
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Create Role")}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
