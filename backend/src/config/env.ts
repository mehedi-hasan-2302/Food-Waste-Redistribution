import dotenv from 'dotenv'
dotenv.config()

export const config = {
    
  port: process.env.PORT ,
  jwtSecret: process.env.JWT_SECRET ,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME,
    dbport: process.env.DB_PORT
  },
  email: {
    user: process.env.EMAIL_USER ,
    mailpass: process.env.EMAIL_PASSWORD
  },

}