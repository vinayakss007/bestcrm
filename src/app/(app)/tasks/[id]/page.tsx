
"use client"

import { notFound } from "next/navigation"
import {
  Activity,
  Archive,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  Paperclip,
  Trash2,
  Calendar,
} from "lucide-react"

import { tasks, users, accounts, contacts, opportunities } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import type { TaskStatus } from "@/lib/types"
import Link from "next/link"

const statusVariant: Record<TaskStatus, "default" | "secondary"> = {
    'Completed': 'default',
    'Pending': 'secondary'
}

const getRelatedLink = (task: typeof tasks[0]) => {
    switch (task.relatedTo.type) {
        case "Account":
            const account = accounts.find(a => a.name === task.relatedTo.name)
            return `/accounts/${account?.id}`
        case "Contact":
            const contact = contacts.find(c => c.name === task.relatedTo.name)
            return `/contacts/${contact?.id}`
        case "Opportunity":
             const opportunity = opportunities.find(o => o.name === task.relatedTo.name)
            return `/opportunities/${opportunity?.id}`
        default:
            return "#"
    }
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = tasks.find((t) => t.id === params.id)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(true)

  if (!task) {
    notFound()
  }
  
  const administrator = users[0];

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
            <Link href="/tasks">
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
            </Link>
            <h1 className="text-2xl font-bold">Tasks / {task.title}</h1>
            <div className="ml-auto flex items-center gap-2">
                 <Button>Edit</Button>
            </div>
        </div>

        <Tabs defaultValue="activity">
          <TabsList className="mb-4">
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
             <TabsTrigger value="notes">
              <Archive className="mr-2 h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="attachments">
              <Paperclip className="mr-2 h-4 w-4" />
              Attachments
            </TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
             <Card>
                <CardHeader>
                    <CardTitle>Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarImage src={administrator.avatarUrl} />
                            <AvatarFallback>{administrator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">{administrator.name} created this task</p>
                                <p className="text-xs text-muted-foreground">3 hours ago</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
               <div className="p-3 bg-muted rounded-md">
                <CheckSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">{task.title}</CardTitle>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline">Mark as Complete</Button>
              <Button variant="destructive" size="icon" className="ml-auto">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Details</h4>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="sr-only">Toggle</span>
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3 py-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Status</span>
                    <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Due Date</span>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Related To</span>
                    <Link href={getRelatedLink(task)} className="text-primary hover:underline">
                        {task.relatedTo.name}
                    </Link>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assigned To</span>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={task.assignedTo.avatarUrl} />
                            <AvatarFallback>{task.assignedTo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{task.assignedTo.name}</span>
                     </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
