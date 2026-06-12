import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/data-source'
import { Notification, NotificationType } from '../models/Notification'
import { AccountStatus, User, UserRole } from '../models/User'
import { config } from '../config/env'
import logger from '../utils/logger'

// Initialize services
const notificationRepo = AppDataSource.getRepository(Notification)
const userRepo = AppDataSource.getRepository(User)


// WebSocket server
let io: SocketIOServer

interface SocketUser {
  id: number
  role: UserRole
}

function getHandshakeToken(authToken: unknown): string | null {
  return typeof authToken === 'string' && authToken.trim() ? authToken : null
}

export function initializeWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.cors.origin,
      methods: ["GET", "POST"]
    }
  })

  io.use(async (socket, next) => {
    try {
      const token = getHandshakeToken(socket.handshake.auth?.token)
      if (!token) {
        return next(new Error('Authentication required'))
      }

      const decoded = jwt.verify(token, config.jsonToken.secret) as any
      const user = await userRepo.findOne({
        where: { UserID: decoded.id },
        select: ['UserID', 'Role', 'IsEmailVerified', 'AccountStatus', 'TokenValidFrom']
      })

      if (!user || !user.IsEmailVerified || user.AccountStatus !== AccountStatus.ACTIVE) {
        return next(new Error('Authentication required'))
      }

      if (decoded.tokenValidFrom && user.TokenValidFrom) {
        const tokenValidFromTime = user.TokenValidFrom.getTime()
        if (decoded.tokenValidFrom < tokenValidFromTime) {
          return next(new Error('Authentication required'))
        }
      }

      socket.data.user = {
        id: user.UserID,
        role: user.Role
      } satisfies SocketUser

      next()
    } catch (error) {
      logger.warn('WebSocket authentication failed', { socketId: socket.id })
      next(new Error('Authentication required'))
    }
  })

  io.on('connection', (socket) => {
    const socketUser = socket.data.user as SocketUser
    socket.join(`user_${socketUser.id}`)
    logger.info('User connected to WebSocket', { userId: socketUser.id, socketId: socket.id })

    if (socketUser.role === UserRole.INDEP_DELIVERY || socketUser.role === UserRole.ORG_VOLUNTEER) {
      socket.join(`delivery_${socketUser.id}`)
      logger.info('Delivery person joined delivery room', {
        deliveryPersonId: socketUser.id,
        socketId: socket.id
      })
    }

    socket.on('disconnect', () => {
      logger.info('User disconnected from WebSocket', { userId: socketUser.id, socketId: socket.id })
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
    logger.info('Real-time notification sent', { recipientId: payload.recipientId, type: payload.type })
    return notification
  } catch (error) {
    logger.error('Error sending real-time notification', { error })
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

  logger.info('WebSocket notification sent', { recipientId: payload.recipientId, type: payload.type })
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


export async function getNotificationsForUser(
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> {
  return await notificationRepo.find({
    where: { recipient: { UserID: userId } },
    order: { createdAt: 'DESC' },
    take: limit,
    skip: offset
  })
} 


export async function markNotificationAsRead(notificationId: number): Promise<Notification> {
  const notification = await notificationRepo.findOneBy({ NotificationID: notificationId })
  if (!notification) {
    throw new Error(`Notification with ID ${notificationId} not found`)
  }
  notification.IsRead = true
  return await notificationRepo.save(notification)
}


export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const notifications = await notificationRepo.find({
    where: {
      recipient: { UserID: userId },
      IsRead: false
    }
  })
  if (notifications.length === 0) return
  for (const notification of notifications) {
    notification.IsRead = true
    await notificationRepo.save(notification)
  }
}



