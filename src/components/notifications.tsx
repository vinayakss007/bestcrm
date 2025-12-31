
"use client"

import * as React from "react"
import { Bell, Clock } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { recentActivities } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"

export function Notifications() {
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
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={activity.user.avatarUrl} data-ai-hint="person face" />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  {activity.action}{" "}
                  <span className="font-medium text-primary">{activity.target}</span>.
                </p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Clock className="mr-1.5 h-3 w-3" />
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
