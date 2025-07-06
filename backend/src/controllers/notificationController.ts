import * as notificationService from "../services/notificationService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/responseHelper";
import { Request, Response } from "express";
import logger from '../utils/logger'

export async function getNotificationsForUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
      logger.warn('Unauthorized notification fetch attempt')
      sendErrorResponse(res, 'User not authenticated', 401);
      return;
    }
  const userId = req.user.UserID;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const notifications = await notificationService.getNotificationsForUser(userId, limit, offset);
    logger.info('Notifications fetched for user', { userId })
    sendSuccessResponse(res, notifications);
  } catch (error) {
    logger.error('Error fetching notifications', { error: error instanceof Error ? error.message : String(error) })
    sendErrorResponse(res, (error instanceof Error ? error.message : String(error)));
  }
}


export async function markNotificationAsRead(req: Request, res: Response): Promise<void> {
  const notificationId = parseInt(req.params.notificationId);

  try {
    const updatedNotification = await notificationService.markNotificationAsRead(notificationId);
    logger.info('Notification marked as read', { notificationId })
    sendSuccessResponse(res, updatedNotification);
  } catch (error) {
    logger.error('Error marking notification as read', { error: error instanceof Error ? error.message : String(error) })
    sendErrorResponse(res, (error instanceof Error ? error.message : String(error)));
  }
}


export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {

  if (!req.user) {
      logger.warn('Unauthorized mark all notifications as read attempt')
      sendErrorResponse(res, 'User not authenticated', 401);
      return;
  }
  
  const userId = req.user.UserID;

  try {
    const updatedNotifications = await notificationService.markAllNotificationsAsRead(userId);
    logger.info('All notifications marked as read', { userId })
    sendSuccessResponse(res, updatedNotifications);
  } catch (error) {
    logger.error('Error marking all notifications as read', { error: error instanceof Error ? error.message : String(error) })
    sendErrorResponse(res, (error instanceof Error ? error.message : String(error)));
  }
}