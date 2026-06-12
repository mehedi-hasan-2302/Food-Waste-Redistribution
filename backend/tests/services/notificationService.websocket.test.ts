import jwt from 'jsonwebtoken'
import { AccountStatus, UserRole } from '../../src/models/User'

const mockNotificationRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
}

const mockUserRepository = {
  findOne: jest.fn(),
}

const mockSocketServer = {
  use: jest.fn(),
  on: jest.fn(),
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
}

jest.mock('../../src/config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn((model) => {
      return model.name === 'User' ? mockUserRepository : mockNotificationRepository
    }),
  },
}))

jest.mock('jsonwebtoken')
jest.mock('../../src/utils/logger')
jest.mock('socket.io', () => ({
  Server: jest.fn(() => mockSocketServer),
}))

jest.mock('../../src/config/env', () => ({
  config: {
    cors: {
      origin: ['http://localhost:5173'],
    },
    jsonToken: {
      secret: 'test-jwt-secret',
    },
  },
}))

const mockedJwt = jwt as jest.Mocked<typeof jwt>

function setupSocketServer() {
  const { initializeWebSocket } = require('../../src/services/notificationService')
  initializeWebSocket({} as any)

  const authHandler = mockSocketServer.use.mock.calls[0][0]
  const connectionHandler = mockSocketServer.on.mock.calls.find(
    ([event]) => event === 'connection'
  )?.[1]

  if (!authHandler || !connectionHandler) {
    throw new Error('Socket server was not initialized')
  }

  return { authHandler, connectionHandler }
}

function createSocket(token?: string) {
  return {
    id: 'socket-1',
    handshake: {
      auth: token ? { token } : {},
    },
    data: {},
    join: jest.fn(),
    on: jest.fn(),
  } as any
}

describe('notificationService WebSocket authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('authenticates a valid socket and joins the user notification room', async () => {
    const { authHandler, connectionHandler } = setupSocketServer()
    const socket = createSocket('valid-token')
    const next = jest.fn()
    const tokenValidFrom = Date.now()

    mockedJwt.verify.mockReturnValue({
      id: 7,
      tokenValidFrom,
    } as any)
    mockUserRepository.findOne.mockResolvedValue({
      UserID: 7,
      Role: UserRole.BUYER,
      IsEmailVerified: true,
      AccountStatus: AccountStatus.ACTIVE,
      TokenValidFrom: new Date(tokenValidFrom - 1000),
    })

    await authHandler(socket, next)
    connectionHandler(socket)

    expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'test-jwt-secret')
    expect(next.mock.calls[0]).toEqual([])
    expect(socket.join).toHaveBeenCalledWith('user_7')
    expect(socket.join).not.toHaveBeenCalledWith('delivery_7')
  })

  it('joins delivery users to their delivery room automatically', async () => {
    const { authHandler, connectionHandler } = setupSocketServer()
    const socket = createSocket('delivery-token')
    const next = jest.fn()
    const tokenValidFrom = Date.now()

    mockedJwt.verify.mockReturnValue({
      id: 12,
      tokenValidFrom,
    } as any)
    mockUserRepository.findOne.mockResolvedValue({
      UserID: 12,
      Role: UserRole.INDEP_DELIVERY,
      IsEmailVerified: true,
      AccountStatus: AccountStatus.ACTIVE,
      TokenValidFrom: new Date(tokenValidFrom - 1000),
    })

    await authHandler(socket, next)
    connectionHandler(socket)

    expect(next.mock.calls[0]).toEqual([])
    expect(socket.join).toHaveBeenCalledWith('user_12')
    expect(socket.join).toHaveBeenCalledWith('delivery_12')
  })

  it('rejects socket connections without a token', async () => {
    const { authHandler } = setupSocketServer()
    const socket = createSocket()
    const next = jest.fn()

    await authHandler(socket, next)

    expect(next.mock.calls[0][0]).toEqual(new Error('Authentication required'))
    expect(mockUserRepository.findOne).not.toHaveBeenCalled()
  })

  it('rejects socket tokens for inactive users', async () => {
    const { authHandler } = setupSocketServer()
    const socket = createSocket('pending-token')
    const next = jest.fn()

    mockedJwt.verify.mockReturnValue({ id: 5 } as any)
    mockUserRepository.findOne.mockResolvedValue({
      UserID: 5,
      Role: UserRole.BUYER,
      IsEmailVerified: true,
      AccountStatus: AccountStatus.PENDING,
      TokenValidFrom: new Date(),
    })

    await authHandler(socket, next)

    expect(next.mock.calls[0][0]).toEqual(new Error('Authentication required'))
  })
})
