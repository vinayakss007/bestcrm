
"use server"

import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Activity,
  Archive,
  ChevronLeft,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  User,
} from "lucide-react"

import { getLeadById, getUsers, getComments, addComment, getAttachments } from "@/lib/actions"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { Lead, User as TUser, Comment, Attachment } from "@/lib/types"
import { ConvertLeadDialog } from "@/components/convert-lead-dialog"
import { DeleteLeadDialog } from "@/components/delete-lead-dialog"
import { EditLeadDialog } from "@/components/edit-lead-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { FileUploader } from "@/components/file-uploader"
import { AttachmentsList } from "@/components/attachments-list"

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const leadId = parseInt(params.id, 10);
  if (isNaN(leadId)) {
    notFound();
  }

  const [lead, users, comments, attachments] = await Promise.all([
    getLeadById(leadId),
    getUsers() as Promise<TUser[]>,
    getComments('Lead', leadId),
    getAttachments('Lead', leadId) as Promise<Attachment[]>,
  ]);

  if (!lead) {
    notFound()
  }

  const owner = lead.owner;
  const addCommentAction = addComment.bind(null, 'Lead', leadId);

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
             <Link href="/leads">
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
            </Link>
            <h1 className="text-2xl font-bold">Leads / {lead.name}</h1>
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            New
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => console.log("Email")}>Email</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => console.log("Call")}>Call</DropdownMenuItem>
                        <AddTaskDialog as="menuitem" relatedToType="Lead" relatedToId={lead.id} />
                    </DropdownMenuContent>
                </DropdownMenu>
                <EditLeadDialog lead={lead} users={users} as="button" />
                <ConvertLeadDialog lead={lead} />
            </div>
        </div>

        <Tabs defaultValue="activity">
          <TabsList className="mb-4">
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="mr-2 h-4 w-4" />
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="mr-2 h-4 w-4" />
              Emails
            </TabsTrigger>
             <TabsTrigger value="tasks">
              <User className="mr-2 h-4 w-4" />
              Tasks
            </TabsTrigger>
             <TabsTrigger value="notes">
              <Archive className="mr-2 h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="attachments">
              <Paperclip className="mr-2 h-4 w-4" />
              Attachments ({attachments.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
             <Card>
                <CardHeader>
                    <CardTitle>Activity</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="text-center text-muted-foreground py-10">
                        No activity to display for this lead.
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="comments">
            <Card>
                <CardHeader>
                    <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form action={addCommentAction}>
                        <Textarea name="content" placeholder="Add a comment..."/>
                        <Button className="mt-2">Save Comment</Button>
                    </form>
                    <Separator />
                    <div className="space-y-6">
                        {comments.map((comment: Comment) => (
                            <div key={comment.id} className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarImage src={comment.user?.avatarUrl || undefined} />
                                    <AvatarFallback>{comment.user?.name.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium">{comment.user?.name || 'Unknown User'}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm mt-1">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && <p className="text-muted-foreground text-center py-4">No comments yet.</p>}
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="emails">
            <p className="text-muted-foreground text-center py-8">No emails yet.</p>
          </TabsContent>
          <TabsContent value="tasks">
            <p className="text-muted-foreground text-center py-8">No tasks yet.</p>
          </TabsContent>
           <TabsContent value="notes">
            <p className="text-muted-foreground text-center py-8">No notes yet.</p>
          </TabsContent>
           <TabsContent value="attachments">
            <Card>
                <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FileUploader entityType="Lead" entityId={leadId} />
                    <Separator />
                    <AttachmentsList attachments={attachments} />
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
              <Avatar className="h-12 w-12">
                 <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{lead.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{lead.email}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="icon" onClick={() => console.log('Email lead')}>
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => console.log('Call lead')}>
                <Phone className="h-4 w-4" />
              </Button>
              <div className="ml-auto">
                <DeleteLeadDialog leadId={lead.id} as="button" />
              </div>
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
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Source</span>
                    <span>{lead.source}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Lead Owner</span>
                    {owner ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={owner.avatarUrl || undefined} />
                            <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{owner.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
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
