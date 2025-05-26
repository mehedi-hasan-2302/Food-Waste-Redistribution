/// <reference path="./types/index.d.ts" />
import {config} from './config/env'
import { createApp } from './app'
import dotenv from 'dotenv'
dotenv.config()

const PORT = config.port


createApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start server:', err)
  })
