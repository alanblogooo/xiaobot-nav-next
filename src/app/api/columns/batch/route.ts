import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { columns } = body;

    if (!Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: "请提供有效的专栏数据"
      }, { status: 400 });
    }

    // 批量创建专栏
    const savedData = await prisma.$transaction(
      columns.map(column => 
        prisma.column.create({
          data: {
            name: column.name,
            url: column.url,
            author: column.author,
            avatar: column.avatar,
            description: column.description || null,
            subscribers: column.subscribers || 0,
            contentCount: column.contentCount || 0,
            isPublished: false,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `成功添加 ${savedData.length} 个专栏`,
      savedData
    });
  } catch (error) {
    console.error("[COLUMNS_BATCH_CREATE]", error);
    return NextResponse.json({ 
      success: false,
      message: "添加专栏失败"
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Invalid request", { status: 400 })
    }

    // 批量删除
    await prisma.column.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    return new NextResponse("Success", { status: 200 })
  } catch (error) {
    console.error("[COLUMNS_BATCH_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 