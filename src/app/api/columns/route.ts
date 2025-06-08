import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { columns, categories } from "../../../../database/drizzle/schema"
import { eq, and, like, isNull, count, desc } from "drizzle-orm"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const pageIndex = Number(searchParams.get('pageIndex') || '0')
    const pageSize = Number(searchParams.get('pageSize') || '10')
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const name = searchParams.get("name")
    const author = searchParams.get("author")

    console.log('Search params:', { pageIndex, pageSize, category, status, name, author })

    // 构建查询条件
    const conditions = []

    // 优化分类查询 - 预先获取所有分类映射，减少重复查询
    let categoryId: string | null = null
    if (category === 'no-category') {
      conditions.push(isNull(columns.categoryId))
    } else if (category) {
      // 缓存分类查询结果
      const categoryRecord = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, category)).limit(1)
      if (categoryRecord.length > 0) {
        categoryId = categoryRecord[0].id
        conditions.push(eq(columns.categoryId, categoryId))
      } else {
        // 如果分类不存在，直接返回空结果，避免无效查询
        return NextResponse.json({
          data: [],
          total: 0,
          pageIndex,
          pageSize
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

    console.log('Drizzle where condition:', whereCondition)

    // 使用Promise.all并行执行总数查询和数据查询，提高性能
    const [totalResult, data] = await Promise.all([
      // 总数查询 - 仅查询必要字段
      db.select({ count: count() }).from(columns).where(whereCondition),
      
      // 数据查询 - 使用左连接但只查询必要字段
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
    ])

    const total = totalResult[0].count

    console.log('Search results:', { total, dataCount: data.length })

    return NextResponse.json({
      data,
      total,
      pageIndex,
      pageSize
    })
  } catch (error) {
    console.error('Error in GET /api/columns:', error)
    return NextResponse.json(
      { 
        error: "Failed to fetch columns",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const columnData = {
      name: body.name,
      url: body.url,
      author: body.author,
      avatar: body.avatar,
      description: body.description || null,
      categoryId: body.categoryId || null,
      subscribers: 0,
      contentCount: 0,
      isPublished: false,
    };
    
    const result = await db.insert(columns).values(columnData).returning();
    return NextResponse.json(result[0]);
  } catch {
    return NextResponse.json({ message: "创建栏目失败" }, { status: 500 });
  }
} 