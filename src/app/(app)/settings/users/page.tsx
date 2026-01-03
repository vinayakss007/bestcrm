
import { MoreHorizontal, KeyRound } from "lucide-react"
import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"
import { impersonateUser } from "@/lib/actions"

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
import { getUsers } from "@/lib/actions"
import type { User, Role } from "@/lib/types"
import { InviteUserDialog } from "@/components/invite-user-dialog"
import { Button } from "@/components/ui/button"

type AuthenticatedUser = {
    userId: number;
    email: string;
    organizationId: number;
    role: Role;
}

export default async function UsersSettingsPage() {
  const token = cookies().get("token")?.value;
  let currentUser: AuthenticatedUser | null = null;
  if (token) {
      currentUser = jwtDecode(token);
  }

  const users: User[] = await getUsers();
  const isSuperAdmin = currentUser?.role?.name === 'super-admin';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage your team members and their roles.
          </CardDescription>
        </div>
        <InviteUserDialog />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              {isSuperAdmin && <TableHead>Organization</TableHead>}
              <TableHead className="hidden md:table-cell">
                Created At
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} data-ai-hint="person face" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.role.name}</TableCell>
                {isSuperAdmin && <TableCell>{user.organization.name || 'N/A'}</TableCell>}
                <TableCell className="hidden md:table-cell">
                  {new Date(user.createdAt).toLocaleDateString()}
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
                      <DropdownMenuItem>Edit Role</DropdownMenuItem>
                      {isSuperAdmin && user.id !== currentUser?.userId && (
                        <form action={impersonateUser.bind(null, user.id)}>
                            <button type="submit" className="w-full">
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Impersonate
                                </DropdownMenuItem>
                            </button>
                        </form>
                      )}
                      <DropdownMenuItem>Deactivate User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

      
