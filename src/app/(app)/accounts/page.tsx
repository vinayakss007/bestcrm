
"use client"

import * as React from "react"
import { MoreHorizontal, ArrowUpDown, Columns3, Filter, Upload, ListFilter, RefreshCw } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddAccountDialog } from "@/components/add-account-dialog"
import { getAccounts } from "@/lib/actions"
import { Pagination } from "@/components/pagination"
import type { Account } from "@/lib/types"

export default function AccountsPage() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    getAccounts().then((allAccounts) => {
      setTotal(allAccounts.length);
      const paginatedAccounts = allAccounts.slice((page - 1) * pageSize, page * pageSize);
      setAccounts(paginatedAccounts);
    });
  }, [page, pageSize]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Accounts</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Inactive
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
                <DropdownMenuItem>Industry</DropdownMenuItem>
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
          <AddAccountDialog />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Accounts</CardTitle>
          <CardDescription>
            Manage your customer accounts and view their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead className="hidden md:table-cell">
                  Contacts
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Owner
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Created at
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    <Link href={`/accounts/${account.id}`} className="hover:underline">
                      {account.name}
                    </Link>
                  </TableCell>
                  <TableCell>{account.industry}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {account.contactsCount}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={account.owner.avatarUrl} alt={account.owner.name} data-ai-hint="person face" />
                            <AvatarFallback>{account.owner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{account.owner.name}</span>
                     </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(account.createdAt).toLocaleDateString()}
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
                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            />
        </CardFooter>
      </Card>
    </div>
  )
}
