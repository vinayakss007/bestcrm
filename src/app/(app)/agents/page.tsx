import { MoreHorizontal } from "lucide-react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Placeholder data for agents
const agents = [
  {
    id: "agent-1",
    name: "Agent Smith",
    email: "smith@example.com",
    role: "Admin",
    lastActivity: "2 hours ago",
    avatarUrl: "https://picsum.photos/seed/agent1/100/100",
  },
  {
    id: "agent-2",
    name: "Agent Brown",
    email: "brown@example.com",
    role: "User",
    lastActivity: "5 hours ago",
    avatarUrl: "https://picsum.photos/seed/agent2/100/100",
  },
   {
    id: "agent-3",
    name: "Agent Jones",
    email: "jones@example.com",
    role: "User",
    lastActivity: "1 day ago",
    avatarUrl: "https://picsum.photos/seed/agent3/100/100",
  }
];


export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Agents</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* Add Agent Dialog can be created here */}
           <Button size="sm" className="h-8 gap-1">
            Add Agent
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Team Agents</CardTitle>
          <CardDescription>
            Manage your team of agents and their roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">
                  Last Activity
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                          <AvatarImage src={agent.avatarUrl} alt={agent.name} data-ai-hint="person face" />
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <span className="font-medium">{agent.name}</span>
                        <span className="text-xs text-muted-foreground">{agent.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{agent.role}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {agent.lastActivity}
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
