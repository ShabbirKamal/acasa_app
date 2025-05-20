"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const success = await login(email, password)

      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid email or password. Please check your credentials and try again.")
      }
    } catch (error: unknown) {
      const err = error as Error
      if (err.message?.includes("verify your email")) {
        setError("Please verify your email before logging in.")
      } else {
        setError("An error occurred during login. Please try again.")
      }
    }
  }

  const handleResendVerification = async () => {
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resend: true }),
      })

      if (response.ok) {
        router.push(`/signup?email=${encodeURIComponent(email)}&verify=true`)
      } else {
        setError("Failed to resend verification email. Please try again.")
      }
    } catch (error) {
      console.error("Error resending verification:", error)
      setError("An unexpected error occurred")
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo size="medium" />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-xl">Login</CardTitle>
              <CardDescription>Access your ACASA dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full bg-acasa-blue hover:bg-acasa-darkBlue" type="submit" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="mt-4 flex flex-col items-center space-y-2">
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                    Sign up
                  </Link>
                </p>
                <Button
                  variant="link"
                  type="button"
                  onClick={handleResendVerification}
                  className="text-xs"
                  disabled={!email || isLoading}
                >
                  Resend verification email
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
