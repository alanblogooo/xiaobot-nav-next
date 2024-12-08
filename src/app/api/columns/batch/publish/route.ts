import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { ids, publish } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Invalid request", { status: 400 })
    }

    // 批量更新发布状态
    await prisma.column.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        isPublished: publish
      }
    })

    return new NextResponse("Success", { status: 200 })
  } catch (error) {
    console.error("[COLUMNS_BATCH_PUBLISH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 