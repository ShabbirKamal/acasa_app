"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, User as Usericon} from "lucide-react"
import { Logo } from "@/components/logo"
import { useAuth } from "@/components/auth-provider"
import { fetchUserProfile} from "@/app/actions/user"
import { useEffect, useState } from "react"
import type { User } from "../app/types/database"

export function DashboardHeader() {
  const { user, logout } = useAuth()

  // const [profile, setProfile] = useState<{ profilePicture?: string } | null>(null)

  const [profile, setProfile] = useState<Partial<User>>({profilePicture: "",})

  // Load profile data on mount
  useEffect(() => {
    async function loadProfile() {
      const result = await fetchUserProfile()
      if (result.success && result.data) {
        setProfile({profilePicture : result.data.profilePicture || ""})
      }
    }
    loadProfile()
  }, [])
  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="flex items-center gap-2">
            <Logo size="small" linkTo="/dashboard" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : <Usericon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "Guest"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

