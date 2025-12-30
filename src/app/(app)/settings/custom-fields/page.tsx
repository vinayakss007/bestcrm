"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"

const objects = [
  { value: "lead", label: "Lead" },
  { value: "account", label: "Account" },
  { value: "contact", label: "Contact" },
  { value: "opportunity", label: "Opportunity" },
];

const standardFields: Record<string, { label: string; name: string; type: string }[]> = {
  lead: [
    { label: "Lead Name", name: "name", type: "Text" },
    { label: "Email", name: "email", type: "Email" },
    { label: "Status", name: "status", type: "Picklist" },
    { label: "Source", name: "source", type: "Text" },
  ],
  account: [
    { label: "Account Name", name: "name", type: "Text" },
    { label: "Industry", name: "industry", type: "Text" },
    { label: "Created At", name: "createdAt", type: "Date" },
  ],
  contact: [
      { label: "Contact Name", name: "name", type: "Text" },
      { label: "Email", name: "email", type: "Email" },
      { label: "Phone", name: "phone", type: "Phone" },
  ],
  opportunity: [
      { label: "Opportunity Name", name: "name", type: "Text" },
      { label: "Stage", name: "stage", type: "Picklist" },
      { label: "Amount", name: "amount", type: "Currency" },
      { label: "Close Date", name: "closeDate", type: "Date" },
  ]
};

const dataTypes = ["Text", "Number", "Date", "Picklist", "Checkbox"];

export default function CustomFieldsPage() {
  const [selectedObject, setSelectedObject] = React.useState("lead");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>
            Add and manage custom fields for your CRM objects.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Field
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Custom Field</DialogTitle>
              <DialogDescription>
                Define a new field for the {objects.find(o => o.value === selectedObject)?.label} object.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="field-label" className="text-right">
                  Field Label
                </Label>
                <Input id="field-label" placeholder="e.g. Priority" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="field-name" className="text-right">
                  Field Name
                </Label>
                <Input id="field-name" placeholder="e.g. priority__c" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-type" className="text-right">
                  Data Type
                </Label>
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a data type" />
                    </SelectTrigger>
                    <SelectContent>
                        {dataTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
             <div className="flex justify-end">
                <Button onClick={() => setIsDialogOpen(false)}>Save Field</Button>
             </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-sm">
          <Label>CRM Object</Label>
          <Select value={selectedObject} onValueChange={setSelectedObject}>
            <SelectTrigger>
              <SelectValue placeholder="Select an object" />
            </SelectTrigger>
            <SelectContent>
              {objects.map((obj) => (
                <SelectItem key={obj.value} value={obj.value}>
                  {obj.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="border rounded-lg">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Field Label</TableHead>
                <TableHead>Field Name</TableHead>
                <TableHead>Data Type</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {standardFields[selectedObject]?.map((field) => (
                    <TableRow key={field.name}>
                        <TableCell className="font-medium">{field.label}</TableCell>
                        <TableCell>{field.name}</TableCell>
                        <TableCell>{field.type}</TableCell>
                    </TableRow>
                ))}
                 <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        No custom fields yet.
                    </TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  )
}
