import { type NextRequest, NextResponse } from "next/server"
import { passwordResetRequestSchema } from "../../../lib/auth"
import { generateVerificationCode, storeVerificationCode } from "../../../lib/auth"
import { sendPasswordResetCode } from "../../../lib/email"
import { getDb } from "../../../lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate input
    const result = passwordResetRequestSchema.safeParse({ email })

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    // Check if user exists
    const db = await getDb()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      // Instead, pretend we sent an email
      return NextResponse.json({ success: true })
    }

    // Generate reset code
    const code = generateVerificationCode()

    // Store reset code
    const storeResult = await storeVerificationCode(email, code, "reset")

    if (!storeResult.success) {
      return NextResponse.json({ error: "Failed to generate reset code" }, { status: 500 })
    }

    // Send reset email
    const emailResult = await sendPasswordResetCode(email, code)

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending reset code:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
