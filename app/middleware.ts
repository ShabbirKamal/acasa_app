import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has("session")

  // Protected routes
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/controls",
    "/dashboard/policies",
    "/dashboard/compliance",
    "/dashboard/reports",
    "/dashboard/settings",
    "/dashboard/profile",
  ]

  // Auth routes
  const authRoutes = ["/login", "/signup"]

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // Redirect to login if trying to access a protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if trying to access an auth route while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}

