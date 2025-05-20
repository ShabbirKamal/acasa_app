"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "verification" | "reset">("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to send reset code")
        setIsLoading(false)
        return
      }

      toast({
        title: "Reset code sent",
        description: "Please check your email for the password reset code",
      })

      setStep("verification")
    } catch (error) {
      console.error("Error sending reset code:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Invalid or expired code")
        setIsLoading(false)
        return
      }

      setStep("reset")
    } catch (error) {
      console.error("Error verifying code:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode, password, confirmPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to reset password")
        setIsLoading(false)
        return
      }

      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password",
      })

      router.push("/login")
    } catch (error) {
      console.error("Error resetting password:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resend: true }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to resend reset code")
        setIsLoading(false)
        return
      }

      toast({
        title: "Reset code resent",
        description: "Please check your email for the new reset code",
      })
    } catch (error) {
      console.error("Error resending code:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo size="medium" />
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            {step === "email"
              ? "Enter your email to reset your password"
              : step === "verification"
                ? "Enter the verification code sent to your email"
                : "Create a new password"}
          </p>
        </div>

        <Card>
          {step === "email" && (
            <form onSubmit={handleSendResetCode}>
              <CardHeader>
                <CardTitle className="text-xl">Forgot Password</CardTitle>
                <CardDescription>We&apos;ll send you a code to reset your password</CardDescription>
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
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button className="w-full bg-acasa-blue hover:bg-acasa-darkBlue" type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                    Log in
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}

          {step === "verification" && (
            <form onSubmit={handleVerifyCode}>
              <CardHeader>
                <CardTitle className="text-xl">Verify Code</CardTitle>
                <CardDescription>Enter the 6-digit code sent to {email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button className="w-full bg-acasa-blue hover:bg-acasa-darkBlue" type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
                <div className="mt-4 flex justify-between w-full">
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-sm"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    variant="link"
                    type="button"
                    onClick={handleResendCode}
                    className="text-sm"
                    disabled={isLoading}
                  >
                    Resend Code
                  </Button>
                </div>
              </CardFooter>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword}>
              <CardHeader>
                <CardTitle className="text-xl">Reset Password</CardTitle>
                <CardDescription>Create a new password for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">Password must be at least 8 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button className="w-full bg-acasa-blue hover:bg-acasa-darkBlue" type="submit" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
                <Button
                  variant="link"
                  type="button"
                  onClick={() => setStep("verification")}
                  className="mt-4 text-sm"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
