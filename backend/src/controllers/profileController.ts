import { Request, Response } from 'express'
import * as profileService from '../services/profileService'
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelper'
import {
  UserDoesNotExistError,
  EmailNotVerifiedError,
  ProfileAlreadyCompletedError,
  ProfileNotFoundError,
  CharityOrganizationNotFoundError,
  InvalidRoleError,
  ValidationError
} from '../utils/errors'
import logger from '../utils/logger'

export async function completeProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const profileData = req.body

    const result = await profileService.completeProfile(userId, profileData)
    logger.info('Profile completed', { userId: req.user?.UserID })
    return sendSuccessResponse(res, result, 'Profile completed successfully')

  } catch (error: any) {
    logger.error('Error completing profile', { error: error.message })
    if (error instanceof UserDoesNotExistError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof EmailNotVerifiedError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof ProfileAlreadyCompletedError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof CharityOrganizationNotFoundError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof InvalidRoleError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof ValidationError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else {
      sendErrorResponse(res, error.message, 500)
    }
  }
}


export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const result = await profileService.getProfile(userId)
    logger.info('Fetched profile', { userId: req.user?.UserID })
    return sendSuccessResponse(res, result, 'Profile retrieved successfully')

  } catch (error: any) {
    logger.error('Error fetching profile', { error: error.message })
    if (error instanceof UserDoesNotExistError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else {
      sendErrorResponse(res, error.message, 500)
    }
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
    logger.info('Profile updated', { userId: req.user?.UserID })
    return sendSuccessResponse(res, result, 'Profile updated successfully')

  } catch (error: any) {
    logger.error('Error updating profile', { error: error.message })
    if (error instanceof UserDoesNotExistError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof ProfileNotFoundError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof InvalidRoleError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else {
      sendErrorResponse(res, error.message, 500)
    }
  }
}