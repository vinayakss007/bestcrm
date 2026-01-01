
"use server"

import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Activity,
  Archive,
  Building2,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  Trash2,
  Users,
  Plus,
  ChevronLeft,
} from "lucide-react"

import { getAccountById, getContactsByAccountId, getOpportunitiesByAccountId, getUsers } from "@/lib/actions"
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
import type { Account, Contact, Opportunity, User } from "@/lib/types"

const stageVariant: Record<OpportunityStage, "default" | "secondary" | "destructive" | "outline"> = {
    'Prospecting': 'secondary',
    'Qualification': 'secondary',
    'Proposal': 'secondary',
    'Closing': 'secondary',
    'Won': 'default',
    'Lost': 'destructive'
}

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const [account, accountContacts, accountOpportunities, users] = await Promise.all([
    getAccountById(params.id) as Promise<Account>,
    getContactsByAccountId(params.id) as Promise<Contact[]>,
    getOpportunitiesByAccountId(params.id) as Promise<Opportunity[]>,
    getUsers() as Promise<User[]>,
  ]);

  if (!account) {
    notFound()
  }

  const getOwnerById = (id: number | null) => {
      // The user ID from the backend is a number, but the mock user ID is a string.
      return users.find(user => id !== null && parseInt(user.id) === id);
  }

  const owner = getOwnerById(account.ownerId);

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
                        <DropdownMenuItem>New Contact</DropdownMenuItem>
                        <DropdownMenuItem>New Opportunity</DropdownMenuItem>
                        <DropdownMenuItem>New Task</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                 <Button>Edit</Button>
            </div>
        </div>

        <Tabs defaultValue="activity">
          <TabsList className="mb-4">
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Users className="mr-2 h-4 w-4" />
              Contacts ({accountContacts.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              <MessageSquare className="mr-2 h-4 w-4" />
              Opportunities ({accountOpportunities.length})
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
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="text-center text-muted-foreground py-10">
                        Activity feed coming soon.
                    </div>
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
              <Button variant="destructive" size="icon" className="ml-auto">
                <Trash2 className="h-4 w-4" />
              </Button>
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
                                <AvatarImage src={owner.avatarUrl} />
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
