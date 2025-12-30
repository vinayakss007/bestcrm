import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FileText, Plus } from "lucide-react"

export default function EmailTemplatesSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
        <CardDescription>
          Create and manage reusable email templates for your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground mt-4">No Email Templates Created</h3>
          <p className="text-sm text-muted-foreground mt-2">Get started by creating your first template.</p>
          <Button className="mt-4">
             <Plus className="mr-2 h-4 w-4" />
            Create Template</Button>
        </div>
      </CardContent>
       <CardFooter className="border-t px-6 py-4">
        <Button disabled>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
