
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
import { getActivities } from "@/lib/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Activity } from "@/lib/types"

function getActivityDescription(activity: Activity) {
    switch (activity.type) {
        case 'account_created':
            return <>created account <span className="font-medium">{activity.details.name}</span></>;
        case 'contact_created':
            return <>added a new contact <span className="font-medium">{activity.details.name}</span> to account <span className="font-medium">{activity.details.accountName}</span></>;
        case 'opportunity_created':
            return <>created a new opportunity <span className="font-medium">{activity.details.name}</span> for account <span className="font-medium">{activity.details.accountName}</span></>;
        case 'lead_created':
             return <>created a new lead <span className="font-medium">{activity.details.name}</span></>;
        default:
            // This is a failsafe for any new, unhandled activity types.
             const details = JSON.stringify(activity.details);
             return <>performed action <span className="font-medium">{activity.type}</span> with details: {details}</>;
    }
}


export default async function AuditLogPage() {
  const activities: Activity[] = await getActivities();

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
              <TableHead className="hidden md:table-cell">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                        No activities logged yet.
                    </TableCell>
                </TableRow>
            )}
            {activities.map((log) => {
              const user = log.user;
              if (!user) return null;

              return (
                <TableRow key={log.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.name} data-ai-hint="person face" />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{getActivityDescription(log)}</TableCell>
                  <TableCell className="hidden md:table-cell">{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
