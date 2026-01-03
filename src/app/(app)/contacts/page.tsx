

import { MoreHorizontal, ArrowUpDown, Filter, RefreshCw } from "lucide-react"
import Link from "next/link"
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

import { getContacts, getAccounts } from "@/lib/actions"
import { AddContactDialog } from "@/components/add-contact-dialog"
import { Pagination } from "@/components/pagination"
import type { Contact, Account } from "@/lib/types"
import { EditContactDialog } from "@/components/edit-contact-dialog"
import { DeleteContactDialog } from "@/components/delete-contact-dialog"
import { SearchInput } from "@/components/search-input"

type SearchParams = { 
  query?: string,
  page?: string,
  limit?: string,
}

export default async function ContactsPage({ searchParams }: { searchParams: SearchParams }) {
  const { 
    query = '', 
    page = '1',
    limit = '10',
  } = searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const currentLimit = parseInt(limit, 10) || 10;

  const [{ data: contacts, total }, accounts]: [{ data: Contact[], total: number }, Account[]] = await Promise.all([
    getContacts({ query, page: currentPage, limit: currentLimit }),
    getAccounts(),
  ]);
  
  const accountMap = new Map(accounts.map(acc => [acc.id, acc.name]));


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Contacts</h1>
        <SearchInput placeholder="Search contacts..." />
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
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Has Phone Number
                </DropdownMenuCheckboxItem>
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
                <DropdownMenuItem>Account</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          <AddContactDialog accounts={accounts} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Contacts</CardTitle>
          <CardDescription>
            A list of all contacts in your CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">
                  Phone
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
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                     <Link href={`/contacts/${contact.id}`} className="hover:underline">
                        {contact.name}
                     </Link>
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {contact.phone}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     <Link href={`/accounts/${contact.account?.id}`} className="hover:underline">
                        {contact.account?.name || 'N/A'}
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
                        <EditContactDialog contact={contact} accounts={accounts} />
                        <DeleteContactDialog contactId={contact.id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
            <Pagination
                page={currentPage}
                limit={currentLimit}
                total={total}
            />
        </CardFooter>
      </Card>
    </div>
  )
}
