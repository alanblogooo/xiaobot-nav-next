import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('中间件执行:', {
    path: request.nextUrl.pathname,
    method: request.method,
    env: process.env.NODE_ENV
  })

  const authCookie = request.cookies.get('auth')
  console.log('Cookie 状态:', {
    hasAuthCookie: !!authCookie,
    cookieValue: authCookie?.value,
    allCookies: request.cookies.getAll().map(c => c.name)
  })
  
  // 检查是否访问的是需要保护的路由
  if (request.nextUrl.pathname.startsWith('/user')) {
    console.log('访问用户中心路由')
    // 严格检查 cookie 值
    if (!authCookie?.value || authCookie.value !== 'true') {
      console.log('未授权访问，重定向到登录页')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    console.log('已授权访问用户中心')
  }

  // 如果已经登录，访问登录页面时重定向到用户页面
  if (request.nextUrl.pathname === '/login') {
    console.log('访问登录页面')
    if (authCookie?.value === 'true') {
      console.log('已��录，重定向到用户中心')
      return NextResponse.redirect(new URL('/user', request.url))
    }
    console.log('未登录，允许访问登录页')
  }

  return NextResponse.next()
}

// 配置需要进行中间件检查的路径
export const config = {
  matcher: [
    // 保护用户中心路由 - 确保匹配所有用户中心路径
    '/user',
    '/user/:path*',
    // 处理登录页面重定向
    '/login'
  ]
} 