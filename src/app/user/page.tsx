"use client"

import * as React from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategories, type Category } from "@/services/categories"
import { getColumns, type Column } from "@/services/columns"

interface CategoryStats {
  id: string
  name: string
  count: number
}

export default function UserPage() {
  // 获取所有专栏数据
  const { data: columnsData } = useSWR(
    ['columns', 0, 9999], // 获取所有专栏
    () => getColumns({
      pageIndex: 0,
      pageSize: 9999,
    })
  )

  // 获取所有分类
  const { data: categories = [] } = useSWR<Category[]>(
    'categories',
    () => getCategories()
  )

  // 计算每个分类下的专栏数量
  const categoryStats: CategoryStats[] = React.useMemo(() => {
    if (!columnsData?.data || !categories) return []

    const stats = new Map<string, number>()
    // 初始化所有分类的计数为0
    categories.forEach(category => {
      stats.set(category.id, 0)
    })

    // 统计每个分类下的专栏数量
    columnsData.data.forEach((column: Column) => {
      if (column.categoryId) {
        stats.set(column.categoryId, (stats.get(column.categoryId) || 0) + 1)
      }
    })

    // 转换为数组格式
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      count: stats.get(category.id) || 0
    }))
  }, [columnsData?.data, categories])

  // 计算无分类的专栏数量
  const uncategorizedCount = React.useMemo(() => {
    if (!columnsData?.data) return 0
    return columnsData.data.filter((column: Column) => !column.categoryId).length
  }, [columnsData?.data])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold">📊 数据统计</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">专栏总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{columnsData?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 mt-6">
        <h2 className="text-xl font-semibold">分类统计</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categoryStats.map(stat => (
            <Card key={stat.id} className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未分类</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uncategorizedCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
