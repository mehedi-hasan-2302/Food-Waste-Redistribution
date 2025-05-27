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
import fs from 'fs/promises'


export async function createFoodListing(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const listingData = req.body
    const imageFile = req.file

    const result = await foodListingService.createFoodListingWithImage(
      userId, 
      listingData, 
      imageFile
    )
    
    return sendSuccessResponse(res, result, 'Food listing created successfully')

  } catch (e: any) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error('Failed to delete temp file:', unlinkError)
      }
    }

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
    const result = await foodListingService.getAllFoodListings(filters)
    return sendSuccessResponse(res, result, 'Food listings retrieved successfully')

  } catch (e: any) {
    sendErrorResponse(res, e.message, 500)
  }
}


export async function getFoodListingById(req: Request, res: Response) {
  try {
    const listingId = parseInt(req.params.id)
    
    if (isNaN(listingId)) {
      return sendErrorResponse(res, 'Invalid listing ID', 400)
    }

    const result = await foodListingService.getFoodListingById(listingId)
    return sendSuccessResponse(res, result, 'Food listing retrieved successfully')

  } catch (e: any) {
    if (e instanceof FoodListingNotFoundError) {
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
    
    return sendSuccessResponse(res, result, 'Food listing updated successfully')

  } catch (e: any) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error('Failed to delete temp file:', unlinkError)
      }
    }

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
    return sendSuccessResponse(res, result, 'Food listing deleted successfully')

  } catch (e: any) {
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
    const result = await foodListingService.getMyFoodListings(userId, filters)
    return sendSuccessResponse(res, result, 'My food listings retrieved successfully')

  } catch (e: any) {
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
    return sendSuccessResponse(res, result, 'Price negotiation initiated successfully')

  } catch (e: any) {
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
    const result = await foodListingService.searchFoodListings(searchParams)
    return sendSuccessResponse(res, result, 'Food listings search completed successfully')

  } catch (e: any) {
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
    return sendSuccessResponse(res, result, 'Food listing statistics retrieved successfully')

  } catch (e: any) {
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
    return sendSuccessResponse(res, result, 'Listing status updated successfully')

  } catch (e: any) {
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