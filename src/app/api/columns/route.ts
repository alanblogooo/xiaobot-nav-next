import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from '@prisma/client'

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
    const where: Prisma.ColumnWhereInput = {}

    if (category === 'no-category') {
      where.categoryId = null
    } else if (category) {
      where.category = {
        name: category
      }
    }

    if (status === 'published') {
      where.isPublished = true
    } else if (status === 'draft') {
      where.isPublished = false
    }

    if (name) {
      where.name = {
        contains: name
      }
    }

    if (author) {
      where.author = {
        contains: author
      }
    }

    console.log('Prisma where condition:', JSON.stringify(where, null, 2))

    // 获取总数
    const total = await prisma.column.count({
      where
    })

    // 获取分页数据
    const data = await prisma.column.findMany({
      where,
      include: {
        category: true
      },
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy: {
        updatedAt: 'desc'
      }
    })

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
    const columnData: Prisma.ColumnCreateInput = {
      name: body.name,
      url: body.url,
      author: body.author,
      avatar: body.avatar,
      description: body.description || null,
      category: body.categoryId ? {
        connect: { id: body.categoryId }
      } : undefined,
      subscribers: 0,
      contentCount: 0,
      isPublished: false,
    };
    
    const column = await prisma.column.create({
      data: columnData,
    });
    return NextResponse.json(column);
  } catch {
    return NextResponse.json({ message: "创建栏目失败" }, { status: 500 });
  }
} 