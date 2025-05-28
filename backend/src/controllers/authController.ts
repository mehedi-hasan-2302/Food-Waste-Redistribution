import { Request, Response } from 'express'
import * as authService from '../services/authService'
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelper'
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


export async function signup(req: Request, res: Response) {
  try {
    const { Username, Email, PhoneNumber, Password, Role } = req.body
    const result = await authService.signup({ Username, Email, PhoneNumber, Password, Role })
    sendSuccessResponse(res, result, 'User registered successfully. Please check your email for verification code.')

  }catch (e: any) {
    if (e instanceof UserAlreadyExistsError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof InvalidRoleError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}



export async function login(req: Request, res: Response) {
  try {
    const { Email, Password } = req.body
    const result = await authService.login({ Email, Password })
    sendSuccessResponse(res, result, 'Login successful')

  } catch (e: any) {
    if (e instanceof InvalidCredentialsError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof AccountNotActiveError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof EmailNotVerifiedError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
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
    if (e instanceof UserDoesNotExistError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof EmailAlreadyVerifiedError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof VerificationCodeNotFoundError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof InvalidVerificationCodeError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}


export async function requestForgotPasswordReset(req: Request, res: Response) {
  try {
    const { Email } = req.body
    const result = await authService.requestForgotPasswordReset(Email)
    sendSuccessResponse(res, result, 'Password reset code sent successfully. Please check your email.')

  } catch (e: any) {
    if (e instanceof UserDoesNotExistError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof EmailNotVerifiedError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}


export async function resetPassword(req: Request, res: Response) {
  try {
    const { Email, Code, Password, ConfirmPassword } = req.body
    const result = await authService.resetPassword({ Email, Code, Password, ConfirmPassword })
    sendSuccessResponse(res, result, 'Password reset successfully')

  }  catch (e: any) {
    if (e instanceof UserDoesNotExistError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof PasswordResetTokenNotFoundError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof InvalidPasswordResetTokenError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof PasswordMismatchError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}