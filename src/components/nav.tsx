
"use client"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Contact,
  Lightbulb,
  Briefcase,
  CheckSquare,
  Building2,
  FileText,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Notifications } from "./notifications"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/accounts", icon: Building2, label: "Accounts" },
  { href_alt: "/contacts", icon: Contact, label: "Contacts" },
  { href: "/leads", icon: Lightbulb, label: "Leads" },
  { href: "/opportunities", icon: Briefcase, label: "Opportunities" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/agents", icon: Users, label: "Agents" },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <div className="group-data-[collapsible=icon]:hidden pb-2">
        {/* Placeholder for future top items */}
      </div>
      <SidebarMenu>
         <SidebarMenuItem>
           <Notifications isIconButton={true} />
         </SidebarMenuItem>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              size="lg"
              asChild
              isActive={pathname.startsWith(item.href || item.href_alt || '')}
              tooltip={item.label}
            >
              <a href={item.href || item.href_alt}>
                <item.icon />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
