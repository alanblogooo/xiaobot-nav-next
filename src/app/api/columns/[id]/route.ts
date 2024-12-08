import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const column = await prisma.column.update({
      where: { id: params.id },
      data: {
        ...json,
        categoryId: json.categoryId || null,
      } as Prisma.ColumnUpdateInput,
      include: {
        category: true
      } satisfies Prisma.ColumnInclude,
    })
    return NextResponse.json(column)
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
    await prisma.column.delete({
      where: { id: params.id },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Failed to delete column:", error)
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 }
    )
  }
} 