
"use server"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Nav } from "@/components/nav"
import { Bot, Settings, ChevronsUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/actions"
import type { User } from "@/lib/types"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user: User | null = await getCurrentUser();
  
  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-12 w-full justify-start px-2 text-md font-bold gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://picsum.photos/seed/1/32/32" data-ai-hint="logo" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                      <span className="text-sm">{user?.organization?.name || 'My Workspace'}</span>
                      <span className="text-xs font-normal text-muted-foreground">Workspace</span>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="start">
                {user && (
                    <>
                    <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem>
                   <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="https://picsum.photos/seed/1/32/32" data-ai-hint="logo" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    {user?.organization?.name || 'My Workspace'}
                </DropdownMenuItem>
                 <DropdownMenuItem disabled>
                   <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="https://picsum.photos/seed/2/32/32" data-ai-hint="logo" />
                      <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    Another Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarHeader>
        <SidebarContent>
          <Nav />
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2" />
           <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
            <a href="/settings">
                <Settings />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </a>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col overflow-y-auto p-4 sm:px-6 sm:py-4 min-w-0">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

      