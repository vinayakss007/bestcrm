import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function HomeActionsSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Page Actions</CardTitle>
        <CardDescription>
          Customize the quick action buttons displayed on the main dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium">Visible Actions</p>
        <div className="space-y-3 pl-2">
            <div className="flex items-center space-x-2">
                <Checkbox id="add-lead" defaultChecked />
                <Label htmlFor="add-lead">Add Lead</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="add-contact" defaultChecked />
                <Label htmlFor="add-contact">Add Contact</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="add-opportunity" defaultChecked />
                <Label htmlFor="add-opportunity">Add Opportunity</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="add-task" defaultChecked />
                <Label htmlFor="add-task">Add Task</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="run-report" />
                <Label htmlFor="run-report">Run Report</Label>
            </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
