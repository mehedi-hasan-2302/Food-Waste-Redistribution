import nodemailer from 'nodemailer'
import { config } from '../config/env'

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: true,
  auth: {
    user: config.email.user,
    pass: config.email.mailpass,
  },
})


export async function sendVerificationEmail(email: string, code: string) {
  try {
    await transporter.sendMail({
      from: `"FoodRedistrib" <${config.email.user}>`,
      to: email,
      subject: 'Verify Your Email',
      text: `Your verification code is: ${code}. This code is valid for 10 minutes.`
    })
  } catch (err) {
    console.error('Error sending verification email:', err)
    throw new Error('Failed to send verification email.')
  }
}


export async function sendPasswordResetEmail(email: string, resetCode: string) {
  try {
    await transporter.sendMail({
      from: `"FoodRedistrib" <${config.email.user}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `Your password reset code is: ${resetCode}. This code is valid for 10 minutes.`,
    })
  } catch (err) {
    console.error('Error sending reset email:', err)
    throw new Error('Failed to send password reset email.')
  }
}
