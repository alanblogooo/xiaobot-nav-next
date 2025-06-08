import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { columns, categories } from "../../../../../database/drizzle/schema"
import { eq } from "drizzle-orm"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    
    // 更新数据
    const updateData = {
      ...json,
      categoryId: json.categoryId || null,
      updatedAt: new Date(),
    }
    
    await db.update(columns)
      .set(updateData)
      .where(eq(columns.id, params.id))
    
    // 获取更新后的数据，包含关联的分类信息
    const result = await db
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
      .where(eq(columns.id, params.id))
      .limit(1)
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to update column:", error)
    return NextResponse.json(
      { error: "Failed to update column" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(columns).where(eq(columns.id, params.id))
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Failed to delete column:", error)
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 }
    )
  }
} 