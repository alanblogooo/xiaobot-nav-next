import { db } from '../../src/lib/db'
import { categories, columns, inviteCodes } from './schema'

async function seed() {
  console.log('开始数据库种子数据填充...')

  try {
    // 创建默认分类
    const defaultCategories = [
      { name: '技术' },
      { name: '商业' },
      { name: '生活' },
    ]

    console.log('创建默认分类...')
    await db.insert(categories).values(defaultCategories)

    // 创建默认邀请码记录
    console.log('创建默认邀请码记录...')
    await db.insert(inviteCodes).values({ code: '' })

    console.log('数据库种子数据填充完成！')
  } catch (error) {
    console.error('数据库种子数据填充失败:', error)
    process.exit(1)
  }
}

seed() 