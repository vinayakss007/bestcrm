
"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Cpu, Mail, Database, Server, RefreshCw } from "lucide-react"
import { getHealthCheck } from "@/lib/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

type ServiceStatus = "Operational" | "Degraded Performance" | "Downtime" | "Checking...";

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
        case "Checking...":
             return {
                icon: RefreshCw,
                color: "text-muted-foreground animate-spin",
            };
        case "Degraded Performance":
             return {
                icon: AlertCircle,
                color: "text-orange-500",
            };
        default: // Downtime
             return {
                icon: AlertCircle,
                color: "text-destructive",
            };
    }
}


export default function SystemStatusPage() {
  const [services, setServices] = React.useState<Service[]>([
      { name: "Backend API", status: "Checking...", description: "REST API Service.", icon: Server },
      { name: "Database Connection", status: "Checking...", description: "Primary PostgreSQL database.", icon: Database },
      { name: "AI Agent Service", status: "Operational", description: "Genkit flow processing.", icon: Cpu },
      { name: "Email Service", status: "Degraded Performance", description: "Outbound email delivery (SendGrid).", icon: Mail },
  ]);
  const [loading, setLoading] = React.useState(true);

  const checkHealth = React.useCallback(async () => {
    setLoading(true);
    setServices(prev => prev.map(s => (s.name === 'Backend API' || s.name === 'Database Connection') ? { ...s, status: 'Checking...' } : s));
    try {
        const health = await getHealthCheck();
        setServices(prev => prev.map(s => {
            if (s.name === 'Backend API') {
                return { ...s, status: health.api === 'Operational' ? 'Operational' : 'Downtime' };
            }
            if (s.name === 'Database Connection') {
                return { ...s, status: health.database === 'Operational' ? 'Operational' : 'Downtime' };
            }
            return s;
        }));
    } catch (error) {
        setServices(prev => prev.map(s => {
            if (s.name === 'Backend API' || s.name === 'Database Connection') {
                return { ...s, status: 'Downtime' };
            }
            return s;
        }));
    } finally {
        setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
            Monitor the health and uptime of all critical system services.
            </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={checkHealth} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service, index) => {
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
                        {service.status}
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
