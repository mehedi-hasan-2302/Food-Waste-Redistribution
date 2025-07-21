import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequestBody } from '../../src/middlewares/validationMiddleware';
import { sendErrorResponse } from '../../src/utils/responseHelper';

// Mock dependencies
jest.mock('../../src/utils/responseHelper');
jest.mock('../../src/utils/logger');

const mockedSendErrorResponse = sendErrorResponse as jest.MockedFunction<typeof sendErrorResponse>;

describe('ValidationMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      path: '/test-path'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateRequestBody', () => {
    const testSchema = Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required'
      }),
      email: Joi.string().email().required().messages({
        'string.email': 'Email must be valid',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
      }),
      age: Joi.number().min(18).max(100).required().messages({
        'number.base': 'Age must be a number',
        'number.min': 'Age must be at least 18',
        'number.max': 'Age must be at most 100',
        'any.required': 'Age is required'
      })
    });

    it('should call next() when validation passes', () => {
      // Arrange
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      const middleware = validateRequestBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockedSendErrorResponse).not.toHaveBeenCalled();
    });

    it('should send error response when validation fails for required field', () => {
      // Arrange
      mockRequest.body = {
        email: 'john@example.com',
        age: 25
        // missing required 'name' field
      };

      const middleware = validateRequestBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Name is required',
        422
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should send error response when email format is invalid', () => {
      // Arrange
      mockRequest.body = {
        name: 'John Doe',
        email: 'invalid-email',
        age: 25
      };

      const middleware = validateRequestBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Email must be valid',
        422
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should send error response when age is below minimum', () => {
      // Arrange
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 16
      };

      const middleware = validateRequestBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Age must be at least 18',
        422
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should send error response when age is above maximum', () => {
      // Arrange
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 150
      };

      const middleware = validateRequestBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Age must be at most 100',
        422
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should send error response when age is not a number', () => {
      // Arrange
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 'twenty-five'
      };

      const middleware = validateRequestBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Age must be a number',
        422
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty request body', () => {
      // Arrange
      mockRequest.body = {};

      const middleware = validateRequestBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Name is required',
        422
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle null request body', () => {
      // Arrange
      mockRequest.body = null;

      const middleware = validateRequestBody(testSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        '"value" must be of type object',
        422
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should validate with actual signup schema', () => {
      // Test with actual signup schema pattern
      const signupSchema = Joi.object({
        Username: Joi.string().min(2).max(100).required().messages({
          'string.empty': 'Username is required',
          'string.min': 'Username must be at least 2 characters',
          'string.max': 'Username must be at most 100 characters',
        }),
        Email: Joi.string().email().required().messages({
          'string.empty': 'Email is required',
          'string.email': 'Email must be a valid email address',
        }),
        PhoneNumber: Joi.string().pattern(/^[0-9]{11}$/).required().messages({
          'string.empty': 'Phone number is required',
          'string.pattern.base': 'Phone number must be a valid 11-digit number',
        }),
        Password: Joi.string().min(8).required().messages({
          'string.empty': 'Password is required',
          'string.min': 'Password must be at least 8 characters',
        }),
        Role: Joi.string().valid('DONOR_SELLER', 'CHARITY_ORG', 'BUYER', 'INDEP_DELIVERY', 'ORG_VOLUNTEER').required().messages({
          'any.only': 'Invalid role provided',
          'string.empty': 'Role is required',
        }),
      });

      // Arrange - Valid signup data
      mockRequest.body = {
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '12345678901',
        Password: 'password123',
        Role: 'BUYER'
      };

      const middleware = validateRequestBody(signupSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockedSendErrorResponse).not.toHaveBeenCalled();
    });

    it('should reject invalid phone number format', () => {
      // Test with actual signup schema pattern
      const signupSchema = Joi.object({
        Username: Joi.string().min(2).max(100).required(),
        Email: Joi.string().email().required(),
        PhoneNumber: Joi.string().pattern(/^[0-9]{11}$/).required().messages({
          'string.pattern.base': 'Phone number must be a valid 11-digit number',
        }),
        Password: Joi.string().min(8).required(),
        Role: Joi.string().valid('DONOR_SELLER', 'CHARITY_ORG', 'BUYER', 'INDEP_DELIVERY', 'ORG_VOLUNTEER').required(),
      });

      // Arrange - Invalid phone number (10 digits instead of 11)
      mockRequest.body = {
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Password: 'password123',
        Role: 'BUYER'
      };

      const middleware = validateRequestBody(signupSchema);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockedSendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        'Phone number must be a valid 11-digit number',
        422
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
