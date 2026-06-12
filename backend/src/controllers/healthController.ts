import { Request, Response } from 'express'
import { AppDataSource } from '../config/data-source'
import logger from '../utils/logger'

type DatabaseHealth = 'connected' | 'disconnected'

async function getDatabaseHealth(): Promise<DatabaseHealth> {
  if (!AppDataSource.isInitialized) {
    return 'disconnected'
  }

  try {
    await AppDataSource.query('SELECT 1')
    return 'connected'
  } catch (error: any) {
    logger.warn('Health check database query failed', { error: error.message })
    return 'disconnected'
  }
}

export async function getHealth(req: Request, res: Response) {
  const database = await getDatabaseHealth()
  const isHealthy = database === 'connected'

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'ok',
      database,
    },
  })
}
