"use client"

import * as React from "react"
import Link from "next/link"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import useSWR from 'swr'
import { getColumns } from '@/services/columns'
import { getCategories } from '@/services/categories'
import { getInviteCode } from '@/services/rebates'
import type { Column } from '@prisma/client'
import type { Category } from '@/services/categories'

// 获取邀请码的 hook
const useInviteCode = () => {
  const { data } = useSWR('invite-code', getInviteCode)
  return data?.code || ''
}

// 生成推广链接的函数
const getPromotionUrl = (originalUrl: string, inviteCode: string) => {
  return inviteCode ? `${originalUrl}?refer=${inviteCode}` : originalUrl
}

export default function HomePage() {
  const inviteCode = useInviteCode()
  const [categoryFilter, setCategoryFilter] = React.useState<string>("")
  const [pageIndex, setPageIndex] = React.useState(0)
  const pageSize = 12
  const loadingRef = React.useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [allColumns, setAllColumns] = React.useState<Column[]>([])

  // 获取专栏数据
  const { data: columnsData, error: columnsError, mutate } = useSWR(
    ['columns', pageIndex, pageSize, categoryFilter],
    () => getColumns({
      pageIndex,
      pageSize,
      category: categoryFilter,
      status: 'published'
    })
  )

  // 当新数据到达时，将其添加到现有数据中
  React.useEffect(() => {
    if (columnsData?.data) {
      if (pageIndex === 0) {
        // 如果是第一页，直接替换数据
        setAllColumns(columnsData.data)
      } else {
        // 如果不是第一页，追加数据
        setAllColumns(prev => [...prev, ...columnsData.data])
      }
      setIsLoading(false)
    }
  }, [columnsData?.data, pageIndex])

  // 当切换分类时重置所有状态
  const handleCategoryChange = React.useCallback((category: string) => {
    setIsLoading(true)
    setPageIndex(0)
    setAllColumns([])
    setCategoryFilter(category)
    // 强制重新获取数据
    mutate()
  }, [mutate])

  // 获取分类数据
  const { data: categories = [] } = useSWR<Category[]>(
    'categories',
    () => getCategories()
  )

  const total = columnsData?.total || 0

  // 处理滚动加载
  React.useEffect(() => {
    const currentLoadingRef = loadingRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoading && allColumns.length < total) {
          setIsLoading(true)
          setPageIndex((prev) => prev + 1)
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 0.1
      }
    )

    if (currentLoadingRef) {
      observer.observe(currentLoadingRef)
    }

    return () => {
      if (currentLoadingRef) {
        observer.unobserve(currentLoadingRef)
      }
    }
  }, [allColumns.length, total, isLoading])

  // 当数据加载完时重置 loading 状态
  React.useEffect(() => {
    setIsLoading(false)
  }, [allColumns])

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(125deg,
          #f8f6f4 0%,
          #f7e6e3 20%,
          #e6f0f8 40%,
          #f8f6f4 60%,
          #e8f4ff 80%,
          #f8f6f4 100%
        )`
      }}
    >
      {/* 标题栏 */}
      <div className="pt-12">
        <div className="container text-center">
          <h1 className="text-4xl font-bold text-[#a5463f]">小报童专栏导航</h1>
          <p className="mt-4 mb-8 text-lg text-gray-600">
            发现 {total} 个优秀专栏，丰富的知识资源
          </p>
        </div>
      </div>

      {/* 分类筛选栏和专栏列表的容器 */}
      <div>
        {/* 分类筛选栏 */}
        <div className="relative">
          <div className="container">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={categoryFilter === "" ? "secondary" : "ghost"}
                onClick={() => handleCategoryChange("")}
                className={`min-w-[80px] h-[36px] ${
                  categoryFilter === "" 
                    ? "bg-[#a5463f] text-white hover:bg-[#a5463f] hover:text-white" 
                    : "bg-white/60 backdrop-blur-[5px] hover:bg-white/20"
                }`}
              >
                全部
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={categoryFilter === category.name ? "secondary" : "ghost"}
                  onClick={() => handleCategoryChange(category.name)}
                  className={`min-w-[80px] h-[36px] ${
                    categoryFilter === category.name 
                      ? "bg-[#a5463f] text-white hover:bg-[#a5463f] hover:text-white" 
                      : "bg-white/60 backdrop-blur-[5px] hover:bg-white/20"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 专栏列表 */}
        <div className="py-8">
          <div className="container max-w-[1203px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
              {allColumns.map((column: Column) => (
                <div key={column.id} className="w-full max-w-[381px]">
                  <div className="group relative rounded-lg bg-white/60 backdrop-blur-[5px] p-6 hover:shadow-lg transition-shadow h-full">
                    {/* 头像和标题行 */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 flex-shrink-0">
                        {column.avatar && column.avatar.startsWith('http') ? (
                          <Image
                            src={column.avatar}
                            alt={column.name}
                            width={48}
                            height={48}
                            className="h-full w-full rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded bg-gray-100">
                            📚
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base">
                          <Link
                            href={getPromotionUrl(column.url, inviteCode)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#a5463f] block truncate"
                            title={column.name}
                          >
                            {column.name}
                          </Link>
                        </h3>
                        <div className="mt-1 text-sm text-gray-500">@{column.author}</div>
                      </div>
                    </div>

                    {/* 数据统计 */}
                    <div className="mt-4 flex gap-3">
                      <div className="flex-1 rounded-lg border-black/[0.05] border px-3 py-2">
                        <div className="text-xs text-gray-500">订阅</div>
                        <div className="mt-1 font-bold text-red-500">
                          {column.subscribers} 🔥
                        </div>
                      </div>
                      <div className="flex-1 rounded-lg border-black/[0.05] border px-3 py-2">
                        <div className="text-xs text-gray-500">内容</div>
                        <div className="mt-1 font-bold text-gray-900">{column.contentCount}</div>
                      </div>
                    </div>

                    {/* 简介 */}
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 border-black/[0.05] border rounded-lg p-3 min-h-[220px] max-h-[220px] overflow-y-auto no-scrollbar">
                        {column.description || "暂无简介"}
                      </div>
                    </div>

                    {/* 订阅按钮 */}
                    <div className="mt-4">
                      <Link
                        href={getPromotionUrl(column.url, inviteCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button 
                          variant="outline" 
                          className="w-full bg-transparent border-[#a5463f]/10 text-[#a5463f] hover:bg-[#a5463f] hover:text-white transition-colors"
                        >
                          立即订阅
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 加载更多提示器 */}
        {allColumns.length > 0 && allColumns.length < total && (
          <div 
            ref={loadingRef} 
            className="mt-8 flex justify-center"
          >
            <div className="text-gray-500">
              {isLoading ? '加载中...' : '向下滚动加载更多'}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {allColumns.length === 0 && !columnsError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <svg
                className="h-10 w-10 text-gray-300 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">暂无专栏内容</h3>
              <p className="mt-2 text-sm text-gray-500">
                请查看其他分类的专栏内容
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
