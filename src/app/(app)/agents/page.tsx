import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Bot, Cpu, LineChart, Settings } from "lucide-react"

const aiAgents = [
  {
    id: "agent-1",
    name: "Sales Inquiry Agent",
    description: "Automatically qualifies new leads from web forms and chats.",
    icon: Bot,
    status: "Active",
    performance: "94% Accuracy",
  },
  {
    id: "agent-2",
    name: "Support Ticket Triage",
    description: "Categorizes and assigns incoming support tickets to the right team.",
    icon: Cpu,
    status: "Active",
    performance: "2m Avg. Response",
  },
  {
    id: "agent-3",
    name: "Opportunity Forecaster",
    description: "Analyzes pipeline data to predict quarterly revenue.",
    icon: LineChart,
    status: "Inactive",
    performance: "N/A",
  },
]

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          AI Agents
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1">
            Create New Agent
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {aiAgents.map((agent) => (
          <Card key={agent.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <div className="bg-muted p-3 rounded-md">
                        <agent.icon className="h-6 w-6 text-muted-foreground" />
                   </div>
                   <CardTitle>{agent.name}</CardTitle>
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    agent.status === "Active"
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      agent.status === "Active" ? "bg-green-600" : "bg-muted-foreground"
                    }`}
                  />
                  {agent.status}
                </div>
              </div>
              <CardDescription className="pt-2">{agent.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Performance</p>
                    <p>{agent.performance}</p>
                </div>
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-end gap-2 p-4">
              <Button variant="ghost" size="sm">
                <LineChart className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
