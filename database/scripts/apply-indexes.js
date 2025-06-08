const { createClient } = require('@libsql/client')
const path = require('path')

async function applyIndexes() {
  console.log('🚀 开始应用性能优化索引...')
  
  // 创建数据库连接
  const dbPath = path.join(process.cwd(), 'database/data/database.db')
  const client = createClient({
    url: `file:${dbPath}`
  })

  try {
    // 添加复合索引
    const indexes = [
      {
        name: 'columns_published_category_updated_idx',
        sql: 'CREATE INDEX IF NOT EXISTS columns_published_category_updated_idx ON columns (isPublished, categoryId, updatedAt)'
      },
      {
        name: 'columns_published_updated_idx', 
        sql: 'CREATE INDEX IF NOT EXISTS columns_published_updated_idx ON columns (isPublished, updatedAt)'
      },
      {
        name: 'columns_category_updated_idx',
        sql: 'CREATE INDEX IF NOT EXISTS columns_category_updated_idx ON columns (categoryId, updatedAt)'
      }
    ]

    for (const index of indexes) {
      console.log(`📊 创建索引: ${index.name}`)
      await client.execute(index.sql)
      console.log(`✅ 索引 ${index.name} 创建成功`)
    }

    // 查看所有索引
    console.log('\n📋 查看当前所有索引:')
    const result = await client.execute({
      sql: "SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='columns' ORDER BY name",
    })

    result.rows.forEach((row) => {
      if (row.sql) {
        console.log(`  - ${row.name}: ${row.sql}`)
      }
    })

    console.log('\n🎉 性能优化索引应用完成!')

  } catch (error) {
    console.error('❌ 应用索引时出错:', error)
    process.exit(1)
  } finally {
    client.close()
  }
}

applyIndexes() 