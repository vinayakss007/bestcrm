import { MoreHorizontal, ArrowUpDown, Columns3, Filter, Upload, ListFilter, RefreshCw } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { leads } from "@/lib/data"
import type { LeadStatus } from "@/lib/types"
import { AddLeadDialog } from "@/components/add-lead-dialog"

const statusVariant: Record<LeadStatus, "default" | "secondary" | "destructive" | "outline"> = {
    'New': 'default',
    'Contacted': 'secondary',
    'Qualified': 'outline',
    'Lost': 'destructive'
}

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Leads</h1>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Filter
                </span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Sort
                </span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1">
                <Columns3 className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Columns
                </span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        <span className="sr-only">More</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Upload className="mr-2 h-4 w-4" />
                        Export
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <ListFilter className="mr-2 h-4 w-4" />
                        Customize quick filters
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddLeadDialog />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales Leads</CardTitle>
          <CardDescription>
            Manage and track your potential customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Source
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Email
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Owner
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link href={`/leads/${lead.id}`} className="hover:underline">
                      {lead.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {lead.source}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {lead.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={lead.owner.avatarUrl} alt={lead.owner.name} data-ai-hint="person face"/>
                            <AvatarFallback>{lead.owner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{lead.owner.name}</span>
                     </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Convert to Opportunity</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
