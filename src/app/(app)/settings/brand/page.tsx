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
          Configure your brand name, logo, and favicon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="brand-name">Brand name</Label>
          <Input id="brand-name" placeholder="Enter brand name" />
        </div>
        
        <div className="space-y-2">
            <Label>Brand logo</Label>
            <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Appears in the left sidebar. Recommended size is 32x32 px in PNG or SVG</p>
                    <Button variant="outline" size="sm">Upload</Button>
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <Label>Favicon</Label>
            <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    </div>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Appears next to the title in your browser tab. Recommended size is 32x32 px in PNG or ICO</p>
                    <Button variant="outline" size="sm">Upload</Button>
                </div>
            </div>
        </div>

      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Update</Button>
      </CardFooter>
    </Card>
  )
}
