import { Request, Response } from 'express'

var mockDataSource = {
  isInitialized: true,
  query: jest.fn(),
}

jest.mock('../../src/config/data-source', () => ({
  AppDataSource: mockDataSource,
}))

jest.mock('../../src/utils/logger')

describe('HealthController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let getHealth: typeof import('../../src/controllers/healthController').getHealth

  beforeEach(() => {
    getHealth = require('../../src/controllers/healthController').getHealth
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    mockDataSource.isInitialized = true
    mockDataSource.query.mockReset()
  })

  it('should return ok when the database is connected', async () => {
    mockDataSource.query.mockResolvedValue([{ '?column?': 1 }])

    await getHealth(mockRequest as Request, mockResponse as Response)

    expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1')
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'ok',
      services: {
        api: 'ok',
        database: 'connected',
      },
    }))
  })

  it('should return degraded when the database is not initialized', async () => {
    mockDataSource.isInitialized = false

    await getHealth(mockRequest as Request, mockResponse as Response)

    expect(mockDataSource.query).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(503)
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'degraded',
      services: {
        api: 'ok',
        database: 'disconnected',
      },
    }))
  })

  it('should return degraded when the database query fails', async () => {
    mockDataSource.query.mockRejectedValue(new Error('database unavailable'))

    await getHealth(mockRequest as Request, mockResponse as Response)

    expect(mockResponse.status).toHaveBeenCalledWith(503)
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'degraded',
      services: {
        api: 'ok',
        database: 'disconnected',
      },
    }))
  })
})
