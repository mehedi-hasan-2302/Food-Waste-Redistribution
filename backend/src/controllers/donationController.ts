import { Request, Response } from 'express'
import * as donationService from '../services/donationService'
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelper'
import {
  UserDoesNotExistError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../utils/errors'

export async function createDonationClaim(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const charityOrgUserId = req.user.UserID
    const foodListingId = parseInt(req.params.id)
    const claimData = req.body

    const result = await donationService.createDonationClaim(charityOrgUserId, foodListingId,claimData)
    return sendSuccessResponse(res, result, 'Donation claim created successfully')

  } catch (e: any) {
    if (e instanceof UserDoesNotExistError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof FoodListingNotFoundError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof UnauthorizedActionError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof ValidationError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}

export async function authorizeDonationPickup(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const donorId = req.user.UserID
    const claimId = parseInt(req.params.id)
    const { pickupCode } = req.body

    if (isNaN(claimId)) {
      return sendErrorResponse(res, 'Invalid claim ID', 400)
    }

    if (!pickupCode) {
      return sendErrorResponse(res, 'Pickup code is required', 400)
    }

    const result = await donationService.authorizeDonationPickup(donorId, claimId, pickupCode)
    return sendSuccessResponse(res, result, 'Donation pickup authorized successfully')

  } catch (e: any) {
    if (e instanceof ValidationError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof UnauthorizedActionError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}

export async function completeDonationDelivery(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const volunteerId = req.user.UserID
    const claimId = parseInt(req.params.id)

    if (isNaN(claimId)) {
      return sendErrorResponse(res, 'Invalid claim ID', 400)
    }

    const result = await donationService.completeDonationDelivery(volunteerId, claimId)
    return sendSuccessResponse(res, result, 'Donation delivery completed successfully')

  } catch (e: any) {
    if (e instanceof ValidationError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof UnauthorizedActionError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}

export async function reportDonationDeliveryFailure(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const volunteerId = req.user.UserID
    const claimId = parseInt(req.params.id)
    const { reason } = req.body

    if (isNaN(claimId)) {
      return sendErrorResponse(res, 'Invalid claim ID', 400)
    }

    if (!reason) {
      return sendErrorResponse(res, 'Failure reason is required', 400)
    }

    const result = await donationService.reportDonationDeliveryFailure(volunteerId, claimId, reason)
    return sendSuccessResponse(res, result, 'Donation delivery failure reported successfully')

  } catch (e: any) {
    if (e instanceof ValidationError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof UnauthorizedActionError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}

export async function getDonationClaimById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const claimId = parseInt(req.params.id)

    if (isNaN(claimId)) {
      return sendErrorResponse(res, 'Invalid claim ID', 400)
    }

    const result = await donationService.getDonationClaimById(userId, claimId)
    return sendSuccessResponse(res, result, 'Donation claim retrieved successfully')

  } catch (e: any) {
    if (e instanceof ValidationError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof UnauthorizedActionError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}

export async function getMyDonationClaims(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const charityOrgUserId = req.user.UserID
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const result = await donationService.getMyDonationClaims(charityOrgUserId, offset, parseInt(limit as string))
    return sendSuccessResponse(res, result, 'Donation claims retrieved successfully')

  } catch (e: any) {
    sendErrorResponse(res, e.message, 500)
  }
}

export async function getMyDonationOffers(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const donorId = req.user.UserID
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const result = await donationService.getMyDonationOffers(donorId, offset, parseInt(limit as string))
    return sendSuccessResponse(res, result, 'Donation offers retrieved successfully')

  } catch (e: any) {
    sendErrorResponse(res, e.message, 500)
  }
}

export async function getMyDonationDeliveries(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const volunteerId = req.user.UserID
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const result = await donationService.getMyDonationDeliveries(volunteerId, offset, parseInt(limit as string))
    return sendSuccessResponse(res, result, 'Donation deliveries retrieved successfully')

  } catch (e: any) {
    sendErrorResponse(res, e.message, 500)
  }
}

export async function cancelDonationClaim(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const claimId = parseInt(req.params.id)
    const { reason } = req.body

    if (isNaN(claimId)) {
      return sendErrorResponse(res, 'Invalid claim ID', 400)
    }

    const result = await donationService.cancelDonationClaim(userId, claimId, reason)
    return sendSuccessResponse(res, result, 'Donation claim cancelled successfully')

  } catch (e: any) {
    if (e instanceof ValidationError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof UnauthorizedActionError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}


export async function getDonationStats(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    
    // Get basic stats - enhance based on your needs
    const [totalClaims, totalOffers] = await Promise.all([
      donationService.getMyDonationClaims(userId, 0, 1000), // Get all claims for stats
      donationService.getMyDonationOffers(userId, 0, 1000)   // Get all offers for stats
    ])

    const claimStats = {
      totalClaims: totalClaims.length,
      approvedClaims: totalClaims.filter((c: any) => c.ClaimStatus === 'APPROVED').length,
      pendingClaims: totalClaims.filter((c: any) => c.ClaimStatus === 'PENDING').length,
      rejectedClaims: totalClaims.filter((c: any) => c.ClaimStatus === 'REJECTED').length,
      cancelledClaims: totalClaims.filter((c: any) => c.ClaimStatus === 'CANCELLED').length
    }

    const offerStats = {
      totalOffers: totalOffers.length,
      approvedOffers: totalOffers.filter((o: any) => o.ClaimStatus === 'APPROVED').length,
      pendingOffers: totalOffers.filter((o: any) => o.ClaimStatus === 'PENDING').length,
      rejectedOffers: totalOffers.filter((o: any) => o.ClaimStatus === 'REJECTED').length,
      cancelledOffers: totalOffers.filter((o: any) => o.ClaimStatus === 'CANCELLED').length
    }

    const stats = {
      claims: claimStats,
      offers: offerStats,
      summary: {
        totalInteractions: claimStats.totalClaims + offerStats.totalOffers,
        successfulDeliveries: claimStats.approvedClaims + offerStats.approvedOffers,
        activeItems: claimStats.pendingClaims + offerStats.pendingOffers
      }
    }

    return sendSuccessResponse(res, stats, 'Donation statistics retrieved successfully')

  } catch (e: any) {
    sendErrorResponse(res, e.message, 500)
  }
}