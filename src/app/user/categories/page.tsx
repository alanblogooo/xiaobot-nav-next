"use client"

import * as React from "react"
import { PlusCircle, Edit2, Trash2 } from "lucide-react"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { getCategories, createCategory, type Category } from "@/services/categories"
import { EditCategoryDialog } from "@/components/categories/edit-category-dialog"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null)

  const loadCategories = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      toast.error("加载分类失败")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      toast.error("请输入分类名称")
      return
    }

    setIsCreating(true)
    try {
      await createCategory({ name: newCategoryName.trim() })
      toast.success("创建成功")
      setNewCategoryName("")
      loadCategories()
    } catch (error) {
      toast.error("创建失败")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold">专栏分类管理</h1>
      </div>

      <div className="flex gap-4 items-center mt-6">
        <Input
          placeholder="请输入分类名称"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleCreate} disabled={isCreating}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {isCreating ? "创建中..." : "新增分类"}
        </Button>
      </div>

      <div className="rounded-md border mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">分类名称</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="w-[100px] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                    <span className="ml-2">加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(category.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCategory(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditCategoryDialog
        category={editingCategory}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSuccess={() => {
          setEditingCategory(null)
          loadCategories()
        }}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        onSuccess={() => {
          setDeletingCategory(null)
          loadCategories()
        }}
      />
    </div>
  )
} 