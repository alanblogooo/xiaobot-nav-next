import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { categories, columns } from "../../../../../database/drizzle/schema"
import { eq, count } from "drizzle-orm"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    
    await db.update(categories)
      .set({ 
        name: json.name,
        updatedAt: new Date()
      })
      .where(eq(categories.id, params.id))
    
    const result = await db.select().from(categories).where(eq(categories.id, params.id)).limit(1)
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to update category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params
  
  try {
    // 先检查分类是否存在关联的专栏
    const columnsCountResult = await db.select({ count: count() }).from(columns).where(eq(columns.categoryId, id))
    const columnsCount = columnsCountResult[0].count

    if (columnsCount > 0) {
      return NextResponse.json(
        { 
          error: "CATEGORY_HAS_COLUMNS",
          message: "该分类下存在专栏，无法删除。请先移除或修改相关专栏的分类。" 
        },
        { status: 400 }
      )
    }

    await db.delete(categories).where(eq(categories.id, id))

    // 删除成功返回 204 状态码
    return new NextResponse(null, { status: 204 })
    
  } catch (error) {
    // 其他错误
    console.error("删除分类失败:", error)
    return NextResponse.json(
      { error: "DELETE_FAILED", message: "删除分类失败" },
      { status: 500 }
    )
  }
}
