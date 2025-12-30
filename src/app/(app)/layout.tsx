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
import { Bot, Settings } from "lucide-react"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <Button
            variant="ghost"
            className="h-10 w-full justify-start px-2 text-lg font-bold"
            asChild
          >
            <a href="/dashboard">
              <Bot className="mr-2 h-6 w-6" />
              <span className="group-data-[collapsible=icon]:hidden">
                Zenith CRM
              </span>
            </a>
          </Button>
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
        <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
