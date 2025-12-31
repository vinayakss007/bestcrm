
"use client"

import * as React from "react"
import { Bell, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export function Notifications({ isIconButton = false }: { isIconButton?: boolean }) {
  const Trigger = (
    <Button
      variant="ghost"
      size="icon"
      className={isIconButton ? "group-data-[collapsible=icon]:hidden" : ""}
      tooltip="Notifications"
    >
      <Bell className="h-5 w-5" />
      <span className="sr-only">Toggle notifications panel</span>
    </Button>
  );

  const IconButtonTrigger = (
     <Button
        variant="ghost"
        size="lg"
        className="group-data-[collapsible=collapsed]:h-10 group-data-[collapsible=collapsed]:w-10 group-data-[collapsible=collapsed]:justify-center group-data-[collapsible=collapsed]:p-2 flex w-full items-center gap-2"
        tooltip="Notifications"
      >
        <Bell />
        <span>Notifications</span>
      </Button>
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        {isIconButton ? IconButtonTrigger : Trigger}
      </SheetTrigger>
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
