import { Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '../../src/utils/responseHelper';

describe('ResponseHelper', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('sendSuccessResponse', () => {
    it('should send success response with default message', () => {
      // Arrange
      const testData = { id: 1, name: 'Test' };

      // Act
      sendSuccessResponse(mockResponse as Response, testData);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Operation successful',
        data: testData,
      });
    });

    it('should send success response with custom message', () => {
      // Arrange
      const testData = { id: 1, name: 'Test' };
      const customMessage = 'Custom success message';

      // Act
      sendSuccessResponse(mockResponse as Response, testData, customMessage);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: customMessage,
        data: testData,
      });
    });

    it('should handle null data', () => {
      // Act
      sendSuccessResponse(mockResponse as Response, null);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Operation successful',
        data: null,
      });
    });
  });

  describe('sendErrorResponse', () => {
    it('should send error response with default message and status code', () => {
      // Act
      sendErrorResponse(mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong',
      });
    });

    it('should send error response with custom message', () => {
      // Arrange
      const customMessage = 'Custom error message';

      // Act
      sendErrorResponse(mockResponse as Response, customMessage);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: customMessage,
      });
    });

    it('should send error response with custom status code', () => {
      // Arrange
      const customMessage = 'Not found';
      const customStatusCode = 404;

      // Act
      sendErrorResponse(mockResponse as Response, customMessage, customStatusCode);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: customMessage,
      });
    });

    it('should handle validation errors (400)', () => {
      // Arrange
      const validationMessage = 'Validation failed';
      const statusCode = 400;

      // Act
      sendErrorResponse(mockResponse as Response, validationMessage, statusCode);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: validationMessage,
      });
    });

    it('should handle unauthorized errors (401)', () => {
      // Arrange
      const unauthorizedMessage = 'Unauthorized access';
      const statusCode = 401;

      // Act
      sendErrorResponse(mockResponse as Response, unauthorizedMessage, statusCode);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: unauthorizedMessage,
      });
    });
  });
});
