import { type NextRequest, NextResponse } from "next/server"
import { signupSchema } from "../../../lib/auth"
import { generateVerificationCode, storeVerificationCode, createPendingUser } from "../../../lib/auth"
import { sendVerificationCode } from "../../../lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, resend } = body

    // If resending, we only need to validate the email
    if (!resend) {
      // Validate input
      const result = signupSchema.safeParse({ name, email, password, confirmPassword: password })

      if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
      }

      // Create pending user
      const userResult = await createPendingUser(name, email, password)

      if (!userResult.success) {
        return NextResponse.json({ error: userResult.error }, { status: 400 })
      }
    }

    // Generate verification code
    const code = generateVerificationCode()

    // Store verification code
    const storeResult = await storeVerificationCode(email, code, "signup")

    if (!storeResult.success) {
      return NextResponse.json({ error: "Failed to generate verification code" }, { status: 500 })
    }

    // Send verification email
    const emailResult = await sendVerificationCode(email, code)

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending verification:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
