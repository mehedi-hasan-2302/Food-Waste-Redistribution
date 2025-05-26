import { Request, Response } from 'express'
import * as authService from '../services/authService'
import {
  UserDoesNotExistError,
} from '../utils/errors'
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelper'

export async function signup(req: Request, res: Response) {
  try {
    const { Username, Email, PhoneNumber, Password, Role } = req.body
    const result = await authService.signup({ Username, Email, PhoneNumber, Password, Role })
    sendSuccessResponse(res, result, 'User registered successfully. Please check your email for verification code.')

  } catch (e: any) {
    if (e instanceof UserDoesNotExistError) {
      sendErrorResponse(res, e.message, 404)
    } else {
      sendErrorResponse(res, e.message, 400)
    }
  }
}



export async function login(req: Request, res: Response) {
  try {
    const { Email, Password } = req.body
    const result = await authService.login({ Email, Password })
    sendSuccessResponse(res, result, 'Login successful')

  } catch (e: any) {
    if (e.message.includes('Invalid email or password')) {
      sendErrorResponse(res, e.message, 401)
    } else if (e.message.includes('not active') || e.message.includes('verify your email')) {
      sendErrorResponse(res, e.message, 403)
    } else {
      sendErrorResponse(res, e.message, 400)
    }
  }
}


export async function verifyEmail(req: Request, res: Response) {
  try {
    const email = req.body.Email as string
    const code = req.body.Code as string
  
    const result = await authService.verifyEmail(email, code)
    sendSuccessResponse(res, result, 'Email verified successfully')
  } catch (e: any) {
    sendErrorResponse(res, e.message, 400)
  }
}


export async function requestForgotPasswordReset(req: Request, res: Response) {
  try {
    const { Email } = req.body
    const result = await authService.requestForgotPasswordReset(Email)
    sendSuccessResponse(res, result, 'Password reset code sent successfully. Please check your email.')

  } catch (e: any) {
    if (e.message.includes('User not found')) {
      sendErrorResponse(res, e.message, 404)
    } else if (e.message.includes('verify your email first')) {
      sendErrorResponse(res, e.message, 403)
    } else {
      sendErrorResponse(res, e.message, 400)
    }
  }
}


export async function resetPassword(req: Request, res: Response) {
  try {
    const { Email, Code, Password, ConfirmPassword } = req.body
    const result = await authService.resetPassword({ Email, Code, Password, ConfirmPassword })
    sendSuccessResponse(res, result, 'Password reset successfully')

  } catch (e: any) {
    if (e.message.includes('User not found')) {
      sendErrorResponse(res, e.message, 404)
    } else if (e.message.includes('Invalid or expired')) {
      sendErrorResponse(res, e.message, 400)
    } else if (e.message.includes('Passwords do not match')) {
      sendErrorResponse(res, e.message, 400)
    } else {
      sendErrorResponse(res, e.message, 400)
    }
  }
}