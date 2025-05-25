import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/data-source'
import { User } from '../models/User'
import { config } from '../config/env'

export interface AuthRequest extends Request {
  user?: {
    id: number
    role: string
    email: string
    donorProfileId?: number
    charityProfileId?: number
    buyerProfileId?: number
    independentDeliveryProfileId?: number
    organizationVolunteerId?: number
  }
}

export const verifyToken = async (
  req: AuthRequest,
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
      return res.status(500).json({ message: 'JWT secret is not configured.' })
    }
    const decoded = jwt.verify(token, config.jsonToken.secret as string) as any

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
      return res.status(401).json({ message: 'Invalid user.' })
    }

    req.user = {
      id: user.UserID,
      role: user.Role,
      email: user.Email,
      donorProfileId: user.donorSeller?.ProfileID,
      charityProfileId: user.charityOrganization?.ProfileID,
      buyerProfileId: user.buyer?.ProfileID,
      independentDeliveryProfileId: user.independentDelivery?.ProfileID,
      organizationVolunteerId: user.organizationVolunteer?.OrgVolunteerID,
    }

    next()
  } catch (error: any) {
    console.error('JWT verification error:', error)
    return res
      .status(401)
      .json({ message: 'Invalid token', error: error.message })
  }
}



export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: Incorrect role' })
    }
    next()
  }
}
