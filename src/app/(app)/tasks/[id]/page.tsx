
"use server"

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

import { getTasks, getUsers, getAccounts, getContacts, getOpportunities, getLeads, updateTask } from "@/lib/actions"
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
import { Badge } from "@/components/ui/badge"
import type { Task, TaskStatus, User, Account, Contact, Opportunity, Lead } from "@/lib/types"
import Link from "next/link"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { DeleteTaskDialog } from "@/components/delete-task-dialog"

const statusVariant: Record<TaskStatus, "default" | "secondary"> = {
    'Completed': 'default',
    'Pending': 'secondary'
}

type RelatedEntity = Account | Contact | Opportunity | Lead;

const getRelatedLink = (task: Task, relatedEntity: RelatedEntity | undefined) => {
    if (!task.relatedToType || !relatedEntity) return "#";
    
    switch (task.relatedToType) {
        case "Account":
            return `/accounts/${relatedEntity.id}`
        case "Contact":
            return `/contacts/${relatedEntity.id}`
        case "Opportunity":
            return `/opportunities/${relatedEntity.id}`
        case "Lead":
            return `/leads/${relatedEntity.id}`
        default:
            return "#"
    }
}

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const [
    allTasks, 
    allUsers, 
    allAccounts, 
    allContacts, 
    allOpportunities, 
    allLeads
  ] = await Promise.all([
    getTasks(),
    getUsers(),
    getAccounts(),
    getContacts(),
    getLeads(),
    getOpportunities(),
  ]);

  const task = allTasks.find((t: Task) => t.id === parseInt(params.id))
  
  if (!task) {
    notFound()
  }

  const administrator = allUsers.find((u: User) => u.id === '1'); // Mock creator

  const getRelatedEntity = (task: Task): RelatedEntity | undefined => {
    if (!task.relatedToType || !task.relatedToId) return undefined;

    switch (task.relatedToType) {
        case 'Account': return allAccounts.find((e: Account) => e.id === task.relatedToId);
        case 'Contact': return allContacts.find((e: Contact) => e.id === task.relatedToId);
        case 'Opportunity': return allOpportunities.find((e: Opportunity) => e.id === task.relatedToId);
        case 'Lead': return allLeads.find((e: Lead) => e.id === task.relatedToId);
        default: return undefined;
    }
  }

  const relatedEntity = getRelatedEntity(task);
  const relatedLink = getRelatedLink(task, relatedEntity);
  const markTaskCompleteAction = updateTask.bind(null, task.id, { status: 'Completed' });

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
                 <EditTaskDialog task={task} />
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
                    {administrator && (
                     <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarImage src={administrator.avatarUrl} />
                            <AvatarFallback>{administrator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">{administrator.name} created this task</p>
                                <p className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    )}
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
              <form action={markTaskCompleteAction}>
                <Button variant="outline" disabled={task.status === 'Completed'}>
                    Mark as Complete
                </Button>
              </form>
              <DeleteTaskDialog taskId={task.id} as="button" />
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <Collapsible open={true}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Details</h4>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3 py-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Status</span>
                    {task.status && <Badge variant={statusVariant[task.status]}>{task.status}</Badge>}
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Due Date</span>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                   {relatedEntity && (
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Related To</span>
                        <Link href={relatedLink} className="text-primary hover:underline">
                            {relatedEntity.name}
                        </Link>
                    </div>
                   )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assigned To</span>
                    {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={task.assignedTo.avatarUrl || undefined} />
                                <AvatarFallback>{task.assignedTo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{task.assignedTo.name}</span>
                        </div>
                    ) : <span className="text-muted-foreground">Unassigned</span>}
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
