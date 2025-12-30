import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Cpu, Mail, Database } from "lucide-react"

const systemServices = [
  {
    name: "Database Connection",
    status: "Operational",
    description: "Primary Firestore database.",
    icon: Database,
  },
  {
    name: "AI Agent Service",
    status: "Operational",
    description: "Genkit flow processing.",
    icon: Cpu,
  },
  {
    name: "Email Service",
    status: "Degraded Performance",
    description: "Outbound email delivery (SendGrid).",
    icon: Mail,
  },
  {
    name: "Authentication Service",
    status: "Operational",
    description: "Firebase Authentication.",
    icon: CheckCircle2,
  },
];

export default function SystemStatusPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>
          Monitor the health and uptime of all critical system services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {systemServices.map((service) => (
          <div key={service.name} className="flex items-start gap-4 rounded-lg border p-4">
            <service.icon className="h-6 w-6 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{service.name}</p>
                 <div
                  className={`flex items-center gap-2 text-sm font-medium ${
                    service.status === "Operational"
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  {service.status === "Operational" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {service.status}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
