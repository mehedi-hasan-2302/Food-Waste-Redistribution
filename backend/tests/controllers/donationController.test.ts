import { Request, Response } from 'express';
import * as donationController from '../../src/controllers/donationController';
import * as donationService from '../../src/services/donationService';
import { sendSuccessResponse, sendErrorResponse } from '../../src/utils/responseHelper';
import {
  UserDoesNotExistError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../../src/utils/errors';
import { User, UserRole, AccountStatus } from '../../src/models/User';
import { ClaimStatus, DonationDeliveryType } from '../../src/models/DonationClaim';

// Mock dependencies
jest.mock('../../src/services/donationService');
jest.mock('../../src/utils/responseHelper');
jest.mock('../../src/utils/logger');

const mockedDonationService = donationService as jest.Mocked<typeof donationService>;
const mockedSendSuccessResponse = sendSuccessResponse as jest.MockedFunction<typeof sendSuccessResponse>;
const mockedSendErrorResponse = sendErrorResponse as jest.MockedFunction<typeof sendErrorResponse>;

describe('DonationController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  // a complete mock user object
  const createMockUser = (userId: number): User & {
    donorSellerId?: number;
    charityOrganizationId?: number;
    buyerId?: number;
    independentDeliveryId?: number;
    organizationVolunteerId?: number;
  } => ({
    UserID: userId,
    Username: `testuser${userId}`,
    PasswordHash: 'hashedpassword',
    Email: `test${userId}@example.com`,
    PhoneNumber: '1234567890',
    Role: UserRole.CHARITY_ORG,
    RegistrationDate: new Date(),
    IsEmailVerified: true,
    AccountStatus: AccountStatus.ACTIVE,
    TokenValidFrom: new Date(),
    verificationCode: null,
    verificationCodeExpires: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    isProfileComplete: true,
    charityOrganizationId: userId
  });

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('createDonationClaim', () => {
    const mockUser = createMockUser(1);
    const mockClaimData = {
      PickupLocation: 'Test Location',
      PickupTimeSlot: '2025-07-20 10:00:00'
    };

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '123' };
      mockRequest.body = mockClaimData;
    });

    it('should successfully create a donation claim', async () => {
      // Arrange
      const mockResult: donationService.DonationClaimResponse = {
        claimId: 1,
        claimStatus: ClaimStatus.PENDING,
        listing: {},
        donor: {},
        deliveryType: DonationDeliveryType.SELF_PICKUP
      };
      mockedDonationService.createDonationClaim.mockResolvedValue(mockResult);

      // Act
      await donationController.createDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.createDonationClaim).toHaveBeenCalledWith(1, 123, mockClaimData);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Donation claim created successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await donationController.createDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
      expect(mockedDonationService.createDonationClaim).not.toHaveBeenCalled();
    });

    it('should handle UserDoesNotExistError', async () => {
      // Arrange
      const error = new UserDoesNotExistError('User does not exist');
      mockedDonationService.createDonationClaim.mockRejectedValue(error);

      // Act
      await donationController.createDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });

    it('should handle FoodListingNotFoundError', async () => {
      // Arrange
      const error = new FoodListingNotFoundError('Food listing not found');
      mockedDonationService.createDonationClaim.mockRejectedValue(error);

      // Act
      await donationController.createDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });

    it('should handle UnauthorizedActionError', async () => {
      // Arrange
      const error = new UnauthorizedActionError('Unauthorized action');
      mockedDonationService.createDonationClaim.mockRejectedValue(error);

      // Act
      await donationController.createDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });

    it('should handle ValidationError', async () => {
      // Arrange
      const error = new ValidationError('Validation failed');
      mockedDonationService.createDonationClaim.mockRejectedValue(error);

      // Act
      await donationController.createDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });

    it('should handle generic errors', async () => {
      // Arrange
      const error = new Error('Generic error');
      mockedDonationService.createDonationClaim.mockRejectedValue(error);

      // Act
      await donationController.createDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        500
      );
    });
  });

  describe('authorizeDonationPickup', () => {
    const mockUser = createMockUser(2);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '456' };
      mockRequest.body = { pickupCode: 'ABC123' };
    });

    it('should successfully authorize donation pickup', async () => {
      // Arrange
      const mockResult = { Status: 'AUTHORIZED' };
      mockedDonationService.authorizeDonationPickup.mockResolvedValue(mockResult);

      // Act
      await donationController.authorizeDonationPickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.authorizeDonationPickup).toHaveBeenCalledWith(2, 456, 'ABC123');
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Donation pickup authorized successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await donationController.authorizeDonationPickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should return 400 for invalid claim ID', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await donationController.authorizeDonationPickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Invalid claim ID',
        400
      );
    });

    it('should return 400 when pickup code is missing', async () => {
      // Arrange
      mockRequest.body = {};

      // Act
      await donationController.authorizeDonationPickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Pickup code is required',
        400
      );
    });

    it('should handle ValidationError', async () => {
      // Arrange
      const error = new ValidationError('Invalid pickup code');
      mockedDonationService.authorizeDonationPickup.mockRejectedValue(error);

      // Act
      await donationController.authorizeDonationPickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });

    it('should handle UnauthorizedActionError', async () => {
      // Arrange
      const error = new UnauthorizedActionError('Not authorized to perform this action');
      mockedDonationService.authorizeDonationPickup.mockRejectedValue(error);

      // Act
      await donationController.authorizeDonationPickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });
  });

  describe('completeDonationDelivery', () => {
    const mockUser = createMockUser(3);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '789' };
    });

    it('should successfully complete donation delivery', async () => {
      // Arrange
      const mockResult = { Status: 'COMPLETED' };
      mockedDonationService.completeDonationDelivery.mockResolvedValue(mockResult);

      // Act
      await donationController.completeDonationDelivery(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.completeDonationDelivery).toHaveBeenCalledWith(3, 789);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Donation delivery completed successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await donationController.completeDonationDelivery(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should return 400 for invalid claim ID', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await donationController.completeDonationDelivery(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Invalid claim ID',
        400
      );
    });
  });

  describe('reportDonationDeliveryFailure', () => {
    const mockUser = createMockUser(4);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '101' };
      mockRequest.body = { reason: 'Recipient not available' };
    });

    it('should successfully report donation delivery failure', async () => {
      // Arrange
      const mockResult = { Status: 'FAILED', Reason: 'Recipient not available' };
      mockedDonationService.reportDonationDeliveryFailure.mockResolvedValue(mockResult);

      // Act
      await donationController.reportDonationDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.reportDonationDeliveryFailure).toHaveBeenCalledWith(
        4, 
        101, 
        'Recipient not available'
      );
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Donation delivery failure reported successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await donationController.reportDonationDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should return 400 for invalid claim ID', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await donationController.reportDonationDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Invalid claim ID',
        400
      );
    });

    it('should return 400 when reason is missing', async () => {
      // Arrange
      mockRequest.body = {};

      // Act
      await donationController.reportDonationDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Failure reason is required',
        400
      );
    });
  });

  describe('getDonationClaimById', () => {
    const mockUser = createMockUser(5);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '202' };
    });

    it('should successfully retrieve donation claim by ID', async () => {
      // Arrange
      const mockResult = { ClaimID: 202, Status: 'PENDING' };
      mockedDonationService.getDonationClaimById.mockResolvedValue(mockResult);

      // Act
      await donationController.getDonationClaimById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.getDonationClaimById).toHaveBeenCalledWith(5, 202);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Donation claim retrieved successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await donationController.getDonationClaimById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should return 400 for invalid claim ID', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await donationController.getDonationClaimById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Invalid claim ID',
        400
      );
    });
  });

  describe('getMyDonationClaims', () => {
    const mockUser = createMockUser(6);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.query = { page: '1', limit: '10' };
    });

    it('should successfully retrieve user donation claims', async () => {
      // Arrange
      const mockResult: any[] = [
        { ClaimID: 1, Status: 'PENDING' },
        { ClaimID: 2, Status: 'APPROVED' }
      ];
      mockedDonationService.getMyDonationClaims.mockResolvedValue(mockResult);

      // Act
      await donationController.getMyDonationClaims(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.getMyDonationClaims).toHaveBeenCalledWith(6, 0, 10);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Donation claims retrieved successfully'
      );
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      mockRequest.query = {};
      const mockResult: any[] = [];
      mockedDonationService.getMyDonationClaims.mockResolvedValue(mockResult);

      // Act
      await donationController.getMyDonationClaims(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.getMyDonationClaims).toHaveBeenCalledWith(6, 0, 10);
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await donationController.getMyDonationClaims(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });
  });

  describe('getMyDonationOffers', () => {
    const mockUser = createMockUser(7);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.query = { page: '2', limit: '5' };
    });

    it('should successfully retrieve user donation offers', async () => {
      // Arrange
      const mockResult = [
        { OfferID: 1, Status: 'AVAILABLE' },
        { OfferID: 2, Status: 'CLAIMED' }
      ];
      mockedDonationService.getMyDonationOffers.mockResolvedValue(mockResult);

      // Act
      await donationController.getMyDonationOffers(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.getMyDonationOffers).toHaveBeenCalledWith(7, 5, 5);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Donation offers retrieved successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await donationController.getMyDonationOffers(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });
  });

  describe('cancelDonationClaim', () => {
    const mockUser = createMockUser(8);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '303' };
      mockRequest.body = { reason: 'Changed my mind' };
    });

    it('should successfully cancel donation claim', async () => {
      // Arrange
      const mockResult = { Status: 'CANCELLED' };
      mockedDonationService.cancelDonationClaim.mockResolvedValue(mockResult);

      // Act
      await donationController.cancelDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.cancelDonationClaim).toHaveBeenCalledWith(8, 303, 'Changed my mind');
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Donation claim cancelled successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await donationController.cancelDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should return 400 for invalid claim ID', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await donationController.cancelDonationClaim(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Invalid claim ID',
        400
      );
    });
  });

  describe('getDonationStats', () => {
    const mockUser = createMockUser(9);

    beforeEach(() => {
      mockRequest.user = mockUser;
    });

    it('should successfully retrieve donation statistics', async () => {
      // Arrange
      const mockClaims = [
        { ClaimStatus: 'APPROVED' },
        { ClaimStatus: 'PENDING' },
        { ClaimStatus: 'REJECTED' }
      ];
      const mockOffers = [
        { ClaimStatus: 'APPROVED' },
        { ClaimStatus: 'CANCELLED' }
      ];

      mockedDonationService.getMyDonationClaims.mockResolvedValue(mockClaims);
      mockedDonationService.getMyDonationOffers.mockResolvedValue(mockOffers);

      // Act
      await donationController.getDonationStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedDonationService.getMyDonationClaims).toHaveBeenCalledWith(9, 0, 1000);
      expect(mockedDonationService.getMyDonationOffers).toHaveBeenCalledWith(9, 0, 1000);
      
      const expectedStats = {
        claims: {
          totalClaims: 3,
          approvedClaims: 1,
          pendingClaims: 1,
          rejectedClaims: 1,
          cancelledClaims: 0
        },
        offers: {
          totalOffers: 2,
          approvedOffers: 1,
          pendingOffers: 0,
          rejectedOffers: 0,
          cancelledOffers: 1
        },
        summary: {
          totalInteractions: 5,
          successfulDeliveries: 2,
          activeItems: 1
        }
      };

      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        expectedStats,
        'Donation statistics retrieved successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await donationController.getDonationStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should handle errors when retrieving statistics', async () => {
      // Arrange
      const error = new Error('Database error');
      mockedDonationService.getMyDonationClaims.mockRejectedValue(error);

      // Act
      await donationController.getDonationStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        500
      );
    });
  });
});
