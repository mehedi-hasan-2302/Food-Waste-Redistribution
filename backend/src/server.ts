/// <reference path="./types/index.d.ts" />
import {config} from './config/env'
import { createApp } from './app'
import { createServer } from 'http'
import { initializeWebSocket } from './services/notificationService'
import dotenv from 'dotenv'
dotenv.config()

const PORT = config.port

async function startServer() {
  try {
    const app = await createApp()
    const server = createServer(app)
    initializeWebSocket(server)

    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`)
      console.log('WebSocket server initialized')
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

void startServer()
