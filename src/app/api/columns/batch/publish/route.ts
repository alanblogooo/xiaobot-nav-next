import { db } from "@/lib/db"
import { columns } from "../../../../../../database/drizzle/schema"
import { inArray } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { ids, publish } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Invalid request", { status: 400 })
    }

    // 批量更新发布状态
    await db.update(columns)
      .set({ 
        isPublished: publish,
        updatedAt: new Date()
      })
      .where(inArray(columns.id, ids))

    return new NextResponse("Success", { status: 200 })
  } catch (error) {
    console.error("[COLUMNS_BATCH_PUBLISH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 