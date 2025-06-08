import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function POST() {
  // 预览功能在生产环境中不可用，以减少部署包大小
  return NextResponse.json(
    { 
      error: '预览功能在生产环境中不可用',
      message: '此功能仅在开发环境中可用，以减少部署包大小和提高部署成功率'
    },
    { status: 503 }
  );
} 