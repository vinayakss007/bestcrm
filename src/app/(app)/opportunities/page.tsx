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

import { opportunities } from "@/lib/data"
import type { OpportunityStage } from "@/lib/types"
import { AddOpportunityDialog } from "@/components/add-opportunity-dialog"

const stageVariant: Record<OpportunityStage, "default" | "secondary" | "destructive" | "outline"> = {
    'Prospecting': 'secondary',
    'Qualification': 'secondary',
    'Proposal': 'secondary',
    'Closing': 'secondary',
    'Won': 'default',
    'Lost': 'destructive'
}

export default function OpportunitiesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Opportunities</h1>
        <div className="ml-auto flex items-center gap-2">
          <AddOpportunityDialog />
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
                  <TableCell className="font-medium">{opportunity.name}</TableCell>
                  <TableCell>
                    <Badge variant={stageVariant[opportunity.stage]}>{opportunity.stage}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    ${opportunity.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(opportunity.closeDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {opportunity.accountName}
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
      </Card>
    </div>
  )
}
