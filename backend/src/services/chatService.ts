import { AppDataSource } from '../config/data-source'
import { ChatConversation } from '../models/ChatConversation'
import { ChatMessage } from '../models/ChatMessage'
import { User } from '../models/User'
import { UserDoesNotExistError, UnauthorizedActionError, ValidationError } from '../utils/errors'
import { emitToUser } from './notificationService'

const conversationRepo = AppDataSource.getRepository(ChatConversation)
const messageRepo = AppDataSource.getRepository(ChatMessage)
const userRepo = AppDataSource.getRepository(User)

export interface SendChatMessageInput {
  recipientId: number
  message: string
}

export async function getOrCreateConversation(currentUserId: number, otherUserId: number) {
  const [participantOneId, participantTwoId] = normalizeParticipantIds(currentUserId, otherUserId)
  const [participantOne, participantTwo] = await Promise.all([
    getUserOrThrow(participantOneId),
    getUserOrThrow(participantTwoId),
  ])

  let conversation = await conversationRepo.findOne({
    where: {
      participantOne: { UserID: participantOneId },
      participantTwo: { UserID: participantTwoId },
    },
    relations: ['participantOne', 'participantTwo'],
  })

  if (!conversation) {
    conversation = conversationRepo.create({
      participantOne,
      participantTwo,
    })
    conversation = await conversationRepo.save(conversation)
  }

  return formatConversation(conversation, currentUserId)
}

export async function getConversationsForUser(userId: number) {
  const conversations = await conversationRepo.find({
    where: [
      { participantOne: { UserID: userId } },
      { participantTwo: { UserID: userId } },
    ],
    relations: ['participantOne', 'participantTwo'],
    order: { UpdatedAt: 'DESC' },
  })

  return conversations.map(conversation => formatConversation(conversation, userId))
}

export async function getMessagesForConversation(
  userId: number,
  conversationId: number,
  limit = 50,
  offset = 0
) {
  const conversation = await getConversationForParticipant(conversationId, userId)
  const messages = await messageRepo.find({
    where: { conversation: { ConversationID: conversation.ConversationID } },
    relations: ['sender', 'recipient'],
    order: { CreatedAt: 'ASC' },
    take: limit,
    skip: offset,
  })

  return messages.map(formatMessage)
}

export async function sendChatMessage(senderId: number, input: SendChatMessageInput) {
  const messageText = input.message?.trim()
  if (!messageText) {
    throw new ValidationError('Message is required')
  }

  if (messageText.length > 1000) {
    throw new ValidationError('Message must be at most 1000 characters')
  }

  const [participantOneId, participantTwoId] = normalizeParticipantIds(senderId, input.recipientId)
  const [sender, recipient, participantOne, participantTwo] = await Promise.all([
    getUserOrThrow(senderId),
    getUserOrThrow(input.recipientId),
    getUserOrThrow(participantOneId),
    getUserOrThrow(participantTwoId),
  ])

  let conversation = await conversationRepo.findOne({
    where: {
      participantOne: { UserID: participantOneId },
      participantTwo: { UserID: participantTwoId },
    },
    relations: ['participantOne', 'participantTwo'],
  })

  if (!conversation) {
    conversation = conversationRepo.create({ participantOne, participantTwo })
    conversation = await conversationRepo.save(conversation)
  }

  const chatMessage = messageRepo.create({
    conversation,
    sender,
    recipient,
    Message: messageText,
    IsRead: false,
  })
  const savedMessage = await messageRepo.save(chatMessage)

  conversation.UpdatedAt = new Date()
  await conversationRepo.save(conversation)

  const payload = formatMessage(savedMessage)
  emitToUser(input.recipientId, 'chat_message', payload)
  emitToUser(senderId, 'chat_message', payload)

  return payload
}

async function getConversationForParticipant(conversationId: number, userId: number) {
  const conversation = await conversationRepo.findOne({
    where: { ConversationID: conversationId },
    relations: ['participantOne', 'participantTwo'],
  })

  if (!conversation) {
    throw new ValidationError('Conversation not found')
  }

  const isParticipant =
    conversation.participantOne.UserID === userId ||
    conversation.participantTwo.UserID === userId

  if (!isParticipant) {
    throw new UnauthorizedActionError('You are not part of this conversation')
  }

  return conversation
}

async function getUserOrThrow(userId: number) {
  const user = await userRepo.findOneBy({ UserID: userId })
  if (!user) {
    throw new UserDoesNotExistError()
  }
  return user
}

function normalizeParticipantIds(userId: number, otherUserId: number): [number, number] {
  if (!Number.isInteger(userId) || !Number.isInteger(otherUserId)) {
    throw new ValidationError('Invalid user ID')
  }

  if (userId === otherUserId) {
    throw new ValidationError('Cannot start a conversation with yourself')
  }

  return userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId]
}

function formatConversation(conversation: ChatConversation, currentUserId: number) {
  const otherUser = conversation.participantOne.UserID === currentUserId
    ? conversation.participantTwo
    : conversation.participantOne

  return {
    id: conversation.ConversationID,
    otherUser: {
      id: otherUser.UserID,
      username: otherUser.Username,
      role: otherUser.Role,
    },
    createdAt: conversation.CreatedAt,
    updatedAt: conversation.UpdatedAt,
  }
}

function formatMessage(message: ChatMessage) {
  return {
    id: message.MessageID,
    conversationId: message.conversation.ConversationID,
    senderId: message.sender.UserID,
    recipientId: message.recipient.UserID,
    message: message.Message,
    isRead: message.IsRead,
    createdAt: message.CreatedAt,
  }
}
