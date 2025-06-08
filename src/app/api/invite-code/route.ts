import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { inviteCodes } from "../../../../database/drizzle/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const inviteCodeResult = await db.select().from(inviteCodes).limit(1)
    
    if (inviteCodeResult.length === 0) {
      const newInviteCode = await db.insert(inviteCodes).values({
        code: "",
      }).returning()
      return NextResponse.json(newInviteCode[0])
    }

    return NextResponse.json(inviteCodeResult[0])
  } catch (error) {
    console.error("获取邀请码失败:", error)
    return NextResponse.json(
      { error: "获取邀请码失败，请稍后重试" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { code } = json

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "邀请码不能为空" },
        { status: 400 }
      )
    }

    const inviteCodeResult = await db.select().from(inviteCodes).limit(1)
    
    if (inviteCodeResult.length > 0) {
      await db.update(inviteCodes)
        .set({ 
          code,
          updatedAt: new Date()
        })
        .where(eq(inviteCodes.id, inviteCodeResult[0].id))
      
      const updatedResult = await db.select().from(inviteCodes).where(eq(inviteCodes.id, inviteCodeResult[0].id)).limit(1)
      return NextResponse.json(updatedResult[0])
    } else {
      const newInviteCode = await db.insert(inviteCodes).values({ code }).returning()
      return NextResponse.json(newInviteCode[0])
    }
  } catch (error) {
    console.error("更新邀请码失败:", error)
    return NextResponse.json(
      { error: "更新邀请码失败，请稍后重试" },
      { status: 500 }
    )
  }
} 