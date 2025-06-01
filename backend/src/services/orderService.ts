import { AppDataSource } from '../config/data-source'
import { User, UserRole } from '../models/User'
import { FoodListing, ListingStatus } from '../models/FoodListing'
import { Order, OrderStatus, PaymentStatus, DeliveryType } from '../models/Order'
import { IndependentDelivery } from '../models/IndependentDelivery'
import { Delivery, DeliveryStatus, DeliveryPersonnelType } from '../models/Delivery'
import {
  UserDoesNotExistError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../utils/errors'
import { generateUniqueCode } from '../utils/codeGenerator'
import { sendNotification } from '../services/notificationService'

const userRepo = AppDataSource.getRepository(User)
const foodListingRepo = AppDataSource.getRepository(FoodListing)
const orderRepo = AppDataSource.getRepository(Order)
const independentDeliveryRepo = AppDataSource.getRepository(IndependentDelivery)
const deliveryRepo = AppDataSource.getRepository(Delivery)

export interface CreateOrderInput {
  listingId: number
  deliveryType: DeliveryType
  deliveryAddress: string
  proposedPrice?: number // For negotiated items
  orderNotes?: string
}

export interface OrderResponse {
  orderId: number
  orderStatus: OrderStatus
  pickupCode?: string
  estimatedTotal: number
  deliveryFee: number
  listing: any
  seller: any
  assignedDeliveryPersonnel?: any
}

// Create new order for food purchase
export async function createOrder(buyerId: number, orderData: CreateOrderInput): Promise<OrderResponse> {
  const buyer = await userRepo.findOne({
    where: { UserID: buyerId },
    relations: ['buyer'],
    select: {
      UserID: true,
      Role: true,
      AccountStatus: true,
      buyer: {
        ProfileID: true,
        DefaultDeliveryAddress: true
      }
    }
  })

  if (!buyer) throw new UserDoesNotExistError()
  if (buyer.Role !== UserRole.BUYER) {
    throw new UnauthorizedActionError('Only buyers can create orders')
  }

  const listing = await foodListingRepo.findOne({
    where: { ListingID: orderData.listingId },
    relations: ['donor'],
    select: {
      ListingID: true,
      Title: true,
      Description: true,
      Price: true,
      IsDonation: true,
      ListingStatus: true,
      PickupLocation: true,
      CreatedAt: true,
      donor: {
        UserID: true,
        Username: true,
        PhoneNumber: true
      }
    }
  })

  if (!listing) throw new FoodListingNotFoundError()
  
  if (listing.IsDonation) {
    throw new ValidationError('Cannot create purchase order for donation items. Use donation claim instead.')
  }

  if (listing.ListingStatus !== ListingStatus.ACTIVE) {
    throw new ValidationError('Cannot order inactive food listing')
  }

  if (listing.donor.UserID === buyerId) {
    throw new ValidationError('Cannot order your own food listing')
  }

  // Calculate dynamic price (with time-based discount)
  const hoursElapsed = (Date.now() - listing.CreatedAt.getTime()) / (1000 * 60 * 60)
  const discountRate = Math.min(hoursElapsed * 0.05, 0.5)
  const currentPrice = (listing.Price ?? 0) * (1 - discountRate)
  const finalPrice = orderData.proposedPrice || currentPrice

  let deliveryFee = 0
  let assignedDeliveryPersonnel = null

  // Handle delivery assignment for home delivery
  if (orderData.deliveryType === DeliveryType.HOME_DELIVERY) {
    const availableDeliveryPersonnel = await findAvailableDeliveryPersonnel(orderData.deliveryAddress)
    if (!availableDeliveryPersonnel) {
      throw new ValidationError('No delivery personnel available in your area')
    }
    assignedDeliveryPersonnel = availableDeliveryPersonnel
    deliveryFee = calculateDeliveryFee(orderData.deliveryAddress, listing.PickupLocation)
  }

  // Generate unique pickup code
  const pickupCode = generateUniqueCode()

  // Create order
  const order = new Order()
  order.buyer = buyer
  order.seller = listing.donor
  order.listing = listing
  order.DeliveryFee = deliveryFee
  order.OrderStatus = OrderStatus.PENDING
  order.PaymentStatus = PaymentStatus.PENDING
  order.DeliveryType = orderData.deliveryType
  order.DeliveryAddress = orderData.deliveryAddress
  order.PickupCode = pickupCode
  order.FinalPrice = finalPrice
  order.OrderNotes = orderData.orderNotes

  const savedOrder = await orderRepo.save(order)

  // Create delivery record if home delivery
  if (orderData.deliveryType === DeliveryType.HOME_DELIVERY && assignedDeliveryPersonnel) {
    const delivery = new Delivery()
    delivery.order = savedOrder
    delivery.DeliveryPersonnelType = DeliveryPersonnelType.INDEPENDENT
    delivery.independentDeliveryPersonnel = assignedDeliveryPersonnel.user
    delivery.DeliveryStatus = DeliveryStatus.SCHEDULED

    await deliveryRepo.save(delivery)

    // Send notification to delivery personnel
    await sendNotification(
      assignedDeliveryPersonnel.user.UserID,
      'NEW_DELIVERY_REQUEST',
      `New delivery request for order #${savedOrder.OrderID}. Pickup code: ${pickupCode}`,
      savedOrder.OrderID
    )
  }

  // Update listing status to claimed (order placed)
  await foodListingRepo.update(
    { ListingID: order.listing.ListingID },
    { ListingStatus: ListingStatus.CLAIMED }
  )

  // Send notification to seller
  await sendNotification(
    listing.donor.UserID,
    'NEW_ORDER_RECEIVED',
    `New order received for ${listing.Title}. Pickup code: ${pickupCode}`,
    savedOrder.OrderID
  )

  // Send notification to buyer
  await sendNotification(
    buyerId,
    'ORDER_CREATED',
    `Order created successfully. Order ID: ${savedOrder.OrderID}`,
    savedOrder.OrderID
  )

  return {
    orderId: savedOrder.OrderID,
    orderStatus: savedOrder.OrderStatus,
    pickupCode: pickupCode,
    estimatedTotal: finalPrice + deliveryFee,
    deliveryFee: deliveryFee,
    listing: {
      id: listing.ListingID,
      title: listing.Title,
      description: listing.Description,
      originalPrice: listing.Price,
      finalPrice: finalPrice
    },
    seller: {
      id: listing.donor.UserID,
      username: listing.donor.Username,
      phone: listing.donor.PhoneNumber
    },
    assignedDeliveryPersonnel: assignedDeliveryPersonnel ? {
      id: assignedDeliveryPersonnel.user.UserID,
      name: assignedDeliveryPersonnel.FullName,
      rating: assignedDeliveryPersonnel.CurrentRating
    } : undefined
  }
}

// Seller authorizes pickup (verifies pickup code when volunteer/buyer arrives)
export async function authorizePickup(sellerId: number, orderId: number, providedCode: string): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: ['seller', 'buyer', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel'],
    select: {
      OrderID: true,
      PickupCode: true,
      OrderStatus: true,
      DeliveryType: true,
      seller: { UserID: true },
      buyer: { UserID: true, Username: true },
      listing: { ListingID: true, Title: true }
    }
  })

  if (!order) {
    throw new ValidationError('Order not found')
  }

  if (order.seller.UserID !== sellerId) {
    throw new UnauthorizedActionError('Only the seller can authorize pickup for this order')
  }

  if (order.OrderStatus !== OrderStatus.PENDING) {
    throw new ValidationError('Order is not in pending status')
  }

  if (order.PickupCode !== providedCode) {
    throw new ValidationError('Invalid pickup code')
  }

  // Update order status to confirmed (pickup authorized)
  order.OrderStatus = OrderStatus.CONFIRMED
  const updatedOrder = await orderRepo.save(order)

  if (order.DeliveryType === DeliveryType.HOME_DELIVERY) {
    // Update delivery status to in transit
    if (order.delivery) {
      order.delivery.DeliveryStatus = DeliveryStatus.IN_TRANSIT
      await deliveryRepo.save(order.delivery)
    }

    // Notify delivery personnel
    await sendNotification(
      order.delivery?.independentDeliveryPersonnel?.UserID || 0,
      'PICKUP_AUTHORIZED',
      `Pickup authorized for order #${orderId}. Please deliver to customer.`,
      orderId
    )

    // Notify buyer
    await sendNotification(
      order.buyer.UserID,
      'ORDER_PICKED_UP',
      `Your order #${orderId} has been picked up by delivery personnel and is on the way.`,
      orderId
    )
  } else {
    // For self pickup, buyer has the item now, so complete the order
    order.OrderStatus = OrderStatus.COMPLETED
    order.PaymentStatus = PaymentStatus.PAID
    await orderRepo.save(order)

    // Notify buyer
    await sendNotification(
      order.buyer.UserID,
      'ORDER_COMPLETED',
      `Your order #${orderId} has been completed via self-pickup.`,
      orderId
    )
  }

  return updatedOrder
}

// Complete delivery (used by delivery personnel for home delivery)
export async function completeDelivery(deliveryPersonnelId: number, orderId: number): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: ['seller', 'buyer', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel']
  })

  if (!order) {
    throw new ValidationError('Order not found')
  }

  if (!order.delivery || order.delivery.independentDeliveryPersonnel?.UserID !== deliveryPersonnelId) {
    throw new UnauthorizedActionError('You are not assigned to this delivery')
  }

  if (order.OrderStatus !== OrderStatus.CONFIRMED) {
    throw new ValidationError('Order must be confirmed (picked up) first')
  }

  if (order.delivery.DeliveryStatus !== DeliveryStatus.IN_TRANSIT) {
    throw new ValidationError('Delivery must be in transit to complete')
  }

  // Complete the order
  order.OrderStatus = OrderStatus.COMPLETED
  order.PaymentStatus = PaymentStatus.PAID
  order.delivery.DeliveryStatus = DeliveryStatus.DELIVERED

  await orderRepo.save(order)
  await deliveryRepo.save(order.delivery)

  // Send notifications
  await sendNotification(
    order.buyer.UserID,
    'ORDER_DELIVERED',
    `Your order #${orderId} has been delivered successfully.`,
    orderId
  )

  await sendNotification(
    order.seller.UserID,
    'ORDER_COMPLETED',
    `Order #${orderId} has been completed and delivered.`,
    orderId
  )

  return order
}

// Report delivery failure
export async function reportDeliveryFailure(deliveryPersonnelId: number, orderId: number, reason: string): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: ['seller', 'buyer', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel']
  })

  if (!order) {
    throw new ValidationError('Order not found')
  }

  if (!order.delivery || order.delivery.independentDeliveryPersonnel?.UserID !== deliveryPersonnelId) {
    throw new UnauthorizedActionError('You are not assigned to this delivery')
  }

  // Update delivery status
  order.delivery.DeliveryStatus = DeliveryStatus.FAILED
  await deliveryRepo.save(order.delivery)

  // Send notifications
  await sendNotification(
    order.buyer.UserID,
    'DELIVERY_FAILED',
    `Delivery failed for order #${orderId}. Reason: ${reason}`,
    orderId
  )

  await sendNotification(
    order.seller.UserID,
    'DELIVERY_FAILED',
    `Delivery failed for order #${orderId}. Reason: ${reason}`,
    orderId
  )

  return order
}

// Get order details
export async function getOrderById(userId: number, orderId: number): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: [
      'buyer', 'seller', 'listing', 'delivery', 
      'delivery.independentDeliveryPersonnel'
    ]
  })

  if (!order) {
    throw new ValidationError('Order not found')
  }

  // Check if user has access to this order
  const hasAccess = order.buyer.UserID === userId || 
                   order.seller.UserID === userId ||
                   order.delivery?.independentDeliveryPersonnel?.UserID === userId

  if (!hasAccess) {
    throw new UnauthorizedActionError('Access denied')
  }

  return order
}


// Get user's orders (as buyer)
export async function getMyOrders(buyerId: number, offset: number, limit: number): Promise<any> {
  const orders = await orderRepo.find({
    where: { buyer: { UserID: buyerId } },
    relations: ['seller', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel'],
    skip: offset,
    take: limit,
    order: { OrderID: 'DESC' }
  })

  return orders
}


// Get user's sales (as seller)
export async function getMySales(sellerId: number, offset: number, limit: number): Promise<any> {
  const sales = await orderRepo.find({
    where: { seller: { UserID: sellerId } },
    relations: ['buyer', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel'],
    skip: offset,
    take: limit,
    order: { OrderID: 'DESC' }
  })

  return sales
}


// Get delivery personnel's assigned deliveries
export async function getMyDeliveries(deliveryPersonnelId: number, offset: number, limit: number): Promise<any> {
  const deliveries = await deliveryRepo.find({
    where: { independentDeliveryPersonnel: { UserID: deliveryPersonnelId } },
    relations: ['order', 'order.buyer', 'order.seller', 'order.listing'],
    skip: offset,
    take: limit,
    order: { DeliveryID: 'DESC' }
  })

  return deliveries
}


// Cancel order
export async function cancelOrder(userId: number, orderId: number, reason?: string): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: ['buyer', 'seller', 'listing', 'delivery']
  })

  if (!order) {
    throw new ValidationError('Order not found')
  }

  if (order.buyer.UserID !== userId && order.seller.UserID !== userId) {
    throw new UnauthorizedActionError('Only buyer or seller can cancel this order')
  }

  if (order.OrderStatus === OrderStatus.COMPLETED) {
    throw new ValidationError('Cannot cancel completed order')
  }

  if (order.OrderStatus === OrderStatus.CONFIRMED) {
    throw new ValidationError('Cannot cancel order that has been picked up')
  }

  order.OrderStatus = OrderStatus.CANCELLED
  const updatedOrder = await orderRepo.save(order)

  // Update listing status back to active
  await foodListingRepo.update(
    { ListingID: order.listing.ListingID },
    { ListingStatus: ListingStatus.ACTIVE }
  )

  // Cancel delivery if exists
  if (order.delivery) {
    order.delivery.DeliveryStatus = DeliveryStatus.FAILED
    await deliveryRepo.save(order.delivery)
  }

  // Send notifications
  const cancellerRole = order.buyer.UserID === userId ? 'buyer' : 'seller'
  const otherPartyId = cancellerRole === 'buyer' ? order.seller.UserID : order.buyer.UserID

  await sendNotification(
    otherPartyId,
    'ORDER_CANCELLED',
    `Order #${orderId} has been cancelled by the ${cancellerRole}. ${reason ? 'Reason: ' + reason : ''}`,
    orderId
  )

  return updatedOrder
}

// Helper function to find available delivery personnel
async function findAvailableDeliveryPersonnel(deliveryAddress: string): Promise<any> {
  // This is a simplified version - you'd implement proper geo-matching logic
  const deliveryPersonnel = await independentDeliveryRepo.findOne({
    where: { IsIDVerifiedByAdmin: true },
    relations: ['user'],
    order: { CurrentRating: 'DESC' }
  })

  return deliveryPersonnel
}

// Helper function to calculate delivery fee
function calculateDeliveryFee(deliveryAddress: string, pickupLocation?: string): number {
  return 50.00 
}