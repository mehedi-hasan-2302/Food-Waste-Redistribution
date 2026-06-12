import { User, UserRole, AccountStatus } from '../../src/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail, sendVerificationEmail } from '../../src/utils/emailHelper';
import {
  UserAlreadyExistsError,
  InvalidRoleError,
  InvalidCredentialsError,
  AccountNotActiveError,
  EmailNotVerifiedError,
  InvalidPasswordResetTokenError,
  InvalidVerificationCodeError,
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
const mockedSendPasswordResetEmail = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;

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
      mockedBcrypt.hash
        .mockResolvedValueOnce('hashedpassword' as never)
        .mockResolvedValueOnce('hashed-verification-code' as never);
      
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

      mockUserRepository.create.mockImplementation((user: User) => ({ ...mockUser, ...user }));
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockedSendVerificationEmail.mockResolvedValue(undefined);

      // Act
      await authService.signup(signupInput);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [{ Email: signupInput.Email }]
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(signupInput.Password, 10);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(expect.stringMatching(/^[0-9]{6}$/), 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        PasswordHash: 'hashedpassword',
        verificationCode: 'hashed-verification-code',
      }));
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockedSendVerificationEmail).toHaveBeenCalledWith(
        signupInput.Email,
        expect.stringMatching(/^[0-9]{6}$/)
      );
      expect(mockedSendVerificationEmail).not.toHaveBeenCalledWith(
        signupInput.Email,
        'hashed-verification-code'
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

  describe('verifyEmail', () => {
    it('should verify email using the hashed verification code', async () => {
      const mockUser = {
        UserID: 1,
        Email: 'test@example.com',
        Role: UserRole.BUYER,
        IsEmailVerified: false,
        AccountStatus: AccountStatus.PENDING,
        verificationCode: 'hashed-verification-code',
        verificationCodeExpires: new Date(Date.now() + 10000),
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign.mockReturnValue('email-token' as never);

      const result = await authService.verifyEmail('test@example.com', '123456');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-verification-code');
      expect(mockUser.IsEmailVerified).toBe(true);
      expect(mockUser.AccountStatus).toBe(AccountStatus.ACTIVE);
      expect(mockUser.verificationCode).toBeNull();
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ email_verificationToken: 'email-token' });
    });

    it('should reject an invalid verification code hash match', async () => {
      const mockUser = {
        UserID: 1,
        Email: 'test@example.com',
        IsEmailVerified: false,
        verificationCode: 'hashed-verification-code',
        verificationCodeExpires: new Date(Date.now() + 10000),
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.verifyEmail('test@example.com', '000000'))
        .rejects.toThrow(InvalidVerificationCodeError);
    });
  });

  describe('password reset codes', () => {
    it('should store a hashed password reset code and email the raw code', async () => {
      const mockUser = {
        UserID: 1,
        Email: 'test@example.com',
        IsEmailVerified: true,
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('hashed-reset-code' as never);
      mockedSendPasswordResetEmail.mockResolvedValue(undefined);

      await authService.requestForgotPasswordReset('test@example.com');

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(expect.stringMatching(/^[0-9]{6}$/), 10);
      expect(mockUser.passwordResetToken).toBe('hashed-reset-code');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockedSendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringMatching(/^[0-9]{6}$/)
      );
      expect(mockedSendPasswordResetEmail).not.toHaveBeenCalledWith(
        'test@example.com',
        'hashed-reset-code'
      );
    });

    it('should reset password using the hashed reset code', async () => {
      const mockUser = {
        UserID: 1,
        Email: 'test@example.com',
        PasswordHash: 'old-password-hash',
        passwordResetToken: 'hashed-reset-code',
        passwordResetExpires: new Date(Date.now() + 10000),
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedBcrypt.hash.mockResolvedValue('new-password-hash' as never);

      await authService.resetPassword({
        Email: 'test@example.com',
        Code: '123456',
        Password: 'newpassword123',
        ConfirmPassword: 'newpassword123',
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-reset-code');
      expect(mockUser.PasswordHash).toBe('new-password-hash');
      expect(mockUser.passwordResetToken).toBeNull();
      expect(mockUser.passwordResetExpires).toBeNull();
      expect(mockUser.TokenValidFrom).toBeInstanceOf(Date);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should reject an invalid reset code hash match', async () => {
      const mockUser = {
        UserID: 1,
        Email: 'test@example.com',
        passwordResetToken: 'hashed-reset-code',
        passwordResetExpires: new Date(Date.now() + 10000),
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.resetPassword({
        Email: 'test@example.com',
        Code: '000000',
        Password: 'newpassword123',
        ConfirmPassword: 'newpassword123',
      })).rejects.toThrow(InvalidPasswordResetTokenError);
    });
  });
});
