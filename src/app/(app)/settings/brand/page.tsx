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
import { Upload } from "lucide-react"

export default function BrandSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand settings</CardTitle>
        <CardDescription>
          Configure your brand name, logo, and favicon for a cohesive identity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="brand-name">Brand name</Label>
          <Input id="brand-name" placeholder="Enter brand name" className="max-w-sm" />
          <p className="text-xs text-muted-foreground">
            This name will be displayed throughout the application.
          </p>
        </div>
        
        <div className="space-y-4">
            <Label>Brand logo</Label>
            <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center">
                        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Button variant="outline" size="sm">Upload</Button>
                    <p className="text-xs text-muted-foreground">
                        Appears in the left sidebar.
                        <br />
                        Recommended size: 32x32 px, PNG or SVG.
                    </p>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <Label>Favicon</Label>
            <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center">
                        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Button variant="outline" size="sm">Upload</Button>
                    <p className="text-xs text-muted-foreground">
                        Appears in your browser tab.
                        <br />
                        Recommended size: 32x32 px, PNG or ICO.
                    </p>
                </div>
            </div>
        </div>

      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
