
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
import { getAccounts, getLeads, getOpportunities, getOpportunityForecast, getActivities } from "@/lib/actions"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Lead, Opportunity, Account, OpportunityStage, Activity as TActivity } from "@/lib/types"
import { format, getMonth, parseISO } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
}

function getActivityDescription(activity: TActivity) {
    switch (activity.type) {
        case 'account_created':
            return <>created account <span className="font-medium">{activity.details.name}</span></>;
        case 'contact_created':
            return <>added a new contact <span className="font-medium">{activity.details.name}</span> to account <span className="font-medium">{activity.details.accountName}</span></>;
        case 'opportunity_created':
            return <>created a new opportunity <span className="font-medium">{activity.details.name}</span> for account <span className="font-medium">{activity.details.accountName}</span></>;
        case 'lead_created':
             return <>created a new lead <span className="font-medium">{activity.details.name}</span></>;
        default:
            return "performed an unknown action";
    }
}

export default async function Dashboard() {
    const [leads, opportunities, accounts, forecastData, activities]: [Lead[], Opportunity[], Account[], Record<number, number>, TActivity[]] = await Promise.all([
      getLeads(),
      getOpportunities(),
      getAccounts(),
      getOpportunityForecast(),
      getActivities(),
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
                   {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={activity.user?.avatarUrl || undefined} alt={activity.user.name} />
                                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{activity.user.name}</span>{' '}
                                        {getActivityDescription(activity)}
                                    </p>
                                    <time className="text-xs text-muted-foreground">
                                        {new Date(activity.createdAt).toLocaleString()}
                                    </time>
                                </div>
                            </div>
                        ))
                   ) : (
                     <div className="text-center text-muted-foreground py-10">
                        No recent activity.
                    </div>
                   )}
                </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
