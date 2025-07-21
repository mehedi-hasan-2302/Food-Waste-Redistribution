import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/authRoutes';
import * as authService from '../../src/services/authService';
import { UserRole } from '../../src/models/User';
import { InvalidCredentialsError } from '../../src/utils/errors';


jest.mock('../../src/services/authService');
jest.mock('../../src/utils/logger');
jest.mock('../../src/utils/rateLimiter', () => ({
  authLimiter: (req: any, res: any, next: any) => next()
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const signupData = {
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '12345678901',
        Password: 'password123',
        Role: 'BUYER'
      };

      mockedAuthService.signup.mockResolvedValue(undefined);

      // Act
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User registered successfully. Please check your email for verification code.');
    });

    it('should return error for invalid data', async () => {
      // Arrange
      const invalidData = {
        Username: '', // Empty username
        Email: 'invalid-email', // Invalid email
        PhoneNumber: '123', // Invalid phone number (too short)
        Password: 'short', // Too short password
        Role: 'INVALID_ROLE' // Invalid role
      };

      // Act
      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidData);

      // Assert
      expect(response.status).toBe(422); // Validation error returns 422
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const loginData = {
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
          isProfileComplete: false,
        },
        token: 'jwt-token-here'
      };

      mockedAuthService.login.mockResolvedValue(mockResult);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toEqual(mockResult);
    });

    it('should return error for invalid credentials', async () => {
      // Arrange
      const loginData = {
        Email: 'test@example.com',
        Password: 'wrongpassword'
      };

      const error = new InvalidCredentialsError('Invalid credentials');
      mockedAuthService.login.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });
});
