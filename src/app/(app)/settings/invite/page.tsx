
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send } from "lucide-react"

export default function InviteSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite User</CardTitle>
        <CardDescription>
          Invite a new user to join your team on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="name@company.com" className="max-w-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="company-admin">Company Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Send Invitation
        </Button>
      </CardFooter>
    </Card>
  )
}
