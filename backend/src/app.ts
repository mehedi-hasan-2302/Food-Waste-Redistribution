import express, { Express } from 'express'
import cors from 'cors'
import { AppDataSource } from './config/data-source'

export async function createApp(): Promise<Express> {
  await AppDataSource.initialize()
  const app = express()
  app.use(cors())
  app.use(express.json())


  return app 
}