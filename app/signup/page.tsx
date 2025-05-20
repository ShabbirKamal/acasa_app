"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SignupPage() {
  const [step, setStep] = useState<"details" | "verification">("details")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if we're coming from a verification link
  useEffect(() => {
    const emailParam = searchParams.get("email")
    const verifyParam = searchParams.get("verify")

    if (emailParam && verifyParam === "true") {
      setEmail(emailParam)
      setStep("verification")
    }
  }, [searchParams])

  // Remove the validateEmail function that uses any:
  const validateEmail = (email: string) => {
    return email.includes("@") && email.includes(".")
  }

  // In the handleSendVerification function, remove the LUMS-specific validation
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      // Create pending user and send verification code
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to send verification code")
        setIsLoading(false)
        return
      }

      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code",
      })

      setStep("verification")
    } catch (error) {
      console.error("Error sending verification:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Verify code and complete signup
      const response = await fetch("/api/auth/verify-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to verify code")
        setIsLoading(false)
        return
      }

      toast({
        title: "Account created successfully",
        description: "You can now log in with your credentials",
      })

      router.push("/login")
    } catch (error) {
      console.error("Error verifying code:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resend: true }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to resend verification code")
        setIsLoading(false)
        return
      }

      toast({
        title: "Verification code resent",
        description: "Please check your email for the new verification code",
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
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            {step === "details"
              ? "Enter your details to create an account"
              : "Enter the verification code sent to your email"}
          </p>
        </div>

        <Card>
          {step === "details" ? (
            <form onSubmit={handleSendVerification}>
              <CardHeader>
                <CardTitle className="text-xl">Sign Up</CardTitle>
                <CardDescription>Create your ACASA account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
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
                  <p className="text-xs text-muted-foreground">Enter your email address</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button className="w-full bg-acasa-blue hover:bg-acasa-darkBlue" type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Continue"}
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                    Log in
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndSignup}>
              <CardHeader>
                <CardTitle className="text-xl">Verify Email</CardTitle>
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
                  {isLoading ? "Verifying..." : "Complete Signup"}
                </Button>
                <div className="mt-4 flex justify-between w-full">
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => setStep("details")}
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
        </Card>
      </div>
    </div>
  )
}
