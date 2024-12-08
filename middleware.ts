import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. 检查是否是登录页面
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  // 2. 检查是否已登录
  const token = request.cookies.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// 配置需要进行中间件检查的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，但不包括:
     * /api/auth/login (登录API)
     * /login (登录页面)
     * /_next (Next.js 静态文件)
     * /favicon.ico (浏览器图标)
     */
    '/((?!api/auth/login|login|_next|favicon.ico).*)',
  ],
} 