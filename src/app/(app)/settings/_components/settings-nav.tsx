"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart, Users, Star, User, Mail, Ban, Sliders, Home } from "lucide-react"

export function SettingsNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Profile",
      href: "/settings/profile",
      icon: User,
    },
    {
      title: "System Configuration",
      links: [
        { title: "Forecasting", href: "/settings/forecasting", icon: BarChart },
        { title: "Brand Settings", href: "/settings/brand", icon: Star },
      ],
    },
    {
      title: "User Management",
      links: [
        { title: "Users", href: "/settings/users", icon: Users },
        { title: "Invite User", href: "/settings/invite", icon: Mail },
      ],
    },
    {
      title: "Email Settings",
      links: [
        { title: "Email Accounts", href: "/settings/email-accounts", icon: Mail },
        { title: "Email Templates", href: "/settings/email-templates", icon: Mail },
      ],
    },
    {
        title: "Automation & Rules",
        links: [
            { title: "Assignment rules", href: "/settings/assignment-rules", icon: Ban },
        ]
    },
    {
        title: "Customization",
        links: [
            { title: "Home Actions", href: "/settings/home-actions", icon: Home },
        ]
    }
  ]

  return (
    <nav className="grid gap-4 text-sm text-muted-foreground">
      {navItems.map((item, index) => (
        <div key={index}>
          {item.href ? (
             <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 font-semibold",
                  pathname === item.href ? "bg-muted text-primary" : "hover:text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
          ) : (
            <>
              <h4 className="px-3 py-2 font-semibold text-primary">{item.title}</h4>
              {item.links?.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2",
                    pathname === link.href ? "bg-muted text-primary font-semibold" : "hover:text-primary"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.title}
                </Link>
              ))}
            </>
          )}
        </div>
      ))}
    </nav>
  )
}
