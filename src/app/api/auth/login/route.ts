import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password } = body

  if (
    username === process.env.NEXT_PUBLIC_USERNAME &&
    password === process.env.AUTH_PASSWORD
  ) {
    // 使用正确的 cookies API
    const cookieStore = await cookies()
    cookieStore.delete('auth') // 先删除旧的 cookie（如果存在）
    cookieStore.set({
      name: 'auth',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json(
    { success: false, message: '用户名或密码错误' },
    { status: 401 }
  )
} 