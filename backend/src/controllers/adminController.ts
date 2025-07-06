import { Request, Response } from 'express'
import * as adminService from '../services/adminService'
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelper'
import {
  UserDoesNotExistError,
  UnauthorizedActionError,
  ValidationError,
  ProfileNotFoundError
} from '../utils/errors'
import logger from '../utils/logger'


export async function getDashboardStats(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized dashboard stats access attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const stats = await adminService.getAdminDashboardStats()
    logger.info('Admin dashboard stats retrieved', { adminId: req.user.UserID })
    return sendSuccessResponse(res, stats, 'Dashboard stats retrieved successfully')

  } catch (error: any) {
    logger.error('Error retrieving dashboard stats', { error: error.message })
    sendErrorResponse(res, error.message, 500)
  }
}


export async function getAllUsers(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized user list access attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const { page = 1, limit = 20, role, accountStatus, isEmailVerified } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const filters = {
      role: role as any,
      accountStatus: accountStatus as any,
      isEmailVerified: isEmailVerified === 'true' ? true : isEmailVerified === 'false' ? false : undefined,
      limit: parseInt(limit as string),
      offset
    }

    const users = await adminService.getAllUsers(filters)
    logger.info('Admin retrieved user list', { adminId: req.user.UserID, filters })
    return sendSuccessResponse(res, users, 'Users retrieved successfully')

  } catch (error: any) {
    logger.error('Error retrieving users', { error: error.message })
    sendErrorResponse(res, error.message, 500)
  }
}


export async function getPendingVerifications(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized pending verifications access attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const pendingVerifications = await adminService.getPendingVerifications()
    logger.info('Admin retrieved pending verifications', { adminId: req.user.UserID })
    return sendSuccessResponse(res, pendingVerifications, 'Pending verifications retrieved successfully')

  } catch (error: any) {
    logger.error('Error retrieving pending verifications', { error: error.message })
    sendErrorResponse(res, error.message, 500)
  }
}


export async function processVerification(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized verification process attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const { userId, type, status, reason } = req.body

    if (!userId || !type || !status) {
      logger.warn('Missing fields in verification process', { userId, type, status })
      return sendErrorResponse(res, 'Missing required fields: userId, type, status', 400)
    }

    if (!['charity', 'delivery'].includes(type)) {
      logger.warn('Invalid verification type', { type })
      return sendErrorResponse(res, 'Invalid verification type. Must be charity or delivery', 400)
    }

    if (!['approve', 'reject'].includes(status)) {
      logger.warn('Invalid verification status', { status })
      return sendErrorResponse(res, 'Invalid status. Must be approve or reject', 400)
    }

    const result = await adminService.processVerificationRequest({
      userId: parseInt(userId),
      type,
      status,
      reason
    })

    logger.info('Admin processed verification', { adminId: req.user.UserID, userId, type, status })
    return sendSuccessResponse(res, result, `Verification ${status}d successfully`)

  } catch (error: any) {
    logger.error('Error processing verification', { error: error.message })
    if (error instanceof UserDoesNotExistError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof ProfileNotFoundError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else {
      sendErrorResponse(res, error.message, 500)
    }
  }
}


export async function suspendUser(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized suspend user attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const userId = parseInt(req.params.userId)
    const { reason } = req.body

    if (isNaN(userId)) {
      logger.warn('Invalid user ID for suspension', { userId })
      return sendErrorResponse(res, 'Invalid user ID', 400)
    }

    if (!reason) {
      logger.warn('No reason provided for suspension', { userId })
      return sendErrorResponse(res, 'Suspension reason is required', 400)
    }

    const result = await adminService.suspendUser(userId, reason)
    logger.info('Admin suspended user', { adminId: req.user.UserID, userId, reason })
    return sendSuccessResponse(res, result, 'User suspended successfully')

  } catch (error: any) {
    logger.error('Error suspending user', { error: error.message })
    if (error instanceof UserDoesNotExistError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof UnauthorizedActionError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof ValidationError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else {
      sendErrorResponse(res, error.message, 500)
    }
  }
}


export async function reactivateUser(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized reactivate user attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const userId = parseInt(req.params.userId)

    if (isNaN(userId)) {
      logger.warn('Invalid user ID for reactivation', { userId })
      return sendErrorResponse(res, 'Invalid user ID', 400)
    }

    const result = await adminService.reactivateUser(userId)
    logger.info('Admin reactivated user', { adminId: req.user.UserID, userId })
    return sendSuccessResponse(res, result, 'User reactivated successfully')

  } catch (error: any) {
    logger.error('Error reactivating user', { error: error.message })
    if (error instanceof UserDoesNotExistError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else if (error instanceof ValidationError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else {
      sendErrorResponse(res, error.message, 500)
    }
  }
}


export async function getAllFoodListings(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized food listings access attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const { page = 1, limit = 20, status, isDonation, foodType } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const filters = {
      status,
      isDonation,
      foodType,
      limit: parseInt(limit as string),
      offset
    }

    const listings = await adminService.getAllFoodListings(filters)
    logger.info('Admin retrieved food listings', { adminId: req.user.UserID, filters })
    return sendSuccessResponse(res, listings, 'Food listings retrieved successfully')

  } catch (error: any) {
    logger.error('Error retrieving food listings', { error: error.message })
    sendErrorResponse(res, error.message, 500)
  }
}


export async function removeFoodListing(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized remove food listing attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const listingId = parseInt(req.params.listingId)
    const { reason } = req.body

    if (isNaN(listingId)) {
      logger.warn('Invalid listing ID for removal', { listingId })
      return sendErrorResponse(res, 'Invalid listing ID', 400)
    }

    if (!reason) {
      logger.warn('No reason provided for food listing removal', { listingId })
      return sendErrorResponse(res, 'Removal reason is required', 400)
    }

    const result = await adminService.removeFoodListing(listingId, reason)
    logger.info('Admin removed food listing', { adminId: req.user.UserID, listingId, reason })
    return sendSuccessResponse(res, result, 'Food listing removed successfully')

  } catch (error: any) {
    logger.error('Error removing food listing', { error: error.message })
    if (error instanceof ValidationError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else {
      sendErrorResponse(res, error.message, 500)
    }
  }
}


export async function getAllComplaints(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized complaints access attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const { page = 1, limit = 20, status } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const filters = {
      status,
      limit: parseInt(limit as string),
      offset
    }

    const complaints = await adminService.getAllComplaints(filters)
    logger.info('Admin retrieved complaints', { adminId: req.user.UserID, filters })
    return sendSuccessResponse(res, complaints, 'Complaints retrieved successfully')

  } catch (error: any) {
    logger.error('Error retrieving complaints', { error: error.message })
    sendErrorResponse(res, error.message, 500)
  }
}


export async function resolveComplaint(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized resolve complaint attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const complaintId = parseInt(req.params.complaintId)
    const { action, adminNotes } = req.body

    if (isNaN(complaintId)) {
      logger.warn('Invalid complaint ID for resolution', { complaintId })
      return sendErrorResponse(res, 'Invalid complaint ID', 400)
    }

    if (!action || !['resolve', 'dismiss'].includes(action)) {
      logger.warn('Invalid action for complaint resolution', { action })
      return sendErrorResponse(res, 'Invalid action. Must be resolve or dismiss', 400)
    }

    const result = await adminService.resolveComplaint(complaintId, action, adminNotes)
    logger.info('Admin resolved complaint', { adminId: req.user.UserID, complaintId, action })
    return sendSuccessResponse(res, result, `Complaint ${action}d successfully`)

  } catch (error: any) {
    logger.error('Error resolving complaint', { error: error.message })
    if (error instanceof ValidationError) {
      sendErrorResponse(res, error.message, error.statusCode)
    } else {
      sendErrorResponse(res, error.message, 500)
    }
  }
}


export async function getSystemHealth(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      logger.warn('Unauthorized system health access attempt')
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const health = await adminService.getSystemHealth()
    logger.info('Admin checked system health', { adminId: req.user.UserID })
    return sendSuccessResponse(res, health, 'System health retrieved successfully')

  } catch (error: any) {
    logger.error('Error retrieving system health', { error: error.message })
    sendErrorResponse(res, error.message, 500)
  }
}