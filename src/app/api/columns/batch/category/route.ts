import { db } from "@/lib/db"
import { columns, categories } from "../../../../../../database/drizzle/schema"
import { inArray, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { ids, categoryId } = body

    if (!Array.isArray(ids) || ids.length === 0 || !categoryId) {
      return new NextResponse("Invalid request", { status: 400 })
    }

    // 验证分类是否存在
    const category = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1)

    if (category.length === 0) {
      return new NextResponse("Category not found", { status: 404 })
    }

    // 批量更新分类
    await db.update(columns)
      .set({ 
        categoryId,
        updatedAt: new Date()
      })
      .where(inArray(columns.id, ids))

    return new NextResponse("Success", { status: 200 })
  } catch (error) {
    console.error("[COLUMNS_BATCH_CATEGORY]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 