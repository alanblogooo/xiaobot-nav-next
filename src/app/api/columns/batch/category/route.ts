import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { ids, categoryId } = body

    if (!Array.isArray(ids) || ids.length === 0 || !categoryId) {
      return new NextResponse("Invalid request", { status: 400 })
    }

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId
      }
    })

    if (!category) {
      return new NextResponse("Category not found", { status: 404 })
    }

    // 批量更新分类
    await prisma.column.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        categoryId
      }
    })

    return new NextResponse("Success", { status: 200 })
  } catch (error) {
    console.error("[COLUMNS_BATCH_CATEGORY]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 