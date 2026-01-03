
"use server"

import { notFound } from "next/navigation"
import {
  Activity,
  Briefcase,
  ChevronLeft,
  DollarSign,
  Mail,
  Paperclip,
  Calendar,
  Plus,
  MessageSquare,
} from "lucide-react"

import { getOpportunityById, getUsers, getAccounts, getCommentsForOpportunity, addComment, getAttachments } from "@/lib/actions"
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
import type { OpportunityStage, Opportunity, User, Account, Comment, Attachment } from "@/lib/types"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditOpportunityDialog } from "@/components/edit-opportunity-dialog"
import { DeleteOpportunityDialog } from "@/components/delete-opportunity-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "@/components/file-uploader"
import { AttachmentsList } from "@/components/attachments-list"

const stageVariant: Record<OpportunityStage, "default" | "secondary" | "destructive" | "outline"> = {
    'Prospecting': 'secondary',
    'Qualification': 'secondary',
    'Proposal': 'secondary',
    'Closing': 'secondary',
    'Won': 'default',
    'Lost': 'destructive'
}

export default async function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const opportunityId = parseInt(params.id, 10);
  if (isNaN(opportunityId)) {
    notFound();
  }
  
  const [opportunity, users, accounts, comments, attachments] = await Promise.all([
    getOpportunityById(opportunityId),
    getUsers() as Promise<User[]>,
    getAccounts() as Promise<Account[]>,
    getCommentsForOpportunity(opportunityId) as Promise<Comment[]>,
    getAttachments('Opportunity', opportunityId) as Promise<Attachment[]>,
  ]);

  if (!opportunity) {
    notFound()
  }

  const addCommentAction = addComment.bind(null, 'Opportunity', opportunityId);


  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
             <Link href="/opportunities">
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
            </Link>
            <h1 className="text-2xl font-bold">Opportunities / {opportunity.name}</h1>
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            New
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <AddTaskDialog as="menuitem" relatedToType="Opportunity" relatedToId={opportunity.id} />
                        <DropdownMenuItem onSelect={() => console.log("Log a call")}>Log a Call</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                 <EditOpportunityDialog opportunity={opportunity} accounts={accounts} users={users} as="button" />
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
                        No activity to display for this opportunity.
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
                        {comments.map(comment => (
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
           <TabsContent value="attachments">
            <Card>
                <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FileUploader entityType="Opportunity" entityId={opportunityId} />
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
               <div className="p-3 bg-muted rounded-md">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">{opportunity.name}</CardTitle>
                <Link href={`/accounts/${opportunity.accountId}`} className="text-sm text-primary hover:underline">{opportunity.account.name}</Link>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="icon" onClick={() => console.log('Email')}>
                <Mail className="h-4 w-4" />
              </Button>
              <DeleteOpportunityDialog opportunityId={opportunity.id} as="button" />
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
                    <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" /> Amount</span>
                    <span>${opportunity.amount?.toLocaleString()}</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4" /> Stage</span>
                    {opportunity.stage && <Badge variant={stageVariant[opportunity.stage]}>{opportunity.stage}</Badge>}
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Close Date</span>
                    <span>{opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Opportunity Owner</span>
                    {opportunity.owner ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={opportunity.owner.avatarUrl || undefined} />
                                <AvatarFallback>{opportunity.owner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{opportunity.owner.name}</span>
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
