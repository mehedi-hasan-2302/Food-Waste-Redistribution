import dotenv from 'dotenv'
dotenv.config()

export const config = {
    
  port: process.env.PORT ,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME,
    dbport: process.env.DB_PORT
  },
  email: {
    host: process.env.SMTP_HOST ,
    port: process.env.SMTP_PORT ,
    user: process.env.SMTP_USER ,
    mailpass: process.env.SMTP_PASSWORD
  },
  jsonToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
      'http://localhost:5173',  // Local development
      'http://localhost:3000',  // Alternative local port
      process.env.FRONTEND_URL || 'http://localhost:5173',  // Production frontend
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

} 