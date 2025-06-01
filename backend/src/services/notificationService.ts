import { AppDataSource } from '../config/data-source'
import { Notification, NotificationType } from '../models/Notification'
import { User } from '../models/User'

const notificationRepo = AppDataSource.getRepository(Notification)
const userRepo = AppDataSource.getRepository(User)

export interface NotificationInput {
  recipientId: number
  type: NotificationType
  message: string
  referenceId?: number
}


export async function sendNotification(
  recipientId: number,
  type: NotificationType | string,
  message: string,
  referenceId?: number
): Promise<Notification> {
  const recipient = await userRepo.findOne({
    where: { UserID: recipientId }
  })

  if (!recipient) {
    throw new Error(`User with ID ${recipientId} not found`)
  }

  let notificationType: NotificationType
  switch (type) {
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
      notificationType = type as NotificationType
  }

  const notification = new Notification()
  notification.recipient = recipient
  notification.NotificationType = notificationType
  notification.Message = message
  notification.ReferenceID = referenceId
  notification.IsRead = false

  return await notificationRepo.save(notification)
}


export async function sendBulkNotifications(
  notifications: NotificationInput[]
): Promise<Notification[]> {
  const results = []
  
  for (const notif of notifications) {
    try {
      const result = await sendNotification(
        notif.recipientId,
        notif.type,
        notif.message,
        notif.referenceId
      )
      results.push(result)
    } catch (error) {
      console.error(`Failed to send notification to user ${notif.recipientId}:`, error)
    }
  }

  return results
}


export async function getUserNotifications(
  userId: number,
  offset: number = 0,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<{ notifications: Notification[], totalCount: number }> {
  const whereCondition: any = { recipient: { UserID: userId } }
  
  if (unreadOnly) {
    whereCondition.IsRead = false
  }

  const [notifications, totalCount] = await notificationRepo.findAndCount({
    where: whereCondition,
    relations: ['recipient'],
    skip: offset,
    take: limit,
    order: { NotificationID: 'DESC' }
  })

  return { notifications, totalCount }
}


export async function markNotificationAsRead(
  notificationId: number,
  userId: number
): Promise<Notification> {
  const notification = await notificationRepo.findOne({
    where: { 
      NotificationID: notificationId,
      recipient: { UserID: userId }
    },
    relations: ['recipient']
  })

  if (!notification) {
    throw new Error('Notification not found')
  }

  notification.IsRead = true
  return await notificationRepo.save(notification)
}


export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  await notificationRepo.update(
    { recipient: { UserID: userId }, IsRead: false },
    { IsRead: true }
  )
}

export async function deleteNotification(
  notificationId: number,
  userId: number
): Promise<void> {
  const result = await notificationRepo.delete({
    NotificationID: notificationId,
    recipient: { UserID: userId }
  })

  if (result.affected === 0) {
    throw new Error('Notification not found or unauthorized')
  }
}


export async function getUnreadNotificationCount(userId: number): Promise<number> {
  return await notificationRepo.count({
    where: {
      recipient: { UserID: userId },
      IsRead: false
    }
  })
}