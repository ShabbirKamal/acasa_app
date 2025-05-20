import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { ModalProvider } from "@/components/ui/modal-provider"
import { getSession } from "./lib/auth"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ACASA - Automated Compliance Auditing Software",
  description: "Streamline your ISO27001:2022 compliance process with our intelligent auditing platform.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get the current session
  const session = await getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider initialUser={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <ModalProvider>
              {children}
              <Toaster />
            </ModalProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
