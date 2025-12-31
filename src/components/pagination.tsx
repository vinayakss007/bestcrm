
"use client"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pageCount = Math.ceil(total / pageSize)

  return (
    <div className="flex w-full items-center justify-between">
        <div className="text-sm text-muted-foreground">
            Showing{' '}
            <strong>
                {Math.min((page - 1) * pageSize + 1, total)}-{Math.min(page * pageSize, total)}
            </strong>{' '}
            of <strong>{total}</strong> records
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                    onPageSizeChange(Number(value))
                    onPageChange(1) // Reset to first page
                }}
                >
                <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                    {[5, 10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                        {size}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {page} of {pageCount}
            </div>
            <div className="flex items-center space-x-2">
                <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(1)}
                disabled={page === 1}
                >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(page + 1)}
                disabled={page === pageCount}
                >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(pageCount)}
                disabled={page === pageCount}
                >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
  )
}
