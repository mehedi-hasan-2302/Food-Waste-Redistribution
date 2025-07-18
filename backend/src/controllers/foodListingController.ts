import { Request, Response } from 'express'
import * as foodListingService from '../services/foodListingService'
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelper'
import {
  UserDoesNotExistError,
  ProfileNotFoundError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../utils/errors'
import logger from '../utils/logger'


export async function createFoodListing(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const listingData = req.body;
    const imageFile = req.file

    const result = await foodListingService.createFoodListingWithImage(
      userId, 
      listingData, 
      imageFile
    )
    
    logger.info('Food listing created', { userId })
    return sendSuccessResponse(res, result, 'Food listing created successfully')

  } catch (e: any) {
    logger.error('Error creating food listing', { error: e.message })

    if (e instanceof UserDoesNotExistError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof ProfileNotFoundError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof ValidationError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}


export async function getAllFoodListings(req: Request, res: Response) {
  try {
    const filters = req.query
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)
    
    const result = await foodListingService.getAllFoodListings(filters, offset, parseInt(limit as string))
    logger.info('Fetched all food listings')
    return sendSuccessResponse(res, result, 'Food listings retrieved successfully')

  } catch (e: any) {
    logger.error('Error fetching food listings', { error: e.message })
    sendErrorResponse(res, e.message, 500)
  }
}


export async function getFoodListingById(req: Request, res: Response) {
  try {
    const listingId = parseInt(req.params.id)
    
    if (isNaN(listingId) || listingId <= 0) {
      return sendErrorResponse(res, 'Invalid listing ID', 400)
    }

    const result = await foodListingService.getFoodListingById(listingId)
    logger.info('Fetched food listing by ID', { listingId })
    return sendSuccessResponse(res, result, 'Food listing retrieved successfully')

  } catch (e: any) {
    logger.error('Error fetching food listing by ID', { error: e.message, listingId: req.params.id })

    if (e instanceof FoodListingNotFoundError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof ValidationError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}


export async function updateFoodListing(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const listingId = parseInt(req.params.id)
    const updateData = req.body
    const imageFile = req.file

    if (isNaN(listingId)) {
      return sendErrorResponse(res, 'Invalid listing ID', 400)
    }

    const result = await foodListingService.updateFoodListingWithImage(
      userId, 
      listingId, 
      updateData, 
      imageFile
    )
    
    logger.info('Food listing updated', { listingId, userId })
    return sendSuccessResponse(res, result, 'Food listing updated successfully')

  } catch (e: any) {
    logger.error('Error updating food listing', { error: e.message })

    if (e instanceof FoodListingNotFoundError) {
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



export async function deleteFoodListing(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const listingId = parseInt(req.params.id)

    if (isNaN(listingId)) {
      return sendErrorResponse(res, 'Invalid listing ID', 400)
    }

    const result = await foodListingService.deleteFoodListing(userId, listingId)
    logger.info('Food listing deleted', { listingId, userId })
    return sendSuccessResponse(res, result, 'Food listing deleted successfully')

  } catch (e: any) {
    logger.error('Error deleting food listing', { error: e.message })

    if (e instanceof FoodListingNotFoundError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof UnauthorizedActionError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}



export async function getMyFoodListings(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const filters = req.query
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)
    
    const result = await foodListingService.getMyFoodListings(userId, filters, offset, parseInt(limit as string))
    logger.info('Fetched my food listings', { userId })
    return sendSuccessResponse(res, result, 'My food listings retrieved successfully')

  } catch (e: any) {
    logger.error('Error fetching my food listings', { error: e.message })
    sendErrorResponse(res, e.message, 500)
  }
}



export async function negotiatePrice(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const buyerId = req.user.UserID
    const listingId = parseInt(req.params.id)
    const { proposedPrice } = req.body

    if (isNaN(listingId)) {
      return sendErrorResponse(res, 'Invalid listing ID', 400)
    }

    const result = await foodListingService.negotiatePrice(buyerId, listingId, proposedPrice)
    logger.info('Price negotiation initiated', { listingId, buyerId, proposedPrice })
    return sendSuccessResponse(res, result, 'Price negotiation initiated successfully')

  } catch (e: any) {
    logger.error('Error in price negotiation', { error: e.message })

    if (e instanceof FoodListingNotFoundError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else if (e instanceof ValidationError) {
      sendErrorResponse(res, e.message, e.statusCode)
    } else {
      sendErrorResponse(res, e.message, 500)
    }
  }
}



export async function searchFoodListings(req: Request, res: Response) {
  try {
    const searchParams = req.query
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)
    
    const result = await foodListingService.searchFoodListings(searchParams, offset, parseInt(limit as string))
    logger.info('Searched food listings', { searchParams })
    return sendSuccessResponse(res, result, 'Food listings search completed successfully')

  } catch (e: any) {
    logger.error('Error searching food listings', { error: e.message })
    sendErrorResponse(res, e.message, 500)
  }
}



export async function getFoodListingStats(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const result = await foodListingService.getFoodListingStats(userId)
    logger.info('Fetched food listing statistics', { userId })
    return sendSuccessResponse(res, result, 'Food listing statistics retrieved successfully')

  } catch (e: any) {
    logger.error('Error fetching food listing statistics', { error: e.message })
    sendErrorResponse(res, e.message, 500)
  }
}



export async function toggleListingStatus(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const listingId = parseInt(req.params.id)
    const { status } = req.body

    if (isNaN(listingId)) {
      return sendErrorResponse(res, 'Invalid listing ID', 400)
    }

    const result = await foodListingService.toggleListingStatus(userId, listingId, status)
    logger.info('Toggled listing status', { listingId, userId, status })
    return sendSuccessResponse(res, result, 'Listing status updated successfully')

  } catch (e: any) {
    logger.error('Error toggling listing status', { error: e.message })

    if (e instanceof FoodListingNotFoundError) {
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