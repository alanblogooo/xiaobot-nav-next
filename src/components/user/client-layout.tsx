"use client"

import * as React from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Home, BookOpen, FolderTree, Ticket } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
    })

    if (res.ok) {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="fixed top-0 left-0 flex flex-col h-screen bg-gray-50 border-r">
          <SidebarContent className="flex-1">
            <SidebarGroup>
              <SidebarGroupLabel>导航</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/user"}>
                      <Link href="/user">
                        <Home className="h-4 w-4" />
                        <span>首页</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/user/columns"}>
                      <Link href="/user/columns">
                        <BookOpen className="h-4 w-4" />
                        <span>专栏管理</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/user/categories"}>
                      <Link href="/user/categories">
                        <FolderTree className="h-4 w-4" />
                        <span>分类管理</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/user/invite-code"}>
                      <Link href="/user/invite-code">
                        <Ticket className="h-4 w-4" />
                        <span>邀请码管理</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                  <span>退出登录</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto p-8 ml-[240px] bg-white">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
} 