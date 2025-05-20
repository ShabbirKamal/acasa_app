"use client"

import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { Logo } from "@/components/logo"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"

export default function Home() {
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true)

    // Redirect authenticated users to dashboard
    if (user) {
      redirect("/dashboard")
    }
  }, [user])

  // Don't render anything until we're on the client
  if (!isClient) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="medium" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => redirect("/login")}>
              Login
            </Button>
            <Button onClick={() => redirect("/signup")} className="bg-acasa-blue hover:bg-acasa-darkBlue">
              Sign up
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 grid-background">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Automated Compliance Auditing Software integrated with AI
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Streamline your ISO27001:2022 compliance process with our intelligent auditing platform.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" onClick={() => redirect("/signup")} className="bg-acasa-blue hover:bg-acasa-darkBlue">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => redirect("/login")}>
                  Login to Dashboard
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
                <Image
                  src="/img/img2.png"
                  alt="Cybersecurity"
                  className="object-cover"
                  // width={600} 
                  // height={400}
                  fill
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        <section className="container py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <Logo size="large" />
            <p className="mt-2 text-muted-foreground">Automated Compliance Auditing Software integrated with AI</p>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to manage your ISO27001:2022 compliance
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 pt-8">
            {[
              {
                title: "Control Checklists",
                description: "Track compliance with ISO27001:2022 Annex A Controls",
              },
              {
                title: "Policy Document Creation",
                description: "Generate policy documents through guided questionnaires",
              },
              {
                title: "Document Management",
                description: "Upload and manage supporting documentation",
              },
              {
                title: "Automated Controls",
                description: "Automate compliance checks with built-in scripts",
              },
              {
                title: "Compliance Reporting",
                description: "Generate comprehensive compliance reports",
              },
              {
                title: "AI-Powered Insights",
                description: "Get intelligent recommendations for compliance improvement",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 rounded-lg border bg-background p-6 shadow-sm"
              >
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} ACASA. All rights reserved.</p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">
              Terms
            </Button>
            <Button variant="ghost" size="sm">
              Privacy
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

