import { Request, Response } from 'express';
import * as orderController from '../../src/controllers/orderController';
import * as orderService from '../../src/services/orderService';
import { sendSuccessResponse, sendErrorResponse } from '../../src/utils/responseHelper';
import {
  UserDoesNotExistError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../../src/utils/errors';
import { User, UserRole, AccountStatus } from '../../src/models/User';
import { OrderStatus } from '../../src/models/Order';

// Mock dependencies
jest.mock('../../src/services/orderService');
jest.mock('../../src/utils/responseHelper');
jest.mock('../../src/utils/logger');

const mockedOrderService = orderService as jest.Mocked<typeof orderService>;
const mockedSendSuccessResponse = sendSuccessResponse as jest.MockedFunction<typeof sendSuccessResponse>;
const mockedSendErrorResponse = sendErrorResponse as jest.MockedFunction<typeof sendErrorResponse>;

describe('OrderController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  //  a complete mock user object
  const createMockUser = (userId: number, role: UserRole = UserRole.BUYER): User & {
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
    Role: role,
    RegistrationDate: new Date(),
    IsEmailVerified: true,
    AccountStatus: AccountStatus.ACTIVE,
    TokenValidFrom: new Date(),
    verificationCode: null,
    verificationCodeExpires: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    isProfileComplete: true,
    buyerId: role === UserRole.BUYER ? userId : undefined,
    donorSellerId: role === UserRole.DONOR_SELLER ? userId : undefined,
    independentDeliveryId: role === UserRole.INDEP_DELIVERY ? userId : undefined
  });

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const mockUser = createMockUser(1, UserRole.BUYER);
    const mockOrderData = {
      quantity: 2,
      deliveryAddress: '123 Test Street',
      deliveryType: 'HOME_DELIVERY'
    };

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '123' };
      mockRequest.body = mockOrderData;
    });

    it('should successfully create an order', async () => {
      // Arrange
      const mockResult: orderService.OrderResponse = {
        orderId: 1,
        orderStatus: OrderStatus.PENDING,
        estimatedTotal: 25.50,
        deliveryFee: 5.00,
        pickupCode: 'ABC123',
        listing: {},
        seller: {}
      };
      mockedOrderService.createOrder.mockResolvedValue(mockResult);

      // Act
      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedOrderService.createOrder).toHaveBeenCalledWith(1, 123, mockOrderData);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Order created successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
      expect(mockedOrderService.createOrder).not.toHaveBeenCalled();
    });

    it('should handle UserDoesNotExistError', async () => {
      // Arrange
      const error = new UserDoesNotExistError('User does not exist');
      mockedOrderService.createOrder.mockRejectedValue(error);

      // Act
      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

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
      mockedOrderService.createOrder.mockRejectedValue(error);

      // Act
      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

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
      mockedOrderService.createOrder.mockRejectedValue(error);

      // Act
      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

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
      mockedOrderService.createOrder.mockRejectedValue(error);

      // Act
      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

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
      mockedOrderService.createOrder.mockRejectedValue(error);

      // Act
      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        500
      );
    });
  });

  describe('authorizePickup', () => {
    const mockUser = createMockUser(2, UserRole.DONOR_SELLER);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '456' };
      mockRequest.body = { pickupCode: 'XYZ789' };
    });

    it('should successfully authorize pickup', async () => {
      // Arrange
      const mockResult = { status: 'AUTHORIZED', authorizedAt: new Date() };
      mockedOrderService.authorizePickup.mockResolvedValue(mockResult);

      // Act
      await orderController.authorizePickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedOrderService.authorizePickup).toHaveBeenCalledWith(2, 456, 'XYZ789');
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Pickup authorized successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await orderController.authorizePickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should return 400 for invalid order ID', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await orderController.authorizePickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Invalid order ID',
        400
      );
    });

    it('should return 400 when pickup code is missing', async () => {
      // Arrange
      mockRequest.body = {};

      // Act
      await orderController.authorizePickup(mockRequest as Request, mockResponse as Response);

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
      mockedOrderService.authorizePickup.mockRejectedValue(error);

      // Act
      await orderController.authorizePickup(mockRequest as Request, mockResponse as Response);

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
      mockedOrderService.authorizePickup.mockRejectedValue(error);

      // Act
      await orderController.authorizePickup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });
  });

  describe('completeDelivery', () => {
    const mockUser = createMockUser(3, UserRole.BUYER);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '789' };
    });

    it('should successfully complete delivery', async () => {
      // Arrange
      const mockResult = { status: 'COMPLETED', completedAt: new Date() };
      mockedOrderService.completeDelivery.mockResolvedValue(mockResult);

      // Act
      await orderController.completeDelivery(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedOrderService.completeDelivery).toHaveBeenCalledWith(3, 789);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Delivery completed successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await orderController.completeDelivery(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should return 400 for invalid order ID', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await orderController.completeDelivery(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Invalid order ID',
        400
      );
    });

    it('should handle ValidationError', async () => {
      // Arrange
      const error = new ValidationError('Cannot complete delivery');
      mockedOrderService.completeDelivery.mockRejectedValue(error);

      // Act
      await orderController.completeDelivery(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });

    it('should handle UnauthorizedActionError', async () => {
      // Arrange
      const error = new UnauthorizedActionError('Not authorized to complete delivery');
      mockedOrderService.completeDelivery.mockRejectedValue(error);

      // Act
      await orderController.completeDelivery(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });
  });

  describe('reportDeliveryFailure', () => {
    const mockUser = createMockUser(4, UserRole.INDEP_DELIVERY);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '101' };
      mockRequest.body = { reason: 'Customer not available' };
    });

    it('should successfully report delivery failure', async () => {
      // Arrange
      const mockResult = { status: 'FAILED', reason: 'Customer not available', reportedAt: new Date() };
      mockedOrderService.reportDeliveryFailure.mockResolvedValue(mockResult);

      // Act
      await orderController.reportDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedOrderService.reportDeliveryFailure).toHaveBeenCalledWith(
        4, 
        101, 
        'Customer not available'
      );
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Delivery failure reported successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await orderController.reportDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should return 400 for invalid order ID', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await orderController.reportDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Invalid order ID',
        400
      );
    });

    it('should return 400 when reason is missing', async () => {
      // Arrange
      mockRequest.body = {};

      // Act
      await orderController.reportDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Failure reason is required',
        400
      );
    });

    it('should handle ValidationError', async () => {
      // Arrange
      const error = new ValidationError('Invalid failure reason');
      mockedOrderService.reportDeliveryFailure.mockRejectedValue(error);

      // Act
      await orderController.reportDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });

    it('should handle UnauthorizedActionError', async () => {
      // Arrange
      const error = new UnauthorizedActionError('Not authorized to report failure');
      mockedOrderService.reportDeliveryFailure.mockRejectedValue(error);

      // Act
      await orderController.reportDeliveryFailure(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });
  });

  describe('getOrderById', () => {
    const mockUser = createMockUser(5, UserRole.BUYER);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: '202' };
    });

    it('should successfully retrieve order by ID', async () => {
      // Arrange
      const mockResult = {
        orderId: 202,
        status: 'PENDING',
        totalAmount: 35.75,
        buyer: { UserID: 5, Username: 'testuser5' },
        seller: { UserID: 10, Username: 'seller1' }
      };
      mockedOrderService.getOrderById.mockResolvedValue(mockResult);

      // Act
      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedOrderService.getOrderById).toHaveBeenCalledWith(5, 202);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Order retrieved successfully'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });

    it('should handle ValidationError when order not found', async () => {
      // Arrange
      const error = new ValidationError('Order not found');
      mockedOrderService.getOrderById.mockRejectedValue(error);

      // Act
      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });

    it('should handle UnauthorizedActionError', async () => {
      // Arrange
      const error = new UnauthorizedActionError('Not authorized to view this order');
      mockedOrderService.getOrderById.mockRejectedValue(error);

      // Act
      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });
  });
});
