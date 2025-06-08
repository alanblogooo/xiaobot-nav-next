import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '../../database/drizzle/schema'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'

// 开发环境使用本地文件，生产环境使用 Turso 或环境变量
const databaseUrl = isDevelopment 
  ? `file:${path.join(process.cwd(), 'database/data/database.db')}`
  : process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'database/data/database.db')}`

const authToken = process.env.TURSO_AUTH_TOKEN

const client = createClient({
  url: databaseUrl,
  authToken: authToken
})

export const db = drizzle(client, { schema }) 