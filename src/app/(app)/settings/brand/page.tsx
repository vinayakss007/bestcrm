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
        <CardTitle>Brand</CardTitle>
        <CardDescription>
          Manage your company's branding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="brand-name">Brand Name</Label>
            <Input id="brand-name" placeholder="Acme Inc." className="max-w-sm" />
            <p className="text-sm text-muted-foreground">
              This name will be displayed throughout the application.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Brand Logo</Label>
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  Upload
                </Button>
                <p className="text-xs text-muted-foreground">
                  Appears in the left sidebar.
                  <br />
                  Recommended size: 32x32 px, PNG or SVG.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Favicon</Label>
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  Upload
                </Button>
                <p className="text-xs text-muted-foreground">
                  Appears in your browser tab.
                  <br />
                  Recommended size: 32x32 px, PNG or ICO.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save</Button>
      </CardFooter>
    </Card>
  )
}