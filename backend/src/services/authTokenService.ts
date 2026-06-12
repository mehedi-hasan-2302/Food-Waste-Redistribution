import jwt from 'jsonwebtoken'
import { FindOneOptions } from 'typeorm'
import { AppDataSource } from '../config/data-source'
import { config } from '../config/env'
import { AccountStatus, User } from '../models/User'
import logger from '../utils/logger'

export type AuthTokenFailureReason =
  | 'JWT_SECRET_MISSING'
  | 'INVALID_USER'
  | 'ACCOUNT_INACTIVE'
  | 'TOKEN_INVALIDATED'
  | 'EMAIL_NOT_VERIFIED'

export class AuthTokenError extends Error {
  constructor(
    public readonly reason: AuthTokenFailureReason,
    public readonly statusCode: number,
    public readonly publicMessage: string
  ) {
    super(publicMessage)
  }
}

export interface AuthenticatedUser extends User {
  donorSellerId?: number
  charityOrganizationId?: number
  buyerId?: number
  independentDeliveryId?: number
  organizationVolunteerId?: number
}

export interface AuthTokenPayload {
  id: number
  email?: string
  role?: string
  tokenValidFrom?: number
}

interface AuthenticateTokenOptions {
  includeProfiles?: boolean
}

export async function authenticateToken(
  token: string,
  options: AuthenticateTokenOptions = {}
): Promise<AuthenticatedUser> {
  if (!config.jsonToken.secret) {
    throw new AuthTokenError('JWT_SECRET_MISSING', 500, 'JWT secret is not configured')
  }

  const decoded = jwt.verify(token, config.jsonToken.secret) as AuthTokenPayload
  const userRepo = AppDataSource.getRepository(User)
  const user = await userRepo.findOne(buildUserQuery(decoded.id, Boolean(options.includeProfiles)))

  if (!user) {
    throw new AuthTokenError('INVALID_USER', 401, 'Invalid user')
  }

  if (user.AccountStatus !== AccountStatus.ACTIVE) {
    logger.warn('Inactive account attempted authenticated access', {
      userId: user.UserID,
      accountStatus: user.AccountStatus,
    })
    throw new AuthTokenError('ACCOUNT_INACTIVE', 403, 'Account is not active')
  }

  if (decoded.tokenValidFrom && user.TokenValidFrom) {
    const tokenValidFromTime = user.TokenValidFrom.getTime()
    if (decoded.tokenValidFrom < tokenValidFromTime) {
      logger.warn('Token invalidated due to password change', {
        userId: user.UserID,
        tokenValidFrom: decoded.tokenValidFrom,
        userTokenValidFrom: tokenValidFromTime,
      })
      throw new AuthTokenError(
        'TOKEN_INVALIDATED',
        401,
        'Token invalidated due to security update'
      )
    }
  }

  if (!user.IsEmailVerified) {
    throw new AuthTokenError('EMAIL_NOT_VERIFIED', 401, 'Email not verified')
  }

  if (!options.includeProfiles) {
    return user
  }

  return Object.assign(user, {
    donorSellerId: user.donorSeller?.ProfileID,
    charityOrganizationId: user.charityOrganization?.ProfileID,
    buyerId: user.buyer?.ProfileID,
    independentDeliveryId: user.independentDelivery?.ProfileID,
    organizationVolunteerId: user.organizationVolunteer?.OrgVolunteerID,
  })
}

function buildUserQuery(userId: number, includeProfiles: boolean): FindOneOptions<User> {
  if (!includeProfiles) {
    return {
      where: { UserID: userId },
      select: {
        UserID: true,
        Role: true,
        IsEmailVerified: true,
        AccountStatus: true,
        TokenValidFrom: true,
      },
    }
  }

  return {
    where: { UserID: userId },
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
      organizationVolunteer: { OrgVolunteerID: true },
    },
  }
}
