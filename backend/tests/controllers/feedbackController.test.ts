import { Request, Response } from 'express'
import * as feedbackController from '../../src/controllers/feedbackController'
import * as feedbackService from '../../src/services/feedbackService'
import { sendErrorResponse, sendSuccessResponse } from '../../src/utils/responseHelper'
import { UnauthorizedActionError, ValidationError } from '../../src/utils/errors'
import { AccountStatus, User, UserRole } from '../../src/models/User'
import { AdminActionStatus } from '../../src/models/FeedbackComplaint'

jest.mock('../../src/services/feedbackService')
jest.mock('../../src/utils/responseHelper')
jest.mock('../../src/utils/logger')

const mockedFeedbackService = feedbackService as jest.Mocked<typeof feedbackService>
const mockedSendSuccessResponse = sendSuccessResponse as jest.MockedFunction<typeof sendSuccessResponse>
const mockedSendErrorResponse = sendErrorResponse as jest.MockedFunction<typeof sendErrorResponse>

describe('FeedbackController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  const createMockUser = (userId: number): User => ({
    UserID: userId,
    Username: `testuser${userId}`,
    PasswordHash: 'hashedpassword',
    Email: `test${userId}@example.com`,
    PhoneNumber: '1234567890',
    Role: UserRole.BUYER,
    RegistrationDate: new Date(),
    IsEmailVerified: true,
    AccountStatus: AccountStatus.ACTIVE,
    TokenValidFrom: new Date(),
    verificationCode: null,
    verificationCodeExpires: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    isProfileComplete: true
  })

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    jest.clearAllMocks()
  })

  describe('createComplaint', () => {
    beforeEach(() => {
      mockRequest.user = createMockUser(1)
      mockRequest.body = {
        orderId: '7',
        message: 'The rider never arrived.'
      }
    })

    it('should submit a complaint', async () => {
      const result = {
        complaintId: 3,
        status: AdminActionStatus.PENDING,
        orderId: 7
      }
      mockedFeedbackService.createComplaint.mockResolvedValue(result)

      await feedbackController.createComplaint(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockedFeedbackService.createComplaint).toHaveBeenCalledWith(1, {
        orderId: 7,
        claimId: undefined,
        regardingUserId: undefined,
        message: 'The rider never arrived.'
      })
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        result,
        'Issue reported successfully'
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined

      await feedbackController.createComplaint(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      )
      expect(mockedFeedbackService.createComplaint).not.toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      const error = new ValidationError('Complaint message must be at least 10 characters')
      mockedFeedbackService.createComplaint.mockRejectedValue(error)

      await feedbackController.createComplaint(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      )
    })

    it('should handle unauthorized errors', async () => {
      const error = new UnauthorizedActionError('Access denied')
      mockedFeedbackService.createComplaint.mockRejectedValue(error)

      await feedbackController.createComplaint(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      )
    })
  })

  describe('getMyComplaints', () => {
    it('should return the authenticated user complaints', async () => {
      mockRequest.user = createMockUser(2)
      const complaints = [{ FeedbackID: 10, Message: 'Test complaint' }]
      mockedFeedbackService.getMyComplaints.mockResolvedValue(complaints as any)

      await feedbackController.getMyComplaints(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockedFeedbackService.getMyComplaints).toHaveBeenCalledWith(2)
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        complaints,
        'Complaints retrieved successfully'
      )
    })
  })
})
