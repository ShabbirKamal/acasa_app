import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { getDb } from "./db"
import { redirect } from "next/navigation"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { createHash } from "crypto"
import type { User } from "../types/database"

// Secret key for JWT signing - in production, use a proper secret from environment variables
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

// Session duration - 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 // in seconds

// User DTO - only expose necessary fields
export type UserDTO = {
  id: string
  name: string
  email: string
  role: string
}

// Login schema for validation
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// Signup schema for validation with LUMS email restriction
export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Verification code schema
export const verificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().length(6, "Verification code must be 6 characters"),
})

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

// Password reset schema
export const passwordResetSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    code: z.string().length(6, "Reset code must be 6 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Create a session token
export async function createSessionToken(user: UserDTO): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET)

  return token
}

// Verify a session token
export async function verifySessionToken(token: string): Promise<UserDTO | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.user as UserDTO
  } catch (error) {
    console.error(error)
    return null
  }
}

// Get the current session
export async function getSession(): Promise<UserDTO | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) {
    return null
  }

  return verifySessionToken(token)
}

// Check if the user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session
}

// Require authentication - redirect to login if not authenticated
export async function requireAuth() {
  const isAuthed = await isAuthenticated()

  if (!isAuthed) {
    redirect("/login")
  }
}

// Convert a User to UserDTO
export function userToDTO(user: User): UserDTO {
  return {
    id: user._id?.toString() || "",
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

// Generate a random 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store verification code in the database
export async function storeVerificationCode(email: string, code: string, type: "signup" | "reset") {
  try {
    const db = await getDb()

    // Hash the code for security
    const hashedCode = createHash("sha256").update(code).digest("hex")

    // Set expiration time (15 minutes)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Store in database
    await db.collection("verificationCodes").updateOne(
      { email, type },
      {
        $set: {
          email,
          type,
          code: hashedCode,
          expiresAt,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    return { success: true }
  } catch (error) {
    console.error("Error storing verification code:", error)
    return { success: false, error: "Failed to store verification code" }
  }
}

// Verify the code
export async function verifyCode(email: string, code: string, type: "signup" | "reset") {
  try {
    const db = await getDb()

    // Hash the provided code
    const hashedCode = createHash("sha256").update(code).digest("hex")

    // Find the verification record
    const verification = await db.collection("verificationCodes").findOne({
      email,
      type,
      expiresAt: { $gt: new Date() }, // Check if not expired
    })

    if (!verification) {
      return { success: false, error: "Verification code not found or expired" }
    }

    // Check if code matches
    if (verification.code !== hashedCode) {
      return { success: false, error: "Invalid verification code" }
    }

    // If it's a signup verification, mark the email as verified
    if (type === "signup") {
      await db.collection("users").updateOne({ email }, { $set: { emailVerified: true } })
    }

    // Delete the used verification code
    await db.collection("verificationCodes").deleteOne({ _id: verification._id })

    return { success: true }
  } catch (error) {
    console.error("Error verifying code:", error)
    return { success: false, error: "Failed to verify code" }
  }
}

// Create a pending user account
export async function createPendingUser(name: string, email: string, password: string) {
  try {
    const db = await getDb()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })

    if (existingUser) {
      if (existingUser.emailVerified) {
        return { success: false, error: "Email already registered" }
      } else {
        // User exists but email not verified, we can update the record
        await db.collection("users").updateOne(
          { email },
          {
            $set: {
              name,
              password: await bcrypt.hash(password, 10),
              updatedAt: new Date(),
            },
          },
        )
        return { success: true }
      }
    }

    // Create new user with emailVerified set to false
    const user = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "user", // Default role
      status: "pending",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("users").insertOne(user)

    return { success: true }
  } catch (error) {
    console.error("Error creating pending user:", error)
    return { success: false, error: "Failed to create user account" }
  }
}

// Login a user with email verification check
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: UserDTO; error?: string }> {
  try {
    const db = await getDb()
    const user = await db.collection<User>("users").findOne({ email })

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return { success: false, error: "Please verify your email before logging in" }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" }
    }

    return { success: true, user: userToDTO(user) }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Register a new user with email verification
export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; user?: UserDTO; error?: string }> {
  try {
    const db = await getDb()

    // Check if user already exists
    const existingUser = await db.collection<User>("users").findOne({ email })

    if (existingUser) {
      if (existingUser.emailVerified) {
        return { success: false, error: "Email already in use" }
      } else {
        return { success: false, error: "Please verify your email to complete registration" }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user with emailVerified set to false
    const newUser: Omit<User, "_id"> = {
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role
      status: "pending",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<User>("users").insertOne(newUser as User)

    if (!result.insertedId) {
      return { success: false, error: "Failed to create user" }
    }

    const createdUser: User = {
      ...newUser,
      _id: result.insertedId,
    }

    return {
      success: false,
      error: "Please verify your email to complete registration",
      user: userToDTO(createdUser),
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Reset password
export async function resetPassword(email: string, password: string) {
  try {
    const db = await getDb()

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the user's password
    const result = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return { success: false, error: "User not found" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { success: false, error: "Failed to reset password" }
  }
}

// Logout a user
export async function logoutUser() {
  const cookiestore = await cookies()
  cookiestore.delete("session")
}
