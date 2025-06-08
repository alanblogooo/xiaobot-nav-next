import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { categories, columns } from "../../../../../database/drizzle/schema"
import { eq, count } from "drizzle-orm"

export const dynamic = 'force-dynamic'

// 更新分类
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "分类名称不能为空" }, 
        { status: 400 }
      )
    }
    
    const result = await db
      .update(categories)
      .set({ 
        name: name.trim(),
        updatedAt: new Date()
      })
      .where(eq(categories.id, params.id))
      .returning()
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "分类不存在" }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(result[0])
    
  } catch (error) {
    console.error("更新分类失败:", error)
    
    // 检查是否是唯一性约束错误
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        { error: "分类名称已存在" }, 
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "更新分类失败" }, 
      { status: 500 }
    )
  }
}

// 删除分类
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 检查分类是否存在
    const categoryExists = await db
      .select()
      .from(categories)
      .where(eq(categories.id, params.id))
      .limit(1)
    
    if (categoryExists.length === 0) {
      return NextResponse.json(
        { error: "Category not found", message: "分类不存在" }, 
        { status: 404 }
      )
    }
    
    // 检查是否有专栏使用此分类
    const columnsCount = await db
      .select({ count: count() })
      .from(columns)
      .where(eq(columns.categoryId, params.id))
    
    if (columnsCount[0].count > 0) {
      return NextResponse.json(
        { 
          error: "CATEGORY_HAS_COLUMNS", 
          message: "该分类下还有专栏，无法删除" 
        }, 
        { status: 400 }
      )
    }
    
    // 删除分类
    await db
      .delete(categories)
      .where(eq(categories.id, params.id))
    
    return new NextResponse(null, { status: 204 })
    
  } catch (error) {
    console.error("删除分类失败:", error)
    return NextResponse.json(
      { error: "删除分类失败" }, 
      { status: 500 }
    )
  }
} 