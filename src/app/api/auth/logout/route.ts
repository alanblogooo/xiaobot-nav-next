import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = cookies()
  cookieStore.set({
    name: 'auth',
    value: '',
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  return NextResponse.json({ message: 'Logged out successfully' })
} 