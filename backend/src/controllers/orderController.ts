import { Request, Response } from 'express'
import * as orderService from '../services/orderService'
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelper'
import {
  UserDoesNotExistError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../utils/errors'


export async function createOrder(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const buyerId = req.user.UserID
    const foodListingId = parseInt(req.params.id)
    const orderData = req.body

    const result = await orderService.createOrder(buyerId, foodListingId, orderData)
    return sendSuccessResponse(res, result, 'Order created successfully')

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



export async function authorizePickup(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const sellerId = req.user.UserID
    const orderId = parseInt(req.params.id)
    const { pickupCode } = req.body

    if (isNaN(orderId)) {
      return sendErrorResponse(res, 'Invalid order ID', 400)
    }

    if (!pickupCode) {
      return sendErrorResponse(res, 'Pickup code is required', 400)
    }

    const result = await orderService.authorizePickup(sellerId, orderId, pickupCode)
    return sendSuccessResponse(res, result, 'Pickup authorized successfully')

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


export async function completeDelivery(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const buyerId = req.user.UserID
    const orderId = parseInt(req.params.id)

    if (isNaN(orderId)) {
      return sendErrorResponse(res, 'Invalid order ID', 400)
    }

    const result = await orderService.completeDelivery(buyerId, orderId)
    return sendSuccessResponse(res, result, 'Delivery completed successfully')

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


export async function reportDeliveryFailure(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const deliveryPersonnelId = req.user.UserID
    const orderId = parseInt(req.params.id)
    const { reason } = req.body

    if (isNaN(orderId)) {
      return sendErrorResponse(res, 'Invalid order ID', 400)
    }

    if (!reason) {
      return sendErrorResponse(res, 'Failure reason is required', 400)
    }

    const result = await orderService.reportDeliveryFailure(deliveryPersonnelId, orderId, reason)
    return sendSuccessResponse(res, result, 'Delivery failure reported successfully')

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


export async function getOrderById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const orderId = parseInt(req.params.id)

    if (isNaN(orderId)) {
      return sendErrorResponse(res, 'Invalid order ID', 400)
    }

    const result = await orderService.getOrderById(userId, orderId)
    return sendSuccessResponse(res, result, 'Order retrieved successfully')

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


export async function getMyOrders(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const buyerId = req.user.UserID
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const result = await orderService.getMyOrders(buyerId, offset, parseInt(limit as string))
    return sendSuccessResponse(res, result, 'Orders retrieved successfully')

  } catch (e: any) {
    sendErrorResponse(res, e.message, 500)
  }
}


export async function getMySales(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const sellerId = req.user.UserID
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const result = await orderService.getMySales(sellerId, offset, parseInt(limit as string))
    return sendSuccessResponse(res, result, 'Sales retrieved successfully')

  } catch (e: any) {
    sendErrorResponse(res, e.message, 500)
  }
}


export async function getMyDeliveries(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const deliveryPersonnelId = req.user.UserID
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const result = await orderService.getMyDeliveries(deliveryPersonnelId, offset, parseInt(limit as string))
    return sendSuccessResponse(res, result, 'Deliveries retrieved successfully')

  } catch (e: any) {
    sendErrorResponse(res, e.message, 500)
  }
}


export async function cancelOrder(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    const orderId = parseInt(req.params.id)
    const { reason } = req.body

    if (isNaN(orderId)) {
      return sendErrorResponse(res, 'Invalid order ID', 400)
    }

    const result = await orderService.cancelOrder(userId, orderId, reason)
    return sendSuccessResponse(res, result, 'Order cancelled successfully')

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


export async function getOrderStats(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const userId = req.user.UserID
    
    // Get basic stats - you can enhance this based on your needs
    const [totalOrders, totalSales] = await Promise.all([
      orderService.getMyOrders(userId, 0, 1000), // Get all orders for stats
      orderService.getMySales(userId, 0, 1000)   // Get all sales for stats
    ])

    const orderStats = {
      totalOrders: totalOrders.length,
      completedOrders: totalOrders.filter((o: any) => o.OrderStatus === 'COMPLETED').length,
      pendingOrders: totalOrders.filter((o: any) => o.OrderStatus === 'PENDING').length,
      cancelledOrders: totalOrders.filter((o: any) => o.OrderStatus === 'CANCELLED').length,
      totalSpent: totalOrders.reduce((sum: number, o: any) => sum + (o.FinalPrice + o.DeliveryFee), 0)
    }

    const salesStats = {
      totalSales: totalSales.length,
      completedSales: totalSales.filter((s: any) => s.OrderStatus === 'COMPLETED').length,
      pendingSales: totalSales.filter((s: any) => s.OrderStatus === 'PENDING').length,
      cancelledSales: totalSales.filter((s: any) => s.OrderStatus === 'CANCELLED').length,
      totalEarned: totalSales.reduce((sum: number, s: any) => sum + s.FinalPrice, 0)
    }

    const result = {
      orders: orderStats,
      sales: salesStats
    }

    return sendSuccessResponse(res, result, 'Order statistics retrieved successfully')

  } catch (e: any) {
    sendErrorResponse(res, e.message, 500)
  }
}