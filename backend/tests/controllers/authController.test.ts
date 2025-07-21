import { Request, Response } from 'express';
import * as authController from '../../src/controllers/authController';
import * as authService from '../../src/services/authService';
import { sendSuccessResponse, sendErrorResponse } from '../../src/utils/responseHelper';
import {
  UserAlreadyExistsError,
  InvalidRoleError,
  InvalidCredentialsError
} from '../../src/utils/errors';
import { UserRole } from '../../src/models/User';

// Mock dependencies
jest.mock('../../src/services/authService');
jest.mock('../../src/utils/responseHelper');
jest.mock('../../src/utils/logger');

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedSendSuccessResponse = sendSuccessResponse as jest.MockedFunction<typeof sendSuccessResponse>;
const mockedSendErrorResponse = sendErrorResponse as jest.MockedFunction<typeof sendErrorResponse>;

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('signup', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      mockRequest.body = {
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Password: 'password123',
        Role: 'BUYER'
      };

      mockedAuthService.signup.mockResolvedValue(undefined);

      // Act
      await authController.signup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedAuthService.signup).toHaveBeenCalledWith({
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Password: 'password123',
        Role: 'BUYER'
      });
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        undefined,
        'User registered successfully. Please check your email for verification code.'
      );
    });

    it('should handle UserAlreadyExistsError', async () => {
      // Arrange
      mockRequest.body = {
        Username: 'existinguser',
        Email: 'existing@example.com',
        PhoneNumber: '1234567890',
        Password: 'password123',
        Role: 'BUYER'
      };

      const error = new UserAlreadyExistsError('User already exists');
      mockedAuthService.signup.mockRejectedValue(error);

      // Act
      await authController.signup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });

    it('should handle InvalidRoleError', async () => {
      // Arrange
      mockRequest.body = {
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Password: 'password123',
        Role: 'INVALID_ROLE'
      };

      const error = new InvalidRoleError('Invalid role specified');
      mockedAuthService.signup.mockRejectedValue(error);

      // Act
      await authController.signup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      // Arrange
      mockRequest.body = {
        Email: 'test@example.com',
        Password: 'password123'
      };

      const mockResult = {
        user: {
          UserID: 1,
          Username: 'testuser',
          Email: 'test@example.com',
          PhoneNumber: '1234567890',
          Role: UserRole.BUYER,
          isProfileComplete: false
        },
        token: 'jwt-token-here'
      };

      mockedAuthService.login.mockResolvedValue(mockResult);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedAuthService.login).toHaveBeenCalledWith({
        Email: 'test@example.com',
        Password: 'password123'
      });
      expect(mockedSendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Login successful'
      );
    });

    it('should handle InvalidCredentialsError', async () => {
      // Arrange
      mockRequest.body = {
        Email: 'test@example.com',
        Password: 'wrongpassword'
      };

      const error = new InvalidCredentialsError('Invalid credentials');
      mockedAuthService.login.mockRejectedValue(error);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        error.message,
        error.statusCode
      );
    });
  });
});
