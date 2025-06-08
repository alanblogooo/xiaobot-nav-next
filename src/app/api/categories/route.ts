import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { categories } from "../../../../database/drizzle/schema"
import { desc } from "drizzle-orm"

export const dynamic = 'force-dynamic'

// 获取所有分类
export async function GET() {
  try {
    const categoriesData = await db
      .select()
      .from(categories)
      .orderBy(desc(categories.createdAt))
    
    return NextResponse.json(categoriesData)
  } catch (error) {
    console.error("获取分类失败:", error)
    return NextResponse.json(
      { error: "获取分类失败" }, 
      { status: 500 }
    )
  }
}

// 创建新分类
export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "分类名称不能为空" }, 
        { status: 400 }
      )
    }
    
    const categoryData = {
      name: name.trim(),
    }
    
    const result = await db.insert(categories).values(categoryData).returning()
    return NextResponse.json(result[0])
    
  } catch (error) {
    console.error("创建分类失败:", error)
    
    // 检查是否是唯一性约束错误
    if (error.message && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        { error: "分类名称已存在" }, 
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "创建分类失败" }, 
      { status: 500 }
    )
  }
} 