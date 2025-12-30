"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart, Users, Star, User, Mail, Ban, Home, Blocks } from "lucide-react"

export function SettingsNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "General",
      links: [
        { title: "Profile", href: "/settings/profile", icon: User },
        { title: "Brand", href: "/settings/brand", icon: Star },
      ]
    },
    {
      title: "Team",
      links: [
        { title: "Users", href: "/settings/users", icon: Users },
        { title: "Invite", href: "/settings/invite", icon: Mail },
      ],
    },
    {
      title: "CRM",
      links: [
        { title: "Custom Fields", href: "/settings/custom-fields", icon: Blocks },
        { title: "Forecasting", href: "/settings/forecasting", icon: BarChart },
        { title: "Home Actions", href: "/settings/home-actions", icon: Home },
        { title: "Assignment Rules", href: "/settings/assignment-rules", icon: Ban },
      ],
    },
    {
      title: "Email",
      links: [
        { title: "Email Accounts", href: "/settings/email-accounts", icon: Mail },
        { title: "Email Templates", href: "/settings/email-templates", icon: Mail },
      ],
    },
  ]

  return (
    <nav className="grid gap-4 text-sm text-muted-foreground">
      {navItems.map((item, index) => (
        <div key={index} className="grid gap-1">
            <h4 className="px-2 text-xs font-semibold uppercase text-muted-foreground/80 tracking-wider">{item.title}</h4>
              {item.links?.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
                    pathname === link.href ? "bg-muted text-primary font-semibold" : "hover:text-primary hover:bg-muted/50"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.title}
                </Link>
              ))}
        </div>
      ))}
    </nav>
  )
}
