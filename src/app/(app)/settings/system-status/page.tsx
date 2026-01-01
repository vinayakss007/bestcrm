
"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Cpu, Mail, Database, Server } from "lucide-react"
import { getHealthCheck } from "@/lib/actions"

type ServiceStatus = "Operational" | "Degraded Performance" | "Downtime";

type Service = {
    name: string;
    status: ServiceStatus;
    description: string;
    icon: React.ElementType;
};

const getStatusVariant = (status: ServiceStatus) => {
    switch (status) {
        case "Operational":
            return {
                icon: CheckCircle2,
                color: "text-green-600",
            };
        case "Degraded Performance":
             return {
                icon: AlertCircle,
                color: "text-orange-500",
            };
        default:
             return {
                icon: AlertCircle,
                color: "text-destructive",
            };
    }
}


export default function SystemStatusPage() {
  const [services, setServices] = React.useState<Service[]>([
      { name: "Backend API", status: "Operational", description: "REST API Service.", icon: Server },
      { name: "Database Connection", status: "Operational", description: "Primary PostgreSQL database.", icon: Database },
      { name: "AI Agent Service", status: "Operational", description: "Genkit flow processing.", icon: Cpu },
      { name: "Email Service", status: "Degraded Performance", description: "Outbound email delivery (SendGrid).", icon: Mail },
  ]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkHealth() {
        setLoading(true);
        try {
            const health = await getHealthCheck();
            if (health.status === 'ok') {
                setServices(prev => prev.map(s => s.name === 'Backend API' ? { ...s, status: 'Operational' } : s));
            } else {
                setServices(prev => prev.map(s => s.name === 'Backend API' ? { ...s, status: 'Downtime' } : s));
            }
        } catch (error) {
            setServices(prev => prev.map(s => s.name === 'Backend API' ? { ...s, status: 'Downtime' } : s));
        } finally {
            setLoading(false);
        }
    }
    checkHealth();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>
          Monitor the health and uptime of all critical system services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => {
            const StatusIcon = getStatusVariant(service.status).icon;
            const statusColor = getStatusVariant(service.status).color;

            return (
              <div key={service.name} className="flex items-start gap-4 rounded-lg border p-4">
                <service.icon className="h-6 w-6 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{service.name}</p>
                     <div className={`flex items-center gap-2 text-sm font-medium ${statusColor}`}>
                        <StatusIcon className="h-4 w-4" />
                        {loading && service.name === 'Backend API' ? 'Checking...' : service.status}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
            )
        })}
      </CardContent>
    </Card>
  )
}
