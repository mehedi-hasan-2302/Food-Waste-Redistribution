import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken, requireAuth, requireRole, requireRoles } from '../../src/middlewares/authMiddleware';
import { User, UserRole, AccountStatus } from '../../src/models/User';

// Mock dependencies
jest.mock('../../src/config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('jsonwebtoken');
jest.mock('../../src/utils/logger');
jest.mock('../../src/config/env', () => ({
  config: {
    jsonToken: {
      secret: 'test-jwt-secret'
    }
  }
}));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockUserRepository: any;

  beforeEach(() => {
    // mock repository
    mockUserRepository = {
      findOne: jest.fn(),
    };

    // AppDataSource mock
    const { AppDataSource } = require('../../src/config/data-source');
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockUserRepository);

    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should authenticate valid token and call next()', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = {
        id: 1,
        tokenValidFrom: new Date().getTime()
      };
      const mockUser = {
        UserID: 1,
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '12345678901',
        Role: UserRole.BUYER,
        IsEmailVerified: true,
        AccountStatus: AccountStatus.ACTIVE,
        TokenValidFrom: new Date(mockDecodedToken.tokenValidFrom - 1000), // Earlier than token
        PasswordHash: 'hashedpassword',
        RegistrationDate: new Date(),
        donorSeller: undefined,
        charityOrganization: undefined,
        buyer: { ProfileID: 1 },
        independentDelivery: undefined,
        organizationVolunteer: undefined
      } as Partial<User>;

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      mockedJwt.verify.mockReturnValue(mockDecodedToken as any);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockedJwt.verify).toHaveBeenCalledWith(mockToken, 'test-jwt-secret');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { UserID: mockDecodedToken.id },
        relations: [
          'donorSeller',
          'charityOrganization',
          'buyer',
          'independentDelivery',
          'organizationVolunteer',
        ],
        select: {
          UserID: true,
          Username: true,
          Email: true,
          PhoneNumber: true,
          Role: true,
          IsEmailVerified: true,
          TokenValidFrom: true,
          AccountStatus: true,
          donorSeller: { ProfileID: true },
          charityOrganization: { ProfileID: true },
          buyer: { ProfileID: true },
          independentDelivery: { ProfileID: true },
          organizationVolunteer: { OrgVolunteerID: true }
        }
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is missing', async () => {
      // Arrange
      mockRequest.headers = {};

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized: Token missing'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is missing from Bearer header', async () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer '
      };

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized: Token missing'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Basic some-token'
      };

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized: Token missing'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when JWT verification fails', async () => {
      // Arrange
      const mockToken = 'invalid-jwt-token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid token',
        error: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = {
        id: 999,
        tokenValidFrom: new Date().getTime()
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      mockedJwt.verify.mockReturnValue(mockDecodedToken as any);
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid user'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is issued before user TokenValidFrom', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const tokenIssuedAt = new Date('2023-01-01T10:00:00Z').getTime();
      const userTokenValidFrom = new Date('2023-01-01T12:00:00Z'); // 2 hours later

      const mockDecodedToken = {
        id: 1,
        tokenValidFrom: tokenIssuedAt
      };

      const mockUser = {
        UserID: 1,
        Username: 'testuser',
        Email: 'test@example.com',
        TokenValidFrom: userTokenValidFrom,
        Role: UserRole.BUYER,
        IsEmailVerified: true,
        AccountStatus: AccountStatus.ACTIVE,
        PasswordHash: 'hashedpassword',
        RegistrationDate: new Date(),
      } as Partial<User>;

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      mockedJwt.verify.mockReturnValue(mockDecodedToken as any);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token invalidated due to security update'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user email is not verified', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = {
        id: 1,
        tokenValidFrom: new Date().getTime()
      };

      const mockUser = {
        UserID: 1,
        Username: 'testuser',
        Email: 'test@example.com',
        TokenValidFrom: new Date(mockDecodedToken.tokenValidFrom - 1000),
        Role: UserRole.BUYER,
        IsEmailVerified: false, // Not verified
        AccountStatus: AccountStatus.ACTIVE,
        PasswordHash: 'hashedpassword',
        RegistrationDate: new Date(),
      } as Partial<User>;

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      mockedJwt.verify.mockReturnValue(mockDecodedToken as any);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email not verified'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = {
        id: 1,
        tokenValidFrom: new Date().getTime()
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      mockedJwt.verify.mockReturnValue(mockDecodedToken as any);
      mockUserRepository.findOne.mockRejectedValue(new Error('Database connection error'));

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid token',
        error: 'Database connection error'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set req.user when authentication succeeds', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = {
        id: 1,
        tokenValidFrom: new Date().getTime()
      };

      const mockUser = {
        UserID: 1,
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '12345678901',
        Role: UserRole.BUYER,
        IsEmailVerified: true,
        AccountStatus: AccountStatus.ACTIVE,
        TokenValidFrom: new Date(mockDecodedToken.tokenValidFrom - 1000),
        PasswordHash: 'hashedpassword',
        RegistrationDate: new Date(),
        donorSeller: undefined,
        charityOrganization: undefined,
        buyer: { ProfileID: 1 },
        independentDelivery: undefined,
        organizationVolunteer: undefined
      } as Partial<User>;

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      mockedJwt.verify.mockReturnValue(mockDecodedToken as any);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should correctly assign profile IDs for different user types', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = {
        id: 1,
        tokenValidFrom: new Date().getTime()
      };

      const mockUser = {
        UserID: 1,
        Username: 'donoruser',
        Email: 'donor@example.com',
        PhoneNumber: '12345678901',
        Role: UserRole.DONOR_SELLER,
        IsEmailVerified: true,
        AccountStatus: AccountStatus.ACTIVE,
        TokenValidFrom: new Date(mockDecodedToken.tokenValidFrom - 1000),
        PasswordHash: 'hashedpassword',
        RegistrationDate: new Date(),
        donorSeller: { ProfileID: 123 },
        charityOrganization: undefined,
        buyer: undefined,
        independentDelivery: { ProfileID: 456 },
        organizationVolunteer: { OrgVolunteerID: 789 }
      } as Partial<User>;

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      mockedJwt.verify.mockReturnValue(mockDecodedToken as any);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.user).toEqual(expect.objectContaining({
        ...mockUser,
        donorSellerId: 123,
        charityOrganizationId: undefined,
        buyerId: undefined,
        independentDeliveryId: 456,
        organizationVolunteerId: 789
      }));
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle token without tokenValidFrom timestamp', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = {
        id: 1
        // No tokenValidFrom field
      };

      const mockUser = {
        UserID: 1,
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '12345678901',
        Role: UserRole.BUYER,
        IsEmailVerified: true,
        AccountStatus: AccountStatus.ACTIVE,
        TokenValidFrom: new Date(),
        PasswordHash: 'hashedpassword',
        RegistrationDate: new Date(),
        donorSeller: undefined,
        charityOrganization: undefined,
        buyer: { ProfileID: 1 },
        independentDelivery: undefined,
        organizationVolunteer: undefined
      } as Partial<User>;

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      mockedJwt.verify.mockReturnValue(mockDecodedToken as any);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should call next() when user is authenticated', () => {
      // Arrange
      mockRequest.user = {
        UserID: 1,
        Username: 'testuser',
        Role: UserRole.BUYER
      } as any;

      // Act
      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      // Arrange
      mockRequest.user = undefined;
      (mockRequest as any).path = '/protected-route';

      // Act
      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should call next() when user has the required role', () => {
      // Arrange
      mockRequest.user = {
        UserID: 1,
        Username: 'adminuser',
        Role: UserRole.ADMIN
      } as any;

      const adminMiddleware = requireRole(UserRole.ADMIN);

      // Act
      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 403 when user has wrong role', () => {
      // Arrange
      mockRequest.user = {
        UserID: 1,
        Username: 'buyeruser',
        Role: UserRole.BUYER
      } as any;
      (mockRequest as any).path = '/admin-route';

      const adminMiddleware = requireRole(UserRole.ADMIN);

      // Act
      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not authenticated', () => {
      // Arrange
      mockRequest.user = undefined;
      (mockRequest as any).path = '/admin-route';

      const adminMiddleware = requireRole(UserRole.ADMIN);

      // Act
      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRoles', () => {
    it('should call next() when user has one of the required roles', () => {
      // Arrange
      mockRequest.user = {
        UserID: 1,
        Username: 'donoruser',
        Role: UserRole.DONOR_SELLER
      } as any;

      const businessMiddleware = requireRoles([UserRole.DONOR_SELLER, UserRole.CHARITY_ORG]);

      // Act
      businessMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next() when user has another valid role from the list', () => {
      // Arrange
      mockRequest.user = {
        UserID: 2,
        Username: 'charityuser',
        Role: UserRole.CHARITY_ORG
      } as any;

      const businessMiddleware = requireRoles([UserRole.DONOR_SELLER, UserRole.CHARITY_ORG]);

      // Act
      businessMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is not in the allowed list', () => {
      // Arrange
      mockRequest.user = {
        UserID: 1,
        Username: 'buyeruser',
        Role: UserRole.BUYER
      } as any;

      const businessMiddleware = requireRoles([UserRole.DONOR_SELLER, UserRole.CHARITY_ORG]);

      // Act
      businessMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden: Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not authenticated', () => {
      // Arrange
      mockRequest.user = undefined;

      const businessMiddleware = requireRoles([UserRole.DONOR_SELLER, UserRole.CHARITY_ORG]);

      // Act
      businessMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden: Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty roles array', () => {
      // Arrange
      mockRequest.user = {
        UserID: 1,
        Username: 'testuser',
        Role: UserRole.BUYER
      } as any;

      const emptyRolesMiddleware = requireRoles([]);

      // Act
      emptyRolesMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden: Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
