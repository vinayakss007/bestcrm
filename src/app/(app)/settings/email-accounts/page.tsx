import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Mail, Plus } from "lucide-react"

export default function EmailAccountsSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Accounts</CardTitle>
        <CardDescription>
          Connect your email accounts to send and receive emails within the CRM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground mt-4">No Email Accounts Connected</h3>
          <p className="text-sm text-muted-foreground mt-2">Connect your first email account to get started.</p>
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button disabled>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
