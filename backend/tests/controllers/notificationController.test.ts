import { Request, Response } from 'express';
import * as notificationController from '../../src/controllers/notificationController';
import * as notificationService from '../../src/services/notificationService';
import { sendSuccessResponse, sendErrorResponse } from '../../src/utils/responseHelper';
import { User, UserRole, AccountStatus } from '../../src/models/User';
import { Notification, NotificationType } from '../../src/models/Notification';

// Mock dependencies
jest.mock('../../src/services/notificationService');
jest.mock('../../src/utils/responseHelper');
jest.mock('../../src/utils/logger');

const mockedNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockedSendSuccessResponse = sendSuccessResponse as jest.MockedFunction<typeof sendSuccessResponse>;
const mockedSendErrorResponse = sendErrorResponse as jest.MockedFunction<typeof sendErrorResponse>;

describe('NotificationController', () => {
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
    Role: UserRole.BUYER,
    RegistrationDate: new Date(),
    IsEmailVerified: true,
    AccountStatus: AccountStatus.ACTIVE,
    TokenValidFrom: new Date(),
    verificationCode: null,
    verificationCodeExpires: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    isProfileComplete: true,
    buyerId: userId
  });

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getNotificationsForUser', () => {
    const mockUser = createMockUser(1);

    beforeEach(() => {
      mockRequest.user = mockUser;
      mockRequest.query = {};
    });

    it('should successfully retrieve notifications for user with default pagination', async () => {
      // Arrange
      const mockNotifications: Notification[] = [
        {
          NotificationID: 1,
          recipient: mockUser,
          NotificationType: NotificationType.ORDER_UPDATE,
          Message: 'Your order has been confirmed',
          IsRead: false,
          createdAt: new Date(),
          ReferenceID: 123
        },
        {
          NotificationID: 2,
          recipient: mockUser,
          NotificationType: NotificationType.DELIVERY_UPDATE,
          Message: 'Your order is out for delivery',
          IsRead: true,
          createdAt: new Date(),
          ReferenceID: 124
        }
      ];
      mockedNotificationService.getNotificationsForUser.mockResolvedValue(mockNotifications);

      // Act
      await notificationController.getNotificationsForUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedNotificationService.getNotificationsForUser).toHaveBeenCalledWith(1, 20, 0);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockNotifications
      );
    });

    it('should retrieve notifications with custom pagination parameters', async () => {
      // Arrange
      mockRequest.query = { limit: '10', offset: '5' };
      const mockNotifications: Notification[] = [];
      mockedNotificationService.getNotificationsForUser.mockResolvedValue(mockNotifications);

      // Act
      await notificationController.getNotificationsForUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedNotificationService.getNotificationsForUser).toHaveBeenCalledWith(1, 10, 5);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockNotifications
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await notificationController.getNotificationsForUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
      expect(mockedNotificationService.getNotificationsForUser).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockedNotificationService.getNotificationsForUser.mockRejectedValue(error);

      // Act
      await notificationController.getNotificationsForUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message
      );
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      const errorMessage = 'String error message';
      mockedNotificationService.getNotificationsForUser.mockRejectedValue(errorMessage);

      // Act
      await notificationController.getNotificationsForUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        errorMessage
      );
    });

    it('should use default values for invalid pagination parameters', async () => {
      // Arrange
      mockRequest.query = { limit: 'invalid', offset: 'invalid' };
      const mockNotifications: Notification[] = [];
      mockedNotificationService.getNotificationsForUser.mockResolvedValue(mockNotifications);

      // Act
      await notificationController.getNotificationsForUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedNotificationService.getNotificationsForUser).toHaveBeenCalledWith(1, 20, 0);
    });
  });

  describe('markNotificationAsRead', () => {
    beforeEach(() => {
      mockRequest.params = { notificationId: '123' };
    });

    it('should successfully mark notification as read', async () => {
      // Arrange
      const mockUpdatedNotification: Notification = {
        NotificationID: 123,
        recipient: createMockUser(1),
        NotificationType: NotificationType.ORDER_UPDATE,
        Message: 'Your order has been confirmed',
        IsRead: true,
        createdAt: new Date(),
        ReferenceID: 456
      };
      mockedNotificationService.markNotificationAsRead.mockResolvedValue(mockUpdatedNotification);

      // Act
      await notificationController.markNotificationAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedNotificationService.markNotificationAsRead).toHaveBeenCalledWith(123);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockUpdatedNotification
      );
    });

    it('should handle invalid notification ID', async () => {
      // Arrange
      mockRequest.params = { notificationId: 'invalid' };

      // Act
      await notificationController.markNotificationAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedNotificationService.markNotificationAsRead).toHaveBeenCalledWith(NaN);
    });

    it('should handle service errors when marking notification as read', async () => {
      // Arrange
      const error = new Error('Notification not found');
      mockedNotificationService.markNotificationAsRead.mockRejectedValue(error);

      // Act
      await notificationController.markNotificationAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message
      );
    });

    it('should handle non-Error exceptions when marking notification as read', async () => {
      // Arrange
      const errorMessage = 'String error message';
      mockedNotificationService.markNotificationAsRead.mockRejectedValue(errorMessage);

      // Act
      await notificationController.markNotificationAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        errorMessage
      );
    });
  });

  describe('markAllNotificationsAsRead', () => {
    const mockUser = createMockUser(2);

    beforeEach(() => {
      mockRequest.user = mockUser;
    });

    it('should successfully mark all notifications as read', async () => {
      // Arrange
      mockedNotificationService.markAllNotificationsAsRead.mockResolvedValue();

      // Act
      await notificationController.markAllNotificationsAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedNotificationService.markAllNotificationsAsRead).toHaveBeenCalledWith(2);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        undefined
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await notificationController.markAllNotificationsAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
      expect(mockedNotificationService.markAllNotificationsAsRead).not.toHaveBeenCalled();
    });

    it('should handle service errors when marking all notifications as read', async () => {
      // Arrange
      const error = new Error('Database update failed');
      mockedNotificationService.markAllNotificationsAsRead.mockRejectedValue(error);

      // Act
      await notificationController.markAllNotificationsAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message
      );
    });

    it('should handle non-Error exceptions when marking all notifications as read', async () => {
      // Arrange
      const errorMessage = 'String error message';
      mockedNotificationService.markAllNotificationsAsRead.mockRejectedValue(errorMessage);

      // Act
      await notificationController.markAllNotificationsAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        errorMessage
      );
    });

    it('should handle case when no notifications need to be updated', async () => {
      // Arrange
      mockedNotificationService.markAllNotificationsAsRead.mockResolvedValue();

      // Act
      await notificationController.markAllNotificationsAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedNotificationService.markAllNotificationsAsRead).toHaveBeenCalledWith(2);
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        undefined
      );
    });
  });
});
