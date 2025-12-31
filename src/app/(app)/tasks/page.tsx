
"use client"

import * as React from "react"
import { MoreHorizontal, ArrowUpDown, Columns3, Filter, Upload, ListFilter, RefreshCw, Search, CalendarIcon } from "lucide-react"
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

import { getTasks } from "@/lib/actions"
import { Task, TaskStatus } from "@/lib/types"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Pagination } from "@/components/pagination"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const statusVariant: Record<TaskStatus, "default" | "secondary"> = {
    'Completed': 'default',
    'Pending': 'secondary'
}

export default function TasksPage() {
  const [allTasks, setAllTasks] = React.useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = React.useState<Task[]>([]);
  const [paginatedTasks, setPaginatedTasks] = React.useState<Task[]>([]);
  
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    // Set the initial date on the client to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      setSelectedDate(new Date());
    }
    
    getTasks().then((tasks) => {
      setAllTasks(tasks);
    });
  }, []);

  React.useEffect(() => {
    let tasks = allTasks;
    if (selectedDate) {
      tasks = allTasks.filter(task => {
        const taskDueDate = new Date(task.dueDate);
        return taskDueDate.toDateString() === selectedDate.toDateString();
      });
    }
    setFilteredTasks(tasks);
    setPage(1); // Reset to first page on filter change
  }, [allTasks, selectedDate]);

  React.useEffect(() => {
    const paginated = filteredTasks.slice((page - 1) * pageSize, page * pageSize);
    setPaginatedTasks(paginated);
  }, [filteredTasks, page, pageSize]);

  return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
           <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              />
          </div>
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                  </span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Sort
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
                  </DropdownMenuContent>
              </DropdownMenu>
            <AddTaskDialog />
          </div>
        </div>
        <Card className="flex flex-col flex-1">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>
              {selectedDate 
                ? `Tasks due on ${selectedDate.toLocaleDateString()}` 
                : "Manage your tasks and activities."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Due Date
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Assigned To
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Related To
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                       <Link href={`/tasks/${task.id}`} className="hover:underline">
                          {task.title}
                       </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assignedTo.avatarUrl} alt={task.assignedTo.name} data-ai-hint="person face" />
                              <AvatarFallback>{task.assignedTo.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{task.assignedTo.name}</span>
                       </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {task.relatedTo.name}
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
                          <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No tasks for this date.
              </div>
            )}
          </CardContent>
          {filteredTasks.length > 0 && (
            <CardFooter>
              <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={filteredTasks.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
              />
            </CardFooter>
          )}
        </Card>
      </div>

    