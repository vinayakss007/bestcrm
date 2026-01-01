
"use client"

import * as React from "react"
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
import { useToast } from "@/hooks/use-toast"

const initialActions = {
  "add-lead": true,
  "add-contact": true,
  "add-opportunity": true,
  "add-task": true,
  "run-report": false,
}

export default function HomeActionsSettingsPage() {
  const { toast } = useToast()
  const [actions, setActions] = React.useState(initialActions)

  const handleCheckedChange = (id: keyof typeof initialActions, checked: boolean) => {
    setActions(prev => ({ ...prev, [id]: checked }))
  }
  
  const handleSaveChanges = () => {
    toast({
        title: "Settings Saved",
        description: "Your home page actions have been updated.",
    })
  }

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
                <Checkbox 
                    id="add-lead" 
                    checked={actions["add-lead"]}
                    onCheckedChange={(checked) => handleCheckedChange("add-lead", !!checked)}
                />
                <Label htmlFor="add-lead">Add Lead</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox 
                    id="add-contact" 
                    checked={actions["add-contact"]}
                    onCheckedChange={(checked) => handleCheckedChange("add-contact", !!checked)}
                />
                <Label htmlFor="add-contact">Add Contact</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox 
                    id="add-opportunity" 
                    checked={actions["add-opportunity"]}
                    onCheckedChange={(checked) => handleCheckedChange("add-opportunity", !!checked)}
                />
                <Label htmlFor="add-opportunity">Add Opportunity</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox 
                    id="add-task" 
                    checked={actions["add-task"]}
                    onCheckedChange={(checked) => handleCheckedChange("add-task", !!checked)}
                />
                <Label htmlFor="add-task">Add Task</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox 
                    id="run-report" 
                    checked={actions["run-report"]}
                    onCheckedChange={(checked) => handleCheckedChange("run-report", !!checked)}
                />
                <Label htmlFor="run-report">Run Report</Label>
            </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
