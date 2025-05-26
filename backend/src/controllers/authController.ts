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