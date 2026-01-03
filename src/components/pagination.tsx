
"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  limit: number
  total: number
}

export function Pagination({
  page,
  limit,
  total,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageCount = Math.ceil(total / limit);

  const onPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  const onPageSizeChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('limit', newLimit);
    params.set('page', '1'); // Reset to first page
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex w-full items-center justify-between">
        <div className="text-sm text-muted-foreground">
            Showing{' '}
            <strong>
                {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)}
            </strong>{' '}
            of <strong>{total}</strong> records
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                value={`${limit}`}
                onValueChange={onPageSizeChange}
                >
                <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((size) => (
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
