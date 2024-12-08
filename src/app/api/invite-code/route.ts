import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    let inviteCode = await prisma.inviteCode.findFirst()
    
    if (!inviteCode) {
      inviteCode = await prisma.inviteCode.create({
        data: {
          code: "",
        },
      })
    }

    return NextResponse.json(inviteCode)
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

    let inviteCode = await prisma.inviteCode.findFirst()
    
    if (inviteCode) {
      inviteCode = await prisma.inviteCode.update({
        where: { id: inviteCode.id },
        data: { code },
      })
    } else {
      inviteCode = await prisma.inviteCode.create({
        data: { code },
      })
    }

    return NextResponse.json(inviteCode)
  } catch (error) {
    console.error("更新邀请码失败:", error)
    return NextResponse.json(
      { error: "更新邀请码失败，请稍后重试" },
      { status: 500 }
    )
  }
} 