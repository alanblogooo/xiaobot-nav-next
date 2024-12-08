import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'auth',
    value: '',
    expires: new Date(0),
    path: '/',
  })
  return NextResponse.json({ message: 'Logged out successfully' })
} 