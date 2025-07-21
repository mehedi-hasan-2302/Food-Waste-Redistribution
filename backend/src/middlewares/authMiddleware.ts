import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/data-source'
import { config } from '../config/env'
import { User } from '../models/User'
import logger from '../utils/logger'


export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token missing' })
    }

    if (!config.jsonToken.secret) {
      return res.status(500).json({ message: 'JWT secret is not configured' })
    }

    const decoded = jwt.verify(token, config.jsonToken.secret) as any

    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({
      where: { UserID: decoded.id },
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
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid user' })
    }

    //if token was issued before the user's TokenValidFrom timestamp
    if (decoded.tokenValidFrom && user.TokenValidFrom) {
      const tokenValidFromTime = user.TokenValidFrom.getTime()
      if (decoded.tokenValidFrom < tokenValidFromTime) {
        logger.warn('Token invalidated due to password change', { 
          userId: user.UserID, 
          tokenValidFrom: decoded.tokenValidFrom, 
          userTokenValidFrom: tokenValidFromTime 
        })
        return res.status(401).json({ message: 'Token invalidated due to security update' })
      }
    }

    if (!user.IsEmailVerified) {
      return res.status(401).json({ message: 'Email not verified' })
    }

    req.user = Object.assign(user, {
      donorSellerId: user.donorSeller?.ProfileID,
      charityOrganizationId: user.charityOrganization?.ProfileID,
      buyerId: user.buyer?.ProfileID,
      independentDeliveryId: user.independentDelivery?.ProfileID,
      organizationVolunteerId: user.organizationVolunteer?.OrgVolunteerID,
    }) ;

    next()
  } catch (error: any) {
    console.error('JWT verification error:', error)
    return res.status(401).json({ 
      message: 'Invalid token', 
      error: error.message 
    })
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    logger.warn('Unauthorized access attempt', { path: req.path })
    return res.status(401).json({ message: 'Unauthorized' })
  }
  next()
}

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.Role !== role) {
      logger.warn('Forbidden access attempt', { path: req.path, requiredRole: role, userRole: req.user?.Role })
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}

export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.Role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' })
    }
    next()
  }
}