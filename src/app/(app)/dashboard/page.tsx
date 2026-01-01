
"use server"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Briefcase, DollarSign, Lightbulb, Users, Activity, Plus, Edit, CalendarDays } from "lucide-react"
import { getAccounts, getLeads, getOpportunities, getOpportunityForecast } from "@/lib/actions"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Lead, Opportunity, Account, OpportunityStage } from "@/lib/types"
import { format, getMonth, parseISO } from "date-fns"


const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
}

export default async function Dashboard() {
    const [leads, opportunities, accounts, forecastData]: [Lead[], Opportunity[], Account[], Record<number, number>] = await Promise.all([
      getLeads(),
      getOpportunities(),
      getAccounts(),
      getOpportunityForecast(),
    ]);

  const totalRevenue = opportunities
    .filter((opp: Opportunity) => opp.stage === 'Won')
    .reduce((sum: number, opp: Opportunity) => sum + (opp.amount || 0), 0)
  
  const totalLeads = leads.length
  const totalOpportunities = opportunities.length
  const totalAccounts = accounts.length

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: format(new Date(0, i), 'MMM'),
    revenue: forecastData[i] || 0,
  }));


  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-8 gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>This Year</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
                        <DropdownMenuItem>This Quarter</DropdownMenuItem>
                        <DropdownMenuItem>This Year</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Edit className="h-3.5 w-3.5" />
                    <span>Customize</span>
                </Button>
                <Button size="sm" className="h-8 gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Widget</span>
                </Button>
            </div>
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                    ${totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                    Based on won opportunities
                    </p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leads</CardTitle>
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalLeads}</div>
                    <p className="text-xs text-muted-foreground">
                    + {leads.filter((l: Lead) => l.status === 'New').length} new this month
                    </p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalOpportunities}</div>
                    <p className="text-xs text-muted-foreground">
                    {opportunities.filter((o: Opportunity) => o.stage === 'Proposal' || o.stage === 'Closing').length} in pipeline
                    </p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accounts</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalAccounts}</div>
                    <p className="text-xs text-muted-foreground">
                    Total active accounts
                    </p>
                </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                <CardHeader>
                    <CardTitle>Revenue Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart data={chartData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => `$${Number(value) / 1000}k`}
                        />
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                        />
                        <Bar
                        dataKey="revenue"
                        fill="var(--color-revenue)"
                        radius={4}
                        />
                    </BarChart>
                    </ChartContainer>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Recent Activity</CardTitle>
                    </div>
                    <Activity className="ml-auto h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="grid gap-8">
                   <div className="text-center text-muted-foreground py-10">
                        Activity feed coming soon.
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
