import { AppDataSource } from '../config/data-source'
import { User, UserRole, AccountStatus } from '../models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../config/env'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailHelper'
import crypto from 'crypto'
import {
  UserAlreadyExistsError,
  InvalidRoleError,
  UserDoesNotExistError,
  InvalidCredentialsError,
  AccountNotActiveError,
  EmailNotVerifiedError,
  EmailAlreadyVerifiedError,
  VerificationCodeNotFoundError,
  InvalidVerificationCodeError,
  PasswordResetTokenNotFoundError,
  InvalidPasswordResetTokenError,
  PasswordMismatchError
} from '../utils/errors'

export interface SignupInput {
  Username: string;
  Email: string;
  PhoneNumber?: string;
  Password: string;
  Role: string;
}

export interface LoginInput {
  Email: string;
  Password: string;
}

export interface ResetPasswordInput {
  Email: string;
  Code: string;
  Password: string;
  ConfirmPassword: string;
}

const userRepo = AppDataSource.getRepository(User)


export async function signup(data: SignupInput) {
  const existingUser = await userRepo.findOne({ 
    where: [
      { Email: data.Email },
    ]
  })
  
  if (existingUser) {
    throw new UserAlreadyExistsError()
  }

  if (!Object.values(UserRole).includes(data.Role as UserRole)) {
    throw new InvalidRoleError()
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  const user = userRepo.create({
    Username: data.Username,
    Email: data.Email,
    PhoneNumber: data.PhoneNumber,
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



export async function login(data: LoginInput) {
  const user = await userRepo.findOneBy({ Email: data.Email })

  if (!user) {
    throw new InvalidCredentialsError()
  }

  if (user.AccountStatus !== AccountStatus.ACTIVE) {
    throw new AccountNotActiveError()
  }

  if (!user.IsEmailVerified) {
    throw new EmailNotVerifiedError()
  }

  const isPasswordValid = await bcrypt.compare(data.Password, user.PasswordHash)
  if (!isPasswordValid) {
    throw new InvalidCredentialsError()
  }

  const token = jwt.sign(
    { 
      id: user.UserID, 
      email: user.Email, 
      role: user.Role 
    },
    config.jsonToken.secret as string, 
    { expiresIn: '24h' }
  )

  const commonUserData = {
    UserID: user.UserID,
    Username: user.Username,
    Email: user.Email,
    PhoneNumber: user.PhoneNumber,
    Role: user.Role,
  }

  return {
    token,
    user: commonUserData
  }
}



export async function verifyEmail(email: string, code: string) {
  const user = await userRepo.findOneBy({ Email: email })

  if (!user) {
    throw new UserDoesNotExistError()
  }
  
  if (user.IsEmailVerified) {
    throw new EmailAlreadyVerifiedError()
  }
  
  if (!user.verificationCode || !user.verificationCodeExpires) {
    throw new VerificationCodeNotFoundError()
  }
  
  if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
    throw new InvalidVerificationCodeError()
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



export async function requestForgotPasswordReset(email: string) {
  const user = await userRepo.findOneBy({ Email: email })

  if (!user) {
    throw new UserDoesNotExistError()
  }

  if (!user.IsEmailVerified) {
    throw new EmailNotVerifiedError('Please verify your email first before requesting password reset')
  }

  const resetCode = crypto.randomInt(100000, 1000000).toString()
  const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  user.passwordResetToken = resetCode
  user.passwordResetExpires = resetCodeExpires

  await userRepo.save(user)
  await sendPasswordResetEmail(user.Email, resetCode)
}


export async function resetPassword(data: ResetPasswordInput) {
  const user = await userRepo.findOneBy({ Email: data.Email })

  if (!user) {
    throw new UserDoesNotExistError()
  }

  if (!user.passwordResetToken || !user.passwordResetExpires) {
    throw new PasswordResetTokenNotFoundError()
  }

  if (user.passwordResetToken !== data.Code || user.passwordResetExpires < new Date()) {
    throw new InvalidPasswordResetTokenError()
  }

  if (data.Password !== data.ConfirmPassword) {
    throw new PasswordMismatchError()
  }

  const hashedPassword = await bcrypt.hash(data.Password, 10)
  
  user.PasswordHash = hashedPassword
  user.passwordResetToken = null
  user.passwordResetExpires = null

  await userRepo.save(user)
}