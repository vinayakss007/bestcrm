
"use server"

import { MoreHorizontal, ArrowUpDown, Filter, Upload, RefreshCw, Search, Ellipsis } from "lucide-react"
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
import { getTasks, getUsers, updateTask } from "@/lib/actions"
import { Task, TaskStatus, User } from "@/lib/types"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Input } from "@/components/ui/input"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { DeleteTaskDialog } from "@/components/delete-task-dialog"

const statusVariant: Record<TaskStatus, "default" | "secondary"> = {
    'Completed': 'default',
    'Pending': 'secondary'
}

export default async function TasksPage() {
  const [tasks, users]: [Task[], User[]] = await Promise.all([getTasks(), getUsers()])
  
  const getOwnerById = (id: number | null) => {
      return users.find(user => id !== null && parseInt(user.id) === id);
  }

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
            <Button variant="outline" size="icon" className="h-8 w-8">
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <Ellipsis className="h-3.5 w-3.5" />
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
              Manage your tasks and activities.
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
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const assignedTo = getOwnerById(task.assignedToId);
                  const markTaskCompleteAction = updateTask.bind(null, task.id, { status: "Completed" });

                  return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                       <Link href={`/tasks/${task.id}`} className="hover:underline">
                          {task.title}
                       </Link>
                    </TableCell>
                    <TableCell>
                      {task.status && <Badge variant={statusVariant[task.status]}>{task.status}</Badge>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       {assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                              <AvatarImage src={assignedTo.avatarUrl || undefined} alt={assignedTo.name} data-ai-hint="person face" />
                              <AvatarFallback>{assignedTo.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{assignedTo.name}</span>
                       </div>
                       ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                       )}
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
                          <form action={markTaskCompleteAction} className="w-full">
                            <button type="submit" className="w-full">
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={task.status === 'Completed'}>
                                    Mark as Complete
                                </DropdownMenuItem>
                            </button>
                          </form>
                          <EditTaskDialog task={task} />
                          <DeleteTaskDialog taskId={task.id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
             {tasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No tasks found.
              </div>
            )}
          </CardContent>
          {tasks.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{tasks.length}</strong> of <strong>{tasks.length}</strong> tasks
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
  )
}
