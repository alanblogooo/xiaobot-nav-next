import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    console.log('收到登录请求')
    const { username, password } = await request.json()
    
    // 打印更详细的环境信息
    console.log('环境信息:', {
      NODE_ENV: process.env.NODE_ENV,
      REQUEST_URL: request.url,
      METHOD: request.method,
    })
    
    console.log('环境变量:', {
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ? '已设置' : '未设置',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '已设置' : '未设置',
    })

    // 验证环境变量是否存在
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.error('环境变量未设置: ADMIN_USERNAME 或 ADMIN_PASSWORD')
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 })
    }

    // 打印认证结果
    const isValidUsername = username === ADMIN_USERNAME
    const isValidPassword = password === ADMIN_PASSWORD
    console.log('认���结果:', {
      isValidUsername,
      isValidPassword,
      username,
      providedUsername: ADMIN_USERNAME,
    })

    // 验证用户名和密码
    if (isValidUsername && isValidPassword) {
      // 设置登录 cookie
      const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
      }
      
      console.log('设置 cookie:', cookieOptions)
      
      cookies().set('auth', 'true', cookieOptions)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  } catch (error) {
    console.error('登录处理错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 