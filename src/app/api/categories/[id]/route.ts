import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

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
    // 先检查分类是否存在关联的专栏
    const columnsCount = await prisma.column.count({
      where: { categoryId: id }
    })

    if (columnsCount > 0) {
      return NextResponse.json(
        { 
          error: "CATEGORY_HAS_COLUMNS",
          message: "该分类下存在专栏，无法删除。请先移除或修改相关专栏的分类。" 
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id }
    })

    // 删除成功返回 204 状态码
    return new NextResponse(null, { status: 204 })
    
  } catch (error) {
    // 如果是记录不存在的错误
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: "Category not found", message: "分类不存在或已被删除" },
        { status: 404 }
      )
    }
    
    // 其他错误
    console.error("删除分类失败:", error)
    return NextResponse.json(
      { error: "DELETE_FAILED", message: "删除分类失败" },
      { status: 500 }
    )
  }
}
