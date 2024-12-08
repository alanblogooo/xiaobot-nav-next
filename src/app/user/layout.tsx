import { Metadata } from 'next'
import ClientLayout from '@/components/user/client-layout'

export const metadata: Metadata = {
  title: '小报童导航 - 用户中心',
  description: '小报童导航 - 用户中心'
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
} 