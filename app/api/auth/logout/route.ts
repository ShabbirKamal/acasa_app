import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Delete the session cookie
  const resCookies = await cookies();
  resCookies.delete("session")

  return NextResponse.json({ success: true })
}

