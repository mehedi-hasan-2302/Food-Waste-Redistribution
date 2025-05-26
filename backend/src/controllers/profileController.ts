import { Request, Response } from 'express'
import * as profileService from '../services/profileService'
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelper'

export async function completeProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const profileData = req.body

    const result = await profileService.completeProfile(userId, profileData)
    return sendSuccessResponse(res, result, 'Profile completed successfully')

  } catch (e: any) {
    return sendErrorResponse(res, e.message, 400)
  }
}


export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const result = await profileService.getProfile(userId)
    return sendSuccessResponse(res, result, 'Profile retrieved successfully')

  } catch (e: any) {
    return sendErrorResponse(res, e.message, 400)
  }
}


export async function updateProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const updateData = req.body

    const result = await profileService.updateProfile(userId, updateData)
    return sendSuccessResponse(res, result, 'Profile updated successfully')

  } catch (e: any) {
    return sendErrorResponse(res, e.message, 400)
  }
}