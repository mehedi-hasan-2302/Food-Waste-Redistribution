import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { AppDataSource } from './config/data-source'
import { config } from './config/env'
import authRoutes from './routes/authRoutes'
import chatRoutes from './routes/chatRoutes'
import healthRoutes from './routes/healthRoutes'
import profileRoutes from './routes/profileRoutes'
import foodListingRoutes from './routes/foodListingRoutes'
import orderRoutes from './routes/orderRoutes'
import donationRoutes from './routes/donationRoutes'
import notificationRoutes from './routes/notificationRoutes'
import adminRoutes from './routes/adminRoutes'
import feedbackRoutes from './routes/feedbackRoutes'
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import logger from './utils/logger'

export async function createApp(): Promise<Express> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
  } catch (error) {
    logger.error('Database connection error', { error })
  }
  
  const app = express()
  
  app.use(cors(config.cors))
  
  app.use(express.json())
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(mongoSanitize());
  app.use(xss());

  app.use('/api/health', healthRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/chat', chatRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/food-listings', foodListingRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/donations', donationRoutes)
  app.use('/api/notifications', notificationRoutes) 
  app.use('/api/feedback', feedbackRoutes)
  app.use('/api/admin', adminRoutes) 

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' })
  })

  // Error handler
  app.use((error: any, req: Request, res: Response, next: any) => {
    logger.error('Server error', { error })
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
  })

  return app 
}

// Export for Vercel serverless function
let app: Express | null = null

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      app = await createApp()
    }
    return app(req, res)
  } catch (error) {
    logger.error('Handler error', { error })
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    })
  }
}
