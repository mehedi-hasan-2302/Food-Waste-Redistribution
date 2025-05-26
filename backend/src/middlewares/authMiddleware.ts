import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/data-source'
import { config } from '../config/env'
import { User } from '../models/User'


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
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid user' })
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

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.Role !== role) {
      return res.status(403).json({ message: 'Forbidden: Incorrect role' })
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