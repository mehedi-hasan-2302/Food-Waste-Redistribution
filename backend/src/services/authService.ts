import { AppDataSource } from '../config/data-source'
import { User, UserRole, AccountStatus } from '../models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../config/env'
import { sendVerificationEmail } from '../utils/emailHelper'
import crypto from 'crypto'


export interface SignupInput {
  Username: string;
  Email: string;
  Password: string;
  Role: string;
}

const userRepo = AppDataSource.getRepository(User)

export async function signup(data: SignupInput) {
  // Validate JWT secret exists
  if (!config.jsonToken.secret) {
    throw new Error('JWT secret is not configured')
  }

  const existingUser = await userRepo.findOne({ 
    where: [
      { Email: data.Email },

    ]
  })
  
  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  if (!Object.values(UserRole).includes(data.Role as UserRole)) {
    throw new Error('Invalid role specified')
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  const user = userRepo.create({
    Username: data.Username,
    Email: data.Email,
    PasswordHash: await bcrypt.hash(data.Password, 10),
    Role: data.Role as UserRole,
    AccountStatus: AccountStatus.PENDING,
    verificationCode: code,
    verificationCodeExpires: expires,
    IsEmailVerified: false
  })
  
  await userRepo.save(user)
  await sendVerificationEmail(user.Email, code)

}



export async function verifyEmail(email: string, code: string) {
  const user = await userRepo.findOneBy({ Email: email })

  if (!user) {
    throw new Error('User not found')
  }
  
  if (user.IsEmailVerified) {
    throw new Error('Email already verified')
  }
  
  if (!user.verificationCode || !user.verificationCodeExpires) {
    throw new Error('No verification code found')
  }
  
  if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
    throw new Error('Invalid or expired verification code')
  }

  
  user.IsEmailVerified = true
  user.verificationCode = null
  user.verificationCodeExpires = null
  user.AccountStatus = AccountStatus.ACTIVE
  
  await userRepo.save(user)

  const email_verificationToken = jwt.sign(
    { 
      id: user.UserID, 
      email: user.Email, 
      role: user.Role 
    },
      config.jsonToken.secret as string, {expiresIn: '1h'}
  )

  return { email_verificationToken }
}