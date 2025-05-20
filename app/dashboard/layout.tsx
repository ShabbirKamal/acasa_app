import type { ReactNode } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { requireAuth } from "../lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  // Server-side authentication check
  await requireAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 pb-8">{children}</div>
    </div>
  )
}

