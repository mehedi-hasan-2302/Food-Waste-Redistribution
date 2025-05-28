import express, { Express } from 'express'
import cors from 'cors'
import { AppDataSource } from './config/data-source'
import authRoutes from './routes/authRoutes'
import profileRoutes from './routes/profileRoutes'
import foodListingRoutes from './routes/foodListingRoutes'

export async function createApp(): Promise<Express> {
  await AppDataSource.initialize()
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.use('/api/auth', authRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/food-listings', foodListingRoutes)


  return app 
}