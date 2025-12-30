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
import { Switch } from "@/components/ui/switch"

export default function ForecastingSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecasting</CardTitle>
        <CardDescription>
          Configure how your sales forecasts are calculated and displayed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="enable-forecasting" className="text-base">
              Enable Forecasting
            </Label>
            <p className="text-sm text-muted-foreground">
              Turn sales forecasting on or off for your entire organization.
            </p>
          </div>
          <Switch id="enable-forecasting" defaultChecked />
        </div>

        <div className="space-y-2">
            <Label>Forecast Period</Label>
            <p className="text-xs text-muted-foreground pb-2">
                Set the default time frame for forecast reporting.
            </p>
            <div className="flex items-center gap-4">
                <Button variant="outline">Monthly</Button>
                <Button variant="default">Quarterly</Button>
            </div>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
             <p className="text-xs text-muted-foreground pb-2">
                Only include opportunities with a confidence level above this threshold in forecasts.
            </p>
            <Input id="confidence-threshold" type="number" defaultValue="70" className="max-w-xs" />
        </div>

      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
