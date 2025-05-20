"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// Define the user type
export type AuthUser = {
  id: string
  name: string
  email: string
  role: string
}

// Define the auth context type
type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<boolean>
  logout: () => Promise<void>
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  initialUser: AuthUser | null
  children: React.ReactNode
}

// Auth provider component
export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Login failed",
          description: data.error || "Invalid email or password",
          variant: "destructive",
        })
        return false
      }

      setUser(data.user)
      router.refresh()
      return true
    } catch (error) {
      console.error(error)
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  const signup = async (name: string, email: string, password: string, confirmPassword: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Signup failed",
          description: data.error || "Failed to create account",
          variant: "destructive",
        })
        return false
      }

      setUser(data.user)
      router.refresh()
      return true
    } catch (error) {
      console.error(error)
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true)

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      setUser(null)
      router.refresh()
      router.push("/login")
    } catch (error) {
      console.error(error)
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

