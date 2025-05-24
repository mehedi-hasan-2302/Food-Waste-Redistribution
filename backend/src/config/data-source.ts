import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { config } from './env'
dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:     config.db.host,
  port:     Number(config.db.dbport),
  username: config.db.user,
  password: config.db.password,
  database: config.db.database,
  entities: [__dirname + '/../models/*.ts'],
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: false,  
})
