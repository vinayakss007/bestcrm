
"use server"

import * as React from "react"
import { Bell, Clock, Contact, Briefcase, Plus, Lightbulb, Activity as ActivityIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { getActivities } from "@/lib/actions"
import type { Activity } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"

function getActivityDescription(activity: Activity) {
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

const activityIcons: Record<Activity['type'], React.ReactNode> = {
    contact_created: <Contact className="h-4 w-4" />,
    opportunity_created: <Briefcase className="h-4 w-4" />,
    account_created: <Plus className="h-4 w-4" />,
    lead_created: <Lightbulb className="h-4 w-4" />,
}


export async function Notifications() {
  const activities = await getActivities();

  return (
    <Sheet>
      <SidebarMenuItem>
        <SheetTrigger asChild>
            <SidebarMenuButton size="lg" tooltip="Notifications">
                <Bell />
                <span>Notifications</span>
            </SidebarMenuButton>
        </SheetTrigger>
      </SidebarMenuItem>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex flex-col gap-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={activity.user.avatarUrl || undefined} data-ai-hint="person face" />
                  <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>{" "}
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Clock className="mr-1.5 h-3 w-3" />
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center text-muted-foreground py-10">
                No notifications yet.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
