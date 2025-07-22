import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { AppDataSource } from './config/data-source'
import { config } from './config/env'
import authRoutes from './routes/authRoutes'
import profileRoutes from './routes/profileRoutes'
import foodListingRoutes from './routes/foodListingRoutes'
import orderRoutes from './routes/orderRoutes'
import donationRoutes from './routes/donationRoutes'
import notificationRoutes from './routes/notificationRoutes'
import adminRoutes from './routes/adminRoutes'
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

export async function createApp(): Promise<Express> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
  } catch (error) {
    console.error('Database connection error:', error)
  }
  
  const app = express()
  
  app.use(cors(config.cors))
  
  app.use(express.json())
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(mongoSanitize());
  app.use(xss());

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/food-listings', foodListingRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/donations', donationRoutes)
  app.use('/api/notifications', notificationRoutes) 
  app.use('/api/admin', adminRoutes) 

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' })
  })

  // Error handler
  app.use((error: any, req: Request, res: Response, next: any) => {
    console.error('Server error:', error)
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
    console.error('Handler error:', error)
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    })
  }
}