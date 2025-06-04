import { Request, Response } from 'express'
import * as adminService from '../services/adminService'
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelper'
import {
  UserDoesNotExistError,
  UnauthorizedActionError,
  ValidationError,
  ProfileNotFoundError
} from '../utils/errors'


export async function getDashboardStats(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const stats = await adminService.getAdminDashboardStats()
    return sendSuccessResponse(res, stats, 'Dashboard stats retrieved successfully')

  } catch (error: any) {
    sendErrorResponse(res, error.message, 500)
  }
}


export async function getAllUsers(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
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
    return sendSuccessResponse(res, users, 'Users retrieved successfully')

  } catch (error: any) {
    sendErrorResponse(res, error.message, 500)
  }
}


export async function getPendingVerifications(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const pendingVerifications = await adminService.getPendingVerifications()
    return sendSuccessResponse(res, pendingVerifications, 'Pending verifications retrieved successfully')

  } catch (error: any) {
    sendErrorResponse(res, error.message, 500)
  }
}


export async function processVerification(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const { userId, type, status, reason } = req.body

    if (!userId || !type || !status) {
      return sendErrorResponse(res, 'Missing required fields: userId, type, status', 400)
    }

    if (!['charity', 'delivery'].includes(type)) {
      return sendErrorResponse(res, 'Invalid verification type. Must be charity or delivery', 400)
    }

    if (!['approve', 'reject'].includes(status)) {
      return sendErrorResponse(res, 'Invalid status. Must be approve or reject', 400)
    }

    const result = await adminService.processVerificationRequest({
      userId: parseInt(userId),
      type,
      status,
      reason
    })

    return sendSuccessResponse(res, result, `Verification ${status}d successfully`)

  } catch (error: any) {
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
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const userId = parseInt(req.params.userId)
    const { reason } = req.body

    if (isNaN(userId)) {
      return sendErrorResponse(res, 'Invalid user ID', 400)
    }

    if (!reason) {
      return sendErrorResponse(res, 'Suspension reason is required', 400)
    }

    const result = await adminService.suspendUser(userId, reason)
    return sendSuccessResponse(res, result, 'User suspended successfully')

  } catch (error: any) {
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
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const userId = parseInt(req.params.userId)

    if (isNaN(userId)) {
      return sendErrorResponse(res, 'Invalid user ID', 400)
    }

    const result = await adminService.reactivateUser(userId)
    return sendSuccessResponse(res, result, 'User reactivated successfully')

  } catch (error: any) {
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
    return sendSuccessResponse(res, listings, 'Food listings retrieved successfully')

  } catch (error: any) {
    sendErrorResponse(res, error.message, 500)
  }
}


export async function removeFoodListing(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const listingId = parseInt(req.params.listingId)
    const { reason } = req.body

    if (isNaN(listingId)) {
      return sendErrorResponse(res, 'Invalid listing ID', 400)
    }

    if (!reason) {
      return sendErrorResponse(res, 'Removal reason is required', 400)
    }

    const result = await adminService.removeFoodListing(listingId, reason)
    return sendSuccessResponse(res, result, 'Food listing removed successfully')

  } catch (error: any) {
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
    return sendSuccessResponse(res, complaints, 'Complaints retrieved successfully')

  } catch (error: any) {
    sendErrorResponse(res, error.message, 500)
  }
}


export async function resolveComplaint(req: Request, res: Response) {
  try {
    if (!req.user || req.user.Role !== 'ADMIN') {
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const complaintId = parseInt(req.params.complaintId)
    const { action, adminNotes } = req.body

    if (isNaN(complaintId)) {
      return sendErrorResponse(res, 'Invalid complaint ID', 400)
    }

    if (!action || !['resolve', 'dismiss'].includes(action)) {
      return sendErrorResponse(res, 'Invalid action. Must be resolve or dismiss', 400)
    }

    const result = await adminService.resolveComplaint(complaintId, action, adminNotes)
    return sendSuccessResponse(res, result, `Complaint ${action}d successfully`)

  } catch (error: any) {
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
      return sendErrorResponse(res, 'Admin access required', 403)
    }

    const health = await adminService.getSystemHealth()
    return sendSuccessResponse(res, health, 'System health retrieved successfully')

  } catch (error: any) {
    sendErrorResponse(res, error.message, 500)
  }
}