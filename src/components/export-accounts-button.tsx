
"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { exportAccountsToCsv, getJobStatus } from "@/lib/actions"
import { Upload } from "lucide-react"
import { Button } from "./ui/button"

export function ExportAccountsButton() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    toast({
      title: "Export Started",
      description: "Your account data is being prepared. The download will begin automatically.",
    })
    
    try {
      const { jobId } = await exportAccountsToCsv();
      
      // Poll for job status
      const pollJob = async () => {
        try {
          const statusResult = await getJobStatus(jobId);

          if (statusResult.status === 'completed') {
            const csvData = statusResult.data;
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `accounts-export-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
              title: "Export Complete",
              description: "Your accounts have been downloaded.",
            });
            setIsExporting(false);
          } else if (statusResult.status === 'failed') {
             toast({
              variant: "destructive",
              title: "Export Failed",
              description: statusResult.reason || "Could not export accounts.",
            });
            setIsExporting(false);
          } else {
            // If still processing, poll again after a delay
            setTimeout(pollJob, 2000);
          }
        } catch (pollError) {
           console.error("Polling failed:", pollError);
           toast({
              variant: "destructive",
              title: "Export Failed",
              description: "Could not check export status. Please try again later.",
            });
            setIsExporting(false);
        }
      };
      
      setTimeout(pollJob, 2000);

    } catch (error) {
      console.error("Export failed:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not start export process. Please try again later.",
      })
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport} disabled={isExporting}>
        <Upload className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {isExporting ? "Exporting..." : "Export"}
        </span>
    </Button>
  )
}
