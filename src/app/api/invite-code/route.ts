import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { inviteCodes } from "../../../../database/drizzle/schema"
import { eq } from "drizzle-orm"

export const dynamic = 'force-dynamic'

// 获取邀请码
export async function GET() {
  try {
    const inviteCodeData = await db
      .select()
      .from(inviteCodes)
      .limit(1)
    
    // 如果没有邀请码记录，创建一个默认的
    if (inviteCodeData.length === 0) {
      const newRecord = await db
        .insert(inviteCodes)
        .values({ code: '' })
        .returning()
      
      return NextResponse.json(newRecord[0])
    }
    
    return NextResponse.json(inviteCodeData[0])
    
  } catch (error) {
    console.error("获取邀请码失败:", error)
    return NextResponse.json(
      { error: "获取邀请码失败" }, 
      { status: 500 }
    )
  }
}

// 更新邀请码
export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    
    // 检查是否已有邀请码记录
    const existingRecord = await db
      .select()
      .from(inviteCodes)
      .limit(1)
    
    if (existingRecord.length === 0) {
      // 如果没有记录，创建新记录
      const newRecord = await db
        .insert(inviteCodes)
        .values({ code: code || '' })
        .returning()
      
      return NextResponse.json(newRecord[0])
    } else {
      // 如果有记录，更新现有记录
      const updatedRecord = await db
        .update(inviteCodes)
        .set({ 
          code: code || '',
          updatedAt: new Date()
        })
        .where(eq(inviteCodes.id, existingRecord[0].id))
        .returning()
      
      return NextResponse.json(updatedRecord[0])
    }
    
  } catch (error) {
    console.error("更新邀请码失败:", error)
    return NextResponse.json(
      { error: "更新邀请码失败" }, 
      { status: 500 }
    )
  }
} 