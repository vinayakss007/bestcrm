
"use server"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUsers } from "@/lib/actions"
import type { User } from "@/lib/types"

export default async function ProfileSettingsPage() {
  const users: User[] = await getUsers();
  const user = users[0] // For now, we'll just use the first user as the logged in user

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          This is how you'll appear to others on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user.name} className="max-w-sm" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} className="max-w-sm" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save</Button>
      </CardFooter>
    </Card>
  )
}
