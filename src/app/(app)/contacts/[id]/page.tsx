
"use client"

import { notFound } from "next/navigation"
import {
  Activity,
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react"

import { contacts, users } from "@/lib/data"
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
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const contact = contacts.find((c) => c.id === params.id)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(true)

  if (!contact) {
    notFound()
  }

  const administrator = users[0];

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
                        <DropdownMenuItem>Task</DropdownMenuItem>
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
                                <p className="text-sm font-medium">{administrator.name} created this contact</p>
                                <p className="text-xs text-muted-foreground">4 days ago</p>
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account</span>
                    <Link href={`/accounts/${contact.accountId}`} className="text-primary hover:underline">{contact.accountName}</Link>
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
