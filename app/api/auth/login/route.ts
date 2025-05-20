import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { loginUser, createSessionToken, loginSchema } from "../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { email, password } = result.data

    // Attempt to login
    const loginResult = await loginUser(email, password)

    if (!loginResult.success || !loginResult.user) {
      return NextResponse.json({ error: loginResult.error || "Invalid email or password" }, { status: 401 })
    }

    // Create session token
    const token = await createSessionToken(loginResult.user)

    const resCookies = await cookies();
    // Set cookie
    resCookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({ user: loginResult.user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

