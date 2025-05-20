import { type NextRequest, NextResponse } from "next/server"
import { passwordResetSchema, resetPassword } from "../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, password, confirmPassword } = body

    // Validate input
    const result = passwordResetSchema.safeParse({ email, code, password, confirmPassword })

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    // // Verify code again for security
    // const verifyResult = await verifyCode(email, code, "reset")

    // if (!verifyResult.success) {
    //   return NextResponse.json({ error: verifyResult.error }, { status: 400 })
    // }

    // Reset password
    const resetResult = await resetPassword(email, password)

    if (!resetResult.success) {
      return NextResponse.json({ error: resetResult.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
