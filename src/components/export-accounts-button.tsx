
"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { exportAccountsToCsv } from "@/lib/actions"
import { Upload } from "lucide-react"

export function ExportAccountsButton() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    toast({
      title: "Exporting...",
      description: "Your account data is being prepared for download.",
    })
    
    try {
      const csvData = await exportAccountsToCsv();
      
      // Create a blob from the CSV data
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      
      // Create a link element
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `accounts-export-${new Date().toISOString().split('T')[0]}.csv`);
      
      // Append the link to the body, click it, and then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Complete",
        description: "Your accounts have been downloaded.",
      })

    } catch (error) {
      console.error("Export failed:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not export accounts. Please try again later.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleExport} disabled={isExporting}>
      <Upload className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Export"}
    </DropdownMenuItem>
  )
}
