import dotenv from 'dotenv'
dotenv.config()

const isTest = process.env.NODE_ENV === 'test'
const isProduction = process.env.NODE_ENV === 'production'

function getEnv(
  keys: string | string[],
  options: { required?: boolean; defaultValue?: string } = {}
): string | undefined {
  const envKeys = Array.isArray(keys) ? keys : [keys]
  const value = envKeys
    .map(key => process.env[key])
    .find(item => item !== undefined && item.trim() !== '')

  if (value) return value
  if (options.defaultValue !== undefined) return options.defaultValue

  if (options.required && !isTest) {
    throw new Error(`Missing required environment variable: ${envKeys.join(' or ')}`)
  }

  return undefined
}

const corsOrigins = getEnv('CORS_ORIGINS')
  ?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
const frontendUrl = getEnv('FRONTEND_URL', { defaultValue: 'http://localhost:5173' }) as string

function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = getEnv(key)
  if (value === undefined) return defaultValue
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
}

export const config = {
    
  port: getEnv('PORT', { defaultValue: '4000' }) as string,
  db: {
    host: getEnv('DB_HOST', { defaultValue: 'localhost' }) as string,
    user: getEnv(['DB_USER', 'DB_USERNAME'], { required: true }) as string,
    password: getEnv('DB_PASSWORD', { required: true }) as string,
    database: getEnv('DB_NAME', { required: true }) as string,
    dbport: getEnv('DB_PORT', { defaultValue: '5432' }) as string,
    ssl: getBooleanEnv('DB_SSL', isProduction),
    sslRejectUnauthorized: getBooleanEnv('DB_SSL_REJECT_UNAUTHORIZED', false)
  },
  email: {
    host: getEnv('SMTP_HOST'),
    port: getEnv('SMTP_PORT', { defaultValue: '465' }),
    user: getEnv('SMTP_USER'),
    mailpass: getEnv('SMTP_PASSWORD')
  },
  jsonToken: {
    secret: getEnv('JWT_SECRET', { required: true }) as string,
    expiresIn: getEnv('JWT_EXPIRES_IN', { defaultValue: '24h' }) as string
  },
  cloudinary: {
    cloudName: getEnv('CLOUDINARY_CLOUD_NAME'),
    apiKey: getEnv('CLOUDINARY_API_KEY'),
    apiSecret: getEnv('CLOUDINARY_API_SECRET')
  },
  frontendUrl,
  cors: {
    origin: corsOrigins?.length ? corsOrigins : [
      'http://localhost:5173',  // Local development
      'http://localhost:3000',  // Alternative local port
      frontendUrl,  // Production frontend
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

}
