

import { MoreHorizontal } from "lucide-react"
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
import { getInvoices, getLeads } from "@/lib/actions"
import type { Invoice, InvoiceStatus } from "@/lib/types"
import { AddInvoiceDialog } from "@/components/add-invoice-dialog"
import { DeleteInvoiceDialog } from "@/components/delete-invoice-dialog"

const statusVariant: Record<InvoiceStatus, "default" | "secondary" | "destructive" | "outline"> = {
    'Draft': 'secondary',
    'Sent': 'outline',
    'Paid': 'default',
    'Void': 'destructive'
}

export default async function InvoicesPage() {
  const invoices: Invoice[] = await getInvoices()
  const leads = await getLeads()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Invoices</h1>
        <div className="ml-auto flex items-center gap-2">
          <AddInvoiceDialog leads={leads} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Manage and track your invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                   <TableCell>
                    {invoice.lead?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    ${invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DeleteInvoiceDialog invoiceId={invoice.id} />
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
