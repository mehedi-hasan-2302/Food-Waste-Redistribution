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

} 