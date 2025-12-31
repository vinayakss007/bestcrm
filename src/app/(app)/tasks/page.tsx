
"use client"

import * as React from "react"
import { MoreHorizontal, ArrowUpDown, Columns3, Filter, Upload, ListFilter, RefreshCw, Search } from "lucide-react"
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

const statusVariant: Record<TaskStatus, "default" | "secondary"> = {
    'Completed': 'default',
    'Pending': 'secondary'
}

export default function TasksPage() {
  const [allTasks, setAllTasks] = React.useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = React.useState<Task[]>([]);
  const [paginatedTasks, setPaginatedTasks] = React.useState<Task[]>([]);
  
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  React.useEffect(() => {
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
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      {/* Left Column - Calendar */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="p-0"
              classNames={{
                root: "w-full",
                caption: "flex justify-between items-center px-4 pt-3",
                nav_button: "h-8 w-8",
                head_row: "grid grid-cols-7 gap-1 px-2",
                row: "grid grid-cols-7 gap-1 px-2 mt-2",
                day: "h-auto w-auto aspect-square p-1",
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Right Column - Tasks */}
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
            <AddTaskDialog />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>
              {selectedDate 
                ? `Tasks due on ${selectedDate.toLocaleDateString()}` 
                : "Manage your tasks and activities."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
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
    </div>
  )
}
