
"use client"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAccounts, getLeads, getOpportunities, getRecentActivities } from "@/lib/actions"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const chartData = [
  { month: "January", revenue: 18600 },
  { month: "February", revenue: 30500 },
  { month: "March", revenue: 23700 },
  { month: "April", revenue: 7300 },
  { month: "May", revenue: 20900 },
  { month: "June", revenue: 21400 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
}

export default function Dashboard() {
    const [data, setData] = React.useState<{
        leads: Awaited<ReturnType<typeof getLeads>>;
        opportunities: Awaited<ReturnType<typeof getOpportunities>>;
        accounts: Awaited<ReturnType<typeof getAccounts>>;
        recentActivities: Awaited<ReturnType<typeof getRecentActivities>>;
    } | null>(null);

    React.useEffect(() => {
        Promise.all([
            getLeads(),
            getOpportunities(),
            getAccounts(),
            getRecentActivities()
        ]).then(([leads, opportunities, accounts, recentActivities]) => {
            setData({ leads, opportunities, accounts, recentActivities });
        });
    }, []);

  if (!data) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
    )
  }

  const { leads, opportunities, accounts, recentActivities } = data;

  const totalRevenue = opportunities
    .filter((opp) => opp.stage === 'Won')
    .reduce((sum, opp) => sum + opp.amount, 0)
  
  const totalLeads = leads.length
  const totalOpportunities = opportunities.length
  const totalAccounts = accounts.length

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-8 gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>Last 30 Days</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
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
                    + {leads.filter(l => l.status === 'New').length} new this month
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
                    {opportunities.filter(o => o.stage === 'Proposal' || o.stage === 'Closing').length} in pipeline
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
                        tickFormatter={(value) => value.slice(0, 3)}
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
                    {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4">
                            <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarImage src={activity.user.avatarUrl} alt="Avatar" data-ai-hint="person face" />
                                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">
                                {activity.user.name} <span className="font-normal text-muted-foreground">{activity.action}</span> {activity.target}
                                </p>
                                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
