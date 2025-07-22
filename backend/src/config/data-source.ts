import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { config } from './env'
dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:     config.db.host,
  port:     Number(config.db.dbport),
  username: config.db.user,
  password: config.db.password,
  database: config.db.database,
  entities: [
    isProduction 
      ? __dirname + '/../models/*.js'
      : __dirname + '/../models/*.ts'
  ],
  migrations: [
    isProduction 
      ? __dirname + '/../migrations/*.js'
      : __dirname + '/../migrations/*.ts'
  ],
  synchronize: false,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  logging: !isProduction,
})
