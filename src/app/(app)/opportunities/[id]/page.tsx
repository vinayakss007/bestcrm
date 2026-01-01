
"use server"

import { notFound } from "next/navigation"
import {
  Activity,
  Archive,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  DollarSign,
  Mail,
  Paperclip,
  Trash2,
  Calendar,
  Plus,
} from "lucide-react"

import { getOpportunityById, getUsers } from "@/lib/actions"
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
import type { OpportunityStage, Opportunity, User } from "@/lib/types"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const stageVariant: Record<OpportunityStage, "default" | "secondary" | "destructive" | "outline"> = {
    'Prospecting': 'secondary',
    'Qualification': 'secondary',
    'Proposal': 'secondary',
    'Closing': 'secondary',
    'Won': 'default',
    'Lost': 'destructive'
}

export default async function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const [opportunity, users] = await Promise.all([
    getOpportunityById(params.id) as Promise<Opportunity | null>,
    getUsers() as Promise<User[]>,
  ]);

  if (!opportunity) {
    notFound()
  }

  const administrator = users[0];

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
                        <DropdownMenuItem>New Task</DropdownMenuItem>
                        <DropdownMenuItem>Log a Call</DropdownMenuItem>
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
            <TabsTrigger value="emails">
              <Mail className="mr-2 h-4 w-4" />
              Emails
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
                                <p className="text-sm font-medium">{administrator.name} created this opportunity</p>
                                <p className="text-xs text-muted-foreground">{new Date(opportunity.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="emails">
            <p className="text-muted-foreground text-center py-8">No emails yet.</p>
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
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
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

    