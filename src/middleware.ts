import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  
  // 检查是否访问的是需要保护的路由
  if (request.nextUrl.pathname.startsWith('/user')) {
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 如果已经登录，访问登录页面时重定向到用户页面
  if (request.nextUrl.pathname === '/login') {
    if (authCookie && authCookie.value === 'true') {
      return NextResponse.redirect(new URL('/user', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/user/:path*', '/login'],
} 