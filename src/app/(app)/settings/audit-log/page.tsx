
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
import { getUsers } from "@/lib/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/lib/types"

const auditLogs = [
  {
    id: "log-1",
    userId: "1",
    action: "Updated opportunity 'Innovate Inc. - Website Redesign'",
    ipAddress: "192.168.1.101",
    timestamp: "2024-07-30 10:15 AM",
  },
  {
    id: "log-2",
    userId: "2",
    action: "Exported 25 contacts",
    ipAddress: "203.0.113.45",
    timestamp: "2024-07-30 09:45 AM",
  },
  {
    id: "log-3",
    userId: "1",
    action: "Logged in",
    ipAddress: "192.168.1.101",
    timestamp: "2024-07-30 09:00 AM",
  },
  {
    id: "log-4",
    userId: "3",
    action: "Deleted lead 'Cold Call Prospect'",
    ipAddress: "198.51.100.22",
    timestamp: "2024-07-29 03:20 PM",
  },
  {
    id: "log-5",
    userId: "system",
    action: "AI Agent 'Sales Inquiry Agent' created a new lead 'New Project Inquiry'",
    ipAddress: "127.0.0.1",
    timestamp: "2024-07-29 02:00 PM",
  },
];

export default async function AuditLogPage() {
  const users: User[] = await getUsers();
  const userMap = new Map(users.map(u => [String(u.id), u]));
  
  const systemUser = { id: 'system', name: 'System', email: 'system@internal', avatarUrl: '' };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>
          Track all user activities and system events that occur within the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden md:table-cell">IP Address</TableHead>
              <TableHead className="hidden md:table-cell">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => {
              const user = log.userId === 'system' ? systemUser : userMap.get(log.userId);
              if (!user) return null;

              return (
                <TableRow key={log.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person face" />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell className="hidden md:table-cell">{log.ipAddress}</TableCell>
                  <TableCell className="hidden md:table-cell">{log.timestamp}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
