import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ message: "获取分类列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const category = await prisma.category.create({
      data: {
        name: json.name,
      },
    })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ message: "创建分类失败" }, { status: 500 });
  }
} 