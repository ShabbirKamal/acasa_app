import Link from "next/link"
import { cn } from "@/app/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, FileCheck, FileText, Settings, Shield, Home } from "lucide-react"

interface DashboardNavProps {
  activeItem?: string
}

export function DashboardNav({ activeItem }: DashboardNavProps) {
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      id: "dashboard",
    },
    {
      title: "Controls",
      href: "/dashboard/controls",
      icon: Shield,
      id: "controls",
    },
    {
      title: "Policies",
      href: "/dashboard/policies",
      icon: FileText,
      id: "policies",
    },
    {
      title: "Compliance",
      href: "/dashboard/compliance",
      icon: FileCheck,
      id: "compliance",
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
      id: "reports",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      id: "settings",
    },
  ]

  return (
    <nav className="grid items-start gap-2 py-4">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={activeItem === item.id ? "secondary" : "ghost"}
          className={cn("justify-start", activeItem === item.id ? "bg-acasa-blue/10 text-acasa-blue font-medium" : "")}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

