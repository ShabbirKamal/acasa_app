import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { registerUser, createSessionToken, signupSchema } from "../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = signupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Register user
    const registerResult = await registerUser(name, email, password)

    if (!registerResult.success || !registerResult.user) {
      return NextResponse.json({ error: registerResult.error || "Failed to create account" }, { status: 400 })
    }

    // Create session token
    const token = await createSessionToken(registerResult.user)

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

    return NextResponse.json({ user: registerResult.user })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

