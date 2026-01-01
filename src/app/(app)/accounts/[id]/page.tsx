
"use server"

import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Activity as ActivityIcon,
  Building2,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  Trash2,
  Plus,
  ChevronLeft,
  Contact as ContactIcon,
  Briefcase
} from "lucide-react"

import { getAccountById, getContactsByAccountId, getOpportunitiesByAccountId, getUsers, getActivitiesForAccount, getAccounts, getCommentsForAccount, addComment } from "@/lib/actions"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { OpportunityStage } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Account, Contact, Opportunity, User, Activity, Comment } from "@/lib/types"
import { EditAccountDialog } from "@/components/edit-account-dialog"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import { AddContactDialog } from "@/components/add-contact-dialog"
import { AddOpportunityDialog } from "@/components/add-opportunity-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Textarea } from "@/components/ui/textarea"

const stageVariant: Record<OpportunityStage, "default" | "secondary" | "destructive" | "outline"> = {
    'Prospecting': 'secondary',
    'Qualification': 'secondary',
    'Proposal': 'secondary',
    'Closing': 'secondary',
    'Won': 'default',
    'Lost': 'destructive'
}

const activityIcons: Record<Activity['type'], React.ReactNode> = {
    contact_created: <ContactIcon className="h-4 w-4" />,
    opportunity_created: <Briefcase className="h-4 w-4" />,
    account_created: <Plus className="h-4 w-4" />,
    lead_created: <Lightbulb className="h-4 w-4" />,
}

function getActivityDescription(activity: Activity) {
    switch (activity.type) {
        case 'account_created':
            return <>created this account</>;
        case 'contact_created':
            return <>added a new contact <span className="font-medium">{activity.details.name}</span></>;
        case 'opportunity_created':
            return <>created a new opportunity <span className="font-medium">{activity.details.name}</span> for ${activity.details.amount?.toLocaleString()}</>;
        default:
            return "performed an unknown action";
    }
}

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const accountId = parseInt(params.id, 10);
  if (isNaN(accountId)) {
    notFound();
  }

  const [account, accountContacts, accountOpportunities, users, activities, allAccounts, comments] = await Promise.all([
    getAccountById(accountId) as Promise<Account>,
    getContactsByAccountId(accountId) as Promise<Contact[]>,
    getOpportunitiesByAccountId(accountId) as Promise<Opportunity[]>,
    getUsers() as Promise<User[]>,
    getActivitiesForAccount(accountId) as Promise<Activity[]>,
    getAccounts() as Promise<Account[]>,
    getCommentsForAccount(accountId) as Promise<Comment[]>,
  ]);

  if (!account) {
    notFound()
  }

  const getOwnerById = (id: number | null) => {
      // The user ID from the backend is a number, but the mock user ID is a string.
      // This will need to be reconciled once we have a real user API.
      return users.find(user => id !== null && parseInt(user.id) === id);
  }

  const owner = getOwnerById(account.ownerId);
  const addCommentAction = addComment.bind(null, 'Account', accountId);

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
            <Link href="/accounts">
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
            </Link>
            <h1 className="text-2xl font-bold">Accounts / {account.name}</h1>
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            New
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <AddContactDialog accounts={allAccounts} accountId={account.id} as="menuitem" />
                        <AddOpportunityDialog accounts={allAccounts} users={users} accountId={account.id} as="menuitem" />
                        <AddTaskDialog as="menuitem" relatedToType="Account" relatedToId={account.id} />
                    </DropdownMenuContent>
                </DropdownMenu>
                 <EditAccountDialog account={account} users={users} as="button" />
            </div>
        </div>

        <Tabs defaultValue="activity">
          <TabsList className="mb-4">
            <TabsTrigger value="activity">
              <ActivityIcon className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <ContactIcon className="mr-2 h-4 w-4" />
              Contacts ({accountContacts.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              <Briefcase className="mr-2 h-4 w-4" />
              Opportunities ({accountOpportunities.length})
            </TabsTrigger>
             <TabsTrigger value="comments">
              <MessageSquare className="mr-2 h-4 w-4" />
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="attachments">
              <Paperclip className="mr-2 h-4 w-4" />
              Attachments
            </TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
             <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     {activities.length > 0 ? activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                            <div className="p-2 bg-muted rounded-full h-fit">
                                {activityIcons[activity.type] || <ActivityIcon className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">{activity.user.name}</span> {getActivityDescription(activity)}
                                </p>
                                <time className="text-xs text-muted-foreground">
                                    {new Date(activity.createdAt).toLocaleString()}
                                </time>
                            </div>
                        </div>
                     )) : (
                        <div className="text-center text-muted-foreground py-10">
                            No activity yet.
                        </div>
                     )}
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="contacts">
            <Card>
                <CardHeader><CardTitle>Contacts</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accountContacts.map(contact => (
                                <TableRow key={contact.id}>
                                    <TableCell>{contact.name}</TableCell>
                                    <TableCell>{contact.email}</TableCell>
                                    <TableCell>{contact.phone}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="opportunities">
            <Card>
                <CardHeader><CardTitle>Opportunities</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Close Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accountOpportunities.map(opp => (
                                <TableRow key={opp.id}>
                                    <TableCell>{opp.name}</TableCell>
                                    <TableCell><Badge variant={opp.stage ? stageVariant[opp.stage] : 'secondary'}>{opp.stage}</Badge></TableCell>
                                    <TableCell>${opp.amount?.toLocaleString()}</TableCell>
                                    <TableCell>{opp.closeDate ? new Date(opp.closeDate).toLocaleDateString() : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-md">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">{account.name}</CardTitle>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <DeleteAccountDialog accountId={account.id} as="button" />
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
                    <span className="text-muted-foreground">Industry</span>
                    <span>{account.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contacts</span>
                    <span>{accountContacts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created At</span>
                    <span>{new Date(account.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Account Owner</span>
                    {owner ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={owner.avatarUrl || ''} />
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
