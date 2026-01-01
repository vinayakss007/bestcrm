
"use server"

import { notFound } from "next/navigation"
import {
  Activity,
  ChevronLeft,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
} from "lucide-react"

import { getContactById, getUsers, getAccounts, getCommentsForContact, addComment } from "@/lib/actions"
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
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Contact, User, Account, Comment } from "@/lib/types"
import { EditContactDialog } from "@/components/edit-contact-dialog"
import { DeleteContactDialog } from "@/components/delete-contact-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Textarea } from "@/components/ui/textarea"

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const contactId = parseInt(params.id, 10);
  if (isNaN(contactId)) {
    notFound();
  }

  const [contact, users, accounts, comments] = await Promise.all([
    getContactById(params.id) as Promise<Contact | null>,
    getUsers() as Promise<User[]>,
    getAccounts() as Promise<Account[]>,
    getCommentsForContact(contactId) as Promise<Comment[]>,
  ]);

  if (!contact) {
    notFound()
  }

  // Assuming the first user is the creator for mock purposes.
  const administrator = users[0];
  const addCommentAction = addComment.bind(null, 'Contact', contactId);

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
            <Link href="/contacts">
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
            </Link>
            <h1 className="text-2xl font-bold">Contacts / {contact.name}</h1>
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            New
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Email</DropdownMenuItem>
                        <DropdownMenuItem>Call</DropdownMenuItem>
                        <AddTaskDialog as="menuitem" relatedToType="Contact" relatedToId={contact.id} />
                    </DropdownMenuContent>
                </DropdownMenu>
                 <EditContactDialog contact={contact} accounts={accounts} as="button" />
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
                            <AvatarImage src={administrator.avatarUrl || undefined} />
                            <AvatarFallback>{administrator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">{administrator.name} created this contact</p>
                                <p className="text-xs text-muted-foreground">{new Date(contact.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
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
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                 <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{contact.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{contact.email}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <DeleteContactDialog contactId={contact.id} as="button" />
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
                    <span className="text-muted-foreground">Account</span>
                    <Link href={`/accounts/${contact.accountId}`} className="text-primary hover:underline">{contact.account?.name}</Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{contact.phone}</span>
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
