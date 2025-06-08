import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { columns, categories, inviteCodes } from "../../../../database/drizzle/schema"
import { eq, and, like, isNull, count, desc } from "drizzle-orm"
import { measureQuery } from "@/lib/performance"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const pageIndex = Number(searchParams.get('pageIndex') || '0')
    const pageSize = Number(searchParams.get('pageSize') || '10')
    const category = searchParams.get("category")
    const status = searchParams.get("status") || 'published'
    const name = searchParams.get("name")
    const author = searchParams.get("author")

    // 构建专栏查询条件
    const conditions = []

    let categoryId: string | null = null
    if (category === 'no-category') {
      conditions.push(isNull(columns.categoryId))
    } else if (category) {
      const categoryRecord = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, category)).limit(1)
      if (categoryRecord.length > 0) {
        categoryId = categoryRecord[0].id
        conditions.push(eq(columns.categoryId, categoryId))
      } else {
        // 如果分类不存在，仍然需要返回分类和邀请码数据
        const [categoriesData, inviteCodeData] = await Promise.all([
          db.select().from(categories),
          db.select().from(inviteCodes).limit(1)
        ])

        return NextResponse.json({
          columns: {
            data: [],
            total: 0,
            pageIndex,
            pageSize
          },
          categories: categoriesData,
          inviteCode: inviteCodeData[0]?.code || ''
        })
      }
    }

    if (status === 'published') {
      conditions.push(eq(columns.isPublished, true))
    } else if (status === 'draft') {
      conditions.push(eq(columns.isPublished, false))
    }

    if (name) {
      conditions.push(like(columns.name, `%${name}%`))
    }

    if (author) {
      conditions.push(like(columns.author, `%${author}%`))
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // 并行执行所有查询并监控性能
    const [totalResult, columnsData, categoriesData, inviteCodeData] = await Promise.all([
      // 专栏总数查询
      measureQuery('homepage_count_query', () =>
        db.select({ count: count() }).from(columns).where(whereCondition)
      ),
      
      // 专栏数据查询
      measureQuery('homepage_columns_query', () =>
        db
          .select({
            id: columns.id,
            avatar: columns.avatar,
            name: columns.name,
            author: columns.author,
            subscribers: columns.subscribers,
            contentCount: columns.contentCount,
            description: columns.description,
            url: columns.url,
            categoryId: columns.categoryId,
            isPublished: columns.isPublished,
            createdAt: columns.createdAt,
            updatedAt: columns.updatedAt,
            category: {
              id: categories.id,
              name: categories.name,
              createdAt: categories.createdAt,
              updatedAt: categories.updatedAt,
            }
          })
          .from(columns)
          .leftJoin(categories, eq(columns.categoryId, categories.id))
          .where(whereCondition)
          .orderBy(desc(columns.updatedAt))
          .limit(pageSize)
          .offset(pageIndex * pageSize)
      ),
      
      // 分类数据查询
      measureQuery('homepage_categories_query', () =>
        db.select().from(categories)
      ),
      
      // 邀请码查询
      measureQuery('homepage_invitecode_query', () =>
        db.select().from(inviteCodes).limit(1)
      )
    ])

    const total = totalResult[0].count

    return NextResponse.json({
      columns: {
        data: columnsData,
        total,
        pageIndex,
        pageSize
      },
      categories: categoriesData,
      inviteCode: inviteCodeData[0]?.code || ''
    })
  } catch (error) {
    console.error('Error in GET /api/homepage:', error)
    return NextResponse.json(
      { 
        error: "Failed to fetch homepage data",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 