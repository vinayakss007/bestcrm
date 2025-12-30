import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AssignmentRulesSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Rules</CardTitle>
        <CardDescription>
          Automate lead and opportunity assignment to your team members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold text-muted-foreground">No Assignment Rules Created</h3>
          <p className="text-sm text-muted-foreground mt-2">Get started by creating a new rule.</p>
          <Button className="mt-4">Create Rule</Button>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
