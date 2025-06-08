import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { categories } from "../../../../database/drizzle/schema"

export async function GET() {
  try {
    const categoriesData = await db.select().from(categories);
    return NextResponse.json(categoriesData);
  } catch {
    return NextResponse.json({ message: "获取分类列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const result = await db.insert(categories).values({
      name: json.name,
    }).returning()
    return NextResponse.json(result[0])
  } catch {
    return NextResponse.json({ message: "创建分类失败" }, { status: 500 });
  }
} 