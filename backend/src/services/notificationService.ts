import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { AppDataSource } from '../config/data-source'
import { Notification, NotificationType } from '../models/Notification'
import { User } from '../models/User'

// Initialize services
const notificationRepo = AppDataSource.getRepository(Notification)
const userRepo = AppDataSource.getRepository(User)


// WebSocket server
let io: SocketIOServer

export function initializeWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)


    socket.on('join_user_room', (userId: number) => {
      socket.join(`user_${userId}`)
      console.log(`User ${userId} joined their notification room`)
    })

    // Delivery personnel joins delivery room
    socket.on('join_delivery_room', (deliveryPersonId: number) => {
      socket.join(`delivery_${deliveryPersonId}`)
      console.log(`Delivery person ${deliveryPersonId} joined delivery room`)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}

export interface NotificationPayload {
  recipientId: number
  type: NotificationType | string
  message: string
  referenceId?: number
  priority?: 'low' | 'normal' | 'high' | 'critical'
  data?: any
}

export async function sendRealTimeNotification(payload: NotificationPayload): Promise<Notification> {
  try {
    const notification = await saveNotificationToDatabase(payload)

  
    const user = await userRepo.findOne({
      where: { UserID: payload.recipientId },
      select: ['UserID', 'Username', 'PhoneNumber']
    })

    if (!user) {
      throw new Error(`User with ID ${payload.recipientId} not found`)
    }

    await Promise.allSettled([
      sendWebSocketNotification(payload, notification)
    ])

    return notification
  } catch (error) {
    console.error('Error sending real-time notification:', error)
    throw error
  }
}


async function sendWebSocketNotification(
  payload: NotificationPayload, 
  notification: Notification
): Promise<void> {
  if (!io) return

  const socketPayload = {
    id: notification.NotificationID,
    type: payload.type,
    message: payload.message,
    referenceId: payload.referenceId,
    timestamp: new Date(),
    data: payload.data
  }

  io.to(`user_${payload.recipientId}`).emit('new_notification', socketPayload)


  if (isDeliveryNotification(payload.type)) {
    io.to(`delivery_${payload.recipientId}`).emit('delivery_notification', socketPayload)
  }

  console.log(`WebSocket notification sent to user ${payload.recipientId}`)
}




export async function sendDeliveryNotification(
  deliveryPersonId: number,
  type: string,
  message: string,
  referenceId?: number,
  additionalData?: any
): Promise<Notification> {
  return sendRealTimeNotification({
    recipientId: deliveryPersonId,
    type,
    message,
    referenceId,
    priority: 'high', 
    data: {
      ...additionalData,
      requiresAction: true,
      actionType: 'delivery_update'
    }
  })
}


export async function sendBulkRealTimeNotifications(
  notifications: NotificationPayload[]
): Promise<Notification[]> {
  const results = await Promise.allSettled(
    notifications.map(notif => sendRealTimeNotification(notif))
  )

  return results
    .filter((result): result is PromiseFulfilledResult<Notification> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value)
}

// Utility functions
function isDeliveryNotification(type: NotificationType | string): boolean {
  const deliveryTypes = [
    'NEW_DELIVERY_REQUEST',
    'PICKUP_CONFIRMED',
    'ORDER_DELIVERED',
    'DELIVERY_UPDATE',
    'DELIVERY_FAILED'
  ]
  return deliveryTypes.includes(type.toString())
}

function getNotificationTitle(type: NotificationType | string): string {
  const titles: Record<string, string> = {
    'NEW_DELIVERY_REQUEST': 'New Delivery Request',
    'NEW_ORDER_RECEIVED': 'New Order',
    'ORDER_CREATED': 'Order Confirmation',
    'ORDER_CONFIRMED': 'Order Confirmed',
    'ORDER_COMPLETED': 'Order Completed',
    'PICKUP_CONFIRMED': 'Pickup Confirmed',
    'ORDER_DELIVERED': 'Order Delivered',
    'ORDER_CANCELLED': 'Order Cancelled',
    'DONATION_CLAIMED': 'Donation Claimed',
    'DELIVERY_UPDATE': 'Delivery Update',
    'DELIVERY_FAILED': 'Delivery Issue'
  }
  return titles[type.toString()] || 'Notification'
}

function getNotificationChannel(type: NotificationType | string): string {
  if (isDeliveryNotification(type)) return 'delivery_updates'
  if (type.toString().includes('ORDER')) return 'order_updates'
  if (type.toString().includes('DONATION')) return 'donation_updates'
  return 'general'
}

async function getUnreadNotificationCount(userId: number): Promise<number> {
  return await notificationRepo.count({
    where: {
      recipient: { UserID: userId },
      IsRead: false
    }
  })
}


async function saveNotificationToDatabase(payload: NotificationPayload): Promise<Notification> {
  const recipient = await userRepo.findOne({
    where: { UserID: payload.recipientId }
  })

  if (!recipient) {
    throw new Error(`User with ID ${payload.recipientId} not found`)
  }

  let notificationType: NotificationType
  switch (payload.type) {
    case 'NEW_DELIVERY_REQUEST':
      notificationType = NotificationType.DELIVERY_UPDATE
      break
    case 'NEW_ORDER_RECEIVED':
      notificationType = NotificationType.ORDER_UPDATE
      break
    case 'ORDER_CREATED':
      notificationType = NotificationType.ORDER_UPDATE
      break
    case 'ORDER_CONFIRMED':
      notificationType = NotificationType.ORDER_UPDATE
      break
    case 'ORDER_COMPLETED':
      notificationType = NotificationType.ORDER_UPDATE
      break
    case 'PICKUP_CONFIRMED':
      notificationType = NotificationType.DELIVERY_UPDATE
      break
    case 'ORDER_DELIVERED':
      notificationType = NotificationType.DELIVERY_UPDATE
      break
    case 'ORDER_CANCELLED':
      notificationType = NotificationType.ORDER_UPDATE
      break
    case 'DONATION_CLAIMED':
      notificationType = NotificationType.CLAIM_UPDATE
      break
    default:
      notificationType = payload.type as NotificationType
  }

  const notification = new Notification()
  notification.recipient = recipient
  notification.NotificationType = notificationType
  notification.Message = payload.message
  notification.ReferenceID = payload.referenceId
  notification.IsRead = false

  return await notificationRepo.save(notification)
}