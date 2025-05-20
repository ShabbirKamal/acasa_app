import { type NextRequest, NextResponse } from "next/server"
import { verificationSchema, verifyCode } from "../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    // Validate input
    const result = verificationSchema.safeParse({ email, code })

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    // Verify code
    const verifyResult = await verifyCode(email, code, "signup")

    if (!verifyResult.success) {
      return NextResponse.json({ error: verifyResult.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying signup:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
