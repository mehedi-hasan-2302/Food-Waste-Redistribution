import * as notificationService from "../services/notificationService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/responseHelper";
import { Request, Response } from "express";

export async function getNotificationsForUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
      sendErrorResponse(res, 'User not authenticated', 401);
      return;
    }
  const userId = req.user.UserID;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const notifications = await notificationService.getNotificationsForUser(userId, limit, offset);
    sendSuccessResponse(res, notifications);
  } catch (error) {
    sendErrorResponse(res, (error instanceof Error ? error.message : String(error)));
  }
}


export async function markNotificationAsRead(req: Request, res: Response): Promise<void> {
  const notificationId = parseInt(req.params.notificationId);

  try {
    const updatedNotification = await notificationService.markNotificationAsRead(notificationId);
    sendSuccessResponse(res, updatedNotification);
  } catch (error) {
    sendErrorResponse(res, (error instanceof Error ? error.message : String(error)));
  }
}


export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {

  if (!req.user) {
      sendErrorResponse(res, 'User not authenticated', 401);
      return;
  }
  
  const userId = req.user.UserID;

  try {
    const updatedNotifications = await notificationService.markAllNotificationsAsRead(userId);
    sendSuccessResponse(res, updatedNotifications);
  } catch (error) {
    sendErrorResponse(res, (error instanceof Error ? error.message : String(error)));
  }
}