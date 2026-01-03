

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
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getAccounts, getOpportunities, getUsers } from "@/lib/actions"
import type { Opportunity, OpportunityStage, Account, User } from "@/lib/types"
import { AddOpportunityDialog } from "@/components/add-opportunity-dialog"
import { EditOpportunityDialog } from "@/components/edit-opportunity-dialog"
import { DeleteOpportunityDialog } from "@/components/delete-opportunity-dialog"
import { SearchInput } from "@/components/search-input"

const stageVariant: Record<OpportunityStage, "default" | "secondary" | "destructive" | "outline"> = {
    'Prospecting': 'secondary',
    'Qualification': 'secondary',
    'Proposal': 'secondary',
    'Closing': 'secondary',
    'Won': 'default',
    'Lost': 'destructive'
}

export default async function OpportunitiesPage({ searchParams }: { searchParams: { query?: string, sort?: string, order?: 'asc' | 'desc' } }) {
  const query = searchParams.query || '';
  const sort = searchParams.sort || 'createdAt';
  const order = searchParams.order || 'desc';

  const opportunities: Opportunity[] = await getOpportunities(query, sort, order);
  const accounts: Account[] = await getAccounts();
  const users: User[] = await getUsers();


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Opportunities</h1>
        <SearchInput placeholder="Search opportunities..." />
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
                <DropdownMenuLabel>Filter by Stage</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem>Prospecting</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Qualification</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Proposal</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Closing</DropdownMenuCheckboxItem>
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
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href={`/opportunities?sort=name&order=asc`}>Name</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href={`/opportunities?sort=amount&order=desc`}>Amount</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href={`/opportunities?sort=closeDate&order=asc`}>Close Date</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          <AddOpportunityDialog accounts={accounts} users={users} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales Opportunities</CardTitle>
          <CardDescription>
            Track your sales pipeline and manage deals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="hidden md:table-cell">
                  Amount
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Close Date
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Account
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">
                     <Link href={`/opportunities/${opportunity.id}`} className="hover:underline">
                        {opportunity.name}
                     </Link>
                  </TableCell>
                  <TableCell>
                    {opportunity.stage && <Badge variant={stageVariant[opportunity.stage]}>{opportunity.stage}</Badge>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    ${opportunity.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link href={`/accounts/${opportunity.accountId}`} className="hover:underline">
                        {opportunity.account.name}
                    </Link>
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
                        <EditOpportunityDialog opportunity={opportunity} accounts={accounts} users={users} />
                        <DeleteOpportunityDialog opportunityId={opportunity.id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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
