"use server"

import nodemailer from "nodemailer"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

// Configure nodemailer with Google SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: `"ACASA System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendVerificationCode(email: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0066cc;">ACASA Email Verification</h2>
      <p>Thank you for signing up with ACASA. To complete your registration, please use the verification code below:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you did not request this verification, please ignore this email.</p>
      <p>Best regards,<br>The ACASA Team</p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: "ACASA - Verify Your Email",
    html,
  })
}

export async function sendPasswordResetCode(email: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0066cc;">ACASA Password Reset</h2>
      <p>You requested to reset your password. Please use the code below to complete the process:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you did not request a password reset, please ignore this email or contact support.</p>
      <p>Best regards,<br>The ACASA Team</p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: "ACASA - Password Reset Code",
    html,
  })
}
