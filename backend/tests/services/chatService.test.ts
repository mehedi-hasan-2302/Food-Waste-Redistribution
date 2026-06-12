import { UserRole } from '../../src/models/User'
import { ValidationError, UnauthorizedActionError } from '../../src/utils/errors'
import { emitToUser } from '../../src/services/notificationService'

const mockConversationRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
}

const mockMessageRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
}

const mockUserRepository = {
  findOneBy: jest.fn(),
}

jest.mock('../../src/config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn((model) => {
      if (model.name === 'ChatConversation') return mockConversationRepository
      if (model.name === 'ChatMessage') return mockMessageRepository
      return mockUserRepository
    }),
  },
}))

jest.mock('../../src/services/notificationService', () => ({
  emitToUser: jest.fn(),
}))

jest.mock('../../src/utils/logger')

const mockedEmitToUser = emitToUser as jest.MockedFunction<typeof emitToUser>

function createUser(id: number, role = UserRole.BUYER) {
  return {
    UserID: id,
    Username: `user${id}`,
    Role: role,
  } as any
}

describe('chatService', () => {
  let chatService: typeof import('../../src/services/chatService')
  const userOne = createUser(1)
  const userTwo = createUser(2, UserRole.DONOR_SELLER)

  beforeEach(() => {
    chatService = require('../../src/services/chatService')

    jest.clearAllMocks()
    mockUserRepository.findOneBy.mockImplementation(({ UserID }) => {
      if (UserID === 1) return Promise.resolve(userOne)
      if (UserID === 2) return Promise.resolve(userTwo)
      return Promise.resolve(null)
    })
  })

  it('should create a conversation, save a message, and emit it to both users', async () => {
    const savedConversation = {
      ConversationID: 10,
      participantOne: userOne,
      participantTwo: userTwo,
      CreatedAt: new Date('2026-01-01T00:00:00Z'),
      UpdatedAt: new Date('2026-01-01T00:00:00Z'),
    } as any

    mockConversationRepository.findOne.mockResolvedValue(null)
    mockConversationRepository.create.mockReturnValue({
      participantOne: userOne,
      participantTwo: userTwo,
    })
    mockConversationRepository.save.mockImplementation((conversation) => Promise.resolve({
      ...conversation,
      ConversationID: conversation.ConversationID ?? 10,
      CreatedAt: conversation.CreatedAt ?? savedConversation.CreatedAt,
      UpdatedAt: conversation.UpdatedAt ?? savedConversation.UpdatedAt,
    }))
    mockMessageRepository.create.mockImplementation((message) => message)
    mockMessageRepository.save.mockImplementation((message) => Promise.resolve({
      ...message,
      MessageID: 50,
      CreatedAt: new Date('2026-01-01T00:01:00Z'),
    }))

    const result = await chatService.sendChatMessage(1, {
      recipientId: 2,
      message: '  Hello there  ',
    })

    expect(mockConversationRepository.create).toHaveBeenCalledWith({
      participantOne: userOne,
      participantTwo: userTwo,
    })
    expect(mockMessageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      conversation: expect.objectContaining({ ConversationID: 10 }),
      sender: userOne,
      recipient: userTwo,
      Message: 'Hello there',
      IsRead: false,
    }))
    expect(result).toEqual(expect.objectContaining({
      id: 50,
      conversationId: 10,
      senderId: 1,
      recipientId: 2,
      message: 'Hello there',
      isRead: false,
    }))
    expect(mockedEmitToUser).toHaveBeenCalledWith(2, 'chat_message', result)
    expect(mockedEmitToUser).toHaveBeenCalledWith(1, 'chat_message', result)
  })

  it('should reject empty messages', async () => {
    await expect(chatService.sendChatMessage(1, {
      recipientId: 2,
      message: '   ',
    })).rejects.toThrow(ValidationError)
  })

  it('should reject conversations with yourself', async () => {
    await expect(chatService.getOrCreateConversation(1, 1))
      .rejects.toThrow(ValidationError)
  })

  it('should reject message reads by non-participants', async () => {
    mockConversationRepository.findOne.mockResolvedValue({
      ConversationID: 10,
      participantOne: userOne,
      participantTwo: userTwo,
    })

    await expect(chatService.getMessagesForConversation(3, 10))
      .rejects.toThrow(UnauthorizedActionError)
    expect(mockMessageRepository.find).not.toHaveBeenCalled()
  })
})
