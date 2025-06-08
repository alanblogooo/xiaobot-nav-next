import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '../../database/drizzle/schema'
import path from 'path'
import fs from 'fs'

const isProduction = process.env.NODE_ENV === 'production'

// 数据库配置
let databaseUrl: string
let authToken: string | undefined

if (isProduction) {
  // 生产环境：优先使用云数据库，然后使用部署的只读数据库文件
  if (process.env.TURSO_DATABASE_URL) {
    databaseUrl = process.env.TURSO_DATABASE_URL
    authToken = process.env.TURSO_AUTH_TOKEN
    console.log('🗄️  使用 Turso 云数据库')
      } else {
      // 使用部署后的数据库文件（只读模式）
      const dbFileName = process.env.DATABASE_FILE || 'database.db'
      const deployedDbPath = path.join(process.cwd(), 'database/data', dbFileName)
      databaseUrl = `file:${deployedDbPath}`
      console.log('🗄️  使用部署的只读数据库文件:', deployedDbPath)
      
      // 验证文件是否存在
      if (fs.existsSync(deployedDbPath)) {
        console.log('✅ 数据库文件存在')
      } else {
        console.error('❌ 数据库文件不存在:', deployedDbPath)
        
        // 尝试查找其他可能的数据库文件
        const dataDir = path.join(process.cwd(), 'database/data')
        if (fs.existsSync(dataDir)) {
          const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.db'))
          console.log('📁 找到的数据库文件:', files)
          if (files.length > 0) {
            const fallbackDb = path.join(dataDir, files[0])
            databaseUrl = `file:${fallbackDb}`
            console.log('🔄 使用回退数据库文件:', fallbackDb)
          }
        }
      }
    }
} else {
  // 开发环境：使用本地文件数据库
  const dbFileName = process.env.DATABASE_FILE || 'database.db'
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database/data', dbFileName)
  databaseUrl = `file:${dbPath}`
  console.log('🗄️  开发环境数据库路径:', dbPath)
}

console.log(`🗄️  数据库连接: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`)

const client = createClient({
  url: databaseUrl,
  authToken: authToken
})

export const db = drizzle(client, { schema }) 