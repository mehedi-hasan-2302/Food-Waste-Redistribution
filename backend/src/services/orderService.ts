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
import { sendRealTimeNotification, sendDeliveryNotification } from '../services/notificationService'
import { DonorSeller } from '../models/DonorSeller'


const userRepo = AppDataSource.getRepository(User)
const foodListingRepo = AppDataSource.getRepository(FoodListing)
const orderRepo = AppDataSource.getRepository(Order)
const independentDeliveryRepo = AppDataSource.getRepository(IndependentDelivery)
const deliveryRepo = AppDataSource.getRepository(Delivery)

export interface CreateOrderInput {
  listingId: number
  deliveryType: DeliveryType
  deliveryAddress: string
  proposedPrice?: number 
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


export async function createOrder(buyerId: number, listingId: number, orderData: CreateOrderInput): Promise<OrderResponse> {
  const buyer = await userRepo.findOne({
    where: { UserID: buyerId },
    relations: ['buyer'],
    select: {
      UserID: true,
      Role: true,
      AccountStatus: true,
      Username: true,
      PhoneNumber: true,
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
    where: { ListingID: listingId },
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

  const hoursElapsed = (Date.now() - listing.CreatedAt.getTime()) / (1000 * 60 * 60)
  const discountRate = Math.min(hoursElapsed * 0.05, 0.5)
  const currentPrice = (listing.Price ?? 0) * (1 - discountRate)
  const finalPrice = orderData.proposedPrice || currentPrice

  let deliveryFee = 0
  let assignedDeliveryPersonnel = null

  if (orderData.deliveryType === DeliveryType.HOME_DELIVERY) {
    if (!listing.PickupLocation) {
      throw new ValidationError('Pickup location is not specified for this listing')
    }
    
    const availableDeliveryPersonnel = await findAvailableDeliveryPersonnel(listing.PickupLocation)
    if (!availableDeliveryPersonnel) {
      throw new ValidationError('No delivery personnel available in your area')
    }
    
    assignedDeliveryPersonnel = availableDeliveryPersonnel
    deliveryFee = calculateDeliveryFee(orderData.deliveryAddress, listing.PickupLocation)
  }
  
  const pickupCode = generateUniqueCode()

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

  if (orderData.deliveryType === DeliveryType.HOME_DELIVERY && assignedDeliveryPersonnel) {
    const delivery = new Delivery()
    delivery.order = savedOrder
    delivery.DeliveryPersonnelType = DeliveryPersonnelType.INDEPENDENT
    delivery.independentDeliveryPersonnel = assignedDeliveryPersonnel.user
    delivery.DeliveryStatus = DeliveryStatus.SCHEDULED

    await deliveryRepo.save(delivery)

        await sendDeliveryNotification(
        assignedDeliveryPersonnel.user.UserID,
        'NEW_DELIVERY_REQUEST',
        `New delivery request for order #${savedOrder.OrderID}. Pickup code: ${pickupCode}`,
        savedOrder.OrderID,
        {
        orderId: savedOrder.OrderID,
        priority: 'high',
        pickupCode: pickupCode,
        pickupLocation: listing.PickupLocation,
        deliveryAddress: orderData.deliveryAddress,
        customerPhone: buyer.PhoneNumber,
        sellerPhone: listing.donor.PhoneNumber
        }
      )
  }
  
  await foodListingRepo.update(
    { ListingID: order.listing.ListingID },
    { ListingStatus: ListingStatus.CLAIMED }
  )

      await sendRealTimeNotification({
      recipientId: listing.donor.UserID,
      type: 'NEW_ORDER_RECEIVED',
      message: `New order received for ${listing.Title}. Pickup code: ${pickupCode}`,
      referenceId: savedOrder.OrderID,
      priority: 'high',
      data: {
        orderId: savedOrder.OrderID,
        listingTitle: listing.Title,
        buyerName: buyer.Username
      }
    })

      await sendRealTimeNotification({
      recipientId: buyerId,
      type: 'NEW_ORDER_RECEIVED',
      message: `New order received for ${listing.Title}. Pickup code: ${pickupCode}`,
      referenceId: savedOrder.OrderID,
      priority: 'high',
      data: {
        orderId: savedOrder.OrderID,
        listingTitle: listing.Title,
        foodPrice: listing.Price,
        deliveryFee: deliveryFee,
        finalPrice: finalPrice,
        buyerName: listing.donor.Username
      }
    })

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


export async function authorizePickup(sellerId: number, orderId: number, providedCode: string): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: ['seller', 'buyer', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel'],
    select: {
      OrderID: true,
      PickupCode: true,
      OrderStatus: true,
      DeliveryType: true,
      PaymentStatus: true,
      seller: { 
        UserID: true,
        Username: true
      },
      buyer: { 
        UserID: true, 
        Username: true,
        PhoneNumber: true
      },
      listing: { 
        ListingID: true, 
        Title: true 
      },
      delivery: {
        DeliveryID: true,
        DeliveryStatus: true,
        independentDeliveryPersonnel: {
          UserID: true,
          Username: true
        }
      }
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

  order.OrderStatus = OrderStatus.CONFIRMED
  const updatedOrder = await orderRepo.save(order)

  if (order.DeliveryType === DeliveryType.HOME_DELIVERY) {
    if (order.delivery) {
      order.delivery.DeliveryStatus = DeliveryStatus.IN_TRANSIT
      await deliveryRepo.save(order.delivery)
    }

        await sendRealTimeNotification({
        recipientId: order.delivery?.independentDeliveryPersonnel?.UserID || 0,
        type:  'DELIVERY_UPDATE',
        message: `Pickup authorized for order #${orderId}. Please deliver to customer.`,
        referenceId: orderId,
        priority: 'high',
        data: {
          orderId: orderId,
          listingTitle: order.listing.Title,
          buyerName: order.buyer.Username
        }
    })


       await sendRealTimeNotification({
        recipientId:  order.buyer.UserID,
        type:  'DELIVERY_UPDATE',
        message:  `Your order #${orderId} has been picked up by delivery personnel and is on the way.`,
        referenceId: orderId,
        priority: 'high',
        data: {
          orderId: orderId,
          listingTitle: order.listing.Title,
          buyerName: order.seller.Username
        }
    })
  } else {
    order.OrderStatus = OrderStatus.COMPLETED
    order.PaymentStatus = PaymentStatus.PAID

    foodListingRepo.update(
      { ListingID: order.listing.ListingID },
      { ListingStatus: ListingStatus.SOLD }
    )

    await orderRepo.save(order)

    await sendRealTimeNotification({
        recipientId:  order.buyer.UserID,
        type:  'DELIVERY_UPDATE',
        message:  `Your order #${orderId} has been completed via self-pickup.`,
        referenceId: orderId,
        priority: 'high',
        data: {
          orderId: orderId,
          listingTitle: order.listing.Title,
          buyerName: order.seller.Username
        }
    })
  }

  return {
    OrderID: updatedOrder.OrderID,
    OrderStatus: updatedOrder.OrderStatus,
    PaymentStatus: updatedOrder.PaymentStatus,
    DeliveryType: updatedOrder.DeliveryType,
    seller: {
      UserID: order.seller.UserID,
      Username: order.seller.Username
    },
    buyer: {
      UserID: order.buyer.UserID,
      Username: order.buyer.Username,
      PhoneNumber: order.buyer.PhoneNumber
    },
    listing: {
      ListingID: order.listing.ListingID,
      Title: order.listing.Title
    },
    delivery: order.delivery ? {
      DeliveryID: order.delivery.DeliveryID,
      DeliveryStatus: order.delivery.DeliveryStatus,
      independentDeliveryPersonnel: order.delivery.independentDeliveryPersonnel ? {
        UserID: order.delivery.independentDeliveryPersonnel.UserID,
        Username: order.delivery.independentDeliveryPersonnel.Username
      } : null
    } : null
  }
}


export async function completeDelivery(buyerId: number, orderId: number): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: ['seller', 'buyer', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel'],
    select: {
      OrderID: true,
      OrderStatus: true,
      PaymentStatus: true,
      seller: { 
        UserID: true,
        Username: true
      },
      buyer: { 
        UserID: true, 
        Username: true
      },
      listing: { 
        ListingID: true, 
        Title: true 
      },
      delivery: {
        DeliveryID: true,
        DeliveryStatus: true,
        independentDeliveryPersonnel: {
          UserID: true,
          Username: true
        }
      }
    }
  })

  if (!order) {
    throw new ValidationError('Order not found')
  }

  if (!order.delivery || order.buyer.UserID !== buyerId) {
    throw new UnauthorizedActionError('You are not assigned to this delivery')
  }

  if (order.OrderStatus !== OrderStatus.CONFIRMED) {
    throw new ValidationError('Order must be confirmed (picked up) first')
  }

  if (order.delivery.DeliveryStatus !== DeliveryStatus.IN_TRANSIT) {
    throw new ValidationError('Delivery must be in transit to complete')
  }

  order.OrderStatus = OrderStatus.COMPLETED
  order.PaymentStatus = PaymentStatus.PAID
  order.delivery.DeliveryStatus = DeliveryStatus.DELIVERED
  
  foodListingRepo.update(
    { ListingID: order.listing.ListingID },
    { ListingStatus: ListingStatus.SOLD }
  )

  await orderRepo.save(order)
  await deliveryRepo.save(order.delivery)

  await sendRealTimeNotification({
    recipientId: order.delivery.independentDeliveryPersonnel?.UserID ?? 0,
    type: 'ORDER_DELIVERED',
    message: `Your order #${orderId} has been delivered successfully.`,
    referenceId: orderId,
    data: {
      orderId: orderId,
      listingTitle: order.listing.Title,
      sellerName: order.seller.Username
    }
  })

   await sendRealTimeNotification({
    recipientId: order.seller.UserID,
    type: 'ORDER_DELIVERED',
    message: `Order #${orderId} has been completed and delivered successfully.`,
    referenceId: orderId,
    data: {
      orderId: orderId,
      listingTitle: order.listing.Title,
      sellerName: order.buyer.Username
    }
  })

  return {
    OrderID: order.OrderID,
    OrderStatus: order.OrderStatus,
    PaymentStatus: order.PaymentStatus,
    seller: {
      UserID: order.seller.UserID,
      Username: order.seller.Username
    },
    buyer: {
      UserID: order.buyer.UserID,
      Username: order.buyer.Username
    },
    listing: {
      ListingID: order.listing.ListingID,
      Title: order.listing.Title
    },
    delivery: {
      DeliveryID: order.delivery.DeliveryID,
      DeliveryStatus: order.delivery.DeliveryStatus,
      independentDeliveryPersonnel: order.delivery.independentDeliveryPersonnel ? {
        UserID: order.delivery.independentDeliveryPersonnel.UserID,
        Username: order.delivery.independentDeliveryPersonnel.Username
      } : null
    }
  }
}

export async function reportDeliveryFailure(deliveryPersonnelId: number, orderId: number, reason: string): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: ['seller', 'buyer', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel'],
    select: {
      OrderID: true,
      seller: { 
        UserID: true,
        Username: true
      },
      buyer: { 
        UserID: true, 
        Username: true
      },
      listing: { 
        ListingID: true, 
        Title: true 
      },
      delivery: {
        DeliveryID: true,
        DeliveryStatus: true,
        independentDeliveryPersonnel: {
          UserID: true,
          Username: true
        }
      }
    }
  })

  if (!order) {
    throw new ValidationError('Order not found')
  }

  if (!order.delivery || order.delivery.independentDeliveryPersonnel?.UserID !== deliveryPersonnelId) {
    throw new UnauthorizedActionError('You are not assigned to this delivery')
  }

  order.delivery.DeliveryStatus = DeliveryStatus.FAILED
  await deliveryRepo.save(order.delivery)


  await sendRealTimeNotification({
    recipientId: order.buyer.UserID,
    type:  'DELIVERY_FAILED',
    message: `Delivery failed for order #${orderId}. Reason: ${reason}`,
    referenceId: orderId,
    data: {
      orderId: orderId,
      listingTitle: order.listing.Title,
      sellerName: order.seller.Username
    }
  })

   await sendRealTimeNotification({
    recipientId: order.seller.UserID,
    type: 'DELIVERY_FAILED',
    message: `Delivery failed for order #${orderId}. Reason: ${reason}`,
    referenceId: orderId,
    data: {
      orderId: orderId,
      listingTitle: order.listing.Title,
      sellerName: order.buyer.Username
    }
  })

  return {
    OrderID: order.OrderID,
    seller: {
      UserID: order.seller.UserID,
      Username: order.seller.Username
    },
    buyer: {
      UserID: order.buyer.UserID,
      Username: order.buyer.Username
    },
    listing: {
      ListingID: order.listing.ListingID,
      Title: order.listing.Title
    },
    delivery: {
      DeliveryID: order.delivery.DeliveryID,
      DeliveryStatus: order.delivery.DeliveryStatus
    }
  }
}

export async function getOrderById(userId: number, orderId: number): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: [
      'buyer', 'seller', 'listing', 'delivery', 
      'delivery.independentDeliveryPersonnel'
    ],
    select: {
      OrderID: true,
      OrderStatus: true,
      PaymentStatus: true,
      DeliveryType: true,
      DeliveryAddress: true,
      PickupCode: true,
      FinalPrice: true,
      DeliveryFee: true,
      OrderNotes: true,
      CreatedAt: true,
      buyer: {
        UserID: true,
        Username: true,
        PhoneNumber: true
      },
      seller: {
        UserID: true,
        Username: true,
        PhoneNumber: true
      },
      listing: {
        ListingID: true,
        Title: true,
        Description: true,
        Price: true,
        PickupLocation: true
      },
      delivery: {
        DeliveryID: true,
        DeliveryStatus: true,
        DeliveryPersonnelType: true,
        independentDeliveryPersonnel: {
          UserID: true,
          Username: true,
          PhoneNumber: true
        }
      }
    }
  })

  if (!order) {
    throw new ValidationError('Order not found')
  }

  const hasAccess = order.buyer.UserID === userId || 
                   order.seller.UserID === userId ||
                   order.delivery?.independentDeliveryPersonnel?.UserID === userId

  if (!hasAccess) {
    throw new UnauthorizedActionError('Access denied')
  }

  return order
}

export async function getMyOrders(buyerId: number, offset: number, limit: number): Promise<any> {
  const orders = await orderRepo.find({
    where: { buyer: { UserID: buyerId } },
    relations: ['seller', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel'],
    select: {
      OrderID: true,
      OrderStatus: true,
      PaymentStatus: true,
      DeliveryType: true,
      FinalPrice: true,
      DeliveryFee: true,
      CreatedAt: true,
      seller: {
        UserID: true,
        Username: true,
        PhoneNumber: true
      },
      listing: {
        ListingID: true,
        Title: true,
        Description: true,
        PickupLocation: true
      },
      delivery: {
        DeliveryID: true,
        DeliveryStatus: true,
        independentDeliveryPersonnel: {
          UserID: true,
          Username: true
        }
      }
    },
    skip: offset,
    take: limit,
    order: { OrderID: 'DESC' }
  })

  return orders
}

export async function getMySales(sellerId: number, offset: number, limit: number): Promise<any> {
  const sales = await orderRepo.find({
    where: { seller: { UserID: sellerId } },
    relations: ['buyer', 'listing', 'delivery', 'delivery.independentDeliveryPersonnel'],
    select: {
      OrderID: true,
      OrderStatus: true,
      PaymentStatus: true,
      DeliveryType: true,
      FinalPrice: true,
      DeliveryFee: true,
      CreatedAt: true,
      buyer: {
        UserID: true,
        Username: true,
        PhoneNumber: true
      },
      listing: {
        ListingID: true,
        Title: true,
        Description: true,
        PickupLocation: true
      },
      delivery: {
        DeliveryID: true,
        DeliveryStatus: true,
        independentDeliveryPersonnel: {
          UserID: true,
          Username: true
        }
      }
    },
    skip: offset,
    take: limit,
    order: { OrderID: 'DESC' }
  })

  return sales
}

export async function getMyDeliveries(deliveryPersonnelId: number, offset: number, limit: number): Promise<any> {
  const deliveries = await deliveryRepo.find({
    where: { independentDeliveryPersonnel: { UserID: deliveryPersonnelId } },
    relations: ['order', 'order.buyer', 'order.seller', 'order.listing'],
    select: {
      DeliveryID: true,
      DeliveryStatus: true,
      DeliveryPersonnelType: true,
      order: {
        OrderID: true,
        OrderStatus: true,
        DeliveryAddress: true,
        PickupCode: true,
        FinalPrice: true,
        buyer: {
          UserID: true,
          Username: true,
          PhoneNumber: true
        },
        seller: {
          UserID: true,
          Username: true,
          PhoneNumber: true
        },
        listing: {
          ListingID: true,
          Title: true,
          PickupLocation: true
        }
      }
    },
    skip: offset,
    take: limit,
    order: { DeliveryID: 'DESC' }
  })

  return deliveries
}

export async function cancelOrder(userId: number, orderId: number, reason?: string): Promise<any> {
  const order = await orderRepo.findOne({
    where: { OrderID: orderId },
    relations: ['buyer', 'seller', 'listing', 'delivery'],
    select: {
      OrderID: true,
      OrderStatus: true,
      buyer: {
        UserID: true,
        Username: true
      },
      seller: {
        UserID: true,
        Username: true
      },
      listing: {
        ListingID: true,
        Title: true
      },
      delivery: {
        DeliveryID: true,
        DeliveryStatus: true
      }
    }
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

  await foodListingRepo.update(
    { ListingID: order.listing.ListingID },
    { ListingStatus: ListingStatus.ACTIVE }
  )

  if (order.delivery) {
    order.delivery.DeliveryStatus = DeliveryStatus.FAILED
    await deliveryRepo.save(order.delivery)
  }

  const cancellerRole = order.buyer.UserID === userId ? 'buyer' : 'seller'
  const otherPartyId = cancellerRole === 'buyer' ? order.seller.UserID : order.buyer.UserID

     await sendRealTimeNotification({
    recipientId: otherPartyId,
    type: 'ORDER_CANCELLED',
    message: `Order #${orderId} has been cancelled by the ${cancellerRole}. ${reason ? 'Reason: ' + reason : ''}`,
    referenceId: orderId,
  
  })

  return {
    OrderID: updatedOrder.OrderID,
    OrderStatus: updatedOrder.OrderStatus,
    buyer: {
      UserID: order.buyer.UserID,
      Username: order.buyer.Username
    },
    seller: {
      UserID: order.seller.UserID,
      Username: order.seller.Username
    },
    listing: {
      ListingID: order.listing.ListingID,
      Title: order.listing.Title
    }
  }
}


async function findAvailableDeliveryPersonnel(pickupLocation: string): Promise<any> {
  try {
   
    const allDeliveryPersonnel = await independentDeliveryRepo.find({
      where: { IsIDVerifiedByAdmin: true },
      relations: ['user'],
      select: {
        ProfileID: true,
        FullName: true,
        CurrentRating: true,
        OperatingAreas: true,
        user: {
          UserID: true,
          Username: true,
          PhoneNumber: true
        }
      }
    })

    if (!allDeliveryPersonnel || allDeliveryPersonnel.length === 0) {
      return null
    }

    const availablePersonnel = allDeliveryPersonnel.filter(personnel => {
      if (!personnel.OperatingAreas || typeof personnel.OperatingAreas !== 'object') {
        return false
      }
      const operatingAreas = Object.values(personnel.OperatingAreas) as string[]
      
      return operatingAreas.some(area => {
        if (typeof area !== 'string') return false
        
        
        const areaLower = area.toLowerCase().trim()
        const pickupLower = pickupLocation.toLowerCase().trim()
        
        return areaLower.includes(pickupLower) || pickupLower.includes(areaLower)
      })
    })

    if (availablePersonnel.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * availablePersonnel.length)
    const selectedPersonnel = availablePersonnel[randomIndex]

    return selectedPersonnel
  } catch (error) {
    console.error('Error finding delivery personnel:', error)
    return null
  }
}


function calculateDeliveryFee(deliveryAddress: string, pickupLocation?: string): number {
  
  return 50.00 
}