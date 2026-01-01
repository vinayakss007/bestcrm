
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function ForecastingSettingsPage() {
  const { toast } = useToast()
  const [isForecastingEnabled, setIsForecastingEnabled] = React.useState(true)
  const [forecastPeriod, setForecastPeriod] = React.useState<"monthly" | "quarterly">("quarterly")
  const [confidenceThreshold, setConfidenceThreshold] = React.useState("70")

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved",
      description: "Your forecasting settings have been updated.",
    })
  }

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
          <Switch 
            id="enable-forecasting" 
            checked={isForecastingEnabled}
            onCheckedChange={setIsForecastingEnabled}
          />
        </div>

        <div className="space-y-2">
            <Label>Forecast Period</Label>
            <p className="text-xs text-muted-foreground pb-2">
                Set the default time frame for forecast reporting.
            </p>
            <div className="flex items-center gap-4">
                <Button 
                    variant={forecastPeriod === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setForecastPeriod('monthly')}
                >
                    Monthly
                </Button>
                <Button 
                    variant={forecastPeriod === 'quarterly' ? 'default' : 'outline'}
                    onClick={() => setForecastPeriod('quarterly')}
                >
                    Quarterly
                </Button>
            </div>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
             <p className="text-xs text-muted-foreground pb-2">
                Only include opportunities with a confidence level above this threshold in forecasts.
            </p>
            <Input 
                id="confidence-threshold" 
                type="number" 
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(e.target.value)}
                className="max-w-xs" 
            />
        </div>

      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
