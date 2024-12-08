import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: json.name,
      },
    })
    return NextResponse.json(category)
  } catch (error) {
    console.error("Failed to update category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params
  
  try {
    const category = await prisma.category.delete({
      where: { id }
    })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json(
      { message: "删除分类失败" },
      { status: 500 }
    )
  }
}
