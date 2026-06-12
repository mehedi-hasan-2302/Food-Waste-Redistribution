import { Request, Response } from 'express'
import * as chatService from '../services/chatService'
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseHelper'
import { BaseError, UnauthorizedActionError } from '../utils/errors'
import logger from '../utils/logger'

export async function searchUsers(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const query = String(req.query.q || '')
    const limit = Number(req.query.limit) || 10
    const users = await chatService.searchChatUsers(req.user.UserID, query, limit)
    return sendSuccessResponse(res, users, 'Users retrieved successfully')
  } catch (error: any) {
    return handleChatError(res, error)
  }
}

export async function getConversations(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const conversations = await chatService.getConversationsForUser(req.user.UserID)
    return sendSuccessResponse(res, conversations, 'Conversations retrieved successfully')
  } catch (error: any) {
    return handleChatError(res, error)
  }
}

export async function getOrCreateConversation(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const otherUserId = Number(req.params.userId)
    const conversation = await chatService.getOrCreateConversation(req.user.UserID, otherUserId)
    return sendSuccessResponse(res, conversation, 'Conversation ready')
  } catch (error: any) {
    return handleChatError(res, error)
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const conversationId = Number(req.params.conversationId)
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0
    const messages = await chatService.getMessagesForConversation(
      req.user.UserID,
      conversationId,
      limit,
      offset
    )

    return sendSuccessResponse(res, messages, 'Messages retrieved successfully')
  } catch (error: any) {
    return handleChatError(res, error)
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendErrorResponse(res, 'User not authenticated', 401)
    }

    const message = await chatService.sendChatMessage(req.user.UserID, {
      recipientId: Number(req.body.recipientId),
      message: req.body.message,
    })

    return sendSuccessResponse(res, message, 'Message sent successfully')
  } catch (error: any) {
    return handleChatError(res, error)
  }
}

function handleChatError(res: Response, error: any) {
  logger.error('Chat request failed', { error: error.message })

  if (error instanceof BaseError || error instanceof UnauthorizedActionError) {
    return sendErrorResponse(res, error.message, error.statusCode)
  }

  return sendErrorResponse(res, error.message || 'Chat request failed', 500)
}
