import { Request, Response } from 'express'
import * as feedbackService from '../services/feedbackService'
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseHelper'
import {
  UnauthorizedActionError,
  UserDoesNotExistError,
  ValidationError
} from '../utils/errors'
import logger from '../utils/logger'

export async function createComplaint(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const { orderId, claimId, regardingUserId, message } = req.body
    const result = await feedbackService.createComplaint(req.user.UserID, {
      orderId: orderId ? parseInt(orderId) : undefined,
      claimId: claimId ? parseInt(claimId) : undefined,
      regardingUserId: regardingUserId ? parseInt(regardingUserId) : undefined,
      message
    })

    logger.info('Complaint submitted', { userId: req.user.UserID, orderId, claimId })
    return sendSuccessResponse(res, result, 'Issue reported successfully')
  } catch (error: any) {
    logger.error('Error submitting complaint', { error: error.message })
    if (
      error instanceof ValidationError ||
      error instanceof UnauthorizedActionError ||
      error instanceof UserDoesNotExistError
    ) {
      return sendErrorResponse(res, error.message, error.statusCode)
    }

    return sendErrorResponse(res, error.message, 500)
  }
}

export async function getMyComplaints(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const result = await feedbackService.getMyComplaints(req.user.UserID)
    return sendSuccessResponse(res, result, 'Complaints retrieved successfully')
  } catch (error: any) {
    logger.error('Error retrieving user complaints', { error: error.message })
    return sendErrorResponse(res, error.message, 500)
  }
}

export async function createRating(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const { orderId, claimId, regardingUserId, ratingValue, message } = req.body
    const result = await feedbackService.createRating(req.user.UserID, {
      orderId: orderId ? parseInt(orderId) : undefined,
      claimId: claimId ? parseInt(claimId) : undefined,
      regardingUserId: regardingUserId ? parseInt(regardingUserId) : undefined,
      ratingValue: Number(ratingValue),
      message
    })

    logger.info('Rating submitted', { userId: req.user.UserID, orderId, claimId })
    return sendSuccessResponse(res, result, 'Rating submitted successfully')
  } catch (error: any) {
    logger.error('Error submitting rating', { error: error.message })
    if (
      error instanceof ValidationError ||
      error instanceof UnauthorizedActionError ||
      error instanceof UserDoesNotExistError
    ) {
      return sendErrorResponse(res, error.message, error.statusCode)
    }

    return sendErrorResponse(res, error.message, 500)
  }
}
