import { User, UserRole, AccountStatus } from '../../src/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../../src/utils/emailHelper';
import {
  UserAlreadyExistsError,
  InvalidRoleError,
  InvalidCredentialsError,
  AccountNotActiveError,
  EmailNotVerifiedError,
} from '../../src/utils/errors';


const mockUserRepository = {
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
} as any;


jest.mock('../../src/config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue(mockUserRepository),
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/utils/emailHelper');
jest.mock('../../src/utils/logger');

import * as authService from '../../src/services/authService';

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedSendVerificationEmail = sendVerificationEmail as jest.MockedFunction<typeof sendVerificationEmail>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUserRepository.findOne.mockReset();
    mockUserRepository.findOneBy.mockReset();
    mockUserRepository.save.mockReset();
    mockUserRepository.create.mockReset();
    mockUserRepository.update.mockReset();
    mockUserRepository.find.mockReset();
    mockUserRepository.delete.mockReset();
  });

  describe('signup', () => {
    const signupInput = {
      Username: 'testuser',
      Email: 'test@example.com',
      PhoneNumber: '12345678901', 
      Password: 'password123',
      Role: 'BUYER'
    };

    it('should successfully register a new user', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null); // User doesn't exist
      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      
      const mockUser = {
        UserID: 1,
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '12345678901', 
        PasswordHash: 'hashedpassword',
        Role: UserRole.BUYER,
        AccountStatus: AccountStatus.PENDING,
        IsEmailVerified: false,
        verificationCode: 'verification-code',
        verificationCodeExpires: new Date(),
        RegistrationDate: new Date(),
      } as User;

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockedSendVerificationEmail.mockResolvedValue(undefined);

      // Act
      await authService.signup(signupInput);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [{ Email: signupInput.Email }]
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(signupInput.Password, 10);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockedSendVerificationEmail).toHaveBeenCalledWith(
        signupInput.Email,
        expect.any(String)
      );
    });

    it('should throw UserAlreadyExistsError if user already exists', async () => {
      // Arrange
      const existingUser = {
        UserID: 1,
        Email: 'test@example.com',
        Username: 'testuser',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.signup(signupInput)).rejects.toThrow(UserAlreadyExistsError);
    });

    it('should throw InvalidRoleError for invalid role', async () => {
      // Arrange
      const invalidRoleInput = {
        ...signupInput,
        Role: 'INVALID_ROLE'
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.signup(invalidRoleInput)).rejects.toThrow(InvalidRoleError);
    });
  });

  describe('login', () => {
    const loginInput = {
      Email: 'test@example.com',
      Password: 'password123'
    };

    it('should successfully login a user', async () => {
      // Arrange
      const mockUser = {
        UserID: 1,
        Username: 'testuser',
        Email: 'test@example.com',
        PhoneNumber: '12345678901', 
        PasswordHash: 'hashedpassword',
        Role: UserRole.BUYER,
        AccountStatus: AccountStatus.ACTIVE,
        IsEmailVerified: true,
        isProfileComplete: false,
        TokenValidFrom: new Date(),
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign.mockReturnValue('jwt-token' as never);

      // Act
      const result = await authService.login(loginInput);

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        Email: loginInput.Email
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginInput.Password, mockUser.PasswordHash);
      expect(mockedJwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          UserID: mockUser.UserID,
          Username: mockUser.Username,
          Email: mockUser.Email,
          PhoneNumber: mockUser.PhoneNumber,
          Role: mockUser.Role,
          isProfileComplete: mockUser.isProfileComplete,
        },
        token: 'jwt-token'
      });
    });

    it('should throw InvalidCredentialsError if user not found', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw InvalidCredentialsError for wrong password', async () => {
      // Arrange
      const mockUser = {
        UserID: 1,
        Email: 'test@example.com',
        PasswordHash: 'hashedpassword',
        AccountStatus: AccountStatus.ACTIVE,
        IsEmailVerified: true,
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw AccountNotActiveError for inactive account', async () => {
      // Arrange
      const mockUser = {
        UserID: 1,
        Email: 'test@example.com',
        PasswordHash: 'hashedpassword',
        AccountStatus: AccountStatus.PENDING,
        IsEmailVerified: true,
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(AccountNotActiveError);
    });

    it('should throw EmailNotVerifiedError for unverified email', async () => {
      // Arrange
      const mockUser = {
        UserID: 1,
        Email: 'test@example.com',
        PasswordHash: 'hashedpassword',
        AccountStatus: AccountStatus.ACTIVE,
        IsEmailVerified: false,
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(EmailNotVerifiedError);
    });
  });
});
