
"use server"

import { MoreHorizontal } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { getRoles, getPermissions } from "@/lib/actions"
import type { Role, Permission } from "@/lib/types"
import { RoleDialog } from "@/components/role-dialog"
import { DeleteRoleDialog } from "@/components/delete-role-dialog"

export default async function RolesSettingsPage() {
  const [roles, permissions]: [Role[], Permission[]] = await Promise.all([
    getRoles(),
    getPermissions(),
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>
            Define roles and manage what users can see and do in your CRM.
          </CardDescription>
        </div>
        <RoleDialog permissions={permissions} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">
                  {role.name}
                  {role.isSystemRole && <span className="ml-2 text-xs text-muted-foreground">(System)</span>}
                </TableCell>
                <TableCell>{role.permissions?.length || 0} assigned</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-haspopup="true"
                        size="icon"
                        variant="ghost"
                        disabled={role.isSystemRole}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <RoleDialog role={role} permissions={permissions} as="menuitem" />
                      <DeleteRoleDialog roleId={role.id} />
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
