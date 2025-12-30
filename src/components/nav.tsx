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
  Building2
} from "lucide-react"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/accounts", icon: Building2, label: "Accounts" },
  { href: "/contacts", icon: Contact, label: "Contacts" },
  { href: "/leads", icon: Lightbulb, label: "Leads" },
  { href: "/opportunities", icon: Briefcase, label: "Opportunities" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/agents", icon: Users, label: "Agents" },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              size="lg"
              asChild
              isActive={pathname.startsWith(item.href)}
              tooltip={item.label}
            >
              <a href={item.href}>
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
