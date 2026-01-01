
import { MoreHorizontal, ArrowUpDown, Columns3, Filter, Upload, ListFilter, RefreshCw } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
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

import { getLeads, getUsers } from "@/lib/actions"
import type { Lead, LeadStatus, User } from "@/lib/types"
import { AddLeadDialog } from "@/components/add-lead-dialog"
// import { Pagination } from "@/components/pagination"
import { EditLeadDialog } from "@/components/edit-lead-dialog"
import { DeleteLeadDialog } from "@/components/delete-lead-dialog"
import { SearchInput } from "@/components/search-input"

const statusVariant: Record<LeadStatus, "default" | "secondary" | "destructive" | "outline"> = {
    'New': 'default',
    'Contacted': 'secondary',
    'Qualified': 'outline',
    'Lost': 'destructive'
}

export default async function LeadsPage({ searchParams }: { searchParams: { query?: string } }) {
  const query = searchParams.query || '';
  const leads: Lead[] = await getLeads(query);
  const users: User[] = await getUsers();

  const getOwnerById = (id: number | null) => {
      // The user ID from the backend is a number, but the mock user ID is a string.
      return users.find(user => id !== null && parseInt(user.id) === id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Leads</h1>
        <SearchInput placeholder="Search leads..." />
        <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                    </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem>New</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Contacted</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Qualified</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Sort
                    </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Name</DropdownMenuItem>
                <DropdownMenuItem>Source</DropdownMenuItem>
                <DropdownMenuItem>Owner</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <AddLeadDialog users={users} />
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
              {leads.map((lead) => {
                const owner = getOwnerById(lead.ownerId);
                return (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link href={`/leads/${lead.id}`} className="hover:underline">
                      {lead.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {lead.status && <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {lead.source}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {lead.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     {owner ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={owner.avatarUrl || ''} alt={owner.name} data-ai-hint="person face" />
                                <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{owner.name}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                    )}
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
                        <EditLeadDialog lead={lead} users={users} />
                        <DropdownMenuItem>Convert to Opportunity</DropdownMenuItem>
                        <DeleteLeadDialog leadId={lead.id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
            {/* <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            /> */}
        </CardFooter>
      </Card>
    </div>
  )
}
