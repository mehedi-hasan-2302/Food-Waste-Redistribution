import { Request, Response, NextFunction } from 'express'
import { AuthTokenError, authenticateToken } from '../services/authTokenService'
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

    const user = await authenticateToken(token, { includeProfiles: true })
    req.user = user

    next()
  } catch (error: any) {
    if (error instanceof AuthTokenError) {
      return res.status(error.statusCode).json({ message: error.publicMessage })
    }

    logger.warn('JWT verification error', { error: error.message })
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
