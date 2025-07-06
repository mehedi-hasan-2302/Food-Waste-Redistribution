import express, { Express } from 'express'
import cors from 'cors'
import { AppDataSource } from './config/data-source'
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
  await AppDataSource.initialize()
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(xss());

  app.use('/api/auth', authRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/food-listings', foodListingRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/donations', donationRoutes)
  app.use('/api/notifications', notificationRoutes) 

  
  app.use('/api/admin', adminRoutes) 


  return app 
}