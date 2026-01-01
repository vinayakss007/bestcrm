
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const ruleSchema = z.object({
  object: z.enum(["lead", "opportunity"]),
  conditionField: z.string().min(1),
  conditionValue: z.string().min(1),
  assignTo: z.string().min(1),
})

type RuleFormValues = z.infer<typeof ruleSchema>
type AssignmentRule = RuleFormValues & { id: number }

const mockUsers = [
  { id: "1", name: "Alex Doe" },
  { id: "2", name: "Jane Smith" },
]

export default function AssignmentRulesSettingsPage() {
  const [rules, setRules] = React.useState<AssignmentRule[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      object: "lead",
      conditionField: "source",
      conditionValue: "Website",
    },
  })

  function onSubmit(data: RuleFormValues) {
    setRules((prev) => [...prev, { ...data, id: Date.now() }])
    toast({ title: "Success", description: "New assignment rule created." })
    setIsDialogOpen(false)
    form.reset()
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle>Assignment Rules</CardTitle>
            <CardDescription>
            Automate lead and opportunity assignment to your team members.
            </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Rule</Button>
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
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="opportunity">Opportunity</SelectItem>
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
                    name="assignTo"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {mockUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Rule</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold text-muted-foreground">No Assignment Rules Created</h3>
            <p className="text-sm text-muted-foreground mt-2">Get started by creating a new rule.</p>
          </div>
        ) : (
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
                        const assignedUser = mockUsers.find(u => u.id === rule.assignTo);
                        return (
                            <TableRow key={rule.id}>
                                <TableCell className="capitalize">{rule.object}</TableCell>
                                <TableCell><span className="font-mono bg-muted p-1 rounded-sm text-xs">{rule.conditionField} = &quot;{rule.conditionValue}&quot;</span></TableCell>
                                <TableCell>{assignedUser?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setRules(rules.filter(r => r.id !== rule.id))}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  )
}
